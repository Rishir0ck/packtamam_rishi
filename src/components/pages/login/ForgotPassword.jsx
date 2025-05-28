import React, { useState } from "react";
import { Link } from "react-router-dom";
import { packtamam, packtamambanner } from "../../imagepath";
import { Modal, Button } from "react-bootstrap";

const ForgotPassword = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState("");

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (email.trim() === "") {
      alert("Please enter your email address");
      return;
    }
    // Simulate OTP sent
    setShowOtpModal(true);
  };

  return (
    <div className="main-wrapper login-body">
      <div className="container-fluid px-0">
        <div className="row">
          {/* Login logo */}
          <div className="col-lg-6 login-wrap">
            <div className="login-sec">
              <div className="log-img">
                <img className="img-fluid" src={packtamambanner} alt="Logo" />
              </div>
            </div>
          </div>

          {/* Login Content */}
          <div className="col-lg-6 login-wrap-bg">
            <div className="login-wrapper">
              <div className="loginbox">
                <div className="login-right">
                  <div className="login-right-wrap">
                    <div className="account-logo">
                      <Link to="/admin-dashboard">
                        <img className="img-fluid" src={packtamam} alt="Logo" />
                      </Link>
                    </div>
                    <h2>Reset Password</h2>

                    {/* Form */}
                    <form onSubmit={handleResetPassword}>
                      <div className="form-group">
                        <label>
                          Email <span className="login-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group login-btn">
                        <button
                          className="btn btn-block"
                          type="submit"
                          style={{ backgroundColor: "#c1a078", color: "#fff" }}
                        >
                          Send OTP
                        </button>
                      </div>
                    </form>
                    {/* /Form */}

                    <div className="next-sign">
                      <p className="account-subtitle">
                        Need an account?
                        <Link style={{ color: "#403222" }} to="/login"> Login</Link>
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

      {/* OTP Modal */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>OTP Sent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          An OTP has been sent to <strong>{email}</strong>. Please check your inbox.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOtpModal(false)}>
            Close
          </Button>
          <Link to="/verify-otp" className="btn btn-primary">
            Enter OTP
          </Link>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
