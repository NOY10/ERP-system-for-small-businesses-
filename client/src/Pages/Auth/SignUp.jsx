import { Visibility, VisibilityOff } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import register from "./register.svg";

import { API_BASE_URL } from "../../config/api";

const SignUp = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  // State for steps, form fields, errors, and notifications
  const [step, setStep] = useState(1);
  const [name, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [cid, setCid] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [subscription, setSubscription] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });

  const handleChange = (e, setter, field) => {
    setter(e.target.value);
    setErrors((prev) => ({ ...prev, [field]: "" })); // Clear error for this field
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setErrors((prev) => ({ ...prev, phone: "" }));
      setNumber(value);
    } else {
      setErrors((prev) => ({ ...prev, phone: "Only numbers are allowed" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Username is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!phone) newErrors.phone = "Phone number is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!subscription) newErrors.subscription = "Subscription is required";
    if (!cid) newErrors.cid = "Cid is required";

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailPattern.test(email)) {
      newErrors.email = "Email is not valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Form is valid if there are no errors
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/sendotpuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP. Please try again.");
      }

      setSnackbar({ open: true, message: "OTP sent successfully!", severity: "success" });
      setStep(2); // Move to OTP verification step
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  const handleVerifyOtpAndSignUp = async (e) => {
    e.preventDefault();

    if (!otp) {
      setErrors((prev) => ({ ...prev, otp: "OTP is required" }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/signupUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, gender,dob,cid, phone, email, password, subscription, otp }),
      });

      if (!response.ok) {
        throw new Error("OTP verification failed. Please try again.");
      }

      setSnackbar({ open: true, message: "Sign up successful!", severity: "success" });
      navigate("/login");
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Left side: Sign Up Form */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center p-4">
        <form className="w-full max-w-sm px-6 py-8">
          <h2 className="text-3xl font-bold text-center mb-6">
            {step === 1 ? "Sign Up" : "Verify OTP"}
          </h2>

          {step === 1 ? (
            <>
              {/* Username Field */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={name}
                  onChange={(e) => handleChange(e, setUsername, "name")}
                  className={`w-full py-3 px-4 rounded-lg bg-gray-100 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => handleChange(e, setEmail, "email")}
                  className={`w-full py-3 px-4 rounded-lg bg-gray-100 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Gender Field */}
              <div className="mb-4">
                <input
                  type="date"
                  placeholder="dob"
                  value={dob}
                  onChange={(e) => handleChange(e, setDob, "dob")}
                  className={`w-full py-3 px-4 rounded-lg bg-gray-100 border ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                />
                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
              </div>

              {/* Gender Field */}
              <div className="mb-4">
                <select
                  name="dob"
                  value={dob}
                  onChange={(e) => handleChange(e, setGender, "gender")}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.gender ? "border-red-500" : "border-gray-100"
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>


              {/* cid Field */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cid"
                  value={cid}
                  onChange={(e) => handleChange(e, setCid, "cid")}
                  className={`w-full py-3 px-4 rounded-lg bg-gray-100 border ${
                    errors.cid ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                />
                {errors.cid && <p className="text-red-500 text-sm mt-1">{errors.cid}</p>}
              </div>

              {/* Phone Field */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`w-full py-3 px-4 rounded-lg bg-gray-100 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
        
              {/* Subscription Field */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Subscription"
                  value={subscription}
                  onChange={(e) => handleChange(e, setSubscription, "subscription")}
                  className={`w-full py-3 px-4 rounded-lg bg-gray-100 border ${
                    errors.subscription ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                />
                {errors.subscription && (
                  <p className="text-red-500 text-sm mt-1">{errors.subscription}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative mb-4">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => handleChange(e, setPassword, "password")}
                  className={`w-full py-3 px-4 rounded-lg bg-gray-100 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-sky-400`}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-none"
                >
                  {passwordVisible ? <Visibility /> : <VisibilityOff />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

              {/* Send OTP Button */}
              <button
                onClick={handleSendOtp}
                className="w-full px-8 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition focus:outline-none"
              >
                Send OTP
              </button>
            </>
          ) : (
            <>
              {/* OTP Field */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => handleChange(e, setOtp, "otp")}
                  className="w-full py-3 px-4 rounded-full bg-gray-100"
                />
                {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp
}</p>}
              </div>

              {/* Verify OTP Button */}
              <button
                onClick={handleVerifyOtpAndSignUp}
                className="w-full px-8 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition focus:outline-none"
              >
                Verify OTP and Sign Up
              </button>
            </>
          )}
        </form>
      </div>

      {/* Right side: Sign In Call to Action */}
      <div className="lg:w-1/2 bg-sky-500 flex flex-col items-center justify-center text-white p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold">One of us?</h3>
          <p className="mt-4">
            Sign In and continue where you left off. We are glad to have you back!
          </p>
          <button
            className="px-6 py-2 border-2 border-white rounded-full hover:bg-white hover:text-sky-500 transition mt-4"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
        <img
          src={register}
          className="hidden lg:block w-4/5 max-w-md mt-16"
          alt="Register illustration"
        />
      </div>
    </div>
  );
};

export default SignUp;
