import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import { doctor03 } from "../../imagepath";
import FirebaseAuthService from "../../../Firebase/services/firebase_auth_service";

const Profile = () => {
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("Admin");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return "Good Morning";
      if (hour >= 12 && hour < 17) return "Good Afternoon";
      if (hour >= 17 && hour < 22) return "Good Evening";
      return "Good Night";
    };

    const loadUserDetails = async () => {
      try {
        const currentUser = await FirebaseAuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const formattedName =
            currentUser.displayName ||
            currentUser.email
              ?.split("@")[0]
              ?.replace(/[._]/g, " ")
              .split(" ")
              .map(
                (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
              )
              .join(" ") ||
            "Admin";
          setUserName(formattedName);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setUserName("Admin");
      }
    };

    setGreeting(getTimeBasedGreeting());
    loadUserDetails();

    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content">
          <div className="row align-items-center mb-4">
            <div className="col-sm-7">
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link style={{ color: "#403222" }} to="/admin-dashboard" className="text-dark">
                    Dashboard
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <FeatherIcon style={{ color: "#403222" }} icon="chevron-right" className="text-dark" />
                </li>
                <li style={{ color: "#c1a078" }} className="breadcrumb-item active">
                  My Profile
                </li>
              </ul>
            </div>
            <div className="col-sm-5 text-end">
              <Link
                to="/edit-profile"
                className="btn btn-rounded"
                style={{ backgroundColor: "#c1a078", color: "#fff" }}
              >
                <i className="fa fa-edit me-1" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Unified Profile Card */}
          <div className="card p-4 text-center mx-auto" style={{ maxWidth: "600px" }}>
            <div className="mb-3">
              <img
                src={user?.photoURL || doctor03}
                alt="Profile"
                className="rounded-circle"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
            </div>
            <h2>
              {greeting},{" "}
              <span style={{ color: "#c1a078", fontWeight: "600" }}>{userName}</span>
            </h2>
            <small className="text-muted d-block mb-3">Admin</small>

            <hr />

            <div className="text-start">
              <h5 className="mb-3">Personal Information</h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <strong>Email:</strong>{" "}
                  <span className="ms-2">{user?.email || "admin@example.com"}</span>
                </li>
                {/* Add more personal details here as needed */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
