/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Header from "../../Header";
import Sidebar from "../../Sidebar";
import { imguser } from "../../imagepath";
import { DatePicker } from "antd";
import Select from "react-select";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { Link } from "react-router-dom";

const EditProfile = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [gender, setGender] = useState([
    { value: 1, label: "Select Gender" },
    { value: 2, label: "Male" },
    { value: 3, label: "Female" },
  ]);
  const onChange = (date, dateString) => {
    // console.log(date, dateString);
  };

  return (
    <>
      <Header />
      <Sidebar />
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
                    <li className="breadcrumb-item">
                      <i className="feather-chevron-right">
                        <FeatherIcon
                          style={{ color: "#403222" }}
                          icon="chevron-right"
                        />
                      </i>
                    </li>
                    <li
                      style={{ color: "#c1a078" }}
                      className="breadcrumb-item active"
                    >
                      Edit Profile
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <form>
              <div className="card-box">
                <h3 className="card-title">Profile Informations</h3>
                <div className="row">
                  <div className="col-md-12">
                    <div className="profile-img-wrap">
                      <img className="inline-block" src={imguser} alt="user" />
                      <div className="fileupload btn">
                        <span className="btn-text">edit</span>
                        <input className="upload" type="file" />
                      </div>
                    </div>
                    <div className="profile-basic">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group local-forms">
                            <label className="focus-label">Full Name</label>
                            <input
                              type="text"
                              className="form-control floating"
                              // defaultValue="FullName"
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          
                        </div>
                        <div className="col-md-6">
                          <div className="form-group local-forms">
                            <label className="focus-label">Email </label>
                            <input
                              type="text"
                              className="form-control floating"
                              // defaultValue="FullName"
                            />
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center m-t-20">
                <button
                  style={{
                    backgroundColor: "#c1a078",
                    color: "#fff",
                  }}
                  className="btn btn-primary submit-btn"
                  type="button"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    </>
  );
};

export default EditProfile;
