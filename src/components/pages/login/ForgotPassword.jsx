import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { packtamam } from '../../imagepath';
import { Modal, Button } from 'react-bootstrap';

const ForgotPassword = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    if (email.trim() === '') {
      alert('Please enter your email address');
      return;
    }

    // Simulate OTP sent
    setShowOtpModal(true);
  };

  return (
    <div className="main-wrapper login-body">
      <div className="container-fluid px-0">
        <div className="row">
          <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 px-4">
              <div className="card shadow-sm border-0 rounded-4 p-4">
                <div className="text-center mb-4">
                  <Link to="/admin-dashboard">
                    <img src={packtamam} alt="Logo" className="img-fluid" style={{ maxHeight: '60px' }} />
                  </Link>
                </div>
                <h3 className="text-center mb-3">Reset Password</h3>

                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-grid">
                    <button className="btn btn-primary" type="submit" style={{ backgroundColor: '#c1a078', color: '#fff' }}> 
                      Send OTP
                    </button>
                  </div>
                </form>

                <div className="text-center mt-3">
                  <p className="mb-1">
                    Need an account? <Link to="/login" style={{ color: '#403222' , fontWeight: 600}}>Login</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* OTP Modal */}
          <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>OTP Sent</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              An OTP has been sent to <strong>{email}</strong>. Please check your email to continue.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={() => setShowOtpModal(false)}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
