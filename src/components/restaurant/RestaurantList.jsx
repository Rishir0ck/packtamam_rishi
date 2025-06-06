import React, { useState, useEffect } from "react";
import { message, Spin, Card, Avatar, Space, Tag, Button, Row, Col, Tabs, Modal, Pagination } from "antd";
import { Link } from "react-router-dom";
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import Header from "../Header";
import Sidebar from "../Sidebar";
import { imagesend, blogimg4 } from "../imagepath";
// import { onShowSizeChange, itemRender } from "../Pagination";
import Select from "react-select";

const RestaurantList = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [datasource, setDatasource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [tabCounts, setTabCounts] = useState({ pending: 0, approved: 0, rejected: 0, query: 0 });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });
  const [editModal, setEditModal] = useState({ visible: false, record: null, statusOption: null });
  const [viewModal, setViewModal] = useState({ visible: false, record: null });

  // API configuration
  const API_CONFIG = {
    baseUrl: "http://167.71.228.10:3000/api/admin",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJ1c2VyX2lkIjoiUUZMcUpWOVdTamF5TVhEZnFEUXFUdFVMa0g5MyIsImVtYWlsIjoicmRwYXRlbDc4MjRAZ21haWwuY29tIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwLyIsImlhdCI6MTc0ODc0ODIwOCwiZXhwIjoxNzQ5MzUzMDA4fQ.aIuhF_2BD_c4EkJ2kiLV5-BWEg4OxaNu6LPR-E5VaDo"
  };

  const API_ENDPOINTS = {
    pending: "/pending-business-list",
    approved: "/approved-business-list", 
    rejected: "/rejected-business-list",
    query: "/query-business-list",
    updateStatus: "/update-business-status",
  };

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Query", label: "Query" },
  ];

  const getImageUrl = (profilePicture) => {
    if (profilePicture && profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return blogimg4;
  };

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

  // Fetch all tab counts
  const fetchAllTabCounts = async () => {
    const tabs = ['pending', 'approved', 'rejected', 'query'];
    
    try {
      const countPromises = tabs.map(async (tab) => {
        try {
          const data = await apiCall(`${API_ENDPOINTS[tab]}?page=1&per_page=1`);
          return { tab, count: data.total || data.pagination?.total || 0 };
        } catch (error) {
          console.error(`Error fetching ${tab} count:`, error);
          return { tab, count: 0 };
        }
      });

      const results = await Promise.all(countPromises);
      const newCounts = {};
      results.forEach(({ tab, count }) => {
        newCounts[tab] = count;
      });
      setTabCounts(newCounts);
    } catch (error) {
      console.error("Error fetching tab counts:", error);
    }
  };

  // Fetch data for specific tab
  const fetchDataByTab = async (tabKey, page = 1, perPage = 12) => {
    setLoading(true);
    try {
      const data = await apiCall(`${API_ENDPOINTS[tabKey]}?page=${page}&per_page=${perPage}`);
      
      const transformedData = data.data?.map((item, index) => ({
        id: item.id || `${tabKey}-${page}-${index}`,
        business_id: item.id,
        Name: item.business_name || "N/A",
        BusinessName: item.business_name || "N/A",
        OutletType: item.outlet_type || "N/A",
        Status: item.status || getDefaultStatusForTab(tabKey),
        Email: item.email || "N/A",
        Img: getImageUrl(item.profile_picture),
        owner_name: item.owner_name || "N/A",
        mobile_number: item.mobile_number || "N/A",
        location: item.location || "N/A",
        outlet_type_id: item.outlet_type_id,
        legal_entity_name: item.legal_entity_name || "N/A",
        franchise_code: item.franchise_code || "N/A",
        business_type: item.business_type || "N/A",
        address: item.address || "N/A",
        pincode: item.pincode || "N/A",
        landmark: item.landmark || "N/A",
        city: item.city || "N/A",
        gst_no: item.gst_no || "N/A",
        fssai_no: item.fssai_no || "N/A",
        pan: item.pan || "N/A",
        ...item,
      })) || [];

      setDatasource(transformedData);
      setPagination({
        current: page,
        pageSize: perPage,
        total: data.total || data.pagination?.total || transformedData.length,
      });

      // Update current tab count
      const currentTabCount = data.total || data.pagination?.total || transformedData.length;
      setTabCounts(prev => ({ ...prev, [tabKey]: currentTabCount }));

    } catch (error) {
      console.error(`Error fetching ${tabKey} business list:`, error);
      message.error(`Failed to fetch ${tabKey} business list. Please try again.`);
      setDatasource([]);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStatusForTab = (tabKey) => {
    const statusMap = {
      pending: "Pending",
      approved: "Approved", 
      rejected: "Rejected",
      query: "Query"
    };
    return statusMap[tabKey] || "Unknown";
  };

  const handleBusinessAction = async (businessId, action) => {
    const statusMap = { 
      approve: "Approved", 
      reject: "Rejected", 
      query: "Query", 
    };
    
    setUpdateLoading(true);
    try {
      await apiCall(API_ENDPOINTS.updateStatus, {
        method: "POST",
        body: JSON.stringify({ 
          id: businessId, 
          status: statusMap[action] 
        }),
      });
      
      message.success(`Business ${action}d successfully!`);
      
      // Remove item from current view
      setDatasource(prev => prev.filter(item => item.business_id !== businessId));
      
      // Refresh tab counts and current tab
      await fetchAllTabCounts();
      await fetchDataByTab(activeTab, pagination.current, pagination.pageSize);
      
    } catch (error) {
      message.error(`Failed to ${action} business. Please try again.`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const showEditModal = (record) => {
    setEditModal({
      visible: true,
      record,
      statusOption: statusOptions.find(option => option.value === record.Status)
    });
  };

  const showViewModal = (record) => {
    setViewModal({
      visible: true,
      record
    });
  };

  const handleEditSubmit = async () => {
    if (!editModal.record || !editModal.statusOption) {
      message.error("Please select a status");
      return;
    }

    setUpdateLoading(true);
    try {
      await apiCall(API_ENDPOINTS.updateStatus, {
        method: "POST",
        body: JSON.stringify({ 
          id: editModal.record.business_id, 
          status: editModal.statusOption.value 
        }),
      });

      message.success("Business updated successfully!");

      // If status changed, refresh data
      if (editModal.statusOption.value !== editModal.record.Status) {
        setDatasource(prev => prev.filter(item => item.business_id !== editModal.record.business_id));
        await fetchAllTabCounts();
        await fetchDataByTab(activeTab, pagination.current, pagination.pageSize);
      } else {
        // Update in place
        setDatasource(prev => prev.map(item =>
          item.business_id === editModal.record.business_id
            ? { ...item, Status: editModal.statusOption.value }
            : item
        ));
      }

      setEditModal({ visible: false, record: null, statusOption: null });
    } catch (error) {
      message.error("Failed to update business. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTabCounts().then(() => {
      fetchDataByTab("pending", 1, 12);
    });
  }, []);

  const handlePaginationChange = (page, pageSize) => {
    fetchDataByTab(activeTab, page, pageSize);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination(prev => ({ ...prev, current: 1 }));
    setDatasource([]);
    fetchDataByTab(key, 1, 12);
  };

  const handleImageError = (e) => {
    e.target.src = blogimg4;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'orange',
      'Approved': 'green',
      'Rejected': 'red',
      'Query': 'blue'
    };
    return colors[status] || 'default';
  };

  const getTabTitle = (tab) => {
    const titles = {
      pending: "Pending Requests",
      approved: "Approved Restaurants", 
      rejected: "Rejected Restaurants",
      query: "Query Status Restaurants"
    };
    return titles[tab] || "Restaurants";
  };

  const getTabSubtitle = (tab) => {
    const subtitles = {
      pending: "Review and approve/reject new restaurant applications",
      approved: "Successfully onboarded restaurants",
      rejected: "Rejected restaurant applications",
      query: "Restaurants with pending queries"
    };
    return subtitles[tab] || "";
  };

  const renderInfoCard = (title, value, colSpan = 6) => (
    <div className={`col-md-${colSpan} mb-3`}>
      <div style={{
        background: '#fafafa',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div style={{ 
          fontSize: '12px', 
          color: '#8c8c8c', 
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {title}
        </div>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#403222',
          wordBreak: 'break-word'
        }}>
          {value || 'N/A'}
        </div>
      </div>
    </div>
  );

  const renderRestaurantCard = (record) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={record.id} style={{ marginBottom: '24px' }}>
      <Card
        style={{
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          height: '100%',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '20px' }}
        hoverable
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Avatar
            size={64}
            src={record.Img}
            style={{
              border: '3px solid #f0f0f0',
              marginBottom: '12px'
            }}
            onError={handleImageError}
          />
          <div style={{
            fontWeight: 600,
            fontSize: '16px',
            color: '#403222',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {record.Name}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px'
          }}>
            {record.owner_name}
          </div>
          <Tag
            color={getStatusColor(record.Status)}
            style={{
              borderRadius: '16px',
              fontSize: '12px',
              padding: '4px 12px',
              fontWeight: 500
            }}
          >
            {record.Status}
          </Tag>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: 500, color: '#403222' }}>Email:</span>
            <span style={{
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {record.Email}
            </span>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: 500, color: '#403222' }}>Phone:</span>
            <span>{record.mobile_number}</span>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: 500, color: '#403222' }}>Location:</span>
            <span style={{
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {record.location}
            </span>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontWeight: 500, color: '#403222' }}>Type:</span>
            <Tag
              color="blue"
              style={{
                borderRadius: '12px',
                fontSize: '11px',
                padding: '2px 8px'
              }}
            >
              {record.OutletType}
            </Tag>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showViewModal(record)}
            style={{ color: '#c1a078' }}
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            style={{ color: '#c1a078' }}
            size="small"
          />
          {activeTab === 'pending' && (
            <>
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleBusinessAction(record.business_id, 'approve')}
                style={{ color: '#52c41a' }}
                size="small"
                loading={updateLoading}
              />
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => handleBusinessAction(record.business_id, 'reject')}
                style={{ color: '#ff4d4f' }}
                size="small"
                loading={updateLoading}
              />
            </>
          )}
          {activeTab !== 'pending' && (
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: '#ff4d4f' }}
              size="small"
              data-bs-toggle="modal"
              data-bs-target="#delete_patient"
            />
          )}
        </div>
      </Card>
    </Col>
  );

  return (
    <>
      <Header />
      <Sidebar id="menu-item4" id1="menu-items4" />
      <div className="page-wrapper">
        <div className="content" style={{ padding: '24px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '24px' }}>
            <nav style={{ marginBottom: '16px' }}>
              <ol className="breadcrumb" style={{ 
                background: 'transparent', 
                padding: 0, 
                margin: 0,
                fontSize: '14px'
              }}>
                <li className="breadcrumb-item">
                  <Link style={{ color: "#403222" }} to="#">
                    Restaurant Onboarding
                  </Link>
                </li>
              </ol>
            </nav>
            <div style={{
              background: 'linear-gradient(135deg, #c1a078 0%, #d4b896 100%)',
              borderRadius: '12px',
              padding: '24px',
              color: 'white'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: 600,
                marginBottom: '4px'
              }}>
                Restaurant Onboarding
              </h2>
              <p style={{ 
                margin: 0, 
                opacity: 0.9,
                fontSize: '14px',
                color: '#403222',
              }}>
                Manage restaurant applications and onboarding process
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              style={{ marginBottom: '20px' }}
              items={[
                {
                  key: 'pending',
                  label: `Pending (${tabCounts.pending})`,
                },
                {
                  key: 'approved', 
                  label: `Approved (${tabCounts.approved})`,
                },
                {
                  key: 'rejected',
                  label: `Rejected (${tabCounts.rejected})`,
                },
                {
                  key: 'query',
                  label: `Query (${tabCounts.query})`,
                }
              ]}
            />

            <div style={{ marginBottom: '20px' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <h3 style={{ 
                    color: "#403222", 
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600
                  }}>
                    {getTabTitle(activeTab)}
                  </h3>
                  <p style={{ 
                    color: "#8c8c8c", 
                    margin: 0,
                    fontSize: '14px',
                    marginTop: '4px'
                  }}>
                    {getTabSubtitle(activeTab)} - {pagination.total} restaurants found
                  </p>
                </Col>
              </Row>
            </div>

            <Spin spinning={loading || updateLoading}>
              <Row gutter={[16, 16]}>
                {datasource.map(record => renderRestaurantCard(record))}
              </Row>
              
              {datasource.length === 0 && !loading && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#8c8c8c'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                    No restaurants found
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {getTabSubtitle(activeTab)}
                  </div>
                </div>
              )}

              {pagination.total > 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    onChange={handlePaginationChange}
                    onShowSizeChange={handlePaginationChange}
                    showTotal={(total, range) => 
                      `Showing ${range[0]}-${range[1]} of ${total} entries`
                    }
                    showSizeChanger
                    showQuickJumper
                    pageSizeOptions={['12', '24', '48', '96']}
                  />
                </div>
              )}
            </Spin>
          </Card>
        </div>
      </div>

      {/* View Modal */}
      <Modal
        title="Restaurant Details"
        open={viewModal.visible}
        onCancel={() => setViewModal({ visible: false, record: null })}
        footer={null}
        width={800}
        centered
        style={{ borderRadius: '12px' }}
      >
        {viewModal.record && (
          <div style={{ padding: '20px 0' }}>
            <div className="row mb-4">
              <div className="col-12 text-center">
                <Avatar 
                  size={80}
                  src={viewModal.record.Img}
                  style={{ 
                    border: '3px solid #f0f0f0',
                    marginBottom: '16px'
                  }}
                  onError={handleImageError}
                />
                <h4 style={{ 
                  color: "#403222", 
                  fontSize: '20px',
                  fontWeight: 600,
                  margin: 0
                }}>
                  {viewModal.record.Name}
                </h4>
              </div>
            </div>
            <div className="row">
              {renderInfoCard("Business Name", viewModal.record.BusinessName)}
              {renderInfoCard("Legal Entity Name", viewModal.record.legal_entity_name)}
              {renderInfoCard("Franchise Code", viewModal.record.franchise_code)}
              {renderInfoCard("Owner Name", viewModal.record.owner_name)}
              {renderInfoCard("Email Address", viewModal.record.Email)}
              {renderInfoCard("Mobile Number", viewModal.record.mobile_number)}
              {renderInfoCard("Location", viewModal.record.location)}
              {renderInfoCard("Business Type", viewModal.record.business_type)}
              {renderInfoCard("Outlet Type", viewModal.record.OutletType)}
              {renderInfoCard("GST Number", viewModal.record.gst_no)}
              {renderInfoCard("FSSAI Number", viewModal.record.fssai_no)}
              {renderInfoCard("PAN Number", viewModal.record.pan)}
              {renderInfoCard("Address", viewModal.record.address)}
              {renderInfoCard("Pincode", viewModal.record.pincode)}
              {renderInfoCard("Landmark", viewModal.record.landmark)}
              {renderInfoCard("City", viewModal.record.city)}
              <div className="col-12">
                <div style={{
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#8c8c8c', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Status
                  </div>
                  <Tag 
                    color={getStatusColor(viewModal.record.Status)}
                    style={{ 
                      fontSize: '14px',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontWeight: 500
                    }}
                  >
                    {viewModal.record.Status}
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Restaurant Status"
        open={editModal.visible}
        onCancel={() => setEditModal({ visible: false, record: null, statusOption: null })}
        footer={null}
        width={500}
        centered
        style={{ borderRadius: '12px' }}
      >
        <Spin spinning={updateLoading}>
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <Avatar 
                size={64}
                src={editModal.record?.Img}
                style={{ marginBottom: '12px' }}
              />
              <h4 style={{ margin: 0, color: '#403222' }}>
                {editModal.record?.Name}
              </h4>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 500,
                color: '#403222'
              }}>
                Current Status
              </label>
              <Tag 
                color={getStatusColor(editModal.record?.Status)}
                style={{ 
                  fontSize: '14px',
                  padding: '6px 16px',
                  borderRadius: '20px'
                }}
              >
                {editModal.record?.Status}
              </Tag>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 500,
                color: '#403222'
              }}>
                New Status <span style={{ color: '#ff4d4f' }}>*</span>
              </label>
              <Select
                value={editModal.statusOption}
                onChange={(option) => setEditModal(prev => ({ ...prev, statusOption: option }))}
                options={statusOptions}
                placeholder="Select Status"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#c1a078" : "#d9d9d9",
                    boxShadow: state.isFocused ? "0 0 0 2px rgba(193, 160, 120, 0.2)" : "none",
                    borderRadius: "6px",
                    minHeight: "40px",
                  }),
                }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button 
                  onClick={() => setEditModal({ visible: false, record: null, statusOption: null })}
                  style={{ borderRadius: '6px' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="primary"
                  onClick={handleEditSubmit}
                  loading={updateLoading}
                  style={{ 
                    backgroundColor: "#c1a078", 
                    borderColor: "#c1a078",
                    borderRadius: '6px'
                  }}
                >
                  Update Status
                </Button>
              </Space>
            </div>
          </div>
        </Spin>
      </Modal>

      {/* Delete Modal */}
      <div id="delete_patient" className="modal fade delete-modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
            <div className="modal-body text-center" style={{ padding: '32px' }}>
              <img src={imagesend} alt="Delete" width={50} height={46} style={{ marginBottom: '16px' }} />
              <h3 style={{ 
                color: '#403222', 
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                Confirm Deletion
              </h3>
              <p style={{ color: '#8c8c8c', marginBottom: '24px' }}>
                Are you sure you want to delete this restaurant?
              </p>
              <Space>
                <Button data-bs-dismiss="modal" style={{ borderRadius: '6px' }}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  danger 
                  style={{ borderRadius: '6px' }}
                >
                  Delete
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantList;