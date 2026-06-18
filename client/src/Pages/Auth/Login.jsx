import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import log from "./log.svg";
import useCompanyStore from "../../store/useCompanyStore";

import { API_BASE_URL } from "../../config/api";

const Login = () => {
  const { login } = useAuthStore();
  const { setCompanyInfo } = useCompanyStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Owner");

  const handleLogin = async () => {
    const endpoint =
      role === "Owner"
        ? `${API_BASE_URL}/signinUser`
        : `${API_BASE_URL}/signinEmployee`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Response Data:", data);

      if (data.token) {
        const user = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          employeeId: data.user.employeeId,
          profilePic: data.user.profilePic,
        };
        // console.log("Logging in user:", user);
        login(user, data.token); // Ensure this function is called correctly
        // console.log("Stored User:", user);

        if (role === "Owner") {
          try {
            const companyRes = await fetch(
              `${API_BASE_URL}/viewCompanyInfo`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${data.token}`,
                },
              }
            );

            const companyData = await companyRes.json();
            console.log("Fetched Company Info:", companyData);

            if (companyData.companyInfo) {
              await setCompanyInfo(companyData.companyInfo);
            } else {
              console.warn("Company Info not found in response");
            }
          } catch (companyError) {
            console.error("Error fetching company info:", companyError);
          }
        } else {
          try {
            const companyRes = await fetch(
              `${API_BASE_URL}/employee/viewCompanyInfo`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${data.token}`,
                },
              }
            );

            const companyData = await companyRes.json();
            console.log("Fetched Company Info:", companyData);

            console.log("companyData", companyData);

            if (companyData.companyInfo) {
              await setCompanyInfo(companyData.companyInfo);
            } else {
              console.warn("Company Info not found in response");
            }
          } catch (companyError) {
            console.error("Error fetching company info:", companyError);
          }
        }

        if (role === "Owner") {
          navigate("/dashboard/owner");
        } else {
          navigate(`/dashboard/${user.role.toLowerCase()}`);
        }
      } else {
        alert(data.error || "Failed to login");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left side: Image and Sign Up Call to Action */}
      <div className="relative lg:w-1/2 flex flex-col justify-center items-center bg-sky-500 text-white p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold">New here?</h3>
          <p className="mt-4">
            Sign Up to explore amazing features and benefits tailored for you!
          </p>
          {role === "Owner" && (
            <button
              className="px-6 py-2 border-2 border-white rounded-full hover:bg-white hover:text-sky-500 transition mt-4"
              onClick={() => navigate("/auth/signup")}
            >
              Sign Up
            </button>
          )}
        </div>
        <img
          src={log}
          className="hidden lg:block w-full h-auto object-cover mt-16"
          alt="Log In"
        />
      </div>

      {/* Login Section */}
      <div className="relative flex flex-col justify-center items-center lg:w-1/2 w-full max-w-lg mx-auto px-6 lg:px-12">
        <div className="relative w-full max-w-lg">
          {/* Background Cards */}
          <div className="absolute inset-0">
            <div className="card bg-sky-400 shadow-lg w-full h-full rounded-3xl transform -rotate-6"></div>
            {/* <div className="card bg-gray-400 shadow-lg w-full h-full rounded-3xl transform rotate-6 -top-4 absolute"></div> */}
          </div>

          {/* Form Section */}
          <div className="relative p-12 bg-white mx-auto rounded-3xl shadow-md z-10 w-full">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Login to your account
            </p>

            {/* Role Buttons */}
            <div className="flex justify-between mb-6">
              <button
                className={`flex-1 px-4 py-2 mr-2 text-white font-semibold rounded transition duration-500 ease-in-out transform hover:scale-105 ${
                  role === "Owner" ? "bg-sky-600" : "bg-gray-300"
                }`}
                onClick={() => setRole("Owner")}
              >
                Owner
              </button>
              <button
                className={`flex-1 px-4 py-2 ml-2 text-white font-semibold rounded transition duration-500 ease-in-out transform hover:scale-105 ${
                  role === "Employee" ? "bg-sky-600" : "bg-gray-300"
                }`}
                onClick={() => setRole("Employee")}
              >
                Employee
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="block w-full p-3 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
            </div>

            {/* Owner Sign Up Link */}
            <div className="mt-4 text-center h-6">
              {role === "Owner" && (
                <span className="text-gray-500">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => navigate("/auth/signup")}
                    className="text-green-500 font-medium transition duration-500 ease-in-out transform hover:scale-105"
                  >
                    Register as Owner
                  </button>
                </span>
              )}
            </div>

            {/* Login Button */}
            <button
              className="w-full bg-sky-500 text-white py-3 rounded mt-6 hover:bg-sky-600 font-semibold transition duration-500 ease-in-out transform hover:scale-105"
              onClick={handleLogin}
            >
              Login
            </button>

            {/* Forgot Password Link */}
            <div className="mt-7 text-center">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot_password", { state: { role } });
                }}
                className="text-sky-500 font-medium transition duration-500 ease-in-out transform hover:scale-105"
              >
                Forgot Password? Click Here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
