/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { DatePicker} from "antd";
import { favicon, imagesend } from "../imagepath";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Select from "react-select";
import { Link } from "react-router-dom";

const EditStaff = () => {
  const [show, setShow] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([
    { value: 1, label: "Select City" },
    { value: 2, label: "Alaska" },
    { value: 3, label: "Los Angeles" },
  ]);

  const [statevalue, setStateValue] = useState([
    { value: 1, label: "Select State" },
    { value: 2, label: "Alaska" },
    { value: 3, label: "California" },
  ]);
  const [option, setOption] = useState([
    { value: 1, label: "Select Country" },
    { value: 2, label: "Usa" },
    { value: 3, label: "Uk" },
    { value: 4, label: "Italy" },
  ]);
  const [department, setDepartment] = useState([
    { value: 1, label: "Orthopedics" },
    { value: 2, label: "Radiology" },
    { value: 3, label: "Dentist" },
  ]);
  const onChange = (date, dateString) => {
    // console.log(date, dateString);
  };
  const loadFile = (event) => {
    // Handle file loading logic here
  };


  return (
    <>
      <div className="main-wrapper">
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
                        <Link style={{ color: "#403222" }} to="#">Inventory </Link>
                      </li>
                      <li className="breadcrumb-item">
                        <i className="feather-chevron-right">
                          <FeatherIcon style={{ color: "#403222" }} icon="chevron-right" />
                        </i>
                      </li>
                      <li style={{ color: "#c1a078" }} className="breadcrumb-item active">Edit SKU</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* /Page Header */}
              <div className="row">
                <div className="col-sm-12">
                  <div className="card">
                    <div className="card-body">
                      <form>
                        <div className="row">
                          <div className="col-12">
                            <div className="form-heading">
                              <h4>Edit SKU</h4>
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="form-group local-forms">
                              <label>
                                Name{" "}
                                <span className="login-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                defaultValue="Daniel"
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="form-group local-forms">
                              <label>
                                Price (₹){" "}
                                <span className="login-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                defaultValue="Bruk"
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="form-group local-forms">
                              <label>
                                Category{" "}
                                <span className="login-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                defaultValue="Daniel Bruk"
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="form-group local-forms">
                              <label>
                                Visibility{" "}
                                <span className="login-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                defaultValue="M.B.B.S, M.S."
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-xl-6">
                            <div className="form-group select-gender">
                              <label className="gen-label">
                                Status <span className="login-danger">*</span>
                              </label>
                              <div className="form-check-inline">
                                <label className="form-check-label">
                                  <input
                                    type="radio"
                                    name="gender1"
                                    className="form-check-input"
                                    defaultChecked="true"
                                  />
                                  In Stock
                                </label>
                              </div>
                              <div className="form-check-inline">
                                <label className="form-check-label">
                                  <input
                                    type="radio"
                                    name="gender1"
                                    className="form-check-input"
                                  />
                                  Out of Stock
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="doctor-submit text-end">
                              <button
                              style={{
                                backgroundColor: "#c1a078",
                                color: "#fff",
                              }}
                                type="submit"
                                className="btn btn-primary submit-form me-2"
                              >
                                Submit
                              </button>
                              <button
                              style={{
                                backgroundColor: "#c1a078",
                                color: "#fff",
                              }}
                                type="submit"
                                className="btn btn-primary cancel-form"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div
            id="delete_patient"
            className="modal fade delete-modal"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  <img src={imagesend} alt="#"width={50} height={46} />
                  <h3>Are you sure want to delete this ?</h3>
                  <div className="m-t-20">
                    {" "}
                    <Link
                      to="#"
                      className="btn btn-white me-2"
                      data-bs-dismiss="modal"
                    >
                      Close
                    </Link>
                    <button type="submit" className="btn btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
    </>
  );
};

export default EditStaff;
