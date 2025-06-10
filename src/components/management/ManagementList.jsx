import React, { useState, useEffect } from "react";
import { Table, message, Spin, Card, Avatar, Space, Tag, Button, Row, Col } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Header from "../Header";
import Sidebar from "../Sidebar";
import { imagesend, blogimg4 } from "../imagepath";
// import { onShowSizeChange, itemRender } from "../Pagination";
import AdminService from "../../Firebase/services/adminApiService"; // Import your AdminService

const ManagementList = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [datasource, setDatasource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const getImageUrl = (profilePicture) => profilePicture?.startsWith('http') ? profilePicture : blogimg4;

  const fetchApprovedRestaurants = async (page = 1, perPage = 10) => {
    setLoading(true);
    try {
      // Check if user is authenticated
      if (!AdminService.isAuthenticated()) {
        message.error("Please login to access this page");
        setDatasource([]);
        setPagination({ current: 1, pageSize: 10, total: 0 });
        return;
      }

      console.log(`🔍 Fetching approved restaurants - Page: ${page}, Per Page: ${perPage}`);
      
      // Use AdminService to fetch approved business list
      const result = await AdminService.getApprovedBusinessList(page, perPage);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch approved restaurants');
      }

      const responseData = result.data;
      console.log("✅ Approved restaurants data received:", responseData);

      // Transform the data to match your component structure
      const transformedData = responseData.data?.map((item, index) => ({
        id: item.id || `approved-${page}-${index}`,
        key: item.id || `approved-${page}-${index}`, // Add key for React Table
        Img: getImageUrl(item.profile_picture),
        owner_name: item.owner_name || "N/A",
        mobile_number: item.mobile_number || "N/A",
        Email: item.email || "N/A",
        Business_type: item.business_type || "N/A",
        OutletType: item.outlet_type || "N/A",
        BusinessName: item.business_name || "N/A",
        legal_entity_name: item.legal_entity_name || "N/A",
        franchise_code: item.franchise_code || "N/A",
        Name: item.business_name || "N/A",
        Address: item.address || "N/A",
        Location: item.location || "N/A",
        location: item.location || "N/A",
        Pincode: item.pincode || "N/A",
        Landmark: item.landmark || "N/A",
        City: item.city || "N/A",
        gst_no: item.gst_no || "N/A",
        fssai_no: item.fssai_no || "N/A",
        pan: item.pan || "N/A",
        Status: item.status || "Approved", // Set status as Approved since we're fetching approved list
        created_at: item.created_at,
        updated_at: item.updated_at,
        ...item
      })) || [];

      setDatasource(transformedData);
      
      // Set pagination info
      setPagination({
        current: page,
        pageSize: perPage,
        total: responseData.total || responseData.pagination?.total || transformedData.length,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} entries`
      });

      console.log(`✅ Successfully loaded ${transformedData.length} approved restaurants`);

    } catch (error) {
      console.error("❌ Error fetching approved restaurants:", error);
      
      // Handle specific error cases
      if (error.message.includes('Session expired') || error.message.includes('authentication')) {
        message.error("Session expired. Please login again.");
        // You might want to redirect to login page here
      } else if (error.message.includes('Cannot connect to server')) {
        message.error("Cannot connect to server. Please check your internet connection.");
      } else {
        message.error(`Failed to fetch approved restaurants: ${error.message}`);
      }
      
      setDatasource([]);
      setPagination({ current: 1, pageSize: 10, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Update business status (for edit functionality)
  const updateRestaurantStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      console.log(`🔄 Updating restaurant status - ID: ${id}, Status: ${newStatus}`);
      
      const result = await AdminService.updateBusinessStatus(id, newStatus);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update restaurant status');
      }

      message.success('Restaurant status updated successfully');
      
      // Refresh the data
      await fetchApprovedRestaurants(pagination.current, pagination.pageSize);
      
      closeModal();
      console.log("✅ Restaurant status updated successfully");
      
    } catch (error) {
      console.error("❌ Error updating restaurant status:", error);
      message.error(`Failed to update restaurant status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication on component mount
    if (AdminService.isAuthenticated()) {
      fetchApprovedRestaurants(1, 10);
    } else {
      message.warning("Please login to view approved restaurants");
    }
  }, []);

  const handleTableChange = (paginationInfo) => {
    console.log("📄 Table pagination changed:", paginationInfo);
    fetchApprovedRestaurants(paginationInfo.current, paginationInfo.pageSize);
  };

  const openModal = (type, record = null) => { 
    setActiveModal(type); 
    setSelectedRecord(record); 
    console.log(`📝 Opening ${type} modal for:`, record?.Name || 'new record');
  };
  
  const closeModal = () => { 
    setActiveModal(null); 
    setSelectedRecord(null); 
    console.log("❌ Modal closed");
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    
    if (type === 'edit' && selectedRecord) {
      const formData = new FormData(e.target);
      const newStatus = formData.get('editStatus');
      
      if (newStatus && newStatus !== selectedRecord.Status) {
        await updateRestaurantStatus(selectedRecord.id, newStatus);
      } else {
        message.info('No changes detected');
        closeModal();
      }
    }
  };

  const handleImageError = (e) => { 
    e.target.src = blogimg4; 
    console.log("🖼️  Image load error, using fallback image");
  };

  // Refresh data function
  const refreshData = async () => {
    console.log("🔄 Refreshing approved restaurants data...");
    await fetchApprovedRestaurants(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: "Restaurant Details",
      key: "restaurant",
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={48} 
            src={record.Img} 
            style={{ border: '2px solid #f0f0f0', flexShrink: 0 }} 
            onError={handleImageError} 
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ 
              fontWeight: 600, 
              color: '#403222', 
              fontSize: '14px', 
              marginBottom: '2px', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {record.Name}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {record.owner_name}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Contact Info",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '13px', marginBottom: '4px', color: '#403222' }}>
            {record.Email}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            {record.mobile_number}
          </div>
        </div>
      )
    },
    {
      title: "Location",
      dataIndex: "location",
      width: 150,
      render: (text) => (
        <div style={{ 
          fontSize: '13px', 
          color: '#666', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }}>
          {text}
        </div>
      )
    },
    {
      title: "Outlet Type",
      dataIndex: "OutletType",
      width: 120,
      render: (text) => (
        <Tag color="blue" style={{ 
          borderRadius: '16px', 
          fontSize: '12px', 
          padding: '2px 12px' 
        }}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      width: 100,
      render: (text) => (
        <Tag 
          color={text === "Approved" ? "success" : text === "Legal" ? "success" : "error"} 
          style={{ 
            borderRadius: '16px', 
            fontSize: '12px', 
            padding: '2px 12px', 
            fontWeight: 500 
          }}
        >
          {text}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => openModal('view', record)} 
            style={{ color: '#c1a078' }} 
            size="small"
            title="View Details"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => openModal('edit', record)} 
            style={{ color: '#c1a078' }} 
            size="small"
            title="Edit Restaurant"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            style={{ color: '#ff4d4f' }} 
            size="small" 
            data-bs-toggle="modal" 
            data-bs-target="#delete_patient"
            title="Delete Restaurant"
          />
        </Space>
      )
    }
  ];

  const renderFormField = (label, name, type = "text", required = true, colSpan = 6) => (
    <div className={`col-12 col-md-${colSpan}`}>
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label style={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#403222', 
          marginBottom: '8px', 
          display: 'block' 
        }}>
          {label} {required && <span style={{ color: '#ff4d4f' }}>*</span>}
        </label>
        <input
          className="form-control"
          type={type}
          name={name}
          defaultValue={selectedRecord?.[name] || ""}
          required={required}
          style={{ 
            borderRadius: '6px', 
            border: '1px solid #d9d9d9', 
            padding: '10px 12px', 
            fontSize: '14px' 
          }}
          {...(type === "number" && { step: "1", placeholder: "Enter count" })}
        />
      </div>
    </div>
  );

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

  const formFields = [
    ["Business Name", "BusinessName"], 
    ["Legal Entity Name", "legal_entity_name"], 
    ["Franchise Code", "franchise_code"],
    ["Owner Name", "owner_name"], 
    ["Email Address", "Email", "email"], 
    ["Mobile Number", "mobile_number", "tel"],
    ["Location", "location"], 
    ["Business Type", "Business_type"], 
    ["Outlet Type", "OutletType"],
    ["GST Number", "gst_no"], 
    ["FSSAI Number", "fssai_no"], 
    ["PAN Number", "pan"],
    ["Address", "Address"], 
    ["Pincode", "Pincode"], 
    ["Landmark", "Landmark"], 
    ["City", "City"]
  ];

  const infoFields = [
    ["Business Name", "BusinessName"], 
    ["Legal Entity Name", "legal_entity_name"], 
    ["Franchise Code", "franchise_code"],
    ["Owner Name", "owner_name"], 
    ["Email Address", "Email"], 
    ["Mobile Number", "mobile_number"],
    ["Location", "location"], 
    ["Business Type", "Business_type"], 
    ["Outlet Type", "OutletType"],
    ["GST Number", "gst_no"], 
    ["FSSAI Number", "fssai_no"], 
    ["PAN Number", "pan"],
    ["Address", "Address"], 
    ["Pincode", "Pincode"], 
    ["Landmark", "Landmark"], 
    ["City", "City"]
  ];

  const renderModal = () => {
    if (!activeModal || !selectedRecord) return null;
    const isView = activeModal === 'view';

    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }}>
              <h4 className="modal-title" style={{ color: "#403222", fontSize: '18px', fontWeight: 600, margin: 0 }}>
                {isView ? 'Restaurant Details' : 'Edit Restaurant'}
              </h4>
              <button type="button" className="btn-close" onClick={closeModal} style={{ fontSize: '16px' }}></button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {isView ? (
                <div>
                  <div className="row mb-4">
                    <div className="col-12 text-center">
                      <Avatar 
                        size={80} 
                        src={selectedRecord.Img} 
                        style={{ border: '3px solid #f0f0f0', marginBottom: '16px' }} 
                        onError={handleImageError} 
                      />
                      <h4 style={{ color: "#403222", fontSize: '20px', fontWeight: 600, margin: 0 }}>
                        {selectedRecord.Name}
                      </h4>
                    </div>
                  </div>
                  <div className="row">
                    {infoFields.map(([label, field]) => renderInfoCard(label, selectedRecord[field]))}
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
                          color={selectedRecord.Status === "Approved" || selectedRecord.Status === "Legal" ? "success" : "error"} 
                          style={{ 
                            fontSize: '14px', 
                            padding: '6px 16px', 
                            borderRadius: '20px', 
                            fontWeight: 500 
                          }}
                        >
                          {selectedRecord.Status}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => handleSubmit(e, 'edit')}>
                  <div className="row">
                    {formFields.map(([label, field, type]) => renderFormField(label, field, type))}
                    <div className="col-12 col-md-6">
                      <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ 
                          fontSize: '14px', 
                          fontWeight: 500, 
                          color: '#403222', 
                          marginBottom: '12px', 
                          display: 'block' 
                        }}>
                          Status <span style={{ color: '#ff4d4f' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {["Approved", "Rejected", "Pending", "Query"].map(status => (
                            <label key={status} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              cursor: 'pointer', 
                              fontSize: '14px' 
                            }}>
                              <input 
                                type="radio" 
                                name="editStatus" 
                                value={status} 
                                defaultChecked={selectedRecord.Status === status} 
                                style={{ marginRight: '4px' }} 
                              />
                              {status}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #f0f0f0', padding: '20px 24px' }}>
              <Space>
                <Button onClick={closeModal} style={{ borderRadius: '6px', padding: '8px 20px' }}>
                  {isView ? 'Close' : 'Cancel'}
                </Button>
                {!isView && (
                  <Button 
                    type="primary" 
                    onClick={(e) => handleSubmit(e, 'edit')} 
                    style={{ 
                      backgroundColor: "#c1a078", 
                      borderColor: "#c1a078", 
                      borderRadius: '6px', 
                      padding: '8px 20px' 
                    }}
                    loading={loading}
                  >
                    Update
                  </Button>
                )}
              </Space>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <Sidebar id="menu-item3" id1="menu-items3" activeClassName="staff-list" />
      <div className="page-wrapper">
        <div className="content" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #c1a078 0%, #d4b896 100%)', 
              borderRadius: '12px', 
              padding: '24px', 
              color: 'white' 
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
                Restaurant Management
              </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', color: '#403222' }}>
                Manage approved restaurants and their details
              </p>
            </div>
          </div>

          <Card style={{ 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            border: '1px solid #f0f0f0' 
          }} bodyStyle={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <h3 style={{ color: "#403222", margin: 0, fontSize: '18px', fontWeight: 600 }}>
                    Approved Restaurant List
                  </h3>
                  <p style={{ color: "#8c8c8c", margin: 0, fontSize: '14px', marginTop: '4px' }}>
                    {pagination.total} approved restaurants found
                  </p>
                </Col>
                <Col>
                  <Button 
                    onClick={refreshData} 
                    loading={loading}
                    style={{ 
                      backgroundColor: "#c1a078", 
                      borderColor: "#c1a078", 
                      color: "white",
                      borderRadius: '6px' 
                    }}
                  >
                    Refresh Data
                  </Button>
                </Col>
              </Row>
            </div>

            <Spin spinning={loading} tip="Loading approved restaurants...">
              <Table
                columns={columns}
                dataSource={datasource}
                rowKey="key"
                pagination={{
                  ...pagination,
                  onChange: handleTableChange,
                  onShowSizeChange: (current, size) => {
                    fetchApprovedRestaurants(current, size);
                  },
                  style: { marginTop: '16px' }
                }}
                scroll={{ x: 1000 }}
                locale={{
                  emptyText: AdminService.isAuthenticated() 
                    ? "No approved restaurants found" 
                    : "Please login to view restaurants"
                }}
              />
            </Spin>
          </Card>
        </div>
      </div>

      {renderModal()}

      <div id="delete_patient" className="modal fade delete-modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
            <div className="modal-body text-center" style={{ padding: '32px' }}>
              <img src={imagesend} alt="Delete" width={50} height={46} style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#403222', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Confirm Deletion
              </h3>
              <p style={{ color: '#8c8c8c', marginBottom: '24px' }}>
                Are you sure you want to delete this restaurant?
              </p>
              <Space>
                <Button data-bs-dismiss="modal" style={{ borderRadius: '6px' }}>
                  Cancel
                </Button>
                <Button type="primary" danger style={{ borderRadius: '6px' }}>
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

export default ManagementList;