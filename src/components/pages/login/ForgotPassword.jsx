// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { packtamam, packtamambanner } from "../../imagepath";
// import { Modal } from "react-bootstrap";
// import FirebaseAuthService from "../../../Firebase/services/firebase_auth_service"; // Import the auth service

// const ForgotPassword = () => {
//   const [showEmailSentModal, setShowEmailSentModal] = useState(false);
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [message, setMessage] = useState("");

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEmail(value);
    
//     // Clear specific error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ""
//       }));
//     }
//   };

//   // Validate form
//   const validateForm = () => {
//     const newErrors = {};

//     // Email validation
//     if (!email) {
//       newErrors.email = "Email is required";
//     } else if (!FirebaseAuthService.validateEmail(email)) {
//       newErrors.email = "Please enter a valid email address";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       // Send password reset email using Firebase
//       const result = await FirebaseAuthService.sendPasswordResetEmail(email);
      
//       if (result.success) {
//         console.log("✅ Password reset email sent successfully");
//         setShowEmailSentModal(true);
//       } else {
//         console.error("❌ Failed to send password reset email:", result.message);
//         setMessage(result.message);
//       }
//     } catch (error) {
//       console.error("❌ Error in password reset:", error);
//       setMessage("An unexpected error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="main-wrapper login-body">
//         <div className="container-fluid px-0">
//           <div className="row">
//             {/* Login logo */}
//             <div className="col-lg-6">
//               <div className="login-sec">
//                 <div className="log-img">
//                   <img className="img-fluid login-wrap" src={packtamambanner} alt="#" />
//                 </div>
//               </div>
//             </div>
//             {/* /Login logo */}

//             {/* Login Content */}
//             <div className="col-lg-6 login-wrap-bg">
//               <div className="login-wrapper">
//                 <div className="loginbox">
//                   <div className="login-right">
//                     <div className="login-right-wrap">
//                       <div className="account-logo">
//                         <Link>
//                           <img
//                             src={packtamam}
//                             alt="Logo"
//                             style={{ maxWidth: "150px" }}
//                             className="img-fluid"
//                           />
//                         </Link>
//                       </div>
//                       <h3 className="text-center mb-4">Reset Password</h3>

//                       {/* Success/Error Message */}
//                       {message && (
//                         <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} mb-3`}>
//                           {message}
//                         </div>
//                       )}

//                       {/* Form */}
//                       <form onSubmit={handleResetPassword}>
//                         {/* Email */}
//                         <div className="mb-3">
//                           <label>
//                             Email <span className="text-danger">*</span>
//                           </label>
//                           <input
//                             className={`form-control ${errors.email ? 'is-invalid' : ''}`}
//                             type="email"
//                             name="email"
//                             value={email}
//                             onChange={handleInputChange}
//                             required
//                           />
//                           {errors.email && (
//                             <div className="invalid-feedback">{errors.email}</div>
//                           )}
//                         </div>

//                         <div className="d-grid mb-3">
//                           <button
//                             className="btn btn-block"
//                             type="submit"
//                             disabled={loading}
//                             style={{
//                               backgroundColor: "#c1a078",
//                               color: "#fff",
//                             }}
//                           >
//                             {loading ? (
//                               <>
//                                 <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                                 Sending...
//                               </>
//                             ) : (
//                               "Send Reset Email"
//                             )}
//                           </button>
//                         </div>
//                       </form>
//                       {/* /Form */}

//                       <div className="text-center mb-3">
//                         <p className="mb-1">
//                           Need an account?{" "}
//                           <Link
//                             to="/login"
//                             style={{ color: "#403222", fontWeight: 600 }}
//                           >
//                             Login
//                           </Link>
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* /Login Content */}
//           </div>
//         </div>

//         {/* Email Sent Modal */}
//         <Modal show={showEmailSentModal} onHide={() => setShowEmailSentModal(false)} centered>
//           <Modal.Header closeButton>
//             <Modal.Title>Password Reset Email Sent</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <div className="text-center">
//               <div className="mb-3">
//                 <i className="fas fa-envelope-open" style={{ fontSize: "48px", color: "#c1a078" }}></i>
//               </div>
//               <p>
//                 A password reset email has been sent to <strong>{email}</strong>.
//               </p>
//               <p>
//                 Please check your inbox and follow the instructions in the email to reset your password.
//               </p>
//               <p className="text-muted small">
//                 Don&apos;t see the email? Check your spam folder or wait a few minutes and try again.
//               </p>
//             </div>
//           </Modal.Body>
//           <Modal.Footer className="justify-content-center">
//             <Link 
//               to="/login" 
//               className="btn btn-primary"
//               style={{ backgroundColor: "#c1a078", borderColor: "#c1a078" }}
//               onClick={() => setShowEmailSentModal(false)}
//             >
//               Back to Login
//             </Link>
//           </Modal.Footer>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;
