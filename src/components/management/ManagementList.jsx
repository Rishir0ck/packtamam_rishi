import React, { useState, useEffect } from "react";
import { Table, message, Spin, Card, Avatar, Space, Tag, Button, Row, Col } from "antd";
import { Link } from "react-router-dom";
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Header from "../Header";
import Sidebar from "../Sidebar";
import { imagesend, blogimg4 } from "../imagepath";
import { onShowSizeChange, itemRender } from "../Pagination";

const ManagementList = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [datasource, setDatasource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // API configuration
  const API_CONFIG = {
    baseUrl: "http://167.71.228.10:3000/api/admin",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJ1c2VyX2lkIjoiUUZMcUpWOVdTamF5TVhEZnFEUXFUdFVMa0g5MyIsImVtYWlsIjoicmRwYXRlbDc4MjRAZ21haWwuY29tIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwLyIsImlhdCI6MTc0ODc0ODIwOCwiZXhwIjoxNzQ5MzUzMDA4fQ.aIuhF_2BD_c4EkJ2kiLV5-BWEg4OxaNu6LPR-E5VaDo"
  };

  // Fallback image URL or use your default image
  const getImageUrl = (profilePicture) => {
    if (profilePicture && profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return blogimg4;
  };

  // Fetch approved restaurants
  const fetchApprovedRestaurants = async (page = 1, perPage = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/approved-business-list?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${API_CONFIG.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const transformedData = data.data?.map((item, index) => {
        console.log('Item profile_picture:', item.profile_picture);
        
        return {
          id: item.id || `approved-${page}-${index}`,
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
          Pincode: item.pincode || "N/A",
          Landmark: item.landmark || "N/A",
          City: item.city || "N/A",
          gst_no: item.gst_no || "N/A",
          fssai_no: item.fssai_no || "N/A",
          pan: item.pan || "N/A",
          RestaurantCount: "1",
          TotalOrder: "0",
          PendingOrder: "0",
          RejectOrder: "0",
          Status: "Legal", // Default status, can be updated based on actual data",
          //   Status: item.status || "N/A",
          business_id: item.id,
          outlet_type_id: item.outlet_type_id,
          ...item,
        };
      }) || [];

      console.log('Transformed data:', transformedData);

      setDatasource(transformedData);
      setPagination({
        current: page,
        pageSize: perPage,
        total: data.total || data.pagination?.total || transformedData.length,
      });

    } catch (error) {
      console.error("Error fetching approved restaurants:", error);
      message.error("Failed to fetch approved restaurants. Please try again.");
      setDatasource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedRestaurants(1, 10);
  }, []);

  const handleTableChange = (paginationInfo) => {
    fetchApprovedRestaurants(paginationInfo.current, paginationInfo.pageSize);
  };

  const openModal = (type, record = null) => {
    setActiveModal(type);
    setSelectedRecord(record);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedRecord(null);
  };

  const handleSubmit = (e, type) => {
    e.preventDefault();
    console.log(`${type} form submitted`, selectedRecord);
    closeModal();
  };

  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    e.target.src = blogimg4;
  };

  const columns = [
    {
      title: "Restaurant Details",
      key: "restaurant",
      width: 280,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={48}
            src={record.Img}
            style={{ 
              border: '2px solid #f0f0f0',
              flexShrink: 0
            }}
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
      ),
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
        <Tag 
          color="blue" 
          style={{ 
            borderRadius: '16px',
            fontSize: '12px',
            padding: '2px 12px'
          }}
        >
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
          color={text === "Legal" ? "success" : "error"}
          style={{ 
            borderRadius: '16px',
            fontSize: '12px',
            padding: '2px 12px',
            fontWeight: 500
          }}
        >
          {text}
        </Tag>
      ),
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
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal('edit', record)}
            style={{ color: '#c1a078' }}
            size="small"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{ color: '#ff4d4f' }}
            size="small"
            data-bs-toggle="modal" 
            data-bs-target="#delete_patient"
          />
        </Space>
      ),
    },
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

  const renderModal = () => {
    if (!activeModal || !selectedRecord) return null;

    const isView = activeModal === 'view';

    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
            <div className="modal-header" style={{ 
              borderBottom: '1px solid #f0f0f0',
              padding: '20px 24px'
            }}>
              <h4 className="modal-title" style={{ 
                color: "#403222", 
                fontSize: '18px',
                fontWeight: 600,
                margin: 0
              }}>
                {isView ? 'Restaurant Details' : 'Edit Restaurant'}
              </h4>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeModal}
                style={{ fontSize: '16px' }}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {isView ? (
                <div>
                  <div className="row mb-4">
                    <div className="col-12 text-center">
                      <Avatar 
                        size={80}
                        src={selectedRecord.Img}
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
                        {selectedRecord.Name}
                      </h4>
                    </div>
                  </div>
                  <div className="row">
                    {renderInfoCard("Business Name", selectedRecord.BusinessName)}
                    {renderInfoCard("Legal Entity Name", selectedRecord.legal_entity_name)}
                    {renderInfoCard("Franchise Code", selectedRecord.franchise_code)}
                    {renderInfoCard("Owner Name", selectedRecord.owner_name)}
                    {renderInfoCard("Email Address", selectedRecord.Email)}
                    {renderInfoCard("Mobile Number", selectedRecord.mobile_number)}
                    {renderInfoCard("Location", selectedRecord.location)}
                    {renderInfoCard("Business Type", selectedRecord.Business_type)}
                    {renderInfoCard("Outlet Type", selectedRecord.OutletType)}
                    {renderInfoCard("GST Number", selectedRecord.gst_no)}
                    {renderInfoCard("FSSAI Number", selectedRecord.fssai_no)}
                    {renderInfoCard("PAN Number", selectedRecord.pan)}
                    {renderInfoCard("Address", selectedRecord.Address)}
                    {renderInfoCard("Location", selectedRecord.Location)}
                    {renderInfoCard("Pincode", selectedRecord.Pincode)}
                    {renderInfoCard("Landmark", selectedRecord.Landmark)}
                    {renderInfoCard("City", selectedRecord.City)}
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
                          color={selectedRecord.Status === "Legal" ? "success" : "error"}
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
                    {/* {renderFormField("Restaurant Name", "Name")} */}
                    {renderFormField("Business Name", "BusinessName")}
                    {renderFormField("Legal Entity Name", "legal_entity_name")}
                    {renderFormField("Franchise Code", "franchise_code")}
                    {renderFormField("Owner Name", "owner_name")}
                    {renderFormField("Email Address", "Email", "email")}
                    {renderFormField("Mobile Number", "mobile_number", "tel")}
                    {renderFormField("Location", "location")}
                    {renderFormField("Business Type", "Business_type")}
                    {renderFormField("Outlet Type", "OutletType")}
                    {renderFormField("GST Number", "gst_no")}
                    {renderFormField("FSSAI Number", "fssai_no")}
                    {renderFormField("PAN Number", "pan")}
                    {renderFormField("Address", "Address")}
                    {renderFormField("Location", "Location")}
                    {renderFormField("Pincode", "Pincode")}
                    {renderFormField("Landmark", "Landmark")}
                    {renderFormField("City", "City")}
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
                          {["Legal", "Fraud"].map(status => (
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
            <div className="modal-footer" style={{ 
              borderTop: '1px solid #f0f0f0',
              padding: '20px 24px'
            }}>
              <Space>
                <Button 
                  onClick={closeModal}
                  style={{ 
                    borderRadius: '6px',
                    padding: '8px 20px'
                  }}
                >
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
                    Management
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
                Restaurant Management
              </h2>
              <p style={{ 
                margin: 0, 
                opacity: 0.9,
                fontSize: '14px',
                color: '#403222',
              }}>
                Manage approved restaurants and their details
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
            <div style={{ marginBottom: '20px' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <h3 style={{ 
                    color: "#403222", 
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600
                  }}>
                    Restaurant List
                  </h3>
                  <p style={{ 
                    color: "#8c8c8c", 
                    margin: 0,
                    fontSize: '14px',
                    marginTop: '4px'
                  }}>
                    {pagination.total} restaurants found
                  </p>
                </Col>
              </Row>
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={datasource}
                rowKey="id"
                pagination={{
                  ...pagination,
                  showTotal: (total, range) => 
                    `Showing ${range[0]}-${range[1]} of ${total} entries`,
                  onShowSizeChange,
                  itemRender,
                  onChange: handleTableChange,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  style: { marginTop: '16px' }
                }}
                style={{
                  '.ant-table-thead > tr > th': {
                    backgroundColor: '#fafafa',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#403222'
                  }
                }}
                scroll={{ x: 1000 }}
              />
            </Spin>
          </Card>
        </div>
      </div>

      {renderModal()}

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

export default ManagementList;