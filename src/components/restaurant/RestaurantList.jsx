import React, { useState, useEffect } from "react";
import {
  message,
  Spin,
  Card,
  Avatar,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Tabs,
  Modal,
  Pagination,
  Input,
  Select,
  Table,
  Tooltip,
} from "antd";
// import { Link } from "react-router-dom";
import {
  EyeOutlined,
  EditOutlined,
  //  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  // SearchOutlined,
  AppstoreOutlined,
  MenuOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {
  // imagesend,
  blogimg4,
} from "../imagepath";

const { Search } = Input;
const { Option } = Select;

const RestaurantList = () => {
  // Core state
  const [activeTab, setActiveTab] = useState("pending");
  const [datasource, setDatasource] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // UI state
  const [viewType, setViewType] = useState("card"); // 'card' or 'grid'
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination & counts
  const [tabCounts, setTabCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    query: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  // Modals
  const [editModal, setEditModal] = useState({
    visible: false,
    record: null,
    statusOption: null,
  });
  const [viewModal, setViewModal] = useState({ visible: false, record: null });

  // API Configuration
  const API_CONFIG = {
    baseUrl: "http://167.71.228.10:3000/api/admin",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJ1c2VyX2lkIjoiUUZMcUpWOVdTamF5TVhEZnFEUXFUdFVMa0g5MyIsImVtYWlsIjoicmRwYXRlbDc4MjRAZ21haWwuY29tIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwLyIsImlhdCI6MTc0ODc0ODIwOCwiZXhwIjoxNzQ5MzUzMDA4fQ.aIuhF_2BD_c4EkJ2kiLV5-BWEg4OxaNu6LPR-E5VaDo",
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

  // Utility functions
  const getImageUrl = (profilePicture) => {
    return profilePicture && profilePicture.startsWith("http")
      ? profilePicture
      : blogimg4;
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "orange",
      Approved: "green",
      Rejected: "red",
      Query: "blue",
    };
    return colors[status] || "default";
  };

  const getDefaultStatusForTab = (tabKey) => {
    const statusMap = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      query: "Query",
    };
    return statusMap[tabKey] || "Unknown";
  };

  // API calls
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

  const fetchAllTabCounts = async () => {
    const tabs = ["pending", "approved", "rejected", "query"];
    try {
      const countPromises = tabs.map(async (tab) => {
        try {
          const data = await apiCall(`${API_ENDPOINTS[tab]}?page=1&per_page=1`);
          return { tab, count: data.total || data.pagination?.total || 0 };
        } catch (error) {
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

  const fetchDataByTab = async (tabKey, page = 1, perPage = 12) => {
    setLoading(true);
    try {
      const data = await apiCall(
        `${API_ENDPOINTS[tabKey]}?page=${page}&per_page=${perPage}`
      );
      const transformedData =
        data.data?.map((item, index) => ({
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
      setFilteredData(transformedData);
      setPagination({
        current: page,
        pageSize: perPage,
        total: data.total || data.pagination?.total || transformedData.length,
      });

      const currentTabCount =
        data.total || data.pagination?.total || transformedData.length;
      setTabCounts((prev) => ({ ...prev, [tabKey]: currentTabCount }));
    } catch (error) {
      message.error(`Failed to fetch ${tabKey} business list`);
      setDatasource([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter functionality
  const applyFilters = () => {
    let filtered = datasource;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (item) =>
          item.Name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.owner_name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.Email.toLowerCase().includes(searchText.toLowerCase()) ||
          item.mobile_number.includes(searchText) ||
          item.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.Status === statusFilter);
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchText, statusFilter, datasource]);

  // Action handlers
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
        body: JSON.stringify({ id: businessId, status: statusMap[action] }),
      });
      message.success(`Business ${action}d successfully!`);
      setDatasource((prev) =>
        prev.filter((item) => item.business_id !== businessId)
      );
      await Promise.all([
        fetchAllTabCounts(),
        fetchDataByTab(activeTab, pagination.current, pagination.pageSize),
      ]);
    } catch (error) {
      message.error(`Failed to ${action} business`);
    } finally {
      setUpdateLoading(false);
    }
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
          status: editModal.statusOption.value,
        }),
      });
      message.success("Business updated successfully!");

      if (editModal.statusOption.value !== editModal.record.Status) {
        setDatasource((prev) =>
          prev.filter(
            (item) => item.business_id !== editModal.record.business_id
          )
        );
        await Promise.all([
          fetchAllTabCounts(),
          fetchDataByTab(activeTab, pagination.current, pagination.pageSize),
        ]);
      } else {
        setDatasource((prev) =>
          prev.map((item) =>
            item.business_id === editModal.record.business_id
              ? { ...item, Status: editModal.statusOption.value }
              : item
          )
        );
      }
      setEditModal({ visible: false, record: null, statusOption: null });
    } catch (error) {
      message.error("Failed to update business");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Event handlers
  useEffect(() => {
    fetchAllTabCounts().then(() => fetchDataByTab("pending", 1, 12));
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination((prev) => ({ ...prev, current: 1 }));
    setDatasource([]);
    setFilteredData([]);
    setSearchText("");
    setStatusFilter("all");
    fetchDataByTab(key, 1, 12);
  };

  // Table columns for grid view
  const columns = [
    {
      title: "Restaurant",
      key: "restaurant",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar size={40} src={record.Img} />
          <div>
            <div style={{ fontWeight: 600, color: "#403222" }}>
              {record.Name}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.owner_name}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "13px", marginBottom: "4px" }}>
            <MailOutlined style={{ marginRight: "6px", color: "#8c8c8c" }} />
            {record.Email}
          </div>
          <div style={{ fontSize: "13px" }}>
            <PhoneOutlined style={{ marginRight: "6px", color: "#8c8c8c" }} />
            {record.mobile_number}
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (text) => (
        <div style={{ fontSize: "13px" }}>
          <EnvironmentOutlined
            style={{ marginRight: "6px", color: "#8c8c8c" }}
          />
          {text}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "OutletType",
      key: "OutletType",
      render: (text) => (
        <Tag color="blue" style={{ borderRadius: "12px" }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{ borderRadius: "16px", fontWeight: 500 }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setViewModal({ visible: true, record })}
            />
          </Tooltip>
          <Tooltip title="Edit Status">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() =>
                setEditModal({
                  visible: true,
                  record,
                  statusOption: statusOptions.find(
                    (opt) => opt.value === record.Status
                  ),
                })
              }
            />
          </Tooltip>
          {activeTab === "pending" && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  style={{ color: "#52c41a" }}
                  onClick={() =>
                    handleBusinessAction(record.business_id, "approve")
                  }
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  style={{ color: "#ff4d4f" }}
                  onClick={() =>
                    handleBusinessAction(record.business_id, "reject")
                  }
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Card view renderer
  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {filteredData.map((record) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={record.id}>
          <Card
            hoverable
            style={{
              borderRadius: "12px",
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <Avatar
                size={60}
                src={record.Img}
                style={{ marginBottom: "12px" }}
              />
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "#403222",
                  marginBottom: "4px",
                }}
              >
                {record.Name}
              </div>
              <div
                style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}
              >
                {record.owner_name}
              </div>
              <Tag
                color={getStatusColor(record.Status)}
                style={{
                  borderRadius: "16px",
                  fontSize: "12px",
                  padding: "4px 12px",
                }}
              >
                {record.Status}
              </Tag>
            </div>

            <div style={{ marginBottom: "16px", fontSize: "13px" }}>
              <div
                style={{
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MailOutlined
                  style={{ marginRight: "8px", color: "#8c8c8c" }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {record.Email}
                </span>
              </div>
              <div
                style={{
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <PhoneOutlined
                  style={{ marginRight: "8px", color: "#8c8c8c" }}
                />
                <span>{record.mobile_number}</span>
              </div>
              <div
                style={{
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <EnvironmentOutlined
                  style={{ marginRight: "8px", color: "#8c8c8c" }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {record.location}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <ShopOutlined
                  style={{ marginRight: "8px", color: "#8c8c8c" }}
                />
                <Tag
                  color="blue"
                  style={{ borderRadius: "12px", fontSize: "11px" }}
                >
                  {record.OutletType}
                </Tag>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                paddingTop: "16px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Tooltip title="View Details">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => setViewModal({ visible: true, record })}
                />
              </Tooltip>
              <Tooltip title="Edit Status">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() =>
                    setEditModal({
                      visible: true,
                      record,
                      statusOption: statusOptions.find(
                        (opt) => opt.value === record.Status
                      ),
                    })
                  }
                />
              </Tooltip>
              {activeTab === "pending" && (
                <>
                  <Tooltip title="Approve">
                    <Button
                      type="text"
                      icon={<CheckOutlined />}
                      style={{ color: "#52c41a" }}
                      onClick={() =>
                        handleBusinessAction(record.business_id, "approve")
                      }
                      loading={updateLoading}
                    />
                  </Tooltip>
                  <Tooltip title="Reject">
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      style={{ color: "#ff4d4f" }}
                      onClick={() =>
                        handleBusinessAction(record.business_id, "reject")
                      }
                      loading={updateLoading}
                    />
                  </Tooltip>
                </>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Info card renderer for view modal
  const renderInfoCard = (icon, title, value, colSpan = 12) => (
    <Col span={colSpan} style={{ marginBottom: "16px" }}>
      <Card
        size="small"
        style={{ borderRadius: "8px", backgroundColor: "#fafafa" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon && <span style={{ color: "#c1a078" }}>{icon}</span>}
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#8c8c8c",
                marginBottom: "2px",
              }}
            >
              {title}
            </div>
            <div
              style={{ fontSize: "14px", fontWeight: 500, color: "#403222" }}
            >
              {value || "N/A"}
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );

  return (
    <>
      <Header />
      <Sidebar id="menu-item4" id1="menu-items4" />
      <div className="page-wrapper">
        <div className="content" style={{ padding: "24px" }}>
          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #c1a078 0%, #d4b896 100%)",
                borderRadius: "12px",
                padding: "24px",
                color: "white",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Restaurant Management
              </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
                Manage restaurant applications and onboarding process
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={[
                { key: "pending", label: `Pending (${tabCounts.pending})` },
                { key: "approved", label: `Approved (${tabCounts.approved})` },
                { key: "rejected", label: `Rejected (${tabCounts.rejected})` },
                { key: "query", label: `Query (${tabCounts.query})` },
              ]}
            />

            {/* Controls */}
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: "20px" }}
            >
              <Col>
                <Space>
                  <Search
                    placeholder="Search restaurants..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 250 }}
                    allowClear
                  />
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 120 }}
                  >
                    <Option value="all">All Status</Option>
                    {statusOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              <Col>
                <Space>
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>
                    {filteredData.length} of {datasource.length} restaurants
                  </span>
                  <Button.Group>
                    <Button
                      type={viewType === "card" ? "primary" : "default"}
                      icon={<AppstoreOutlined />}
                      onClick={() => setViewType("card")}
                      style={{ borderRadius: "6px 0 0 6px" }}
                    />
                    <Button
                      type={viewType === "grid" ? "primary" : "default"}
                      icon={<MenuOutlined />}
                      onClick={() => setViewType("grid")}
                      style={{ borderRadius: "0 6px 6px 0" }}
                    />
                  </Button.Group>
                </Space>
              </Col>
            </Row>

            {/* Content */}
            <Spin spinning={loading || updateLoading}>
              {filteredData.length === 0 && !loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#8c8c8c",
                  }}
                >
                  <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                    No restaurants found
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    Try adjusting your search or filters
                  </div>
                </div>
              ) : viewType === "card" ? (
                renderCardView()
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  pagination={false}
                  rowKey="id"
                  style={{ marginBottom: "20px" }}
                />
              )}

              {filteredData.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "32px",
                    paddingTop: "24px",
                    borderTop: "1px solid #f0f0f0",
                    flexWrap: "wrap", // for responsiveness
                    gap: "12px",
                  }}
                >
                  {/* Showing Entries Text */}
                  <div style={{ fontSize: "14px", color: "#595959" }}>
                    Showing {pagination.pageSize * (pagination.current - 1) + 1}
                    –
                    {Math.min(
                      pagination.pageSize * pagination.current,
                      pagination.total
                    )}{" "}
                    of {pagination.total} entries
                  </div>

                  {/* Pagination Controls */}
                  <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    pageSize={pagination.pageSize}
                    onChange={(page, pageSize) =>
                      fetchDataByTab(activeTab, page, pageSize)
                    }
                    showSizeChanger
                    showQuickJumper
                    pageSizeOptions={["12", "24", "48", "96"]}
                  />
                </div>
              )}
            </Spin>
          </Card>
        </div>
      </div>

      {/* Enhanced View Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "8px 0",
            }}
          >
            <Avatar size={48} src={viewModal.record?.Img} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 18, color: "#403222" }}>
                {viewModal.record?.Name}
              </div>
              <div style={{ fontSize: "13px", color: "#8c8c8c" }}>
                Restaurant Details
              </div>
            </div>
          </div>
        }
        open={viewModal.visible}
        onCancel={() => setViewModal({ visible: false, record: null })}
        footer={null}
        width={900}
        centered
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto", padding: "24px" }}
      >
        {viewModal.record && (
          <Row gutter={[16, 16]}>
            {renderInfoCard(
              <ShopOutlined />,
              "Business Name",
              viewModal.record.BusinessName
            )}
            {renderInfoCard(
              <ShopOutlined />,
              "Legal Entity",
              viewModal.record.legal_entity_name
            )}
            {renderInfoCard(
              <ShopOutlined />,
              "Owner Name",
              viewModal.record.owner_name
            )}
            {renderInfoCard(<MailOutlined />, "Email", viewModal.record.Email)}
            {renderInfoCard(
              <PhoneOutlined />,
              "Mobile",
              viewModal.record.mobile_number
            )}
            {renderInfoCard(
              <EnvironmentOutlined />,
              "Location",
              viewModal.record.location
            )}
            {renderInfoCard(
              <ShopOutlined />,
              "Business Type",
              viewModal.record.business_type
            )}
            {renderInfoCard(
              <ShopOutlined />,
              "Outlet Type",
              viewModal.record.OutletType
            )}
            {renderInfoCard(
              <ShopOutlined />,
              "GST Number",
              viewModal.record.gst_no
            )}
            {renderInfoCard(
              <ShopOutlined />,
              "FSSAI Number",
              viewModal.record.fssai_no
            )}
            {renderInfoCard(
              <ShopOutlined />,
              "PAN Number",
              viewModal.record.pan
            )}
            {renderInfoCard(
              <EnvironmentOutlined />,
              "Address",
              viewModal.record.address,
              24
            )}
            {renderInfoCard(
              <EnvironmentOutlined />,
              "City",
              viewModal.record.city
            )}
            {renderInfoCard(
              <EnvironmentOutlined />,
              "Pincode",
              viewModal.record.pincode
            )}

            <Col span={24} style={{ textAlign: "center", marginTop: "24px" }}>
              <Tag
                color={getStatusColor(viewModal.record.Status)}
                style={{
                  fontSize: "14px",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                }}
              >
                {viewModal.record.Status}
              </Tag>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Update Restaurant Status"
        open={editModal.visible}
        onCancel={() =>
          setEditModal({ visible: false, record: null, statusOption: null })
        }
        footer={
          <Space>
            <Button
              onClick={() =>
                setEditModal({
                  visible: false,
                  record: null,
                  statusOption: null,
                })
              }
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleEditSubmit}
              loading={updateLoading}
              style={{ backgroundColor: "#c1a078", borderColor: "#c1a078" }}
            >
              Update Status
            </Button>
          </Space>
        }
        width={400}
        centered
      >
        <Spin spinning={updateLoading}>
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <Avatar
              size={64}
              src={editModal.record?.Img}
              style={{ marginBottom: "16px" }}
            />
            <h4 style={{ margin: 0, color: "#403222", marginBottom: "20px" }}>
              {editModal.record?.Name}
            </h4>

            <div style={{ textAlign: "left", marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                  color: "#403222",
                }}
              >
                Current Status
              </label>
              <Tag
                color={getStatusColor(editModal.record?.Status)}
                style={{
                  fontSize: "14px",
                  padding: "6px 16px",
                  borderRadius: "20px",
                }}
              >
                {editModal.record?.Status}
              </Tag>
            </div>

            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                  color: "#403222",
                }}
              >
                New Status <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <Select
                value={editModal.statusOption?.value}
                onChange={(value) =>
                  setEditModal((prev) => ({
                    ...prev,
                    statusOption: statusOptions.find(
                      (opt) => opt.value === value
                    ),
                  }))
                }
                style={{ width: "100%" }}
                placeholder="Select Status"
              >
                {statusOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default RestaurantList;
