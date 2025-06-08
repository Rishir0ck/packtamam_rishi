import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Table,
  Input,
  Select,
  Button,
  message,
  Modal,
  Row,
  Col,
  Card,
  Avatar,
  Tag,
  Space,
  Divider,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {
  //  imagesend,
  blogimg2,
} from "../imagepath";
import { Link } from "react-router-dom";
import { onShowSizeChange, itemRender } from "../Pagination";

const { Option } = Select;

const InventoryList = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    inventoryCode: "",
    category: "",
    material: "",
    hsnCode: "",
    product: "",
    shape: "",
    colour: "",
    specs: "",
    quality: "",
    packOff: "",
    costPriceBase: "",
    markup: "",
    sellPrice: "",
    grossProfit: "",
    gst: "",
    priceWithGST: "",
    gstAmount: "",
    gstInward: "",
    gstPayable: "",
    netProfit: "",
    status: "In Stock",
  });

  const datasource = [
    {
      id: 1,
      Img: blogimg2,
      InventoryCode: "INV001",
      Category: "Electronics",
      Material: "Aluminum",
      HSNCode: "8517",
      Product: "Smartphone",
      Shape: "Rectangle",
      Colour: "Black",
      Specs: "6.1 inch, 128GB",
      Quality: "Premium",
      PackOff: "Retail Box",
      CostPriceBase: "25000.00",
      Markup: "20%",
      SellPrice: "30000.00",
      GrossProfit: "5000.00",
      GST: "18.00",
      PriceWithGST: "35400.00",
      GSTAmount: "5400.00",
      GSTInward: "0.00",
      GSTPayable: "5400.00",
      NetProfit: "4600.00",
      Status: "In Stock",
    },
    {
      id: 2,
      Img: blogimg2,
      InventoryCode: "INV002",
      Category: "Electronics",
      Material: "Plastic",
      HSNCode: "8517",
      Product: "Tablet",
      Shape: "Rectangle",
      Colour: "White",
      Specs: "10 inch, 64GB",
      Quality: "Standard",
      PackOff: "Retail Box",
      CostPriceBase: "15000.00",
      Markup: "25%",
      SellPrice: "18750.00",
      GrossProfit: "3750.00",
      GST: "18.00",
      PriceWithGST: "22125.00",
      GSTAmount: "3375.00",
      GSTInward: "0.00",
      GSTPayable: "3375.00",
      NetProfit: "375.00",
      Status: "In Stock",
    },
    {
      id: 3,
      Img: blogimg2,
      InventoryCode: "INV003",
      Category: "Accessories",
      Material: "Leather",
      HSNCode: "4202",
      Product: "Phone Case",
      Shape: "Custom",
      Colour: "Brown",
      Specs: "Universal Fit",
      Quality: "Premium",
      PackOff: "Blister Pack",
      CostPriceBase: "500.00",
      Markup: "100%",
      SellPrice: "1000.00",
      GrossProfit: "500.00",
      GST: "18.00",
      PriceWithGST: "1180.00",
      GSTAmount: "180.00",
      GSTInward: "0.00",
      GSTPayable: "180.00",
      NetProfit: "320.00",
      Status: "Out of Stock",
    },
  ];

  const filteredData = datasource.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    const matchesCategory = !filterCategory || item.Category === filterCategory;
    const matchesStatus = !filterStatus || item.Status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      inventoryCode: "",
      category: "",
      material: "",
      hsnCode: "",
      product: "",
      shape: "",
      colour: "",
      specs: "",
      quality: "",
      packOff: "",
      costPriceBase: "",
      markup: "",
      sellPrice: "",
      grossProfit: "",
      gst: "",
      priceWithGST: "",
      gstAmount: "",
      gstInward: "",
      gstPayable: "",
      netProfit: "",
      status: "In Stock",
    });
    setImagePreview(null);
  };

  const handleAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditModal = (record) => {
    setFormData({
      inventoryCode: record.InventoryCode || "",
      category: record.Category || "",
      material: record.Material || "",
      hsnCode: record.HSNCode || "",
      product: record.Product || "",
      shape: record.Shape || "",
      colour: record.Colour || "",
      specs: record.Specs || "",
      quality: record.Quality || "",
      packOff: record.PackOff || "",
      costPriceBase: record.CostPriceBase || "",
      markup: record.Markup || "",
      sellPrice: record.SellPrice || "",
      grossProfit: record.GrossProfit || "",
      gst: record.GST || "",
      priceWithGST: record.PriceWithGST || "",
      gstAmount: record.GSTAmount || "",
      gstInward: record.GSTInward || "",
      gstPayable: record.GSTPayable || "",
      netProfit: record.NetProfit || "",
      status: record.Status || "In Stock",
    });
    setImagePreview(record.Img);
    setShowEditModal(true);
  };

  const handleViewModal = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleSubmit = (e, isEdit = false) => {
    e.preventDefault();
    console.log(
      isEdit ? "Edit form submitted" : "Add form submitted",
      formData
    );
    message.success(
      isEdit ? "Item updated successfully!" : "Item added successfully!"
    );
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "InventoryCode",
      width: 200,
      fixed: "left",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar src={record.Img} size={40} />
          <div>
            <div style={{ fontWeight: "500", fontSize: "14px" }}>{text}</div>
            <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
              {record.Product}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "Category",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    { title: "Material", dataIndex: "Material", width: 120 },
    { title: "HSN Code", dataIndex: "HSNCode", width: 100 },
    { title: "Shape", dataIndex: "Shape", width: 100 },
    { title: "Colour", dataIndex: "Colour", width: 100 },
    { title: "Quality", dataIndex: "Quality", width: 100 },
    {
      title: "Cost Price",
      dataIndex: "CostPriceBase",
      width: 120,
      render: (text) => `₹${text}`,
    },
    {
      title: "Sell Price",
      dataIndex: "SellPrice",
      width: 120,
      render: (text) => `₹${text}`,
    },
    {
      title: "Price with GST",
      dataIndex: "PriceWithGST",
      width: 140,
      render: (text) => `₹${text}`,
    },
    {
      title: "Status",
      dataIndex: "Status",
      width: 120,
      render: (text) => (
        <Tag color={text === "In Stock" ? "success" : "error"}>{text}</Tag>
      ),
    },
    {
      title: "Actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewModal(record)}
            style={{ color: "#1890ff" }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditModal(record)}
            style={{ color: "#52c41a" }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{ color: "#ff4d4f" }}
          />
        </Space>
      ),
    },
  ];

  const ViewModal = () => (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar src={selectedRecord?.Img} size={40} />
          <div>
            <div style={{ fontSize: "18px", fontWeight: "600" }}>
              {selectedRecord?.InventoryCode}
            </div>
            <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
              {selectedRecord?.Product}
            </div>
          </div>
        </div>
      }
      open={showViewModal}
      onCancel={() => setShowViewModal(false)}
      footer={[
        <Button key="close" onClick={() => setShowViewModal(false)}>
          Close
        </Button>,
      ]}
      width={800}
    >
      {selectedRecord && (
        <div style={{ marginTop: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="Basic Information">
                <p>
                  <strong>Category:</strong>{" "}
                  <Tag color="blue">{selectedRecord.Category}</Tag>
                </p>
                <p>
                  <strong>Material:</strong> {selectedRecord.Material}
                </p>
                <p>
                  <strong>HSN Code:</strong> {selectedRecord.HSNCode}
                </p>
                <p>
                  <strong>Shape:</strong> {selectedRecord.Shape}
                </p>
                <p>
                  <strong>Colour:</strong> {selectedRecord.Colour}
                </p>
                <p>
                  <strong>Quality:</strong> {selectedRecord.Quality}
                </p>
                <p>
                  <strong>Pack Off:</strong> {selectedRecord.PackOff}
                </p>
                <p>
                  <strong>Specs:</strong> {selectedRecord.Specs}
                </p>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Pricing Information">
                <p>
                  <strong>Cost Price:</strong> ₹{selectedRecord.CostPriceBase}
                </p>
                <p>
                  <strong>Markup:</strong> {selectedRecord.Markup}
                </p>
                <p>
                  <strong>Sell Price:</strong> ₹{selectedRecord.SellPrice}
                </p>
                <p>
                  <strong>Gross Profit:</strong> ₹{selectedRecord.GrossProfit}
                </p>
                <p>
                  <strong>GST (%):</strong> {selectedRecord.GST}%
                </p>
                <p>
                  <strong>Price with GST:</strong> ₹
                  {selectedRecord.PriceWithGST}
                </p>
                <p>
                  <strong>GST Amount:</strong> ₹{selectedRecord.GSTAmount}
                </p>
                <p>
                  <strong>Net Profit:</strong> ₹{selectedRecord.NetProfit}
                </p>
              </Card>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={24}>
              <Card size="small" title="Status">
                <Tag
                  color={
                    selectedRecord.Status === "In Stock" ? "success" : "error"
                  }
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  {selectedRecord.Status}
                </Tag>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );

  const FormModal = ({ show, onClose, isEdit, onSubmit }) => (
    <Modal
      title={isEdit ? "Edit SKU" : "Add New SKU"}
      open={show}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <form onSubmit={(e) => onSubmit(e, isEdit)}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              border: "2px dashed #d9d9d9",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              overflow: "hidden",
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "#8c8c8c" }}>No Image</span>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            Upload Image
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {[
            {
              key: "inventoryCode",
              label: "Inventory Code",
              type: "text",
              required: true,
            },
            {
              key: "category",
              label: "Category",
              type: "text",
              required: true,
            },
            {
              key: "material",
              label: "Material",
              type: "text",
              required: true,
            },
            { key: "hsnCode", label: "HSN Code", type: "text", required: true },
            { key: "product", label: "Product", type: "text", required: true },
            { key: "shape", label: "Shape", type: "text", required: true },
            { key: "colour", label: "Colour", type: "text", required: true },
            { key: "specs", label: "Specs", type: "text", required: true },
            { key: "quality", label: "Quality", type: "text", required: true },
            { key: "packOff", label: "Pack Off", type: "text", required: true },
            {
              key: "costPriceBase",
              label: "Cost Price (Base)",
              type: "number",
              required: true,
            },
            {
              key: "markup",
              label: "Markup (%)",
              type: "text",
              required: true,
            },
            {
              key: "sellPrice",
              label: "Sell Price",
              type: "number",
              required: true,
            },
            {
              key: "grossProfit",
              label: "Gross Profit",
              type: "number",
              required: true,
            },
            { key: "gst", label: "GST (%)", type: "number", required: true },
            {
              key: "priceWithGST",
              label: "Price with GST",
              type: "number",
              required: true,
            },
            {
              key: "gstAmount",
              label: "GST Amount",
              type: "number",
              required: true,
            },
            {
              key: "gstInward",
              label: "GST Inward",
              type: "number",
              required: true,
            },
            {
              key: "gstPayable",
              label: "GST Payable",
              type: "number",
              required: true,
            },
            {
              key: "netProfit",
              label: "Net Profit",
              type: "number",
              required: true,
            },
          ].map((field) => (
            <Col key={field.key} xs={24} sm={12} md={8}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  {field.label}{" "}
                  {field.required && <span style={{ color: "red" }}>*</span>}
                </label>
                <Input
                  type={field.type}
                  value={formData[field.key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required={field.required}
                />
              </div>
            </Col>
          ))}

          <Col span={24}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Status <span style={{ color: "red" }}>*</span>
              </label>
              <Space>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="In Stock"
                    checked={formData.status === "In Stock"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    style={{ marginRight: "8px" }}
                  />
                  In Stock
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Out of Stock"
                    checked={formData.status === "Out of Stock"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    style={{ marginRight: "8px" }}
                  />
                  Out of Stock
                </label>
              </Space>
            </div>
          </Col>
        </Row>

        <div style={{ marginTop: "24px", textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {isEdit ? "Update" : "Submit"}
            </Button>
          </Space>
        </div>
      </form>
    </Modal>
  );

  FormModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isEdit: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  const CardView = ({ data }) => (
    <Row gutter={[16, 16]}>
      {data.map((item) => (
        <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
          <Card
            hoverable
            cover={
              <div style={{ textAlign: "center", padding: "16px" }}>
                <Avatar src={item.Img} size={80} />
              </div>
            }
            actions={[
              <EyeOutlined key="view" onClick={() => handleViewModal(item)} />,
              <EditOutlined key="edit" onClick={() => handleEditModal(item)} />,
              <DeleteOutlined key="delete" style={{ color: "#ff4d4f" }} />,
            ]}
          >
            <Card.Meta
              title={item.InventoryCode}
              description={
                <div>
                  <Tag color="blue" style={{ marginBottom: "8px" }}>
                    {item.Category}
                  </Tag>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Product:</strong> {item.Product}
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Material:</strong> {item.Material}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Price:</strong> ₹{item.SellPrice}
                  </div>
                  <Tag color={item.Status === "In Stock" ? "success" : "error"}>
                    {item.Status}
                  </Tag>
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  CardView.propTypes = {
    data: PropTypes.array.isRequired,
  };

  return (
    <>
      <Header />
      <Sidebar id="menu-item3" id1="menu-items3" activeClassName="staff-list" />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#" style={{ color: "#403222" }}>
                      Inventory
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
                Inventory Management
              </h2>
              <p
                style={{
                  margin: 0,
                  opacity: 0.9,
                  fontSize: "14px",
                  color: "#403222",
                }}
              >
                Manage Your inventory items and their details
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <Card>
                <div style={{ marginBottom: "24px" }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <h2 style={{ margin: 0, color: "#262626" }}>
                        Inventory Management
                      </h2>
                    </Col>
                    <Col>
                      <Space>
                        <Button
                          type={viewMode === "grid" ? "primary" : "default"}
                          icon={<UnorderedListOutlined />}
                          onClick={() => setViewMode("grid")}
                        />
                        <Button
                          type={viewMode === "card" ? "primary" : "default"}
                          icon={<AppstoreOutlined />}
                          onClick={() => setViewMode("card")}
                        />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddModal}
                        >
                          Add SKU
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={8}>
                    <Input
                      placeholder="Search inventory..."
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Select
                      placeholder="Filter by Category"
                      value={filterCategory}
                      onChange={setFilterCategory}
                      allowClear
                      style={{ width: "100%" }}
                    >
                      {[
                        ...new Set(datasource.map((item) => item.Category)),
                      ].map((category) => (
                        <Option key={category} value={category}>
                          {category}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Select
                      placeholder="Filter by Status"
                      value={filterStatus}
                      onChange={setFilterStatus}
                      allowClear
                      style={{ width: "100%" }}
                    >
                      <Option value="In Stock">In Stock</Option>
                      <Option value="Out of Stock">Out of Stock</Option>
                    </Select>
                  </Col>
                </Row>

                {viewMode === "grid" ? (
                  <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    scroll={{ x: 1500 }}
                    pagination={{
                      showTotal: (total, range) =>
                        `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                      showSizeChanger: true,
                      onShowSizeChange,
                      itemRender,
                    }}
                  />
                ) : (
                  <CardView data={filteredData} />
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      <FormModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        isEdit={false}
        onSubmit={handleSubmit}
      />

      <FormModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        isEdit={true}
        onSubmit={handleSubmit}
      />

      <ViewModal />
    </>
  );
};

export default InventoryList;
