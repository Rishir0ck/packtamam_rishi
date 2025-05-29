/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import FirebaseAuthService from '../Firebase/services/firebase_auth_service'; // Adjust path as needed
import LogoutConfirmationModal from './../popupConfitmation/LogoutConfirmation'; // Adjust path as needed
import { blog, restaurant, dashboard, doctor, doctorschedule, logout, menuicon04, menuicon06, menuicon08, menuicon09, menuicon10, menuicon11, menuicon12, menuicon14, menuicon15, menuicon16, patients, sidemenu, packtamam1 } from './imagepath';
import Scrollbars from "react-custom-scrollbars-2";

const Sidebar = (props) => {
  const [sidebar, setSidebar] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user data
    const currentUser = FirebaseAuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleClick = (e, item, item1, item3) => {
    const div = document.querySelector(`#${item}`);
    const ulDiv = document.querySelector(`.${item1}`);
    
    // Add null checks to prevent errors
    if (div && ulDiv) {
      e?.target?.className ? ulDiv.style.display = 'none' : ulDiv.style.display = 'block'
      e?.target?.className ? div.classList.remove('subdrop') : div.classList.add('subdrop');
    }
  }

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
    if (props?.id && props?.id1) {
      const ele = document.getElementById(`${props?.id}`);
      // Only call handleClick if the element exists
      if (ele) {
        handleClick(ele, props?.id, props?.id1);
      }
    }
  }, [])

  const expandMenu = () => {
    document.body.classList.remove("expand-menu");
  };
  const expandMenuOpen = () => {
    document.body.classList.add("expand-menu");
  };

  return (
    <>
      <div className="sidebar" id="sidebar">
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          autoHeight
          autoHeightMin={0}
          autoHeightMax="95vh"
          thumbMinSize={30}
          universal={false}
          hideTracksWhenNotNeeded={true}
        >
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu"
              onMouseLeave={expandMenu}
              onMouseOver={expandMenuOpen}
            >
              <ul>
                <li className="menu-title">Main</li>

                {/* Dashboard - Fixed to be a simple menu item without submenu */}
                <li>
                  <Link 
                    to="/admin-dashboard" 
                    className={props?.activeClassName === 'admin-dashboard' ? 'active' : ''}
                  >
                    <span className="menu-side">
                      <img className='img-fluid' src={dashboard} alt="" />
                    </span>
                    <span style={{ color: '#c1a078'}}>Dashboard</span>
                  </Link>
                </li>

                <li className="submenu">
                  <Link to="#" id="menu-item4" onClick={(e) => handleClick(e, "menu-item4", "menu-items4")}>
                    <span className="menu-side">
                      <img className='img-fluid' src={menuicon06} alt="" />
                    </span>{" "}
                    <span style={{ color: '#c1a078'}}> Restaurant </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items4">
                    <li>
                      <Link className={props?.activeClassName === 'appoinment-list' ? 'active' : ''} to="/appoinmentlist">Restaurant List</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'add-appoinment' ? 'active' : ''} to="/addappoinments">Add Restaurant</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'edit-appoinment' ? 'active' : ''} to="/editappoinments">Edit Restaurant</Link>
                    </li>
                  </ul>
                </li>

                <li className="submenu">
                  <Link to="#" id="menu-item3" onClick={(e) => handleClick(e, "menu-item3", "menu-items3")}>
                    <span className="menu-side">
                      <img src={menuicon08} alt="" />
                    </span>{" "}
                    <span style={{ color: '#c1a078'}}> Inventory </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items3">
                    <li>
                      <Link className={props?.activeClassName === 'staff-list' ? 'active' : ''} to="/stafflist">Staff List</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'add-staff' ? 'active' : ''} to="/addstaff">Add Staff</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'staff-profile' ? 'active' : ''} to="/staffprofile">Staff Profile</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'leaves' ? 'active' : ''} to="/leave">Leaves</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'holidays' ? 'active' : ''} to="/holiday">Holidays</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'attendance' ? 'active' : ''} to="/attendence">Attendance</Link>
                    </li>
                  </ul>
                </li>

                <li className="submenu">
                  <Link to="#" id="menu-item5" onClick={(e) => handleClick(e, "menu-item5", "menu-items5")}>
                    <span className="menu-side">
                      <img src={doctorschedule} alt="" />
                    </span>{" "}
                    <span style={{ color: '#c1a078'}}> Pricing </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items5">
                    <li>
                      <Link className={props?.activeClassName === 'shedule-list' ? 'active' : ''} to="/schedulelist">Schedule List</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'add-shedule' ? 'active' : ''} to="/addschedule">Add Schedule</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'edit-shedule' ? 'active' : ''} to="/editschedule">Edit Schedule</Link>
                    </li>
                  </ul>
                </li>

                <li className="submenu">
                  <Link to="#" id="menu-item1" onClick={(e) => {
                    handleClick(e, "menu-item1", "menu-items1")
                  }}>
                    <span className="menu-side">
                      <img src={doctor} alt="" />
                    </span>{" "}
                    <span style={{ color: '#c1a078'}}> Users </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Doctors' ? 'block' : 'none' }} className="menu-items1">
                    <li>
                      <Link className={props?.activeClassName === 'doctor-list' ? 'active' : ''} to="/doctorlist">Doctor List</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'add-doctor' ? 'active' : ''} to="/add-doctor">Add Doctor</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'edit-doctor' ? 'active' : ''} to="/editdoctor">Edit Doctor</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'doctor-profile' ? 'active' : ''} to="/doctorprofile">Doctor Profile</Link>
                    </li>
                  </ul>
                </li>

                {/* Logout - Fixed to be inside the menu structure */}
                <li>
                  <Link to="#" onClick={handleLogoutClick}>
                    <span className="menu-side">
                      <img src={logout} alt="" />
                    </span>
                    <span style={{ color: '#c1a078'}}>Logout</span>
                  </Link>
                </li>

              </ul>
            </div>
          </div>
        </Scrollbars>
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
  )
}

export default Sidebar