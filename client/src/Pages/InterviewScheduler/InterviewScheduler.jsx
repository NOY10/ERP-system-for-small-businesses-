import { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Link, AlertTriangle, Check, ArrowLeft, User, Briefcase, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

import { API_BASE_URL } from "../../config/api";

// Time slot generator (same as in SchelduleMeeting)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      slots.push(`${hourStr}:${minuteStr}`);
    }
  }
  return slots;
};

export default function InterviewScheduler() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [googleAuthStatus, setGoogleAuthStatus] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState('');
  const { token, user } = useAuthStore();
  
  // Form states
  const [interviewTitle, setInterviewTitle] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewDescription, setInterviewDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [intervieweeEmail, setIntervieweeEmail] = useState('');
  const [includeOwner, setIncludeOwner] = useState(false);
  
  // Show error message helper
  const displayError = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  // Show success message helper
  const displaySuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Check Google Calendar authorization status
  useEffect(() => {
    const checkGoogleAuthStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/google/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setGoogleAuthStatus(data.isAuthorized);

        if (!data.isAuthorized) {
          // Get auth URL if not authorized
          const authUrlResponse = await fetch(`${API_BASE_URL}/google/auth`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          const authUrlData = await authUrlResponse.json();
          setGoogleAuthUrl(authUrlData.authUrl);
        }
      } catch (error) {
        console.error("Error checking Google auth status:", error);
      }
    };

    if (token) {
      checkGoogleAuthStatus();
    }
  }, [token]);
  
  // Connect Google Calendar
  const connectGoogleCalendar = () => {
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl;
    } else {
      displayError('Unable to get Google authorization URL');
    }
  };

  // Schedule an interview
  const scheduleInterview = async () => {
    if (!interviewTitle || !interviewDate || !startTime || !endTime || !intervieweeEmail) {
      displayError('Please fill all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(intervieweeEmail)) {
      displayError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      
      const currentToken = useAuthStore.getState().token;
      
      if (!currentToken) {
        displayError('You must be logged in to schedule interviews');
        setIsLoading(false);
        return;
      }
      
      // Prepare interview data
      const interviewData = {
        title: interviewTitle,
        description: interviewDescription,
        date: interviewDate,
        startTime,
        endTime,
        intervieweeEmail,
        includeOwner
      };
      
      const response = await fetch(`${API_BASE_URL}/schedule-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentToken}`
        },
        body: JSON.stringify(interviewData)
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form and show success
        setInterviewTitle('');
        setInterviewDate('');
        setInterviewDescription('');
        setStartTime('');
        setEndTime('');
        setIntervieweeEmail('');
        setIncludeOwner(false);
        
        displaySuccess('Interview request submitted successfully!');
      } else {
        displayError(`Failed to schedule interview: ${data.error}`);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      displayError('An error occurred while scheduling the interview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen p-6">
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fadeIn">
          <Check size={20} />
          <span>{successMessage}</span>
        </div>
      )}
      
      {showError && (
        <div className="fixed top-6 right-6 bg-rose-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fadeIn">
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-indigo-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-indigo-800 font-medium">Scheduling interview...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/scheduleMeeting')}
              className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Go back to meeting scheduler"
            >
              <ArrowLeft size={20} className="text-blue-700" />
            </button>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-600">Interview Scheduler</h1>
          </div>
          
          {/* Google Calendar Integration */}
          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-full text-sm flex items-center space-x-2 shadow-sm ${googleAuthStatus ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              <CalendarIcon size={16} />
              <span className="font-medium">{googleAuthStatus ? 'Calendar Connected' : 'Calendar Not Connected'}</span>
            </div>
            
            {!googleAuthStatus && (
              <button 
                onClick={connectGoogleCalendar}
                className="bg-indigo-600 text-white py-2 px-4 rounded-full text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center space-x-2 shadow-sm transition-all"
              >
                <Link size={14} />
                <span>Connect Calendar</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - explanation */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase size={20} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Candidate Interview Portal</h2>
              <p className="text-gray-600 mb-6">
                Schedule interviews with potential candidates. The system will send invitations and create Google Meet links automatically.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 mr-3 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Interviewee Email</h3>
                    <p className="text-sm text-gray-500">The candidate will receive an email with the interview details and a Google Meet link.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 mr-3 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Time Management</h3>
                    <p className="text-sm text-gray-500">Interviews are set in 30-minute increments, with Google Calendar integration for reminders.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 mr-3 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Scheduling</h3>
                    <p className="text-sm text-gray-500">Your HR team will be notified of the interview request and can approve it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - form */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-xl font-semibold text-white">Create a New Interview</h2>
                <p className="text-indigo-100 mt-1">Enter the candidate and interview details below</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Title <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={interviewTitle}
                      onChange={(e) => setInterviewTitle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                      placeholder="e.g. Frontend Developer Interview"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date <span className="text-rose-500">*</span></label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-indigo-400" />
                        </div>
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time <span className="text-rose-500">*</span></label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock size={16} className="text-indigo-400" />
                        </div>
                        <select
                          value={startTime}
                          onChange={(e) => {
                            setStartTime(e.target.value);
                            if (!endTime) {
                              const slots = generateTimeSlots();
                              const currentIndex = slots.indexOf(e.target.value);
                              if (currentIndex >= 0 && currentIndex < slots.length - 2) {
                                setEndTime(slots[currentIndex + 2]);
                              }
                            }
                          }}
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-gray-50"
                        >
                          <option value="">Select time</option>
                          {generateTimeSlots().map(time => (
                            <option key={`start-${time}`} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time <span className="text-rose-500">*</span></label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock size={16} className="text-indigo-400" />
                        </div>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-gray-50"
                          disabled={!startTime}
                        >
                          <option value="">Select time</option>
                          {generateTimeSlots()
                            .filter(time => !startTime || time > startTime)
                            .map(time => (
                              <option key={`end-${time}`} value={time}>{time}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Email <span className="text-rose-500">*</span></label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-indigo-400" />
                      </div>
                      <input
                        type="email"
                        value={intervieweeEmail}
                        onChange={(e) => setIntervieweeEmail(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                        placeholder="candidate@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Details</label>
                    <textarea
                      value={interviewDescription}
                      onChange={(e) => setInterviewDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                      placeholder="Job description, interview agenda, or instructions for the candidate"
                      rows={4}
                    />
                  </div>
                  
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={includeOwner}
                          onChange={() => setIncludeOwner(!includeOwner)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-700">Include Company Owner</span>
                      </label>
                    </div>
                    
                    {includeOwner && (
                      <div className="mt-2 text-sm text-indigo-700">
                        <p>The company owner will be automatically included in this interview and notified.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    onClick={scheduleInterview}
                    disabled={isLoading}
                    className="w-full py-3 px-6 text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Scheduling...' : 'Schedule Interview'}
                  </button>
                </div>
                
                {/* Google Calendar Notice */}
                {!googleAuthStatus && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-start">
                    <AlertTriangle size={18} className="mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Google Calendar Not Connected</p>
                      <p className="text-amber-700">
                        Interview requests can still be submitted, but connecting your Google Calendar enables automatic meeting link creation.
                      </p>
                      <button 
                        onClick={connectGoogleCalendar} 
                        className="mt-2 text-blue-600 font-medium hover:text-indigo-800 underline"
                      >
                        Connect Google Calendar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}