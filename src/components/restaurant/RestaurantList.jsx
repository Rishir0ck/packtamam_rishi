import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { message, Spin, Card, Avatar, Space, Tag, Button, Row, Col, Tabs, Modal, Pagination, Input, Select, Divider, List, Image } from "antd";
import { EyeOutlined, EditOutlined, CheckOutlined, CloseOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, ShopOutlined, FileTextOutlined, DownloadOutlined, UserOutlined, CalendarOutlined, BankOutlined, AppstoreOutlined, UnorderedListOutlined, FileImageOutlined } from "@ant-design/icons";
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
    fssai_certificate: { label: "FSSAI Certificate", icon: <FileTextOutlined />, color: "#52c41a" },
    gst_certificate: { label: "GST Certificate", icon: <FileTextOutlined />, color: "#1890ff" },
    restaurant_pictures: { label: "Restaurant Pictures", icon: <FileImageOutlined />, color: "#722ed1" },
    pan_card: { label: "PAN Card", icon: <FileTextOutlined />, color: "#fa8c16" }
  };

  const statusMethods = {
    Pending: (page, limit) => adminService.getPendingBusinessList(page, limit),
    Approved: (page, limit) => adminService.getApprovedBusinessList(page, limit),
    Rejected: (page, limit) => adminService.getRejectedBusinessList(page, limit),
    Query: (page, limit) => adminService.getQueryBusinessList(page, limit)
  };

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

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

  // With this:
  useEffect(() => {
    const filtered = state.searchText ? state.datasource.filter(item =>
      ['business_name', 'owner_name', 'email'].some(field =>
        (item[field] || '').toLowerCase().includes(state.searchText.toLowerCase())
      ) || (item.mobile_number || '').includes(state.searchText)
    ) : state.datasource;
    updateState({ filteredData: filtered });
  }, [state.searchText, JSON.stringify(state.datasource)]);

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

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    Object.assign(link, { href: url, download: filename, target: '_blank' });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url);

  useEffect(() => { loadBusinesses("Pending", 1, 12); }, []);

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

  ActionButtons.propTypes = {
    record: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      status: PropTypes.string
    }).isRequired
  };

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
            <span style={{ color: "#595959" }}>{value}</span>
          </div>
        ))}
      </div>
    </>
  );

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

  InfoRow.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    span: PropTypes.number
  };

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
                onClick={() => handleDownload(doc.url || doc.document_url || doc, `${docType}_${index + 1}`)}
                style={{ color: "#8c8c8c" }} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  DocumentCard.propTypes = {
    docType: PropTypes.string.isRequired,
    docs: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          url: PropTypes.string
        })
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
          <div style={{ marginBottom: "24px" }}>
            <div style={{ background: "linear-gradient(135deg, #c1a078 0%, #d4b896 100%)", borderRadius: "16px", padding: "24px", color: "white" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, marginBottom: "4px" }}>Restaurants </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>Manage restaurant applications and onboarding process</p>
            </div>
          </div>

          <Card style={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} bodyStyle={{ padding: "24px" }}>
            <Tabs activeKey={state.activeTab} onChange={handleTabChange}
              items={Object.entries(state.tabCounts).map(([key, count]) => ({ key, label: `${key.charAt(0).toUpperCase() + key.slice(1)} (${count})` }))} />

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
                                {value}
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
      <Modal title={
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Avatar size={48} src={state.viewModal.record?.profile_picture || blogimg4} />
          <div>
            <div style={{ fontWeight: 600, fontSize: "18px", color: "#262626" }}>{state.viewModal.record?.business_name || "Restaurant Details"}</div>
            <div style={{ fontSize: "13px", color: "#8c8c8c" }}>Complete Information</div>
          </div>
        </div>
      } open={state.viewModal.visible} onCancel={() => updateState({ viewModal: { visible: false, record: null } })}
        footer={null} width={900} centered bodyStyle={{ maxHeight: "80vh", overflowY: "auto", padding: "24px" }}>
        {state.viewModal.record && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Tag color={statusOptions.find(s => s.value === state.viewModal.record.status)?.color}
                style={{ fontSize: "14px", padding: "8px 20px", borderRadius: "20px", fontWeight: 500 }}>
                {state.viewModal.record.status}
              </Tag>
              {state.viewModal.record.query_message && (
                <div style={{ marginTop: "12px", padding: "12px", background: "#f6f6f6", borderRadius: "8px", fontSize: "13px", color: "#595959" }}>
                  <strong>Query:</strong> {state.viewModal.record.query_message}
                </div>
              )}
            </div>

            <Row gutter={[24, 0]}>
              {[
                { icon: <ShopOutlined />, label: "Business Name", value: state.viewModal.record.business_name },
                { icon: <BankOutlined />, label: "Legal Entity", value: state.viewModal.record.legal_entity_name },
                { icon: <UserOutlined />, label: "Owner Name", value: state.viewModal.record.owner_name },
                { icon: <ShopOutlined />, label: "Business Type", value: state.viewModal.record.business_type },
                { icon: <ShopOutlined />, label: "Outlet Type", value: state.viewModal.record.outlet_type },
                { icon: <ShopOutlined />, label: "Franchise Code", value: state.viewModal.record.franchise_code },
                { icon: <MailOutlined />, label: "Email", value: state.viewModal.record.email },
                { icon: <PhoneOutlined />, label: "Mobile", value: state.viewModal.record.mobile_number },
                { icon: <EnvironmentOutlined />, label: "City", value: state.viewModal.record.city },
                { icon: <EnvironmentOutlined />, label: "Pincode", value: state.viewModal.record.pincode },
                { icon: <EnvironmentOutlined />, label: "Address", value: state.viewModal.record.address, span: 24 },
                { icon: <EnvironmentOutlined />, label: "Landmark", value: state.viewModal.record.landmark, span: 24 },
                { icon: <FileTextOutlined />, label: "GST Number", value: state.viewModal.record.gst_no },
                { icon: <FileTextOutlined />, label: "FSSAI Number", value: state.viewModal.record.fssai_no },
                { icon: <FileTextOutlined />, label: "PAN Number", value: state.viewModal.record.pan },
                { icon: <CalendarOutlined />, label: "Created", value: state.viewModal.record.created_at },
                { icon: <CalendarOutlined />, label: "Updated", value: state.viewModal.record.updated_at }
              ].map((props, i) => <InfoRow key={i} {...props} />)}
            </Row>

            {/* Documents Section */}
            <Divider orientation="left" style={{ color: "#c1a078", fontWeight: 600, marginTop: "32px" }}>Documents Verification</Divider>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {Object.entries(documentTypes).map(([docType, docInfo]) => {
                // Get documents from the nested documents object
                const docs = state.viewModal.record.documents?.[docType];
                if (!docs || (Array.isArray(docs) && docs.length === 0)) return null;
                const docArray = Array.isArray(docs) ? docs : [docs];
                return <DocumentCard key={docType} docType={docType} docs={docArray} docInfo={docInfo} />;
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Document Preview Modal */}
      <Modal title={state.previewModal.title} open={state.previewModal.visible}
        onCancel={() => updateState({ previewModal: { visible: false, url: "", title: "", type: "" } })}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}
            onClick={() => handleDownload(state.previewModal.url, state.previewModal.title)}
            style={{ backgroundColor: "#c1a078", borderColor: "#c1a078", color: "white" }}>
            Download
          </Button>
        ]} width={900} centered bodyStyle={{ padding: "24px", textAlign: "center" }}>
        {state.previewModal.url && (
          isImage(state.previewModal.url) ? (
            <Image src={state.previewModal.url} alt={state.previewModal.title}
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
              preview={false} />
          ) : (
            // For PDF preview
            <div style={{ width: "100%", height: "70vh" }}>
              <iframe
                src={state.previewModal.url}
                width="100%"
                height="100%"
                style={{ border: "none", borderRadius: "8px" }}
                title={state.previewModal.title}
              />
            </div>
          )
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal title="Update Status" open={state.editModal.visible}
        onCancel={() => updateState({ editModal: { visible: false, record: null, statusOption: null, queryMessage: "" } })}
        footer={
          <Space>
            <Button onClick={() => updateState({ editModal: { visible: false, record: null, statusOption: null, queryMessage: "" } })}>Cancel</Button>
            <Button type="primary" onClick={handleEditSubmit} loading={state.updateLoading}
              style={{ backgroundColor: "#c1a078", borderColor: "#c1a078" }}>Update</Button>
          </Space>
        } width={400} centered>
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <Avatar size={64} src={state.editModal.record?.profile_picture || blogimg4} style={{ marginBottom: "16px" }} />
          <h4 style={{ margin: 0, color: "#262626", marginBottom: "20px" }}>{state.editModal.record?.business_name}</h4>

          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>New Status *</label>
            <Select value={state.editModal.statusOption?.value}
              onChange={(value) => updateState({
                editModal: {
                  ...state.editModal,
                  statusOption: statusOptions.find(opt => opt.value === value),
                  queryMessage: value === 'Query' ? state.editModal.queryMessage : ""
                }
              })}
              style={{ width: "100%" }} placeholder="Select Status">
              {statusOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
            </Select>
          </div>

          {state.editModal.statusOption?.value === 'Query' && (
            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Query Message *</label>
              <Input.TextArea value={state.editModal.queryMessage}
                onChange={(e) => updateState({ editModal: { ...state.editModal, queryMessage: e.target.value } })}
                placeholder="Enter your query message..." rows={3} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default RestaurantList;