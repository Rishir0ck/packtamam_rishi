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
  // State management
  const [state, setState] = useState({
    datasource: [],
    activeTab: "pending",
    tabCounts: { pending: 0, approved: 0, others: 0 },
    pagination: { current: 1, pageSize: 10, total: 0 },
    loading: false,
    updateLoading: false,
    outletTypesLoading: false,
    outletOptions: [],
    editRecord: null,
    isEditModalVisible: false,
    editSelectedOption: null,
    editStatusOption: null,
  });

  // API configuration
  const API_CONFIG = {
    baseUrl: "http://167.71.228.10:3000/api/admin",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJ1c2VyX2lkIjoiUUZMcUpWOVdTamF5TVhEZnFEUXFUdFVMa0g5MyIsImVtYWlsIjoicmRwYXRlbDc4MjRAZ21haWwuY29tIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwLyIsImlhdCI6MTc0ODc0ODIwOCwiZXhwIjoxNzQ5MzUzMDA4fQ.aIuhF_2BD_c4EkJ2kiLV5-BWEg4OxaNu6LPR-E5VaDo"
  };

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Fraudulent", label: "Fraudulent" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // Utility functions
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${API_CONFIG.token}`,
        "Content-Type": "application/json",
      },
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const getFilteredData = () => {
    const filters = {
      pending: ["Pending", "Pending Approval", "Under Review"],
      approved: ["Approved", "Active"],
      others: ["Rejected", "Fraudulent", "Suspended", "Inactive"]
    };
    return state.datasource.filter(item => 
      filters[state.activeTab]?.includes(item.Status) || state.activeTab === "all"
    );
  };

  const updateTabCounts = (data) => {
    const counts = {
      pending: data.filter(item => ["Pending", "Pending Approval", "Under Review"].includes(item.Status)).length,
      approved: data.filter(item => ["Approved", "Active"].includes(item.Status)).length,
      others: data.filter(item => ["Rejected", "Fraudulent", "Suspended", "Inactive"].includes(item.Status)).length,
    };
    updateState({ tabCounts: counts });
  };

  // API functions
  const fetchOutletTypes = async () => {
    updateState({ outletTypesLoading: true });
    try {
      const data = await apiCall("/outlet_types");
      const transformedOptions = data.data?.map(item => ({
        value: item.id,
        label: item.name || item.outlet_type || item.type,
      })) || [];
      updateState({ outletOptions: transformedOptions });
    } catch (error) {
      console.error("Error fetching outlet types:", error);
      message.error("Failed to fetch outlet types. Using default options.");
    } finally {
      updateState({ outletTypesLoading: false });
    }
  };

  const fetchBusinessList = async (page = 1, perPage = 10) => {
    updateState({ loading: true });
    try {
      const data = await apiCall(`/business-list?page=${page}&per_page=${perPage}`);
      const transformedData = data.data?.map((item, index) => ({
        id: item.id || `${page}-${index}`,
        business_id: item.id,
        outlet_type_id: item.outlet_type_id,
        Img: blogimg4,
        Business: item.business_name || "N/A",
        OutletType: item.outlet_type || "N/A",
        Status: item.status || "Pending",
        Email: item.email || "N/A",
        ...item,
      })) || [];

      updateState({
        datasource: transformedData,
        pagination: {
          ...state.pagination,
          current: page,
          total: data.total || data.pagination?.total || transformedData.length,
          pageSize: perPage,
        }
      });
      updateTabCounts(transformedData);
    } catch (error) {
      console.error("Error fetching business list:", error);
      message.error("Failed to fetch business list. Please try again.");
    } finally {
      updateState({ loading: false });
    }
  };

  const updateBusiness = async (businessId, updates) => {
    updateState({ updateLoading: true });
    try {
      return await apiCall("/update-business", {
        method: "PUT",
        body: JSON.stringify({ business_id: businessId, ...updates }),
      });
    } finally {
      updateState({ updateLoading: false });
    }
  };

  const handleBusinessAction = async (businessId, action) => {
    const statusMap = { approve: "Approved", reject: "Rejected", fraud: "Fraudulent" };
    try {
      await updateBusiness(businessId, { status: statusMap[action] });
      message.success(`Business ${action}d successfully!`);
      
      const updatedData = state.datasource.map(item =>
        item.business_id === businessId ? { ...item, Status: statusMap[action] } : item
      );
      updateState({ datasource: updatedData });
      updateTabCounts(updatedData);
    } catch (error) {
      message.error(`Failed to ${action} business. Please try again.`);
    }
  };

  // Modal handlers
  const showEditModal = (record) => {
    updateState({
      editRecord: record,
      editSelectedOption: state.outletOptions.find(option => 
        option.label === record.OutletType || option.value === record.outlet_type_id
      ),
      editStatusOption: statusOptions.find(option => option.value === record.Status),
      isEditModalVisible: true
    });
  };

  const handleEditModalOk = async () => {
    if (!state.editRecord || !state.editStatusOption) {
      message.error("Please select a status");
      return;
    }

    try {
      const updates = { status: state.editStatusOption.value };
      if (state.editSelectedOption && state.editSelectedOption.value !== state.editRecord.outlet_type_id) {
        updates.outlet_type_id = state.editSelectedOption.value;
      }

      await updateBusiness(state.editRecord.business_id, updates);
      message.success("Business updated successfully!");

      const updatedData = state.datasource.map(item =>
        item.business_id === state.editRecord.business_id
          ? {
              ...item,
              Status: state.editStatusOption.value,
              OutletType: state.editSelectedOption ? state.editSelectedOption.label : item.OutletType,
              outlet_type_id: state.editSelectedOption ? state.editSelectedOption.value : item.outlet_type_id,
            }
          : item
      );

      updateState({
        datasource: updatedData,
        isEditModalVisible: false,
        editRecord: null,
        editSelectedOption: null,
        editStatusOption: null
      });
      updateTabCounts(updatedData);
    } catch (error) {
      message.error("Failed to update business. Please try again.");
    }
  };

  const handleEditModalCancel = () => {
    updateState({
      isEditModalVisible: false,
      editRecord: null,
      editSelectedOption: null,
      editStatusOption: null
    });
  };

  // Table columns
  const createActionDropdown = (record, isPending = false) => (
    <div className="text-end">
      <div className="dropdown dropdown-action">
        <Link to="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown">
          <i className="fas fa-ellipsis-v" />
        </Link>
        <div className="dropdown-menu dropdown-menu-end">
          {isPending && (
            <>
              <Link className="dropdown-item text-success" to="#" 
                onClick={(e) => { e.preventDefault(); handleBusinessAction(record.business_id, "approve"); }}>
                <i className="fas fa-check me-2" />Approve
              </Link>
              <Link className="dropdown-item text-danger" to="#"
                onClick={(e) => { e.preventDefault(); handleBusinessAction(record.business_id, "reject"); }}>
                <i className="fas fa-times me-2" />Reject
              </Link>
            </>
          )}
          <Link className="dropdown-item" to="#" onClick={(e) => { e.preventDefault(); showEditModal(record); }}>
            <i className="far fa-edit me-2" />Edit
          </Link>
          {!isPending && (
            <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#delete_patient">
              <i className="fa fa-trash-alt m-r-5"></i> Delete
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  const renderStatus = (text) => {
    const statusColors = {
      Pending: "status-yellow", Approved: "status-green", Active: "status-green",
      Rejected: "status-red", Fraudulent: "status-orange", Inactive: "status-gray"
    };
    return <span className={`custom-badge ${statusColors[text] || "status-gray"}`}>{text}</span>;
  };

  const pendingColumns = [
    {
      title: "Name",
      dataIndex: "Business",
      render: (text, record) => (
        <div className="profile-image">
          <Link to="#" className="avatar avatar-sm me-2">
            <img className="avatar-img rounded-circle" src={record.Img} alt="User Image" />
          </Link>
          <span>{record.Business}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "Email" },
    { title: "Status", dataIndex: "Status", render: renderStatus },
    { title: "Actions", dataIndex: "actions", render: (text, record) => createActionDropdown(record, true) },
  ];

  const regularColumns = [
    {
      title: "Business Name",
      dataIndex: "Business",
      render: (text, record) => (
        <h2 className="profile-image">
          <Link to="#" className="avatar avatar-sm me-2">
            <img className="avatar-img rounded-circle" src={record.Img} alt="User Image" />
          </Link>
          <Link to="#">{record.Business}</Link>
        </h2>
      ),
    },
    { title: "Outlet Type", dataIndex: "OutletType" },
    { title: "Status", dataIndex: "Status", render: renderStatus },
    { title: "", dataIndex: "FIELD8", render: (text, record) => createActionDropdown(record, false) },
  ];

  // Effects and handlers
  useEffect(() => {
    fetchOutletTypes();
    fetchBusinessList(1, 10);
  }, []);

  const handleTableChange = (paginationInfo) => {
    fetchBusinessList(paginationInfo.current, paginationInfo.pageSize);
  };

  const handleTabChange = (key) => {
    updateState({ activeTab: key, pagination: { ...state.pagination, current: 1 } });
  };

  // Render tab content
  const renderTabContent = (title, columns, subtitle = null) => (
    <div>
      <div className="page-table-header mb-2">
        <div className="row align-items-center">
          <div className="col">
            <div className="doctor-table-blk">
              <h3 style={{ color: "#403222" }}>{title}</h3>
              {subtitle && <p style={{ color: "#666", marginBottom: 0 }}>{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="table-responsive doctor-list">
        <Spin spinning={state.loading || state.updateLoading}>
          <Table
            pagination={{
              ...state.pagination,
              total: getFilteredData().length,
              showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
              onShowSizeChange,
              itemRender,
            }}
            columns={columns}
            dataSource={getFilteredData()}
            rowKey={(record) => record.id}
          />
        </Spin>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <Sidebar id="menu-item4" id1="menu-items4" />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link style={{ color: "#403222" }} to="#">Restaurant Onboarding</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  <Tabs
                    style={{ marginBottom: "20px" }}
                    centered
                    activeKey={state.activeTab}
                    onChange={handleTabChange}
                    className="restaurant-tabs"
                  >
                    <TabPane tab={`Pending Requests (${state.tabCounts.pending})`} key="pending">
                      {renderTabContent(
                        "Pending Onboarding Requests",
                        pendingColumns,
                        "Review and approve/reject new restaurant applications."
                      )}
                    </TabPane>
                    <TabPane tab={`Approved & Rejected (${state.tabCounts.approved})`} key="approved">
                      {renderTabContent("Approved & Rejected Restaurants", regularColumns)}
                    </TabPane>
                    <TabPane tab={`Others (${state.tabCounts.others})`} key="others">
                      {renderTabContent("Other Status Restaurants", regularColumns)}
                    </TabPane>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Restaurant"
        visible={state.isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        width={600}
        footer={null}
        className="edit-restaurant-modal"
        centered
      >
        <Spin spinning={state.updateLoading}>
          <form>
            <div className="row">
              <div className="col-12">
                <div className="form-heading"><h4>Restaurant Details</h4></div>
              </div>
              
              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Business Name</label>
                  <input
                    className="form-control"
                    type="text"
                    value={state.editRecord?.Business || ""}
                    disabled
                    style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6" }}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Outlet Type <span style={{ color: "red" }}>*</span></label>
                  <Select
                    value={state.editSelectedOption}
                    onChange={(option) => updateState({ editSelectedOption: option })}
                    options={state.outletOptions}
                    isLoading={state.outletTypesLoading}
                    menuPortalTarget={document.body}
                    placeholder="Select Outlet Type"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? "none" : "2px solid rgba(193, 160, 120, 1)",
                        boxShadow: state.isFocused ? "0 0 0 1px #c1a078" : "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        minHeight: "45px",
                      }),
                    }}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Status <span style={{ color: "red" }}>*</span></label>
                  <Select
                    value={state.editStatusOption}
                    onChange={(option) => updateState({ editStatusOption: option })}
                    options={statusOptions}
                    menuPortalTarget={document.body}
                    placeholder="Select Status"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? "none" : "2px solid rgba(193, 160, 120, 1)",
                        boxShadow: state.isFocused ? "0 0 0 1px #c1a078" : "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        minHeight: "45px",
                      }),
                    }}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="form-group local-forms">
                  <label>Current Status</label>
                  <div style={{
                    padding: "10px",
                    border: "2px solid rgba(193, 160, 120, 1)",
                    borderRadius: "10px",
                    minHeight: "45px",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#f8f9fa",
                  }}>
                    {renderStatus(state.editRecord?.Status)}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="doctor-submit text-end">
                  <button
                    style={{ backgroundColor: "#c1a078", color: "#fff" }}
                    type="button"
                    onClick={handleEditModalOk}
                    className="btn btn-primary submit-form me-2"
                    disabled={state.updateLoading}
                  >
                    {state.updateLoading ? "Updating..." : "Update"}
                  </button>
                  <button
                    style={{ backgroundColor: "#c1a078", color: "#fff" }}
                    type="button"
                    onClick={handleEditModalCancel}
                    className="btn btn-primary cancel-form"
                    disabled={state.updateLoading}
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
      <div id="delete_patient" className="modal fade delete-modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <img src={imagesend} alt="#" width={50} height={46} />
              <h3>Are you sure want to delete this ?</h3>
              <div className="m-t-20">
                <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">Close</Link>
                <button type="submit" className="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantList;