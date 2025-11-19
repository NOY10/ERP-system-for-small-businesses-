import React, { useState } from 'react';
import axios from 'axios';
import ForP from "./forpas.webp";
import Toast from "../../Components/Toast";
import { useLocation, useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = location.state || {};

    console.log(role)

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Dynamically choose the endpoint based on the role
            const endpoint =
                role === "Owner"
                    ? "http://localhost:8000/resetusers-password"
                    : "http://localhost:8000/resetEmployee-password";
            
            const { data } = await axios.post(endpoint, { email });
            
            setShowToast(true);
            setMessage(data.message);
            
            setTimeout(() => {
                navigate("/login");
            }, 3000);
    
        } catch (error) {
            setError(error.response?.data?.error || 'Something went wrong');
        }
    };
    

    return (
        <div className="flex min-h-screen flex-col lg:flex-row">

            <div className="relative lg:w-1/2 flex flex-col justify-center items-center bg-sky-500 text-white p-8">
                <div className="text-center">
                    <h3 className="text-2xl font-bold">Forgot Your Password?</h3>
                    <p className="mt-4">
                        No worries! Enter your email, and we'll send you a link to reset your password.
                    </p>
                </div>
                <img
                    src={ForP}
                    className="hidden lg:block w-[400px] h-[600px] object-cover mt-16"
                    alt="Forgot Password"
                />
            </div>


            <div className="relative flex flex-col justify-center items-center lg:w-1/2 w-full max-w-lg mx-auto px-6 lg:px-12">
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                    <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Forgot Password</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full p-3 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                           Send 
                        </button>
                    </form>
                    {/* {message && <p className="mt-4 text-center text-gray-600">{message}</p>} */}
                </div>
            </div>

            {showToast && (
                <Toast
                type="success"
                message={message}
                duration={3000}
                />
            )}
            {error && (
                <Toast type="error" message={error}  />
            )}
        </div>
    );
}

export default ForgotPassword;
