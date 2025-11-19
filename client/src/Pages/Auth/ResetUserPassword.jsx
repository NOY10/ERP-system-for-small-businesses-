import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../../Components/Toast";
import ForP from "./forpas.webp";

const ResetUserPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(""); // Clear error if passwords match

    try {
      const res = await fetch("http://localhost:8000/newusers-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
      });

      const data = await res.json();
      setMessage(data.message);
      setShowToast(true);
      setTimeout(() => {
        navigate("/login");
    }, 3000);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
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
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Reset Password</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="block w-full p-3 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="block w-full p-3 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Reset Password
            </button>
          </form>
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
};

export default ResetUserPassword;
