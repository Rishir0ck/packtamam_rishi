import React, { useState, useEffect } from "react";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
// import DonutChart from "./DonutChart";
import Sidebar from "../Sidebar";
import Header from "../Header";
// import PatientChart from "./Admin_Dashboard/PaitentChart";
// import Select from "react-select";
import {
  // Avatar2,
  // Avatar3,
  // Avatar4,
  // Avatar5,
  // calendar,
  // dep_icon1,
  // dep_icon2,
  // dep_icon3,
  // dep_icon4,
  // dep_icon5,
  // empty_wallet,
  // imagesend,
  morning_img_01,
  // profile_add,
  // scissor,
  // user001,
} from "../imagepath";
import { Link } from "react-router-dom";
import CountUp from "react-countup";

import {
  // AlertTriangle,
  ListChecks,
  // Users,
  IndianRupee,
  ShoppingCart,
  Activity,
} from "lucide-react";

const Admin_Dashboard = () => {
  // const [selectedOption, setSelectedOption] = useState(null);
  const [currentGreeting, setCurrentGreeting] = useState("");
  const [currentUser, setCurrentUser] = useState("Admin");
  
  // eslint-disable-next-line no-unused-vars
  const [year, setyear] = useState([
    { value: 1, label: "2022" },
    { value: 2, label: "2021" },
    { value: 3, label: "2020" },
    { value: 4, label: "2019" },
  ]);

  // Function to get current greeting based on time
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 5 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Good Afternoon";
    } else if (currentHour >= 17 && currentHour < 22) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  // Function to get current user information (mock data)
  const getCurrentUser = () => {
    // Mock user data instead of Firebase
    const mockUser = {
      displayName: "Admin User",
      email: "admin@packtamam.com"
    };
    
    const userName = mockUser.displayName || 
                    mockUser.email?.split('@')[0]?.replace(/[._]/g, ' ')
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ') || 
                    'Admin';
    setCurrentUser(userName);
  };

  // Update greeting every minute and get user on component mount
  useEffect(() => {
    // Set initial greeting
    setCurrentGreeting(getTimeBasedGreeting());
    
    // Get current user (mock data)
    getCurrentUser();
    
    // Update greeting every minute
    const greetingInterval = setInterval(() => {
      setCurrentGreeting(getTimeBasedGreeting());
    }, 60000); // Update every minute

    // Cleanup interval on component unmount
    return () => clearInterval(greetingInterval);
  }, []);

  return (
    <>
      <Header />
      <Sidebar
        id="menu-item"
        id1="menu-items"
        activeClassName="dashboard"
      />
      <>
        <div className="page-wrapper">
          <div className="content">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link style={{ color: "#403222" }} to="#">
                        Dashboard{" "}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="good-morning-blk">
              <div className="row">
                <div className="col-md-6">
                  <div className="morning-user">
                    <h2>
                      {currentGreeting},{" "}
                      <span style={{ color: "#c1a078", fontWeight: 600 }}>
                        {currentUser}
                      </span>
                    </h2>
                    <p>Have a nice day at work</p>
                  </div>
                </div>
                <div className="col-md-6 position-blk">
                  <div className="morning-img">
                    <img src={morning_img_01} alt="#" />
                  </div>
                </div>
              </div>
            </div>
            {/* Total Revenue */}
            <div className="row">
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="dash-widget">
                  <div className="dash-boxs comman-flex-center">
                    {/* <img src={calendar}  alt="#" /> */}
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="dash-content dash-count flex-grow-1">
                    <h4>Total Revenue</h4>
                    <h2>
                      {" "}
                      <CountUp
                        style={{ color: "#c1a078", fontWeight: 600 }}
                        delay={0.4}
                        end={250000}
                        duration={0.6}
                      />
                    </h2>
                    <p>
                      <span className="passive-view">
                        <i className="feather-arrow-up-right me-1">
                          <FeatherIcon icon="arrow-up-right" />
                        </i>
                        40%
                      </span>{" "}
                      vs last month
                    </p>
                  </div>
                </div>
              </div>
              {/* Total Restaurants */}
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="dash-widget">
                  <div className="dash-boxs comman-flex-center">
                    {/* <img src={profile_add}  alt="#" /> */}
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="dash-content dash-count">
                    <h4>Total Restaurants</h4>
                    <h2>
                      <CountUp
                        style={{ color: "#c1a078", fontWeight: 600 }}
                        delay={0.4}
                        end={140}
                        duration={0.6}
                      />
                    </h2>
                    <p>
                      <span className="passive-view">
                        <i className="feather-arrow-up-right me-1">
                          <FeatherIcon icon="arrow-up-right" />
                        </i>
                        20%
                      </span>{" "}
                      vs last month
                    </p>
                  </div>
                </div>
              </div>
              {/* Pending Approvals */}
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="dash-widget">
                  <div className="dash-boxs comman-flex-center">
                    {/* <img src={scissor} alt="#" /> */}
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="dash-content dash-count">
                    <h4>Pending Approvals</h4>
                    <h2>
                      <CountUp
                        style={{ color: "#c1a078", fontWeight: 600 }}
                        delay={0.4}
                        end={56}
                        duration={0.6}
                      />
                    </h2>
                    <p>
                      <span className="negative-view">
                        <i className="feather-arrow-down-right me-1">
                          <FeatherIcon icon="arrow-down-right" />
                        </i>
                        15%
                      </span>{" "}
                      vs last month
                    </p>
                  </div>
                </div>
              </div>
              {/* Active SKUs */}
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="dash-widget">
                  <div className="dash-boxs comman-flex-center">
                    {/* <img src={empty_wallet} alt="#" /> */}
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="dash-content dash-count">
                    <h4>Active SKUs</h4>
                    <h2>
                      <CountUp
                        style={{ color: "#c1a078", fontWeight: 600 }}
                        delay={0.4}
                        end={20250}
                        duration={0.6}
                      />
                    </h2>
                    <p>
                      <span className="passive-view">
                        <i className="feather-arrow-up-right me-1">
                          <FeatherIcon icon="arrow-up-right" />
                        </i>
                        30%
                      </span>{" "}
                      vs last month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* **************************************************************************************** */}

            <div className="row">
              <div className="col-12 col-md-12 col-lg-6 col-flex">
                <div className="card">
                  {/* <div className="card-body">
                    <div className="chart-title patient-visit">
                      <h4>Monthly Order Summary</h4>
                      <div>
                        <ul className="nav chat-user-total">
                          <li>
                            <i
                              className="fa fa-circle current-users"
                              aria-hidden="true"
                            />
                            Male 75%
                          </li>
                          <li>
                            <i
                              className="fa fa-circle old-users"
                              aria-hidden="true"
                            />{" "}
                            Female 25%
                          </li>
                        </ul> 
                      </div>
                      <div className="form-group mb-0">
                        <Select
                          className="custom-react-select"
                          defaultValue={selectedOption}
                          onChange={setSelectedOption}
                          options={year}
                          id="search-commodity"
                          components={{
                            IndicatorSeparator: () => null,
                          }}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              borderColor: state.isFocused
                                ? "none"
                                : "2px solid rgba(46, 55, 164, 0.1);",
                              boxShadow: state.isFocused
                                ? "0 0 0 1px #c1a078"
                                : "none",
                              "&:hover": {
                                borderColor: state.isFocused
                                  ? "none"
                                  : "2px solid rgba(46, 55, 164, 0.1)",
                              },
                              borderRadius: "10px",
                              fontSize: "14px",
                              minHeight: "45px",
                            }),
                            dropdownIndicator: (base, state) => ({
                              ...base,
                              transform: state.selectProps.menuIsOpen
                                ? "rotate(-180deg)"
                                : "rotate(0)",
                              transition: "250ms",
                              width: "35px",
                              height: "35px",
                            }),
                          }}
                        />
                      </div>
                    </div>
                    {/* <div id="patient-chart" />
                    <PatientChart /> 
                  </div> */}
                </div>
              </div>
              {/* ************************** */}
              {/* <div className="col-12 col-md-12 col-lg-6 col-flex">
                <div className="card">
                  <div className="card-body">
                    <div className="chart-title">
                      <h4>Recent Activity</h4>
                      <ul className="space-y-3 list-none">
                        <li className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              High-risk transaction flagged
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Restaurant &apos;Shady Deals Inc.&apos; -
                              Investigate immediately.
                            </p>
                          </div>
                        </li>

                        <li className="flex items-start gap-3">
                          <ListChecks className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              New restaurant &apos;Foodie Haven&apos; approved
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Onboarding completed successfully.
                            </p>
                          </div>
                        </li>

                        <li className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              User &apos;pricing_mgr&apos; updated pricing rules
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Awaiting checker approval for &apos;Summer
                              Discounts&apos;.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Admin_Dashboard;