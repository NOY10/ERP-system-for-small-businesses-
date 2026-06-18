import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
            <p className="text-lg text-gray-700 mb-6">
                You do not have permission to access this page.
            </p>
            <div className="flex space-x-4">
                <Link
                    to="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Go to Home
                </Link>
                <Link
                    to="/login"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
                >
                    Login with Different Account
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
