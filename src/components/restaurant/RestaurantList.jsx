import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  message, Spin, Card, Avatar, Space, Tag, Button, Row, Col, Tabs, Modal, 
  Pagination, Input, Select, Divider, List, Image 
} from "antd";
import {
  EyeOutlined, EditOutlined, CheckOutlined, CloseOutlined, PhoneOutlined,
  MailOutlined, EnvironmentOutlined, ShopOutlined, FileTextOutlined,
  DownloadOutlined, UserOutlined, CalendarOutlined, BankOutlined,
  AppstoreOutlined, UnorderedListOutlined, FileImageOutlined
} from "@ant-design/icons";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { blogimg4 } from "../imagepath";
import adminService from "../../Firebase/services/adminApiService";

const { Search } = Input;
const { Option } = Select;

const RestaurantList = () => {
  const [state, setState] = useState({
    activeTab: "pending",
    viewMode: "grid",
    datasource: [],
    filteredData: [],
    loading: false,
    updateLoading: false,
    searchText: "",
    tabCounts: { pending: 0, approved: 0, rejected: 0, query: 0 },
    pagination: { current: 1, pageSize: 12, total: 0 },
    editModal: { visible: false, record: null, statusOption: null, queryMessage: "" },
    viewModal: { visible: false, record: null },
    previewModal: { visible: false, url: "", title: "", type: "" }
  });

  const statusOptions = [
    { value: "Pending", label: "Pending", color: "orange" },
    { value: "Approved", label: "Approved", color: "green" },
    { value: "Rejected", label: "Rejected", color: "red" },
    { value: "Query", label: "Query", color: "blue" }
  ];

  const documentTypes = {
    fssai_certificate: { label: "FSSAI Certificate", icon: <FileTextOutlined />, color: "#52c41a", ext: ".pdf" },
    gst_certificate: { label: "GST Certificate", icon: <FileTextOutlined />, color: "#1890ff", ext: ".pdf" },
    restaurant_pictures: { label: "Restaurant Pictures", icon: <FileImageOutlined />, color: "#722ed1", ext: ".jpg" },
    pan_card: { label: "PAN Card", icon: <FileTextOutlined />, color: "#fa8c16", ext: ".pdf" }
  };

  const statusMethods = {
    Pending: (page, limit) => adminService.getPendingBusinessList(page, limit),
    Approved: (page, limit) => adminService.getApprovedBusinessList(page, limit),
    Rejected: (page, limit) => adminService.getRejectedBusinessList(page, limit),
    Query: (page, limit) => adminService.getQueryBusinessList(page, limit)
  };

  const businessFields = [
    { icon: <ShopOutlined />, label: "Business Name", key: "business_name" },
    { icon: <BankOutlined />, label: "Legal Entity", key: "legal_entity_name" },
    { icon: <UserOutlined />, label: "Owner Name", key: "owner_name" },
    { icon: <ShopOutlined />, label: "Business Type", key: "business_type" },
    { icon: <ShopOutlined />, label: "Outlet Type", key: "outlet_type" },
    { icon: <ShopOutlined />, label: "Franchise Code", key: "franchise_code" },
    { icon: <MailOutlined />, label: "Email", key: "email" },
    { icon: <PhoneOutlined />, label: "Mobile", key: "mobile_number" },
    { icon: <EnvironmentOutlined />, label: "City", key: "city" },
    { icon: <EnvironmentOutlined />, label: "Pincode", key: "pincode" },
    { icon: <EnvironmentOutlined />, label: "Address", key: "address", span: 24 },
    { icon: <EnvironmentOutlined />, label: "Landmark", key: "landmark", span: 24 },
    { icon: <FileTextOutlined />, label: "GST Number", key: "gst_no" },
    { icon: <FileTextOutlined />, label: "FSSAI Number", key: "fssai_no" },
    { icon: <FileTextOutlined />, label: "PAN Number", key: "pan" },
    { icon: <CalendarOutlined />, label: "Created", key: "created_at" },
    { icon: <CalendarOutlined />, label: "Updated", key: "updated_at" }
  ];

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // Enhanced download function with proper file format detection
  const handleDownload = async (url, filename, docType = '') => {
    try {
      // Detect file extension from URL or use document type default
      let extension = '';
      
      // First try to get extension from URL
      const urlMatch = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
      if (urlMatch) {
        extension = '.' + urlMatch[1].toLowerCase();
      } else if (docType && documentTypes[docType]) {
        // Use default extension based on document type
        extension = documentTypes[docType].ext;
      } else {
        // Detect by content type or URL patterns
        if (url.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)/i.test(url)) {
          extension = '.jpg';
        } else if (url.includes('pdf') || url.includes('document')) {
          extension = '.pdf';
        } else {
          extension = '.pdf'; // Default fallback
        }
      }

      // Clean filename and add proper extension
      const cleanFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const finalFilename = cleanFilename + extension;

      // Create download link
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = finalFilename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success(`Downloaded ${finalFilename} successfully!`);
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download file. Please try again.');
    }
  };

  const loadBusinesses = async (status = "Pending", page = 1, limit = 12) => {
    updateState({ loading: true });
    try {
      const result = await statusMethods[status](page, limit);
      if (result.success) {
        const businesses = result.data.businesses || result.data.data || result.data || [];
        updateState({
          datasource: businesses,
          filteredData: businesses,
          pagination: { ...state.pagination, total: result.data.total || businesses.length, current: page }
        });
        await updateTabCounts();
      } else {
        message.error(result.error || 'Failed to load businesses');
        updateState({ datasource: [], filteredData: [] });
      }
    } catch (error) {
      message.error('Failed to load businesses');
      updateState({ datasource: [], filteredData: [] });
    } finally {
      updateState({ loading: false });
    }
  };

  const updateTabCounts = async () => {
    const counts = { pending: 0, approved: 0, rejected: 0, query: 0 };
    const statusMap = { pending: "Pending", approved: "Approved", rejected: "Rejected", query: "Query" };

    for (const [key, status] of Object.entries(statusMap)) {
      try {
        const result = await statusMethods[status](1, 1);
        if (result.success) counts[key] = result.data.total || 0;
      } catch (error) {
        console.error(`Error getting ${key} count:`, error);
      }
    }
    updateState({ tabCounts: counts });
  };

  const handleStatusUpdate = async (businessId, newStatus, queryMessage = null) => {
    updateState({ updateLoading: true });
    try {
      const result = await adminService.updateBusinessStatus(businessId, newStatus, queryMessage);
      if (result.success) {
        message.success(`Business ${newStatus.toLowerCase()} successfully!`);
        const statusMap = { pending: "Pending", approved: "Approved", rejected: "Rejected", query: "Query" };
        await loadBusinesses(statusMap[state.activeTab], state.pagination.current, state.pagination.pageSize);
      } else {
        message.error(result.error || 'Failed to update business status');
      }
    } catch (error) {
      message.error('Failed to update business status');
    } finally {
      updateState({ updateLoading: false });
    }
  };

  const handleQuickAction = (businessId, action) => {
    const statusMap = { approve: 'Approved', reject: 'Rejected' };
    handleStatusUpdate(businessId, statusMap[action]);
  };

  const handleEditSubmit = async () => {
    const { record, statusOption, queryMessage } = state.editModal;
    if (!record || !statusOption) return message.error("Please select a status");
    if (statusOption.value === 'Query' && !queryMessage) return message.error("Please enter a query message");

    await handleStatusUpdate(record.id, statusOption.value, statusOption.value === 'Query' ? queryMessage : null);
    updateState({ editModal: { visible: false, record: null, statusOption: null, queryMessage: "" } });
  };

  const handleTabChange = (key) => {
    updateState({ activeTab: key, pagination: { ...state.pagination, current: 1 }, searchText: "" });
    const statusMap = { pending: "Pending", approved: "Approved", rejected: "Rejected", query: "Query" };
    loadBusinesses(statusMap[key], 1, state.pagination.pageSize);
  };

  const handlePaginationChange = (page, pageSize) => {
    updateState({ pagination: { ...state.pagination, current: page, pageSize } });
    const statusMap = { pending: "Pending", approved: "Approved", rejected: "Rejected", query: "Query" };
    loadBusinesses(statusMap[state.activeTab], page, pageSize);
  };

  const handlePreview = (url, title, type) => {
    updateState({ previewModal: { visible: true, url, title, type } });
  };

  const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url);

  useEffect(() => { loadBusinesses("Pending", 1, 12); }, []);

  useEffect(() => {
    const filtered = state.searchText ? state.datasource.filter(item =>
      ['business_name', 'owner_name', 'email'].some(field =>
        (item[field] || '').toLowerCase().includes(state.searchText.toLowerCase())
      ) || (item.mobile_number || '').includes(state.searchText)
    ) : state.datasource;
    updateState({ filteredData: filtered });
  }, [state.searchText, state.datasource]);

  // Compact Component Definitions
  const ActionButtons = ({ record }) => (
    <Space size="small">
      <Button type="text" size="small" icon={<EyeOutlined />}
        onClick={() => updateState({ viewModal: { visible: true, record } })}
        style={{ color: "#c1a078" }} />
      <Button type="text" size="small" icon={<EditOutlined />}
        onClick={() => updateState({
          editModal: {
            visible: true, record,
            statusOption: statusOptions.find(opt => opt.value === record.status),
            queryMessage: ""
          }
        })} style={{ color: "#595959" }} />
      {state.activeTab === "pending" && (
        <>
          <Button type="text" size="small" icon={<CheckOutlined />}
            onClick={() => handleQuickAction(record.id, "approve")}
            loading={state.updateLoading} style={{ color: "#52c41a" }} />
          <Button type="text" size="small" icon={<CloseOutlined />}
            onClick={() => handleQuickAction(record.id, "reject")}
            loading={state.updateLoading} style={{ color: "#ff4d4f" }} />
        </>
      )}
    </Space>
  );

  const CardContent = ({ record }) => (
    <>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <Avatar size={56} src={record.profile_picture || blogimg4} style={{ marginBottom: "12px" }} />
        <div style={{ fontWeight: 600, fontSize: "16px", color: "#262626", marginBottom: "4px" }}>
          {record.business_name}
        </div>
        <div style={{ fontSize: "13px", color: "#8c8c8c", marginBottom: "8px" }}>{record.owner_name}</div>
        <Tag color={statusOptions.find(s => s.value === record.status)?.color}
          style={{ borderRadius: "12px", fontSize: "11px", fontWeight: 500 }}>
          {record.status}
        </Tag>
      </div>
      <div style={{ marginBottom: "16px" }}>
        {[
          { icon: <ShopOutlined />, value: record.outlet_type },
          { icon: <EnvironmentOutlined />, value: record.city },
          { icon: <PhoneOutlined />, value: record.mobile_number }
        ].map(({ icon, value }, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "8px", fontSize: "12px" }}>
            <span style={{ marginRight: "8px", color: "#c1a078", fontSize: "14px" }}>{icon}</span>
            <span style={{ color: "#595959" }}>{value || "N/A"}</span>
          </div>
        ))}
      </div>
    </>
  );

  const InfoRow = ({ icon, label, value, span = 12 }) => (
    <Col span={span}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
        <div style={{ color: "#c1a078", fontSize: "16px", marginTop: "2px" }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>{label}</div>
          <div style={{ fontSize: "14px", color: "#262626", fontWeight: 500, wordBreak: "break-word" }}>
            {value || "N/A"}
          </div>
        </div>
      </div>
    </Col>
  );

  const DocumentCard = ({ docType, docs, docInfo }) => (
    <Card key={docType} size="small" style={{ marginBottom: "12px", borderRadius: "8px", border: `1px solid ${docInfo.color}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: docInfo.color, fontSize: "16px" }}>{docInfo.icon}</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: "13px", color: "#262626" }}>{docInfo.label}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>{docs.length} file(s)</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {docs.map((doc, index) => (
            <div key={index} style={{ display: "flex", gap: "4px" }}>
              <Button type="text" size="small" icon={<EyeOutlined />}
                onClick={() => handlePreview(doc.url || doc.document_url || doc, `${docInfo.label} ${index + 1}`, docType)}
                style={{ color: docInfo.color }} />
              <Button type="text" size="small" icon={<DownloadOutlined />}
                onClick={() => handleDownload(doc.url || doc.document_url || doc, `${docType}_${index + 1}`, docType)}
                style={{ color: "#8c8c8c" }} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  // PropTypes
  ActionButtons.propTypes = {
    record: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      status: PropTypes.string
    }).isRequired
  };

  CardContent.propTypes = {
    record: PropTypes.shape({
      profile_picture: PropTypes.string,
      business_name: PropTypes.string,
      owner_name: PropTypes.string,
      status: PropTypes.string,
      outlet_type: PropTypes.string,
      city: PropTypes.string,
      mobile_number: PropTypes.string
    }).isRequired
  };

  InfoRow.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    span: PropTypes.number
  };

  DocumentCard.propTypes = {
    docType: PropTypes.string.isRequired,
    docs: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ url: PropTypes.string })
      ])
    ).isRequired,
    docInfo: PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      color: PropTypes.string.isRequired
    }).isRequired
  };

  return (
    <>
      <Header />
      <Sidebar id="menu-item4" id1="menu-items4" />
      <div className="page-wrapper">
        <div className="content" style={{ padding: "24px" }}>
          {/* Header Section */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ background: "linear-gradient(135deg, #c1a078 0%, #d4b896 100%)", borderRadius: "16px", padding: "24px", color: "white" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, marginBottom: "4px" }}>Restaurants</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>Manage restaurant applications and onboarding process</p>
            </div>
          </div>

          <Card style={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} bodyStyle={{ padding: "24px" }}>
            {/* Tabs */}
            <Tabs activeKey={state.activeTab} onChange={handleTabChange}
              items={Object.entries(state.tabCounts).map(([key, count]) => ({
                key,
                label: `${key.charAt(0).toUpperCase() + key.slice(1)} (${count})`
              }))} />

            {/* Controls */}
            <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
              <Col>
                <Search placeholder="Search restaurants..." value={state.searchText}
                  onChange={(e) => updateState({ searchText: e.target.value })} style={{ width: 300 }} allowClear />
              </Col>
              <Col>
                <Space size="middle">
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>{state.filteredData.length} restaurants</span>
                  <Button.Group>
                    {["grid", "list"].map(mode => (
                      <Button key={mode} type={state.viewMode === mode ? "primary" : "default"}
                        icon={mode === "grid" ? <AppstoreOutlined /> : <UnorderedListOutlined />}
                        onClick={() => updateState({ viewMode: mode })}
                        style={{
                          backgroundColor: state.viewMode === mode ? "#c1a078" : "transparent",
                          borderColor: "#c1a078",
                          color: state.viewMode === mode ? "white" : "#c1a078"
                        }}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Button>
                    ))}
                  </Button.Group>
                </Space>
              </Col>
            </Row>

            {/* Content */}
            <Spin spinning={state.loading || state.updateLoading}>
              {state.filteredData.length === 0 && !state.loading ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#8c8c8c" }}>
                  <div style={{ fontSize: "16px", marginBottom: "8px" }}>No restaurants found</div>
                  <div style={{ fontSize: "14px" }}>Try adjusting your search</div>
                </div>
              ) : (
                state.viewMode === "grid" ? (
                  <Row gutter={[20, 20]}>
                    {state.filteredData.map(record => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={record.id}>
                        <Card hoverable style={{ borderRadius: "16px", height: "100%", border: "1px solid #f0f0f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} bodyStyle={{ padding: "20px" }}>
                          <CardContent record={record} />
                          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f5f5f5" }}>
                            <ActionButtons record={record} />
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <List dataSource={state.filteredData} renderItem={record => (
                    <List.Item style={{ padding: "16px 20px", borderRadius: "12px", marginBottom: "12px", background: "#fff", border: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <Avatar size={50} src={record.profile_picture || blogimg4} style={{ marginRight: "16px" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                            <div style={{ fontWeight: 600, fontSize: "16px", color: "#262626" }}>{record.business_name}</div>
                            <Tag color={statusOptions.find(s => s.value === record.status)?.color} style={{ borderRadius: "12px", fontSize: "11px", fontWeight: 500 }}>{record.status}</Tag>
                          </div>
                          <div style={{ fontSize: "13px", color: "#8c8c8c", marginBottom: "8px" }}>{record.owner_name}</div>
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            {[
                              { icon: <ShopOutlined />, value: record.outlet_type },
                              { icon: <EnvironmentOutlined />, value: record.city },
                              { icon: <PhoneOutlined />, value: record.mobile_number }
                            ].map(({ icon, value }, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "#595959" }}>
                                <span style={{ marginRight: "6px", color: "#c1a078" }}>{icon}</span>
                                {value || "N/A"}
                              </div>
                            ))}
                          </div>
                        </div>
                        <ActionButtons record={record} />
                      </div>
                    </List.Item>
                  )} />
                )
              )}

              {/* Pagination */}
              {state.filteredData.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #f0f0f0" }}>
                  <Pagination current={state.pagination.current} total={state.pagination.total} pageSize={state.pagination.pageSize}
                    onChange={handlePaginationChange} showSizeChanger showQuickJumper pageSizeOptions={["12", "24", "48"]} />
                </div>
              )}
            </Spin>
          </Card>
        </div>
      </div>

      {/* View Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar size={48} src={state.viewModal.record?.profile_picture || blogimg4} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "18px", color: "#262626" }}>
                {state.viewModal.record?.business_name || "Restaurant Details"}
              </div>
              <div style={{ fontSize: "13px", color: "#8c8c8c" }}>Complete Information</div>
            </div>
          </div>
        }
        style={{ top: "47%", transform: "translateY(-50%) translateX(10%)" }}
        open={state.viewModal.visible}
        onCancel={() => updateState({ viewModal: { visible: false, record: null } })}
        footer={null}
        width={900}
        centered
        bodyStyle={{ padding: 0 }}
      >
        {state.viewModal.record && (
          <div style={{ maxHeight: "70vh", overflowY: "auto", padding: 24, boxSizing: "border-box" }}>
            {/* Status & Query */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <Tag
                color={statusOptions.find((s) => s.value === state.viewModal.record.status)?.color || "default"}
                style={{ fontSize: 14, padding: "8px 20px", borderRadius: 20, fontWeight: 500 }}
              >
                {state.viewModal.record.status}
              </Tag>
              {state.viewModal.record.query_message && (
                <div style={{ marginTop: 16, padding: 16, background: "#f0f0f0", borderRadius: 8, fontSize: 13, color: "#595959", maxWidth: 700, margin: "16px auto 0 auto" }}>
                  <strong>Query:</strong> {state.viewModal.record.query_message}
                </div>
              )}
            </div>

            {/* Business Info */}
            <Row gutter={[24, 16]}>
              {businessFields.map((field, i) => (
                <InfoRow
                  key={i}
                  icon={field.icon}
                  label={field.label}
                  value={state.viewModal.record[field.key]}
                  span={field.span}
                />
              ))}
            </Row>

            {/* Documents Section */}
            <Divider orientation="left" style={{ color: "#c1a078", fontWeight: 600, marginTop: 40, marginBottom: 16 }}>
              Documents Verification
            </Divider>

            <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8 }}>
              {Object.entries(documentTypes).map(([docType, docInfo]) => {
                const docs = state.viewModal.record.documents?.[docType];
                if (!docs || (Array.isArray(docs) && docs.length === 0)) return null;
                const docArray = Array.isArray(docs) ? docs : [docs];
                return (
                  <DocumentCard key={docType} docType={docType} docs={docArray} docInfo={docInfo} />
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        title={state.previewModal.title}
        open={state.previewModal.visible}
        onCancel={() => updateState({ previewModal: { visible: false, url: "", title: "", type: "" } })}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(state.previewModal.url, state.previewModal.title, state.previewModal.type)}
            style={{
              backgroundColor: "#c1a078",
              borderColor: "#c1a078",
              color: "white",
              borderRadius: "8px",
              padding: "6px 16px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            Download
          </Button>,
        ]}
        centered
        width={800}
        bodyStyle={{
          padding: 0,
          margin: 0,
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
        style={{ top: "50%", transform: "translateY(-50%)", padding: 0 }}
      >
        {state.previewModal.url && (
          isImage(state.previewModal.url) ? (
            <div style={{ padding: "24px", width: "100%", textAlign: "center" }}>
              <Image
                src={state.previewModal.url}
                alt={state.previewModal.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
                preview
              />
            </div>
          ) : (
            <div style={{ width: "100%", height: "70vh", padding: "24px", boxSizing: "border-box" }}>
              
              <iframe
                src={state.previewModal.url}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
                title={state.previewModal.title}
              />
            </div>
          )
        )}
      </Modal>


      {/* Edit Modal */}
      <Modal 
        title="Update Status" 
        open={state.editModal.visible}
        onCancel={() => updateState({ editModal: { visible: false, record: null, statusOption: null, queryMessage: "" } })}
        footer={
          <Space>
            <Button onClick={() => updateState({ editModal: { visible: false, record: null, statusOption: null, queryMessage: "" } })}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleEditSubmit} loading={state.updateLoading}
              style={{ backgroundColor: "#c1a078", borderColor: "#c1a078" }}>
              Update
            </Button>
          </Space>
        } 
        width={400} 
        centered
      >
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <Avatar size={64} src={state.editModal.record?.profile_picture || blogimg4} style={{ marginBottom: "16px" }} />
          <h4 style={{ margin: 0, color: "#262626", marginBottom: "20px" }}>
            {state.editModal.record?.business_name}
          </h4>

          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>New Status *</label>
            <Select 
              value={state.editModal.statusOption?.value}
              onChange={(value) => updateState({
                editModal: {
                  ...state.editModal,
                  statusOption: statusOptions.find(opt => opt.value === value),
                  queryMessage: value === 'Query' ? state.editModal.queryMessage : ""
                }
              })}
              style={{ width: "100%" }} 
              placeholder="Select Status"
            >
              {statusOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
            </Select>
          </div>

          {state.editModal.statusOption?.value === 'Query' && (
            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Query Message *</label>
              <Input.TextArea 
                value={state.editModal.queryMessage}
                onChange={(e) => updateState({ editModal: { ...state.editModal, queryMessage: e.target.value } })}
                placeholder="Enter your query message..." 
                rows={3} 
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default RestaurantList;