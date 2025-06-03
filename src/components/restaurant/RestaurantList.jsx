/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Modal, message, Spin, Tabs } from "antd";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { imagesend, plusicon, blogimg4 } from "../imagepath";
import { onShowSizeChange, itemRender } from "../Pagination";
import { Link } from "react-router-dom";
import Select from "react-select";

const { TabPane } = Tabs;

const RestaurantList = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [editSelectedOption, setEditSelectedOption] = useState(null);
  const [editStatusOption, setEditStatusOption] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [datasource, setDatasource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [outletTypesLoading, setOutletTypesLoading] = useState(false);
  const [outletOptions, setOutletOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [tabCounts, setTabCounts] = useState({
    pending: 0,
    approved: 0,
    query: 0,
    pendings: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // API configuration
  const API_BASE_URL = "http://64.227.156.136:3000/api/admin";
  const BEARER_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJ1c2VyX2lkIjoiUUZMcUpWOVdTamF5TVhEZnFEUXFUdFVMa0g5MyIsImVtYWlsIjoicmRwYXRlbDc4MjRAZ21haWwuY29tIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwLyIsImlhdCI6MTc0ODc0ODIwOCwiZXhwIjoxNzQ5MzUzMDA4fQ.aIuhF_2BD_c4EkJ2kiLV5-BWEg4OxaNu6LPR-E5VaDo";

  // Filter data based on active tab
  const getFilteredData = () => {
    switch (activeTab) {
      case "pending":
        return datasource.filter(
          (item) =>
            item.Status === "Pending" ||
            item.Status === "Pending Approval" ||
            item.Status === "Under Review"
        );
      case "approved":
        return datasource.filter(
          (item) => item.Status === "Approved" || item.Status === "Active"
        );
      case "others":
        return datasource.filter(
          (item) =>
            item.Status === "Rejected" ||
            item.Status === "Fraudulent" ||
            item.Status === "Suspended" ||
            item.Status === "Inactive"
        );
      default:
        return datasource;
    }
  };

  // Update tab counts
  const updateTabCounts = (data) => {
    const counts = {
      pending: data.filter(
        (item) =>
          item.Status === "Pending" ||
          item.Status === "Pending Approval" ||
          item.Status === "Under Review"
      ).length,
      approved: data.filter(
        (item) => item.Status === "Approved" || item.Status === "Active"
      ).length,
      others: data.filter(
        (item) =>
          item.Status === "Rejected" ||
          item.Status === "Fraudulent" ||
          item.Status === "Suspended" ||
          item.Status === "Inactive"
      ).length,
    };
    setTabCounts(counts);
  };

  // Fetch outlet types from API
  const fetchOutletTypes = async () => {
    setOutletTypesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/outlet_types`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform API data to match select options format
      const transformedOptions =
        data.data?.map((item) => ({
          value: item.id,
          label: item.name || item.outlet_type || item.type,
        })) || [];

      setOutletOptions(transformedOptions);
    } catch (error) {
      console.error("Error fetching outlet types:", error);
      message.error("Failed to fetch outlet types. Using default options.");
    } finally {
      setOutletTypesLoading(false);
    }
  };

  // Fetch business list from API
  const fetchBusinessList = async (page = 1, perPage = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/business-list?page=${page}&per_page=${perPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform API data to match table structure
      const transformedData =
        data.data?.map((item, index) => ({
          id: item.id || `${page}-${index}`,
          business_id: item.id,
          outlet_type_id: item.outlet_type_id,
          Img: blogimg4,
          Business: item.business_name || "N/A",
          OutletType: item.outlet_type || "N/A",
          Status: item.status || "Pending", // Default to Pending for new requests
          Email: item.email || "N/A",
          ...item,
        })) || [];

      setDatasource(transformedData);
      updateTabCounts(transformedData);

      // Update pagination
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: data.total || data.pagination?.total || transformedData.length,
        pageSize: perPage,
      }));
    } catch (error) {
      console.error("Error fetching business list:", error);
      message.error("Failed to fetch business list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update business API call
  const updateBusiness = async (businessId, updates) => {
    setUpdateLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/update-business`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: businessId,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating business:", error);
      throw error;
    } finally {
      setUpdateLoading(false);
    }
  };

  // Approve/Reject business
  const handleBusinessAction = async (businessId, action) => {
    setUpdateLoading(true);
    try {
      const statusMap = {
        approve: "Approved",
        reject: "Rejected",
        fraud: "Fraudulent",
      };

      await updateBusiness(businessId, { status: statusMap[action] });

      message.success(`Business ${action}d successfully!`);

      // Update local data
      setDatasource((prevData) =>
        prevData.map((item) =>
          item.business_id === businessId
            ? { ...item, Status: statusMap[action] }
            : item
        )
      );

      // Update tab counts
      const updatedData = datasource.map((item) =>
        item.business_id === businessId
          ? { ...item, Status: statusMap[action] }
          : item
      );
      updateTabCounts(updatedData);
    } catch (error) {
      message.error(`Failed to ${action} business. Please try again.`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchOutletTypes();
    fetchBusinessList(1, 10);
  }, []);

  // Handle table pagination change
  const handleTableChange = (paginationInfo) => {
    fetchBusinessList(paginationInfo.current, paginationInfo.pageSize);
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
  };

  const showEditModal = (record) => {
    setEditRecord(record);
    setEditSelectedOption(
      outletOptions.find(
        (option) =>
          option.label === record.OutletType ||
          option.value === record.outlet_type_id
      )
    );
    setEditStatusOption(
      statusOptions.find((option) => option.value === record.Status)
    );
    setIsEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    if (!editRecord || !editStatusOption) {
      message.error("Please select a status");
      return;
    }

    try {
      const updates = {
        status: editStatusOption.value,
      };

      if (
        editSelectedOption &&
        editSelectedOption.value !== editRecord.outlet_type_id
      ) {
        updates.outlet_type_id = editSelectedOption.value;
      }

      await updateBusiness(editRecord.business_id, updates);
      message.success("Business updated successfully!");

      // Update local data
      const updatedData = datasource.map((item) =>
        item.business_id === editRecord.business_id
          ? {
              ...item,
              Status: editStatusOption.value,
              OutletType: editSelectedOption
                ? editSelectedOption.label
                : item.OutletType,
              outlet_type_id: editSelectedOption
                ? editSelectedOption.value
                : item.outlet_type_id,
            }
          : item
      );

      setDatasource(updatedData);
      updateTabCounts(updatedData);

      setIsEditModalVisible(false);
      setEditRecord(null);
      setEditSelectedOption(null);
      setEditStatusOption(null);
    } catch (error) {
      message.error("Failed to update business. Please try again.");
    }
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setEditRecord(null);
    setEditSelectedOption(null);
    setEditStatusOption(null);
  };

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Fraudulent", label: "Fraudulent" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // Columns for pending requests
  const pendingColumns = [
    {
      title: "Name",
      dataIndex: "Business",
      render: (text, record) => (
        <div className="profile-image">
          <Link to="#" className="avatar avatar-sm me-2">
            <img
              className="avatar-img rounded-circle"
              src={record.Img}
              alt="User Image"
            />
          </Link>
          <span>{record.Business}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "Email",
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text) => (
        <span className="custom-badge status-yellow">{text}</span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
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
                className="dropdown-item text-success"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleBusinessAction(record.business_id, "approve");
                }}
              >
                <i className="fas fa-check me-2" />
                Approve
              </Link>
              <Link
                className="dropdown-item text-danger"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleBusinessAction(record.business_id, "reject");
                }}
              >
                <i className="fas fa-times me-2" />
                Reject
              </Link>
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
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Columns for approved and other tabs
  const regularColumns = [
    {
      title: "Business Name",
      dataIndex: "Business",
      render: (text, record) => (
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
      ),
    },
    {
      title: "Outlet Type",
      dataIndex: "OutletType",
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text) => (
        <div>
          {text === "Approved" && (
            <span className="custom-badge status-green">{text}</span>
          )}
          {text === "Active" && (
            <span className="custom-badge status-green">{text}</span>
          )}
          {text === "Rejected" && (
            <span className="custom-badge status-red">{text}</span>
          )}
          {text === "Fraudulent" && (
            <span className="custom-badge status-orange">{text}</span>
          )}
          {text === "Inactive" && (
            <span className="custom-badge status-gray">{text}</span>
          )}
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "FIELD8",
      render: (text, record) => (
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
      ),
    },
  ];

  return (
    <>
      <Header />
      <Sidebar id="menu-item4" id1="menu-items4" />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link style={{ color: "#403222" }} to="#">
                      Restaurant Onboarding
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  {/* Tabs Section */}
                  <Tabs
                    style={{ marginBottom: "20px" }}
                    centered
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    className="restaurant-tabs"
                  >
                    <TabPane
                      tab={`Pending Requests (${tabCounts.pending})`}
                      key="pending"
                    >
                      <div className="page-table-header mb-2">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="doctor-table-blk">
                              <h3 style={{ color: "#403222" }}>
                                Pending Onboarding Requests
                              </h3>
                              <p style={{ color: "#666", marginBottom: 0 }}>
                                Review and approve/reject new restaurant
                                applications.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive doctor-list">
                        <Spin spinning={loading || updateLoading}>
                          <Table
                            pagination={{
                              ...pagination,
                              total: getFilteredData().length,
                              showTotal: (total, range) =>
                                `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                              onShowSizeChange: onShowSizeChange,
                              itemRender: itemRender,
                            }}
                            columns={pendingColumns}
                            dataSource={getFilteredData()}
                            rowKey={(record) => record.id}
                          />
                        </Spin>
                      </div>
                    </TabPane>

                    <TabPane
                      tab={`Approved & Rejected (${tabCounts.approved})`}
                      key="approved"
                    >
                      <div className="page-table-header mb-2">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="doctor-table-blk">
                              <h3 style={{ color: "#403222" }}>
                                Approved & Rejected Restaurants
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive doctor-list">
                        <Spin spinning={loading}>
                          <Table
                            pagination={{
                              ...pagination,
                              total: getFilteredData().length,
                              showTotal: (total, range) =>
                                `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                              onShowSizeChange: onShowSizeChange,
                              itemRender: itemRender,
                            }}
                            columns={regularColumns}
                            dataSource={getFilteredData()}
                            rowKey={(record) => record.id}
                          />
                        </Spin>
                      </div>
                    </TabPane>

                    <TabPane
                      tab={`Query Raise (${tabCounts.query})`}
                      key="query"
                    >
                      <div className="page-table-header mb-2">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="doctor-table-blk">
                              <h3 style={{ color: "#403222" }}>Query Raise</h3>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive doctor-list">
                        <Spin spinning={loading}>
                          <Table
                            pagination={{
                              ...pagination,
                              total: getFilteredData().length,
                              showTotal: (total, range) =>
                                `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                              onShowSizeChange: onShowSizeChange,
                              itemRender: itemRender,
                            }}
                            columns={regularColumns}
                            dataSource={getFilteredData()}
                            rowKey={(record) => record.id}
                          />
                        </Spin>
                      </div>
                    </TabPane>

                    <TabPane
                      tab={`Pending (${tabCounts.pendings})`}
                      key="pendings"
                    >
                      <div className="page-table-header mb-2">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="doctor-table-blk">
                              <h3 style={{ color: "#403222" }}>
                                Pending Restaurant
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive doctor-list">
                        <Spin spinning={loading}>
                          <Table
                            pagination={{
                              ...pagination,
                              total: getFilteredData().length,
                              showTotal: (total, range) =>
                                `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                              onShowSizeChange: onShowSizeChange,
                              itemRender: itemRender,
                            }}
                            columns={regularColumns}
                            dataSource={getFilteredData()}
                            rowKey={(record) => record.id}
                          />
                        </Spin>
                      </div>
                    </TabPane>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Restaurant Modal */}
      <Modal
        title="Edit Restaurant"
        visible={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        width={600}
        footer={null}
        className="edit-restaurant-modal"
        centered
      >
        <Spin spinning={updateLoading}>
          <form>
            <div className="row">
              <div className="col-12">
                <div className="form-heading">
                  <h4>Restaurant Details</h4>
                </div>
              </div>

              {/* Business Name Display */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Business Name</label>
                  <input
                    className="form-control"
                    type="text"
                    value={editRecord?.Business || ""}
                    disabled
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderColor: "#dee2e6",
                    }}
                  />
                </div>
              </div>

              {/* Outlet Type */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>
                    Outlet Type <span style={{ color: "red" }}>*</span>
                  </label>
                  <Select
                    value={editSelectedOption}
                    onChange={setEditSelectedOption}
                    options={outletOptions}
                    isLoading={outletTypesLoading}
                    menuPortalTarget={document.body}
                    placeholder="Select Outlet Type"
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
                    }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>
                    Status <span style={{ color: "red" }}>*</span>
                  </label>
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
                    }}
                  />
                </div>
              </div>

              {/* Current Status Display */}
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Current Status</label>
                  <div
                    style={{
                      padding: "10px",
                      border: "2px solid rgba(193, 160, 120, 1)",
                      borderRadius: "10px",
                      minHeight: "45px",
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    {editRecord?.Status === "Approved" && (
                      <span className="custom-badge status-green">
                        {editRecord?.Status}
                      </span>
                    )}
                    {editRecord?.Status === "Rejected" && (
                      <span className="custom-badge status-red">
                        {editRecord?.Status}
                      </span>
                    )}
                    {editRecord?.Status === "Fraudulent" && (
                      <span className="custom-badge status-orange">
                        {editRecord?.Status}
                      </span>
                    )}
                    {editRecord?.Status === "Pending" && (
                      <span className="custom-badge status-yellow">
                        {editRecord?.Status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Update Buttons */}
              <div className="col-12">
                <div className="doctor-submit text-end">
                  <button
                    style={{ backgroundColor: "#c1a078", color: "#fff" }}
                    type="button"
                    onClick={handleEditModalOk}
                    className="btn btn-primary submit-form me-2"
                    disabled={updateLoading}
                  >
                    {updateLoading ? "Updating..." : "Update"}
                  </button>
                  <button
                    style={{ backgroundColor: "#c1a078", color: "#fff" }}
                    type="button"
                    onClick={handleEditModalCancel}
                    className="btn btn-primary cancel-form"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Spin>
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
  );
};

export default RestaurantList;
