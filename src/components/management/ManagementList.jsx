/* eslint-disable no-unused-vars */
import React from "react";
import { Table } from "antd";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {imagesend,plusicon,blogimg12,blogimg2,blogimg4,blogimg6,} from "../imagepath";
import { useState } from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { onShowSizeChange, itemRender } from "../Pagination";

const ManagementList = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const datasource = [
    {
      id: 1,
      Img: blogimg2,
      Name: "Pepperoni Pizza",
      RestaurantCount: "5",
      BusinessName: "Pizza.com",
      OutletType: "Anand",
      TotalOrder: "Anand",
      PendingOrder: "Anand",
      RejectOrder: "Anand",
      Status: "Leagal",
      FIELD9: "",
    // },
    // {
    //   id: 2,
    //   Img: blogimg4,
    //   Name: "Pepperoni Pizza",
    //   RestaurantCount: "50.00",
    //   BusinessName: "Pizza",
    //   OutletType: "Nadiad",
    //   TotalOrder: "Nadiad",
    //   PendingOrder: "Nadiad",
    //   RejectOrder: "Nadiad",
    //   Status: "Fraud",
    //   FIELD9: "",
    // },
    // {
    //   id: 3,
    //   Img: blogimg6,
    //   Name: "Pepperoni Pizza",
    //   RestaurantCount: "50.00",
    //   BusinessName: "Pizza",
    //   OutletType: "Ahmedabad",
    //   TotalOrder: "Ahmedabad",
    //   PendingOrder: "Ahmedabad",
    //   RejectOrder: "Ahmedabad",
    //   Status: "Leagal",
    //   FIELD9: "",
    // },
    // {
    //   id: 4,
    //   Img: blogimg12,
    //   Name: "Pepperoni Pizza",
    //   RestaurantCount: "50.00",
    //   BusinessName: "Pizza",
    //   OutletType: "Vadodara",
    //   TotalOrder: "Vadodara",
    //   PendingOrder: "Vadodara",
    //   RejectOrder: "Vadodara",
    //   Status: "Leagal",
    //   FIELD9: "",
    },
  ];

   
  
   const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
    setSelectedOption(null); // Reset form
  };

  const handleEditModalCancel = () => {
    setShowEditModal(false);
    setSelectedRecord(null); // Reset selected record
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    // Handle add form submission logic here
    console.log("Add form submitted");
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Handle edit form submission logic here
    console.log("Edit form submitted", selectedRecord);
    setShowEditModal(false);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };
  
  const columns = [
    {
      title: "Restauarant Name",
      dataIndex: "Name",
      render: (text, record) => (
        <>
          <h2 className="profile-image">
            <Link to="#" className="avatar avatar-sm me-2">
              <img
                className="avatar-img rounded-circle"
                src={record.Img}
                alt="rounded circle"
              />
            </Link>
            <Link to="#">{record.Name}</Link>
          </h2>
        </>
      ),
    },
    {
        title: "Business Name",
        dataIndex: "BusinessName",
    },
    {
      title: "Restaurant Count",
      dataIndex: "RestaurantCount",
    },
    {
      title: "Outlet Type",
      dataIndex: "OutletType",
    },
    {
      title: "Total Order",
      dataIndex: "TotalOrder",
    },
    {
      title: "Pending Order",
      dataIndex: "PendingOrder",
    },
    {
      title: "Reject Order",
      dataIndex: "RejectOrder",
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      render: (text, record) => (
        <div>
          {text === "Leagal" && (
            <span className="custom-badge status-green">
              {text}
            </span>
          )}
          {text === "Fraud" && (
            <span className="custom-badge status-red">
              {text}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "FIELD8",
      render: (text, record) => (
        <>
          <div className="text-end">
            <div className="dropdown dropdown-action">
              <Link
                to="#"
                className="action-icon dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-ellipsis-v" />
              </Link>
              <div className="dropdown-menu dropdown-menu-end">
                <Link 
                  className="dropdown-item" 
                  to="#"
                  onClick={() => handleView(record)}
                >
                  <i className="far fa-eye me-2" />
                  View
                </Link>
                <Link 
                  className="dropdown-item" 
                  to="#"
                  onClick={() => handleEdit(record)}
                >
                  <i className="far fa-edit me-2" />
                  Edit
                </Link>
                <Link
                  className="dropdown-item"
                  to="#"
                  data-bs-toggle="modal"
                  data-bs-target="#delete_patient"
                >
                  <i className="fa fa-trash-alt m-r-5"></i> Delete
                </Link>
              </div>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Header />
      <Sidebar id="menu-item3" id1="menu-items3" activeClassName="staff-list" />
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
                        Management{" "}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card card-table show-entire">
                  <div className="card-body">
                    {/* Table Header */}
                    <div className="page-table-header mb-2">
                      <div className="row align-items-center">
                        <div className="col">
                          <div className="doctor-table-blk">
                            <h3 style={{ color: "#403222" }}>
                              {" "}
                              Management List
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Table Header */}
                    <div className="table-responsive doctor-list">
                      <Table
                        pagination={{
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          onShowSizeChange: onShowSizeChange,
                          itemRender: itemRender,
                        }}
                        columns={columns}
                        dataSource={datasource}
                        rowKey={(record) => record.id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Details Modal */}
        {showViewModal && selectedRecord && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            role="dialog"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title" style={{ color: "#403222" }}>View Details</h4>
                  <button 
                    type="button" 
                    className="btn-close" 
                    aria-label="Close"
                    onClick={() => setShowViewModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="card">
                    <div className="card-body">
                      <div className="row mb-4">
                        <div className="col-12 text-center">
                          <img
                            className="avatar-img rounded-circle mb-3"
                            src={selectedRecord.Img}
                            alt="Restaurant"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <h4 style={{ color: "#403222" }}>{selectedRecord.Name}</h4>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light">
                            <div className="card-body p-3">
                              <h6 className="card-title text-muted mb-1">Business Name</h6>
                              <p className="card-text h5 mb-0" style={{ color: "#403222" }}>
                                {selectedRecord.BusinessName}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light">
                            <div className="card-body p-3">
                              <h6 className="card-title text-muted mb-1">Restaurant Count</h6>
                              <p className="card-text h5 mb-0" style={{ color: "#403222" }}>
                                {selectedRecord.RestaurantCount}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light">
                            <div className="card-body p-3">
                              <h6 className="card-title text-muted mb-1">Outlet Type</h6>
                              <p className="card-text h5 mb-0" style={{ color: "#403222" }}>
                                {selectedRecord.OutletType}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light">
                            <div className="card-body p-3">
                              <h6 className="card-title text-muted mb-1">Total Orders</h6>
                              <p className="card-text h5 mb-0" style={{ color: "#403222" }}>
                                {selectedRecord.TotalOrder}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light">
                            <div className="card-body p-3">
                              <h6 className="card-title text-muted mb-1">Pending Orders</h6>
                              <p className="card-text h5 mb-0" style={{ color: "#403222" }}>
                                {selectedRecord.PendingOrder}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light">
                            <div className="card-body p-3">
                              <h6 className="card-title text-muted mb-1">Rejected Orders</h6>
                              <p className="card-text h5 mb-0" style={{ color: "#403222" }}>
                                {selectedRecord.RejectOrder}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="card bg-light">
                            <div className="card-body p-3 text-center">
                              <h6 className="card-title text-muted mb-1">Status</h6>
                              <div>
                                {selectedRecord.Status === "Leagal" && (
                                  <span className="badge bg-success fs-6 px-3 py-2">
                                    {selectedRecord.Status}
                                  </span>
                                )}
                                {selectedRecord.Status === "Fraud" && (
                                  <span className="badge bg-danger fs-6 px-3 py-2">
                                    {selectedRecord.Status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowViewModal(false)}
                    style={{
                            backgroundColor: "#c1a078",
                            borderColor: "#c1a078",
                            color: "#fff",
                        }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Management Modal */}
        {showEditModal && selectedRecord && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            role="dialog"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title" style={{ color: "#403222" }}>Edit Management</h4>
                  <button 
                    type="button" 
                    className="btn-close" 
                    aria-label="Close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleEditSubmit}>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Restauarant Name <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            defaultValue={selectedRecord.Name}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Business Name <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            defaultValue={selectedRecord.BusinessName}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Restaurant Count <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            defaultValue={selectedRecord.RestaurantCount}
                            placeholder="Enter count"
                            step="1"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Outlet Type <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            defaultValue={selectedRecord.OutletType}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Total Order <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            defaultValue={selectedRecord.TotalOrder}
                            placeholder="Enter count"
                            step="1"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Pending Order <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            defaultValue={selectedRecord.PendingOrder}
                            placeholder="Enter count"
                            step="1"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Reject Order <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            defaultValue={selectedRecord.RejectOrder}
                            placeholder="Enter count"
                            step="1"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group select-gender">
                          <label className="gen-label">
                            Status <span className="login-danger">*</span>
                          </label>
                          <div className="form-check-inline">
                            <label className="form-check-label">
                              <input
                                type="radio"
                                name="editStatus"
                                className="form-check-input"
                                value="Leagal"
                                defaultChecked={selectedRecord.Status === "Leagal"}
                              />
                              Leagal
                            </label>
                          </div>
                          <div className="form-check-inline">
                            <label className="form-check-label">
                              <input
                                type="radio"
                                name="editStatus"
                                className="form-check-input"
                                value="Fraud"
                                defaultChecked={selectedRecord.Status === "Fraud"}
                              />
                              Fraud
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            backgroundColor: "#c1a078",
                            borderColor: "#c1a078",
                            color: "#fff",
                        }}
                      >
                        Update
                      </button>
                        <button
                          type="button"
                          className="btn btn-primary me-2"
                          onClick={handleEditModalCancel}
                          style={{
                            backgroundColor: "#c1a078",
                            borderColor: "#c1a078",
                            color: "#fff",
                        }}
                        >
                          Cancel
                        </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <div
          id="delete_patient"
          className="modal fade delete-modal"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center">
                <img src={imagesend} alt="#" width={50} height={46} />
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
    </>
  );
};

export default ManagementList;