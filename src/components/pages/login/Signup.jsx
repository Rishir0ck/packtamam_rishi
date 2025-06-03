import React from "react";
import { packtamam, packtamambanner } from "../../imagepath";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "feather-icons-react/build/IconComponents";
import FirebaseAuthService from "../../../Firebase/services/firebase_auth_service";

const Signup = () => {
  const navigate = useNavigate();
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  // UI states
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!FirebaseAuthService.validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = FirebaseAuthService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      console.log("🚀 Starting signup process...");
      const result = await FirebaseAuthService.signUp(
        formData.email, 
        formData.password, 
        formData.fullName
      );

      console.log("📊 Signup result:", result);

      if (result.success) {
        // Check if API integration was successful
        const apiStatus = result.apiResult ? result.apiResult.success : false;
        
        console.log(`🎯 Firebase Success: Yes, API Success: ${apiStatus ? 'Yes' : 'No'}`);
        
        if (apiStatus) {
          setMessage("Account created successfully! You're now registered with both Firebase and our backend system.");
          console.log("✅ Full integration successful - both Firebase and API");
        } else {
          setMessage("Account created with Firebase! Note: Backend integration is currently unavailable, but you can still use the app.");
          console.log("⚠️ Partial success - Firebase only, API failed");
        }

        // Redirect to dashboard after successful signup
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000); // Increased timeout to 2 seconds to show the message
      } else {
        console.error("❌ Signup failed:", result);
        setMessage(result.message || "Account creation failed. Please try again.");
      }
    } catch (error) {
      console.error("💥 Unexpected signup error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine message type for styling
  const getMessageType = () => {
    if (message.includes('successful') || message.includes('created')) {
      return 'success';
    } else if (message.includes('Note:') || message.includes('unavailable')) {
      return 'warning';
    } else {
      return 'danger';
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
                      <h3 className="text-center mb-4">Getting Started</h3>
                      
                      {/* Success/Error/Warning Message */}
                      {message && (
                        <div className={`alert alert-${getMessageType()} mb-3`} role="alert">
                          <div className="d-flex align-items-start">
                            <div className="flex-grow-1">
                              {message}
                            </div>
                            {/* Show different icons based on message type */}
                            {getMessageType() === 'success' && (
                              <i className="fas fa-check-circle text-success ms-2"></i>
                            )}
                            {getMessageType() === 'warning' && (
                              <i className="fas fa-exclamation-triangle text-warning ms-2"></i>
                            )}
                            {getMessageType() === 'danger' && (
                              <i className="fas fa-times-circle text-danger ms-2"></i>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Form */}
                      <form onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div className="mb-3">
                          <label>
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            required
                          />
                          {errors.fullName && (
                            <div className="invalid-feedback">{errors.fullName}</div>
                          )}
                        </div>
                        
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
                            placeholder="Enter your email address"
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
                              placeholder="Enter your password"
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
                              role="button"
                              tabIndex={0}
                              aria-label="Toggle password visibility"
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
                        
                        {/* Confirm Password */}
                        <div className="mb-3">
                          <label>
                            Confirm Password{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <div className="position-relative">
                            <input
                              type={passwordVisible1 ? "text" : "password"}
                              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm your password"
                              style={{ paddingRight: "40px" }}
                              required
                            />
                            <span
                              onClick={togglePasswordVisibility1}
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
                              {passwordVisible1 ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </span>
                            {errors.confirmPassword && (
                              <div className="invalid-feedback">{errors.confirmPassword}</div>
                            )}
                          </div>
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
                                Creating Account...
                              </>
                            ) : (
                              "Sign up"
                            )}
                          </button>
                        </div>
                      </form>

                      <div className="text-center mb-3">
                        <p className="mb-1">
                          Already have an account?{" "}
                          <Link
                            to="/login"
                            style={{ color: "#403222", fontWeight: 600 }}
                          >
                            Login
                          </Link>
                        </p>
                      </div>
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

export default Signup;