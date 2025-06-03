import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { packtamam, packtamambanner } from "../../imagepath";
import { useState } from "react";
import { Eye, EyeOff } from "feather-icons-react/build/IconComponents";
import FirebaseAuthService from "../../../Firebase/services/firebase_auth_service";

const Login = () => {
  const navigate = useNavigate();
  
  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  // UI states
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!FirebaseAuthService.validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission - Updated with API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      console.log("🚀 Starting login process...");
      console.log(`📧 Email: ${formData.email}`);
      
      // This now calls both Firebase auth AND Node.js API
      const result = await FirebaseAuthService.signIn(
        formData.email, 
        formData.password
      );

      console.log("📊 Login result:", result);

      if (result.success) {
        // Check if backend API authentication was successful
        const apiSuccess = result.apiResult?.success;
        
        if (apiSuccess) {
          console.log("✅ Both Firebase and API authentication successful");
          setMessage("Login successful! Redirecting...");
        } else {
          console.log("⚠️ Firebase auth successful, API auth failed");
          setMessage("Login successful! (Backend API unavailable - continuing with limited access)");
        }
        
        // Log authentication details for debugging
        console.log("🔐 Authentication Details:");
        console.log(`   Firebase: ✅ Success`);
        console.log(`   Backend API: ${apiSuccess ? '✅ Success' : '❌ Failed'}`);
        console.log(`   User UID: ${result.user.uid}`);
        console.log(`   User Email: ${result.user.email}`);
        
        if (result.apiResult?.data) {
          console.log(`   API Response:`, result.apiResult.data);
        }
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1500);
      } else {
        console.error("❌ Authentication failed:", result.message);
        setMessage(result.message);
      }
    } catch (error) {
      console.error("❌ Unexpected login error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="main-wrapper login-body">
        <div className="container-fluid px-0">
          <div className="row">
            {/* Login logo */}
            <div className="col-lg-6">
              <div className="login-sec">
                <div className="log-img">
                  <img className="img-fluid login-wrap" src={packtamambanner} alt="#" />
                </div>
              </div>
            </div>
            {/* /Login logo */}
            {/* Login Content */}
            <div className="col-lg-6 login-wrap-bg">
              <div className="login-wrapper">
                <div className="loginbox">
                  <div className="login-right">
                    <div className="login-right-wrap">
                      <div className="account-logo">
                        <Link>
                          <img
                            src={packtamam}
                            alt="Logo"
                            style={{ maxWidth: "150px" }}
                            className="img-fluid"
                          />
                        </Link>
                      </div>
                      <h3 className="text-center mb-4">Welcome Back</h3>
                      
                      {/* Success/Error Message */}
                      {message && (
                        <div className={`alert ${
                          message.includes('successful') || message.includes('Redirecting') 
                            ? 'alert-success' 
                            : message.includes('unavailable') 
                              ? 'alert-warning'
                              : 'alert-danger'
                        } mb-3`}>
                          {message}
                        </div>
                      )}

                      {/* Form */}
                      <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="mb-3">
                          <label>
                            Email <span className="text-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>
                        
                        {/* Password */}
                        <div className="mb-3">
                          <label>
                            Password <span className="text-danger">*</span>
                          </label>
                          <div className="position-relative">
                            <input
                              type={passwordVisible ? "text" : "password"}
                              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              style={{ paddingRight: "40px" }}
                              required
                            />
                            <span
                              onClick={togglePasswordVisibility}
                              style={{
                                position: "absolute",
                                top: "50%",
                                right: "12px",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#6c757d",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "20px",
                                width: "20px",
                              }}
                            >
                              {passwordVisible ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </span>
                            {errors.password && (
                              <div className="invalid-feedback">{errors.password}</div>
                            )}
                          </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="form-check">
                            {/* Remember me functionality can be added here if needed */}
                          </div>
                          <Link
                            to="/forgotpassword"
                            style={{ color: "#403222", fontWeight: 600 }}
                          >
                            Forgot Password?
                          </Link>
                        </div>

                        <div className="d-grid mb-3">
                          <button
                            className="btn btn-block"
                            type="submit"
                            disabled={loading}
                            style={{
                              backgroundColor: "#c1a078",
                              color: "#fff",
                            }}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Authenticating...
                              </>
                            ) : (
                              "Login"
                            )}
                          </button>
                        </div>
                      </form>

                      {/* <div className="text-center mb-3">
                        <p className="mb-1">
                          Need an account?{" "}
                          <Link
                            to="/signup"
                            style={{ color: "#403222", fontWeight: 600 }}
                          >
                            Sign Up
                          </Link>
                        </p>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Login Content */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;