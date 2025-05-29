/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FirebaseAuthService from "../Firebase/services/firebase_auth_service"; // Adjust path as needed
import LogoutConfirmationModal from "../popupConfitmation/LogoutConfirmation"; // Adjust path as needed
import {
  logo,
  baricon,
  baricon1,
  searchnormal,
  imguser,
  noteicon,
  user06,
  settingicon01,
  noteicon1,
  packtamam,
  packtamam1,
} from "./imagepath";




const Header = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user data
    const currentUser = FirebaseAuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handlesidebar = () => {
    document.body.classList.toggle("mini-sidebar");
  };

  const handlesidebarmobilemenu = () => {
    document.body.classList.toggle("slide-nav");
    document.getElementsByTagName("html")[0].classList.toggle('menu-opened');
    document.getElementsByClassName("sidebar-overlay")[0].classList.toggle("opened");
  };

  const openDrawer = () => {
    const div = document.querySelector(".main-wrapper");
    if (div?.className?.includes("open-msg-box")) {
      div?.classList?.remove("open-msg-box");
    } else {
      div?.classList?.add("open-msg-box");
    }
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      const result = await FirebaseAuthService.signOut();
      if (result.success) {
        console.log("✅ Logout successful");
        setShowLogoutModal(false);
        // Redirect to index page instead of login
        navigate("/");
      } else {
        console.error("❌ Logout failed:", result.message);
        // Optionally show error message to user
        alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
      alert("An error occurred during logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const handleClick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };

    const maximizeBtn = document.querySelector(".win-maximize");
    // maximizeBtn.addEventListener('click', handleClick);

    return () => {
      // maximizeBtn.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      <div className="main-wrapper">
        <div className="header">
          <div className="header-left">
            <Link to="/admin-dashboard" className="logo">
              <img src={packtamam1} width={35} height={35} alt="" />{" "}
              <span style={{ color: '#403222'}}>PackTamam</span>
            </Link>
          </div>
          <Link id="toggle_btn" to="#" onClick={handlesidebar}>
          <img style={{ color: '#403222'}} src={baricon} alt="" />
          </Link>
          <Link id="mobile_btn" className="mobile_btn float-start" to="#" onClick={handlesidebarmobilemenu}>
            <img style={{ color: '#403222'}} src={baricon1} alt="" />
          </Link>
          <div className="top-nav-search mob-view">
            <form>
              <input
                style={{ color: '#c1a078'}}
                type="text"
                className="form-control"
                placeholder="Search here"
              />
              <Link className="btn">
                <img style={{ color: '#c1a078'}} src={searchnormal} alt="" />
              </Link>
            </form>
          </div>
          <ul className="nav user-menu float-end">
            <li className="nav-item dropdown d-none d-sm-block">
              <Link
                to="#"
                className="dropdown-toggle nav-link"
                data-bs-toggle="dropdown"
              >
                <img src={noteicon1} alt="" />
                <span className="pulse" />{" "}
              </Link>

              <div className="dropdown-menu notifications">
                <div className="topnav-dropdown-header">
                  <span>Notifications</span>
                </div>
                <div className="drop-scroll">
                  <ul className="notification-list">
                    <li className="notification-message">
                      <Link to="/user-activity">
                        <div className="media">
                        <span className="avatar">V</span>
                          <div className="media-body">
                            <p className="noti-details">
                              <span className="noti-title">Admin</span> added
                              new Restaurant{" "}
                              <span className="noti-title">
                                Restaurant added successfully
                              </span>
                            </p>
                            <p className="noti-time">
                              <span className="notification-time">
                                4 mins ago
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="topnav-dropdown-footer">
                  <Link to="/user-activity">View all Notifications</Link>
                </div>
              </div>
            </li>
            
            <li className="nav-item dropdown has-arrow user-profile-list">
              <Link
                to="#"
                className="dropdown-toggle nav-link user-link"
                data-bs-toggle="dropdown"
              >
                <div className="user-names">
                  <h5 style={{ color: '#c1a078'}}>
                    {user?.displayName || 'Admin'}
                  </h5>
                  <span>{user?.email || 'Admin'}</span>
                </div>
                <span className="user-img">
                  <img src={user06} alt="Admin" />
                </span>
              </Link>

              <div className="dropdown-menu">
                <Link className="dropdown-item" to="/profile">
                  My Profile
                </Link>
                <Link className="dropdown-item" to="/edit-profile">
                  Edit Profile
                </Link>
                <Link className="dropdown-item" to="/settings">
                  Settings
                </Link>
                <Link className="dropdown-item" to="#" onClick={handleLogoutClick}>
                  Logout
                </Link>
              </div>
            </li>

            <li className="nav-item ">
              <Link to="/settings" className="hasnotifications nav-link">
                <img src={settingicon01} alt="" />{" "}
              </Link>
            </li>
          </ul>

          <div className="dropdown mobile-user-menu float-end">
            <Link
              to="#"
              className="dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fa-solid fa-ellipsis-vertical" />
            </Link>
            <div className="dropdown-menu dropdown-menu-end">
              <Link className="dropdown-item" to="/profile">
                My Profile
              </Link>
              <Link className="dropdown-item" to="edit-profile.html">
                Edit Profile
              </Link>
              <Link className="dropdown-item" to="/settings">
                Settings
              </Link>
              <Link className="dropdown-item" to="#" onClick={handleLogoutClick}>
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        logo={packtamam1}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default Header;