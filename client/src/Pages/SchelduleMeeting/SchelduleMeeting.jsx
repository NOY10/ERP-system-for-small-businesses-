import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, ChevronDown, X, Check, AlertTriangle, RefreshCw, Link } from 'lucide-react';
import useAuthStore  from '../../store/useAuthStore'; // Update with your actual path
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from "../../config/api";

// Time slot generator
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

// Main component
export default function MeetingScheduler() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [googleAuthStatus, setGoogleAuthStatus] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState('');
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  // Form states
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/getallEmployees`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const formattedEmployees = data.employees.map((emp) => ({
            id: emp.employeeId,
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            role: emp.role,
            department: emp.department,
            profileImage: emp.profileImage || '/api/placeholder/50/50',
            avatar: emp.profileImage || '/api/placeholder/50/50',
          }));

          setUsers(formattedEmployees);
        } else {
          console.error("Failed to fetch employees:", data.error);
          displayError("Failed to load employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        displayError("Network error while loading employees");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchEmployees();
    }
  }, [token]);
// Fetch meetings
useEffect(() => {
  if (token) {
    fetchMeetings();
  }
}, [token, activeTab]);

// Add a meeting
const scheduleMeeting = async () => {
  if (!meetingTitle || !meetingDate || !startTime || !endTime || selectedParticipants.length === 0) {
    displayError('Please fill all required fields');
    return;
  }

  try {
    setIsLoading(true);
    
    // Get the current token directly from the store
    const currentToken = useAuthStore.getState().token;
    
    if (!currentToken) {
      displayError('You must be logged in to schedule meetings');
      setIsLoading(false);
      return;
    }
    
    // Map selected participant IDs to ensure we're using employeeId format
    const participantsList = selectedParticipants.map(id => {
      const participant = users.find(u => u.id === id);
      return participant ? participant.id : id; // participant.id is already set to emp.employeeId during fetch
    });
    
    const meetingData = {
      title: meetingTitle,
      description: meetingDescription,
      date: meetingDate,
      startTime,
      endTime,
      participants: participantsList, // Use the mapped participant IDs
      includeOwner: includeOwner // Include the owner toggle value
    };
    
    console.log('Scheduling meeting with participants:', participantsList);
    console.log('Including owner:', includeOwner);
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentToken}`
      },
      body: JSON.stringify(meetingData)
    });

    const data = await response.json();

    if (response.ok) {
      // Reset form and show success
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingDescription('');
      setStartTime('');
      setEndTime('');
      setSelectedParticipants([]);
      setIncludeOwner(false); // Reset owner toggle
      
      displaySuccess('Meeting request submitted successfully!');
      fetchMeetings();
    } else {
      displayError(`Failed to schedule meeting: ${data.error}`);
    }
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    displayError('An error occurred while scheduling the meeting');
  } finally {
    setIsLoading(false);
  }
};
// Approve a meeting
const approveMeeting = async (meetingId) => {
  if (!googleAuthStatus) {
    displayError('Please connect your Google Calendar first');
    return;
  }

  try {
    setIsLoading(true);
    
    // UPDATED: Changed from /meetings/approve/ to /approve/
    const response = await fetch(`${API_BASE_URL}/approve/${meetingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message
      displaySuccess('Meeting approved and Google Calendar event created!');
      
      // Refresh meetings
      fetchMeetings();
    } else {
      displayError(`Failed to approve meeting: ${data.error}`);
    }
  } catch (error) {
    console.error('Error approving meeting:', error);
    displayError('An error occurred while approving the meeting');
  } finally {
    setIsLoading(false);
  }
};

// Reject a meeting
const rejectMeeting = async (meetingId) => {
  try {
    setIsLoading(true);
    
    // UPDATED: Changed from /meetings/reject/ to /reject/
    const response = await fetch(`${API_BASE_URL}/reject/${meetingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: "Rejected by administrator" })
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message
      displaySuccess('Meeting request rejected');
      
      // Refresh meetings
      fetchMeetings();
    } else {
      displayError(`Failed to reject meeting: ${data.error}`);
    }
  } catch (error) {
    console.error('Error rejecting meeting:', error);
    displayError('An error occurred while rejecting the meeting');
  } finally {
    setIsLoading(false);
  }
};

