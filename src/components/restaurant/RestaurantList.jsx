/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Table, Modal } from "antd";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {
  blogimg10,
  imagesend,
  pdficon,
  pdficon3,
  pdficon4,
  plusicon,
  refreshicon,
  searchnormal,
  blogimg12,
  blogimg2,
  blogimg4,
  blogimg6,
  blogimg8,
} from "../imagepath";
import { onShowSizeChange, itemRender } from "../Pagination";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Select from "react-select";

const RestaurantList = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [editSelectedOption, setEditSelectedOption] = useState(null);
  const [editBusinessSelectedOption, setEditBusinessSelectedOption] = useState(null);
  const [editStatusOption, setEditStatusOption] = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditRecord(record);
    // Pre-populate the form fields with existing data
    setEditSelectedOption(outletOptions.find(option => option.label === record.OutletType));
    setEditBusinessSelectedOption(businessOptions.find(option => option.label === record.Business));
    setEditStatusOption(statusOptions.find(option => option.value === record.Status));
    setIsEditModalVisible(true);
  };

  const handleAddModalOk = () => {
    // Handle form submission here
    setIsAddModalVisible(false);
  };

  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
    setSelectedOption(null); // Reset form
  };

  const handleEditModalOk = () => {
    // Handle edit form submission here
    setIsEditModalVisible(false);
    setEditRecord(null);
    setEditSelectedOption(null);
    setEditBusinessSelectedOption(null);
    setEditStatusOption(null);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setEditRecord(null);
    setEditSelectedOption(null);
    setEditBusinessSelectedOption(null);
    setEditStatusOption(null);
  };

  const loadFile = (event) => {
    // Handle file loading logic here
  };

  const outletOptions = [
    { value: 2, label: "Cloud Kitchen" },
    { value: 3, label: "Kitchen" },
    { value: 4, label: "Cafe" },
  ];

  const businessOptions = [
    { value: 1, label: "Restaurant" },
    { value: 2, label: "Multiple Restaurant" },
    { value: 3, label: "Franchise Channel" },
    { value: 4, label: "Resort" },
    { value: 5, label: "Catering Service" },
    { value: 6, label: "Cloud Kitchen" },
    { value: 7, label: "Kiosk" },
    { value: 8, label: "Canteen Service" },
    { value: 9, label: "Theater" },
    { value: 10, label: "Fastfood Retailer" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "In Active", label: "In Active" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" }
  ];

  const datasource = [
    {
      id: "1",
      Img: blogimg2,
      Business: "Resort",
      OutletType: "Cloud Kitchen",
      Name: "Curry Corner",
      Status: "Active",
    },
    {
      id: "2",
      Img: blogimg4,
      Business: "Restaurant",
      OutletType: "Cloud Kitchen",
      Name: "Burger Bliss",
      Status: "Active",
    },
    {
      id: "3",
      Img: blogimg6,
      Business: "Resort",
      OutletType: "Cloud Kitchen",
      Name: "Sushi Central",
      Status: "In Active",
    },
    {
      id: "4",
      Img: blogimg12,
      Business: "Restaurant",
      OutletType: "Cloud Kitchen",
      Name: "Pasta Paradise",
      Status: "Approved",
    },
    {
      id: "5",
      Img: blogimg12,
      Business: "Kiosk",
      OutletType: "Kitchen",
      Name: "Happy Paradise",
      Status: "Rejected",
    },
  ];

  const columns = [
    {
      title: "Business Name",
      dataIndex: "Business",
      render: (text, record) => (
        <>
          <h2 className="profile-image">
            <Link to="#" className="avatar avatar-sm me-2">
              <img
                className="avatar-img rounded-circle"
                src={record.Img}
                alt="User Image"
              />
            </Link>
            <Link to="#">{record.Business}</Link>
          </h2>
        </>
      ),
    },
    {
      title: "Outlet Type",
      dataIndex: "OutletType",
      sorter: (a, b) => a.OutletType.length - b.OutletType.length,
    },
    {
      title: "Business Name",
      dataIndex: "Name",
      sorter: (a, b) => a.Name.length - b.Name.length,
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      render: (text, record) => (
        <div>
          {text === "Active" && (
            <span className="custom-badge status-green">
              {text}
            </span>
          )}
          {text === "In Active" && (
            <span className="custom-badge status-pink">
              {text}
            </span>
          )}
          {text === "Approved" && (
            <span className="custom-badge status-blue">
              {text}
            </span>
          )}
          {text === "Rejected" && (
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
                  onClick={(e) => {
                    e.preventDefault();
                    showEditModal(record);
                  }}
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
      <Sidebar
        id="menu-item4"
        id1="menu-items4"
        activeClassName="appoinment-list"
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
                        Restaurant{" "}
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
                            <h3>Restaurant List</h3>
                            <div className="doctor-search-blk">
                              <div className="top-nav-search table-search-blk"></div>
                              <div className="add-group">
                                <button
                                  onClick={showAddModal}
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
                          total: datasource.length,
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

        {/* Add Restaurant Modal */}
        <Modal
          title="Add Restaurant"
          visible={isAddModalVisible}
          onOk={handleAddModalOk}
          onCancel={handleAddModalCancel}
          width={800}
          footer={null}
          className="add-restaurant-modal"
        >
          <form>
            <div className="row">
              <div className="col-12">
                <div className="form-heading">
                  <h4>Restaurant Details</h4>
                </div>
              </div>
{/* Business Type */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Business Type</label>
                  <Select
                    value={selectedOption}
                    onChange={setSelectedOption}
                    options={businessOptions}
                    menuPortalTarget={document.body}
                    id="search-commodity"
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: state.isFocused
                          ? "none"
                          : "2px solid rgba(193, 160, 120, 1);",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #c1a078"
                          : "none",
                        "&:hover": {
                          borderColor: state.isFocused
                            ? "none"
                            : "2px solid rgba(193, 160, 120, 1)",
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
{/* Outlet Type */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Outlet Type</label>
                  <Select
                    value={selectedOption}
                    onChange={setSelectedOption}
                    options={outletOptions}
                    menuPortalTarget={document.body}
                    id="search-commodity"
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: state.isFocused
                          ? "none"
                          : "2px solid rgba(193, 160, 120, 1);",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #c1a078"
                          : "none",
                        "&:hover": {
                          borderColor: state.isFocused
                            ? "none"
                            : "2px solid rgba(193, 160, 120, 1)",
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
{/* Business Name */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Business Name</label>
                  <input className="form-control" type="text" />
                </div>
              </div>
{/* GST NO. */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>GST NO.</label>
                  <input className="form-control" type="text" />
                </div>
              </div>
{/* FSSAI NO. */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>FSSAI NO.</label>
                  <input className="form-control" type="text" />
                </div>
              </div>
{/* Status */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Status</label>
                  <Select
                    value={null}
                    onChange={(selectedStatus) => console.log(selectedStatus)}
                    options={statusOptions}
                    menuPortalTarget={document.body}
                    placeholder="Select Status"
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: state.isFocused
                          ? "none"
                          : "2px solid rgba(193, 160, 120, 1);",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #c1a078"
                          : "none",
                        "&:hover": {
                          borderColor: state.isFocused
                            ? "none"
                            : "2px solid rgba(193, 160, 120, 1)",
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
{/* Image */}
              <div className="col-12 col-md-6">
                <div className="form-group local-top-form">
                  <label className="local-top">
                    Image <span className="login-danger">*</span>
                  </label>
                  <div className="settings-btn upload-files-avator">
                    <input
                      type="file"
                      accept="image/*"
                      name="image"
                      id="file"
                      onChange={loadFile}
                      className="hide-input"
                    />
                    <label style={{ color: '#c1a078'}} htmlFor="file" className="upload">
                      Choose File
                    </label>
                  </div>
                </div>
              </div>
{/* Submit */}
              <div className="col-12">
                <div className="doctor-submit text-end">
                  <button
                    style={{
                              backgroundColor: "#c1a078",
                              color: "#fff",
                            }}
                    type="button"
                    onClick={handleAddModalOk}
                    className="btn btn-primary submit-form me-2"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={handleAddModalCancel}
                    className="btn btn-primary cancel-form"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Modal>

        {/* Edit Restaurant Modal */}
        <Modal
          title="Edit Restaurant"
          visible={isEditModalVisible}
          onOk={handleEditModalOk}
          onCancel={handleEditModalCancel}
          width={800}
          footer={null}
          className="edit-restaurant-modal"
        >
          <form>
            <div className="row">
              <div className="col-12">
                <div className="form-heading">
                  <h4>Restaurant Details</h4>
                </div>
              </div>
{/* Business Type */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Business Type</label>
                  <Select
                    value={editBusinessSelectedOption}
                    onChange={setEditSelectedOption}
                    options={businessOptions}
                    menuPortalTarget={document.body}
                    id="edit-search-commodity"
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: state.isFocused
                          ? "none"
                          : "2px solid rgba(193, 160, 120, 1);",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #c1a078"
                          : "none",
                        "&:hover": {
                          borderColor: state.isFocused
                            ? "none"
                            : "2px solid rgba(193, 160, 120, 1)",
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
{/* Outlet Type */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Outlet Type</label>
                  <Select
                    value={editSelectedOption}
                    onChange={setEditSelectedOption}
                    options={outletOptions}
                    menuPortalTarget={document.body}
                    id="edit-search-commodity"
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: state.isFocused
                          ? "none"
                          : "2px solid rgba(193, 160, 120, 1);",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #c1a078"
                          : "none",
                        "&:hover": {
                          borderColor: state.isFocused
                            ? "none"
                            : "2px solid rgba(193, 160, 120, 1)",
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
{/* Business Name */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Business Name</label>
                  <input 
                    className="form-control" 
                    type="text" 
                    defaultValue={editRecord?.Name || ""}
                  />
                </div>
              </div>
{/* GST NO. */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>GST NO.</label>
                  <input className="form-control" type="text" />
                </div>
              </div>
{/* FSSAI NO. */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>FSSAI NO.</label>
                  <input className="form-control" type="text" />
                </div>
              </div>
{/* Status */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Status</label>
                  <Select
                    value={editStatusOption}
                    onChange={setEditStatusOption}
                    options={statusOptions}
                    menuPortalTarget={document.body}
                    placeholder="Select Status"
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: state.isFocused
                          ? "none"
                          : "2px solid rgba(193, 160, 120, 1);",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #c1a078"
                          : "none",
                        "&:hover": {
                          borderColor: state.isFocused
                            ? "none"
                            : "2px solid rgba(193, 160, 120, 1)",
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
{/* Image */}
              <div className="col-12 col-md-6">
                <div className="form-group local-top-form">
                  <label className="local-top">
                    Image <span className="login-danger">*</span>
                  </label>
                  <div className="settings-btn upload-files-avator">
                    <input
                      type="file"
                      accept="image/*"
                      name="image"
                      id="edit-file"
                      onChange={loadFile}
                      className="hide-input"
                    />
                    <label style={{ color: '#c1a078'}} htmlFor="edit-file" className="upload">
                      Choose File
                    </label>
                  </div>
                </div>
              </div>
{/* Update */}
              <div className="col-12">
                <div className="doctor-submit text-end">
                  <button
                    style={{
                              backgroundColor: "#c1a078",
                              color: "#fff",
                            }}
                    type="button"
                    onClick={handleEditModalOk}
                    className="btn btn-primary submit-form me-2"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={handleEditModalCancel}
                    className="btn btn-primary cancel-form"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Modal>

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

export default RestaurantList;