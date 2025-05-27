import React from "react";
import {
  packtamam
} from "../../imagepath";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "feather-icons-react/build/IconComponents";

const Signup = () => {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [password1, setPassword1] = useState('');

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };


  
  return (
    <div>
      <div className="main-wrapper login-body">
        <div className="container-fluid px-0">
          <div className="row">
            {/* Login Content */}
            <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 bg-light">
              <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                  <div className="card p-4 shadow rounded-4 bg-white">
                    <div className="text-center mb-4">
                      <Link to="/admin-dashboard">
                        <img src={packtamam} alt="Logo" style={{ maxWidth: '150px' }} className="img-fluid" />
                      </Link>
                    </div>
                    <h3 className="text-center mb-4">Getting Started</h3>
                    {/* Full Name */}
                    <form action="./login">
                      <div className="mb-3">
                        <label>Full Name <span className="text-danger">*</span></label>
                        <input className="form-control" type="text" required />
                      </div>
                      {/* Email */}
                      <div className="mb-3">
                        <label>Email <span className="text-danger">*</span></label>
                        <input className="form-control" type="email" required />
                      </div>
                      {/* Password */}
                      <div className="form-group position-relative">
                        <label>Password <span className="text-danger">*</span></label>
                        <div className="position-relative">
                          <input
                            type={passwordVisible ? 'text' : 'password'}
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingRight: '40px' }}
                            required
                          />
                          <span
                            onClick={togglePasswordVisibility}
                            style={{
                              position: 'absolute',
                              top: '50%',
                              right: '12px',
                              transform: 'translateY(-50%)',
                              cursor: 'pointer',
                              color: '#6c757d',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '20px',
                              width: '20px',
                            }}
                          >
                            {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                          </span>
                        </div>
                      </div>
                      {/* Confirm Password */}
                      <div className="form-group position-relative">
                        <label>Confirm Password <span className="text-danger">*</span></label>
                        <div className="position-relative">
                          <input
                            type={passwordVisible1 ? 'text' : 'password'}
                            className="form-control"
                            value={password1}
                            onChange={(e) => setPassword1(e.target.value)}
                            style={{ paddingRight: '40px' }}
                            required
                          />
                          <span
                            onClick={togglePasswordVisibility1}
                            style={{
                              position: 'absolute',
                              top: '50%',
                              right: '12px',
                              transform: 'translateY(-50%)',
                              cursor: 'pointer',
                              color: '#6c757d',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '20px',
                              width: '20px',
                            }}
                          >
                            {passwordVisible1 ? <EyeOff size={20} /> : <Eye size={20} />}
                          </span>
                        </div>
                      </div>
                      {/* Terms and Conditions */}
                      {/* <div className="form-check mb-3">
                        <input type="checkbox" className="form-check-input" id="termsCheck" required />
                        <label className="form-check-label" htmlFor="termsCheck">
                          I agree to the <Link to="#">terms of service</Link> and <Link to="#">privacy policy</Link>
                        </label>
                      </div> */}

                      <div className="d-grid mb-3">
                        <button className="btn btn-primary" type="submit" style={{ backgroundColor: '#c1a078', color: '#fff' }}>Sign up</button>
                      </div>
                    </form>

                    <div className="text-center mb-3">
                      <p className="mb-1">Already have an account? <Link to="/login" style={{ color: '#403222' , fontWeight: 600}}>Login</Link></p>
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