// Cancel a meeting
const cancelMeeting = async (meetingId) => {
  try {
    setIsLoading(true);
    
    // UPDATED: Changed from /meetings/cancel/ to /cancel/
    const response = await fetch(`${API_BASE_URL}/cancel/${meetingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message
      displaySuccess('Meeting cancelled successfully!');
      
      // Refresh meetings
      fetchMeetings();
    } else {
      displayError(`Failed to cancel meeting: ${data.error}`);
    }
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    displayError('An error occurred while cancelling the meeting');
  } finally {
    setIsLoading(false);
  }
};

// Toggle participant selection
const toggleParticipant = (userId) => {
  if (selectedParticipants.includes(userId)) {
    setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
  } else {
    setSelectedParticipants([...selectedParticipants, userId]);
  }
};

// Helper function to fetch meetings
// In your frontend (SchelduleMeeting.jsx)
const fetchMeetings = async () => {
  try {
    setIsLoading(true);
    const token = useAuthStore.getState().token; // Ensure you're getting token
    
    // First check user role
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    let endpoint = `${API_BASE_URL}`;
    let config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Only fetch pending meetings if user has permission
    if (activeTab === 'requests' && ['Accounts', 'HR', 'Owner'].includes(currentUser.role)) {
      endpoint = `${API_BASE_URL}/status/pending`;
    }

    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched meetings:", data);
    
    // Process the participants to ensure we have the right format
    const processedMeetings = data.meetings?.map(meeting => {
      // Ensure participants is always an array
      if (!meeting.participants) {
        meeting.participants = [];
      }
      return meeting;
    }) || [];
    
    setMeetings(processedMeetings);
  } catch (error) {
    console.error("Fetch meetings error:", error);
    displayError(error.message);
  } finally {
    setIsLoading(false);
  }
};
  // Connect Google Calendar
  const connectGoogleCalendar = () => {
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl;
    } else {
      displayError('Unable to get Google authorization URL');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  };
  
  // Get participant info by ID
  const getParticipantInfo = (participant) => {
    // If participant is already a populated object with name
    if (typeof participant === 'object' && participant.name) {
      return participant;
    }
    
    // Get the ID from the participant, which could be in different formats
    let participantId = participant;
    
    // If participant is an object with ID fields
    if (typeof participant === 'object') {
      participantId = participant._id || participant.id || participant.employeeId;
    }
    
    // Find the user by any of their ID fields
    const user = users.find(u => 
      u.id === participantId || 
      u._id === participantId || 
      u.employeeId === participantId
    );
    
    // For debugging
    if (!user) {
      console.log('Could not find participant:', participantId);
    }
    
    return user || { 
      name: `Unknown (ID: ${typeof participantId === 'string' ? participantId.substring(0, 8) : 'Invalid'})`, 
      avatar: '/api/placeholder/50/50' 
    };
  };

  // Format meeting status for display with color
  const getMeetingStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{status}</span>;
    }
  };

  // Check if user is organizer of a meeting
  const isOrganizer = (meeting) => {
    if (!user || !meeting?.organizer) return false;
    const organizerId = typeof meeting.organizer === 'object' 
      ? meeting.organizer.employeeId 
      : meeting.organizer;
    return organizerId === user.employeeId;
  };
  
  // Update the hasManagerPermissions function
  const hasManagerPermissions = () => {
    if (!user) return false;
    return ['Accounts', 'HR', 'Owner'].includes(user.role);
  };
  
  // Generate consistent color based on name
const getAvatarColor = (name) => {
  // Expanded color palette for more visual variety
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500'
  ];
  
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};

// Get initial from name
const getInitial = (name) => {
  if (!name) return '?';
  // Get up to two initials for better visual appearance
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};
  
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Notification components with improved styling */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-500 text-white p-4 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-fadeIn">
          <Check size={20} className="animate-pulse" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
      
      {showError && (
        <div className="fixed top-6 right-6 bg-red-500 text-white p-4 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-fadeIn">
          <AlertTriangle size={20} className="animate-pulse" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}
      
      {/* Improved loading overlay with subtle animation */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium text-center">Loading...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Enhanced header with better spacing and typography */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meeting Scheduler</h1>
          
          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-colors duration-200 ${googleAuthStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <Calendar size={16} className={googleAuthStatus ? 'animate-pulse' : ''} />
              <span>{googleAuthStatus ? 'Google Calendar Connected' : 'Google Calendar Not Connected'}</span>
            </div>
            
            {!googleAuthStatus && (
              <button 
                onClick={connectGoogleCalendar}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-md flex items-center space-x-2"
              >
                <Link size={16} />
                <span>Connect Calendar</span>
              </button>
            )}
            
            <button
              onClick={fetchMeetings}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 hover:rotate-180"
              title="Refresh meetings"
            >
              <RefreshCw size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Enhanced tab navigation with animated indicator */}
        <div className="flex border-b border-gray-200 mb-8 relative">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-6 font-medium relative transition-colors duration-200 ${activeTab === 'schedule' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Schedule Meeting
            {activeTab === 'schedule' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 animate-expandWidth"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`py-3 px-6 font-medium relative transition-colors duration-200 ${activeTab === 'upcoming' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Upcoming Meetings
            {activeTab === 'upcoming' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 animate-expandWidth"></span>}
          </button>
          {hasManagerPermissions() && (
            <button 
              onClick={() => setActiveTab('requests')}
              className={`py-3 px-6 font-medium relative transition-colors duration-200 ${activeTab === 'requests' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Meeting Requests
              {activeTab === 'requests' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 animate-expandWidth"></span>}
            </button>
          )}
          <button 
            onClick={() => navigate('/schedule-interview')}
            className="py-3 px-6 font-medium text-gray-500 hover:text-gray-800 transition-colors duration-200"
          >
            Schedule Interview
          </button>
        </div>
        
        {/* Schedule Meeting Tab - Enhanced Card UI */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-8 text-gray-800">New Meeting Request</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm"
                    placeholder="Enter meeting title"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
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
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors duration-200 shadow-sm"
                  >
                    <option value="">Select start time</option>
                    {generateTimeSlots().map(time => (
                      <option key={`start-${time}`} value={time}>{time}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors duration-200 shadow-sm"
                    disabled={!startTime}
                  >
                    <option value="">Select end time</option>
                    {generateTimeSlots()
                      .filter(time => !startTime || time > startTime)
                      .map(time => (
                        <option key={`end-${time}`} value={time}>{time}</option>
                      ))
                    }
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Description</label>
                <textarea
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm"
                  placeholder="Enter meeting description (optional)"
                  rows={3}
                />
              </div>
              
              {/* Enhanced Participant Selector with Avatars */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Participants <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer transition-colors duration-200 hover:border-blue-300 shadow-sm"
                  >
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-500">
                        {selectedParticipants.length > 0 
                          ? `${selectedParticipants.length} participants selected` 
                          : 'Select participants'}
                      </span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`} />
                  </div>
                  
                  {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl animate-fadeInDown">
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {users.map(user => (
                          <div 
                            key={user.id} 
                            onClick={() => toggleParticipant(user.id)}
                            className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                          >
                            {/* User avatar with initials instead of image */}
                            <div className="w-10 h-10 mr-3 relative flex-shrink-0">
                              <div className={`w-full h-full rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-medium`}>
                                {getInitial(user.name)}
                              </div>
                              {selectedParticipants.includes(user.id) && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email || user.department}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedParticipants.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedParticipants.map(id => {
                      const user = users.find(u => u.id === id);
                      if (!user) return null;
                      return (
                        <div 
                          key={id} 
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center transition-all duration-200 hover:bg-blue-100"
                        >
                          <div className={`w-5 h-5 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white text-xs font-medium mr-2`}>
                            {getInitial(user.name)}
                          </div>
                          <span>{user.name}</span>
                          <X 
                            size={14} 
                            className="ml-2 cursor-pointer hover:text-red-500 transition-colors duration-200" 
                            onClick={() => toggleParticipant(id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 mt-4">
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={includeOwner}
                      onChange={() => setIncludeOwner(!includeOwner)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700">Include Owner in Meeting</span>
                  </label>
                </div>
                
                {includeOwner && (
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-100 animate-fadeIn">
                    <p>The company owner will be automatically notified about this meeting and included as a participant.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={scheduleMeeting}
                disabled={isLoading}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200 font-medium shadow-md"
              >
                {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
            
            {/* Google Calendar Notice - Enhanced */}
            {!googleAuthStatus && (
              <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-start border border-blue-100">
                <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                <p>
                  You haven't connected your Google Calendar yet. Meeting requests can still be submitted, but you'll need to connect 
                  your Google Calendar to create and manage Google Meet links automatically.
                  <button 
                    onClick={connectGoogleCalendar} 
                    className="ml-2 font-medium underline hover:text-blue-800 transition-colors duration-200"
                  >
                    Connect now
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Upcoming Meetings Tab - Enhanced Table UI */}
        {activeTab === 'upcoming' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Your Upcoming Meetings</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {meetings
                    .filter(meeting => meeting.status !== 'rejected' && meeting.status !== 'cancelled')
                    .map(meeting => (
                      <tr key={meeting._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          <div>{meeting.title}</div>
                          {meeting.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{meeting.description}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            <span>{formatDate(meeting.date)}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            <span>{meeting.startTime} - {meeting.endTime}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          <div className="flex -space-x-2">
                            {meeting.participants && meeting.participants.slice(0, 3).map((participant, index) => {
                              const user = getParticipantInfo(participant);
                              return (
                                <div 
                                  key={index} 
                                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-medium ${getAvatarColor(user.name)}`}
                                >
                                  {getInitial(user.name)}
                                </div>
                              );
                            })}
                            {meeting.participants && meeting.participants.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                                +{meeting.participants.length - 3}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            {meeting.participants && meeting.participants.slice(0, 2).map((participant, index) => {
                              const user = getParticipantInfo(participant);
                              return (
                                <div key={index} className="truncate">
                                  {user.name || 'Unknown User'}
                                </div>
                              );
                            })}
                            {meeting.participants && meeting.participants.length > 2 && (
                              <div>+{meeting.participants.length - 2} more</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {getMeetingStatusBadge(meeting.status)}
                        </td>
                        <td className="py-4 px-6 text-sm flex space-x-2">
                          {meeting.meetLink ? (
                            <a 
                              href={meeting.meetLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-md flex items-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
                            >
                              <Video size={14} className="mr-1" />
                              <span>Join</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">No link yet</span>
                          )}
                          {(isOrganizer(meeting) || hasManagerPermissions()) && (
                            <button
                              onClick={() => cancelMeeting(meeting._id)}
                              className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              
              {meetings.filter(meeting => meeting.status !== 'rejected').length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <Calendar size={36} className="mx-auto mb-4 text-gray-300" />
                  <p>No upcoming meetings.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Meeting Requests Tab - Enhanced Table UI */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Meeting Requests</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {meetings
                    .filter(meeting => meeting.status === 'pending')
                    .map(meeting => {
                      const organizer = meeting.organizer && typeof meeting.organizer === 'object' 
                        ? meeting.organizer 
                        : users.find(u => u.id === meeting.organizer) || { name: 'Unknown' };
                      
                      return (
                        <tr key={meeting._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">{meeting.title}</td>
                          <td className="py-4 px-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-2 text-gray-400" />
                              <span>{formatDate(meeting.date)}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Clock size={16} className="mr-2 text-gray-400" />
                              <span>{meeting.startTime} - {meeting.endTime}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700">
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full ${getAvatarColor(organizer.name)} flex items-center justify-center text-white text-xs font-medium mr-2`}>
                                {getInitial(organizer.name)}
                              </div>
                              <span>{organizer.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500">
                            <div className="flex -space-x-2">
                              {meeting.participants && meeting.participants.slice(0, 3).map((participant, index) => {
                                const user = getParticipantInfo(participant);
                                return (
                                  <div 
                                    key={index} 
                                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-medium ${getAvatarColor(user.name)}`}
                                  >
                                    {getInitial(user.name)}
                                  </div>
                                );
                              })}
                              {meeting.participants && meeting.participants.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                                  +{meeting.participants.length - 3}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-500">
                              {meeting.participants && meeting.participants.slice(0, 2).map((participant, index) => {
                                const user = getParticipantInfo(participant);
                                return (
                                  <div key={index} className="truncate">
                                    {user.name || 'Unknown User'}
                                  </div>
                                );
                              })}
                              {meeting.participants && meeting.participants.length > 2 && (
                                <div>+{meeting.participants.length - 2} more</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            {getMeetingStatusBadge(meeting.status)}
                          </td>
                          <td className="py-4 px-6 text-sm flex space-x-2">
                            <button
                              onClick={() => approveMeeting(meeting._id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md flex items-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
                            >
                              <Check size={14} className="mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => rejectMeeting(meeting._id)}
                              className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-md flex items-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
                            >
                              <X size={14} className="mr-1" />
                              Decline
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              
              {meetings.filter(meeting => meeting.status === 'pending').length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <Clock size={36} className="mx-auto mb-4 text-gray-300" />
                  <p>No pending meeting requests.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}