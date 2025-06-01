/* eslint-disable no-unused-vars */
import React from "react";
import { Table } from "antd";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {
  imagesend,
  plusicon,
  blogimg12,
  blogimg2,
  blogimg4,
  blogimg6,
} from "../imagepath";
import { useState } from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { onShowSizeChange, itemRender } from "../Pagination";

const InventoryList = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const datasource = [
    {
      id: 1,
      Img: blogimg2,
      Name: "Pepperoni Pizza",
      Price: "50.00",
      Category: "Pizza",
      Status: "In Stock",
      visibility: "Anand",
      FIELD9: "",
    },
    {
      id: 2,
      Img: blogimg4,
      Name: "Pepperoni Pizza",
      Price: "50.00",
      Category: "Pizza",
      Status: "Out of Stock",
      visibility: "Nadiad",
      FIELD9: "",
    },
    {
      id: 3,
      Img: blogimg6,
      Name: "Pepperoni Pizza",
      Price: "50.00",
      Category: "Pizza",
      Status: "In Stock",
      visibility: "Ahmedabad",
      FIELD9: "",
    },
    {
      id: 4,
      Img: blogimg12,
      Name: "Pepperoni Pizza",
      Price: "50.00",
      Category: "Pizza",
      Status: "In Stock",
      visibility: "Vadodara",
      FIELD9: "",
    },
  ];

   
  
   const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
    setSelectedOption(null); // Reset form
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
  
  const columns = [
    {
      title: "Name",
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
      title: "Price (₹)",
      dataIndex: "Price",
    },
    {
      title: "Category",
      dataIndex: "Category",
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      render: (text, record) => (
        <div>
          {text === "In Stock" && (
            <span className="custom-badge status-green">
              {text}
            </span>
          )}
          {text === "Out of Stock" && (
            <span className="custom-badge status-red">
              {text}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
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
                        Inventory{" "}
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
                              Inventory List
                            </h3>
                            <div className="doctor-search-blk">
                              <div className="add-group">
                                <button
                                  onClick={() => setShowAddModal(true)}
                                  className="btn btn-primary add-pluss ms-2"
                                >
                                  <img src={plusicon} alt="#" />
                                </button>
                              </div>
                            </div>
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

        {/* Add Inventory Modal */}
        {showAddModal && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            role="dialog"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title" style={{ color: "#403222" }}>Add New SKU</h4>
                  <button 
                    type="button" 
                    className="btn-close" 
                    aria-label="Close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddSubmit}>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Name <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="Enter product name"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Price (₹) <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            placeholder="Enter price"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Category <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="Enter category"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Visibility <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="Enter visibility location"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group select-gender">
                          <label className="gen-label">
                            Status <span className="login-danger">*</span>
                          </label>
                          <div className="form-check-inline">
                            <label className="form-check-label">
                              <input
                                type="radio"
                                name="status"
                                className="form-check-input"
                                value="In Stock"
                                defaultChecked
                              />
                              In Stock
                            </label>
                          </div>
                          <div className="form-check-inline">
                            <label className="form-check-label">
                              <input
                                type="radio"
                                name="status"
                                className="form-check-input"
                                value="Out of Stock"
                              />
                              Out of Stock
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
                        Submit
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddModalCancel}
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

        {/* Edit Inventory Modal */}
        {showEditModal && selectedRecord && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            role="dialog"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title" style={{ color: "#403222" }}>Edit SKU</h4>
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
                            Name <span className="login-danger">*</span>
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
                            Price (₹) <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            defaultValue={selectedRecord.Price}
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Category <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            defaultValue={selectedRecord.Category}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">
                          <label>
                            Visibility <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            defaultValue={selectedRecord.visibility}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12">
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
                                value="In Stock"
                                defaultChecked={selectedRecord.Status === "In Stock"}
                              />
                              In Stock
                            </label>
                          </div>
                          <div className="form-check-inline">
                            <label className="form-check-label">
                              <input
                                type="radio"
                                name="editStatus"
                                className="form-check-input"
                                value="Out of Stock"
                                defaultChecked={selectedRecord.Status === "Out of Stock"}
                              />
                              Out of Stock
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
                        className="btn btn-primary"
                        onClick={handleAddModalCancel}
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

export default InventoryList;