import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

import { API_BASE_URL } from "../../config/api";

function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token, user } = useAuthStore();

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user?.email,
            currentPassword,
            newPassword
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setSuccess(data.message);
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setSuccess('');
    }
  };

  return (
    <div className="flex items-center justify-center text-black">
      <div className="p-6 w-96">
        <p className="text-sm text-gray-600 mb-4">
          Your password must be at least 6 characters and should include a combination of numbers, letters, and special characters (!$@%).
        </p>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
        <div className="mb-3">
          <label className="text-sm block mb-1">Current password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="mb-3">
          <label className="text-sm block mb-1">New password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="mb-3">
          <label className="text-sm block mb-1">Re-type new password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500" />
        </div>
        <div onClick={() => navigate("/forgot_password")} className="text-blue-400 text-sm hover:underline block mb-4">Forgot your password?</div>
        <button onClick={handleChangePassword} className="w-full bg-blue-600 p-2 rounded-lg text-white font-semibold hover:bg-blue-700 cursor-pointer">Change password</button>
      </div>
    </div>
  );
}

export default ChangePassword;