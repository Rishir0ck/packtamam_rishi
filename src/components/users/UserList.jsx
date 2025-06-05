/* eslint-disable no-unused-vars */
import React from "react";
import { pagination, Table, Modal, message } from "antd";
import { onShowSizeChange, itemRender } from "../Pagination";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { imagesend, plusicon, refreshicon, blogimg12, blogimg2, blogimg4, blogimg6, blogimg8 } from "../imagepath";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";

const UserList = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [datasource, setDatasource] = useState([]);
  const [loading, setLoading] = useState(false);

  // API Configuration
  const API_BASE_URL = "http://167.71.228.10:3000/api/admin";
  const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJ1c2VyX2lkIjoiUUZMcUpWOVdTamF5TVhEZnFEUXFUdFVMa0g5MyIsImVtYWlsIjoicmRwYXRlbDc4MjRAZ21haWwuY29tIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwLyIsImlhdCI6MTc0ODc0ODIwOCwiZXhwIjoxNzQ5MzUzMDA4fQ.aIuhF_2BD_c4EkJ2kiLV5-BWEg4OxaNu6LPR-E5VaDo";

  const department = [
    { value: "admin", label: "Admin" },
    { value: "subadmin", label: "Sub Admin" },
    { value: "user", label: "User" },
  ];

  // API Headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BEARER_TOKEN}`
  });

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get-data`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API data to match your table structure
      const transformedData = data.map((user, index) => ({
        id: user.id || index + 1,
        Img: user.profileImage || blogimg2, // Use API image or fallback
        Name: user.name || user.username || 'N/A',
        Email: user.email || 'N/A',
        Role: user.role || user.userType || 'user',
        FIELD9: "",
      }));

      setDatasource(transformedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users. Please try again.');
      
      // Fallback to dummy data if API fails
      setDatasource([
        {
          id: 1,
          Img: blogimg2,
          Name: "Andrea Lalema",
          Email: "example@email.com",
          Role: "Admin",
          FIELD9: "",
        },
        {
          id: 2,
          Img: blogimg4,
          Name: "Dr.Smith Bruklin",
          Email: "example@email.com",
          Role: "subadmin",
          FIELD9: "",
        },
        {
          id: 3,
          Img: blogimg6,
          Name: "Dr.William Stephin",
          Email: "example@email.com",
          Role: "user",
          FIELD9: "",
        },
        {
          id: 4,
          Img: blogimg12,
          Name: "Bernardo James",
          Email: "example@email.com",
          Role: "user",
          FIELD9: "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Add new user via API
  const addUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/add-user`, {
        method: 'GET',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      message.success('User added successfully!');
      fetchUsers(); // Refresh the list
      return result;
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Failed to add user. Please try again.');
      throw error;
    }
  };

  // Update user via API
  const updateUser = async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-user/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      message.success('User updated successfully!');
      fetchUsers(); // Refresh the list
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Failed to update user. Please try again.');
      throw error;
    }
  };

  // Delete user via API
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete-user/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('User deleted successfully!');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user. Please try again.');
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const onChange = (date, dateString) => {
    // console.log(date, dateString);
  };

  const showAddModal = () => {
    setSelectedOption(null);
    setIsAddModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditUserData(record);
    setSelectedOption({ value: record.Role.toLowerCase(), label: record.Role });
    setIsEditModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    setSelectedOption(null);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditUserData(null);
    setSelectedOption(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: selectedOption?.value || 'user',
      status: formData.get('status') || 'active',
    };

    try {
      await addUser(userData);
      setIsAddModalVisible(false);
      setSelectedOption(null);
    } catch (error) {
      // Error already handled in addUser function
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: selectedOption?.value || editUserData?.Role?.toLowerCase(),
      status: formData.get('editStatus') || 'active',
    };

    try {
      await updateUser(editUserData.id, userData);
      setIsEditModalVisible(false);
      setEditUserData(null);
      setSelectedOption(null);
    } catch (error) {
      // Error already handled in updateUser function
    }
  };

  const handleDelete = (userId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteUser(userId),
    });
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
                alt="User Image"
                onError={(e) => {
                  e.target.src = blogimg2; // Fallback image
                }}
              />
            </Link>
            <Link to="#">{record.Name}</Link>
          </h2>
        </>
      ),
    },
    {
      title: "Email",
      dataIndex: "Email",
    },
    {
      title: "Role",
      dataIndex: "Role",
      render: (role) => (
        <span style={{ textTransform: 'capitalize' }}>
          {role}
        </span>
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
                  onClick={() => showEditModal(record)}
                >
                  <i className="far fa-edit me-2" />
                  Edit
                </Link>
                <Link
                  className="dropdown-item"
                  to="#"
                  onClick={() => handleDelete(record.id)}
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

  // Add User Modal Content
  const AddUserModal = () => (
    <form onSubmit={handleAddSubmit}>
      <div className="row">
        <div className="col-12">
          <div className="form-heading">
            <h4 style={{ color: "#403222" }}>User Details</h4>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="form-group local-forms">
            <label>
              Name <span className="login-danger">*</span>
            </label>
            <input
              className="form-control"
              type="text"
              name="name"
              placeholder="Enter name"
              required
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="form-group local-forms">
            <label>
              Email <span className="login-danger">*</span>
            </label>
            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="Enter email"
              required
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="form-group local-forms">
            <label>
              Role <span className="login-danger">*</span>
            </label>
            <Select
              value={selectedOption}
              onChange={setSelectedOption}
              options={department}
              placeholder="Select Role"
              components={{
                IndicatorSeparator: () => null
              }}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1);',
                  boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
                  '&:hover': {
                    borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                  },
                  borderRadius: '10px',
                  fontSize: "14px",
                  minHeight: "45px",
                }),
                dropdownIndicator: (base, state) => ({
                  ...base,
                  transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                  transition: '250ms',
                  width: '35px',
                  height: '35px',
                }),
              }}
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
                  name="status"
                  className="form-check-input"
                  value="active"
                  defaultChecked
                />
                Active
              </label>
            </div>
            <div className="form-check-inline">
              <label className="form-check-label">
                <input
                  type="radio"
                  name="status"
                  className="form-check-input"
                  value="inactive"
                />
                In Active
              </label>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="doctor-submit text-end">
            <button
              style={{ backgroundColor: "#c1a078", color: "#fff" }}
              type="submit"
              className="btn btn-primary submit-form me-2"
            >
              Submit
            </button>
            <button
              style={{ backgroundColor: "#c1a078", color: "#fff" }}
              type="button"
              className="btn btn-primary cancel-form"
              onClick={handleAddCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  // Edit User Modal Content
  const EditUserModal = () => (
    <form onSubmit={handleEditSubmit}>
      <div className="row">
        <div className="col-12">
          <div className="form-heading">
            <h4 style={{ color: "#403222" }}>Edit User Details</h4>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="form-group local-forms">
            <label>
              Name <span className="login-danger">*</span>
            </label>
            <input
              className="form-control"
              type="text"
              name="name"
              defaultValue={editUserData?.Name || ""}
              required
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="form-group local-forms">
            <label>
              Email <span className="login-danger">*</span>
            </label>
            <input
              className="form-control"
              type="email"
              name="email"
              defaultValue={editUserData?.Email || ""}
              required
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="form-group local-forms">
            <label>
              Role <span className="login-danger">*</span>
            </label>
            <Select
              value={selectedOption}
              onChange={setSelectedOption}
              options={department}
              components={{
                IndicatorSeparator: () => null
              }}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1);',
                  boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
                  '&:hover': {
                    borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                  },
                  borderRadius: '10px',
                  fontSize: "14px",
                  minHeight: "45px",
                }),
                dropdownIndicator: (base, state) => ({
                  ...base,
                  transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                  transition: '250ms',
                  width: '35px',
                  height: '35px',
                }),
              }}
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
                  value="active"
                  defaultChecked
                />
                Active
              </label>
            </div>
            <div className="form-check-inline">
              <label className="form-check-label">
                <input
                  type="radio"
                  name="editStatus"
                  className="form-check-input"
                  value="inactive"
                />
                In Active
              </label>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="doctor-submit text-end">
            <button
              style={{ backgroundColor: "#c1a078", color: "#fff" }}
              type="submit"
              className="btn btn-primary submit-form me-2"
            >
              Update
            </button>
            <button
              style={{ backgroundColor: "#c1a078", color: "#fff" }}
              type="button"
              className="btn btn-primary cancel-form"
              onClick={handleEditCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <>
      <Header />
      <Sidebar
        id="menu-item1"
        id1="menu-items1"
        // activeClassName='doctor-list'
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
                        Users{" "}
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
                            <h3 style={{ color: "#403222" }}>Users List</h3>
                            <div className="doctor-search-blk">
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
                        loading={loading}
                        pagination={{
                          total: datasource.length,
                          showTotal: (total, range) =>
                            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                          // showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                          itemRender: itemRender,
                        }}
                        columns={columns}
                        dataSource={datasource}
                        rowKey={(record) => record.id}
                        style={{
                          backgroundColor: "#f2f2f2", // Replace with your desired background color for the table
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        <Modal
          title="Add New User"
          open={isAddModalVisible}
          onCancel={handleAddCancel}
          footer={null}
          width={800}
          className="custom-modal"
        >
          <AddUserModal />
        </Modal>

        {/* Edit User Modal */}
        <Modal
          title="Edit User"
          open={isEditModalVisible}
          onCancel={handleEditCancel}
          footer={null}
          width={800}
          className="custom-modal"
        >
          <EditUserModal />
        </Modal>
      </>
    </>
  );
};

export default UserList;