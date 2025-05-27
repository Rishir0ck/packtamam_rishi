import React  from "react";
import { Link } from "react-router-dom";
// import FeatherIcon from "feather-icons-react";
import { packtamam } from "../../imagepath";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import { useState } from "react";

import { Eye, EyeOff } from "feather-icons-react/build/IconComponents";

// import ReactPasswordToggleIcon from 'react-password-toggle-icon';



const Login = () => {


  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };


  // let inputRef = useRef();
  // const showIcon = () => <i className="feather feather-eye" aria-hidden="true">
  //   <FeatherIcon icon="eye" />
  // </i>;
  // const hideIcon = () => <i className="feather feather-eye-slash" aria-hidden="true">
  //   <FeatherIcon icon="eye-off" />
  // </i>
  return (
    <>

      {/* Main Wrapper */}
      <div className="main-wrapper login-body">
        <div className="container-fluid px-0">
          <div className="row">
            {/* Login Content */}
            <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center px-3">
              <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                  <div className="card shadow rounded-4 p-4">
                    <div className="text-center mb-4">
                      <Link to="/admin-dashboard">
                        <img className="img-fluid" src={packtamam} alt="Logo" style={{ maxWidth: '150px' }} />
                      </Link>
                    </div>
                    <h3 className="text-center mb-4">Login</h3>
                    <form>
                      <div className="mb-3">
                        <label>Email <span className="text-danger">*</span></label>
                        <input type="email" className="form-control" required />
                      </div>
                      {/* password  */}
                      <div className="mb-3">
                        <label>
                          Password <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <input
                            type={passwordVisible ? 'text' : 'password'}
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <span
                            className="input-group-text"
                            style={{ cursor: 'pointer' }}
                            onClick={togglePasswordVisibility}
                          >
                            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <label className="form-check-label">
                            <input type="checkbox" className="form-check-input me-1" /> Remember me
                          </label>
                        </div>
                        <Link to="/forgotpassword" style={{ color: '#403222' , fontWeight: 600}}>Forgot Password?</Link>
                      </div>
                      <div className="d-grid mb-3">
                        <Link 
                        to="/admin-dashboard" 
                        className="btn btn-primary" 
                        style={{ backgroundColor: '#c1a078', color: '#fff' }}
                        >Login</Link>
                      </div>
                    </form>
                    <div className="text-center">
                      <p className="mb-3">Need an account? <Link to="/signup" style={{ color: '#403222' , fontWeight: 600}}>Sign Up</Link></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Login Content */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
