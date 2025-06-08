import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { 
  Table, Input, Select, Button, message, Modal, Row, Col, Card, Avatar, Tag, 
  Space,
  // Divider,
   Form, InputNumber 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  AppstoreOutlined, UnorderedListOutlined, UploadOutlined 
} from "@ant-design/icons";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { blogimg2 } from "../imagepath";
import { onShowSizeChange, itemRender } from "../Pagination";

const InventoryList = () => {
  // Consolidated state
  const [state, setState] = useState({
    viewMode: "grid",
    searchText: "",
    filterCategory: "",
    filterStatus: "",
    showAddModal: false,
    showEditModal: false,
    showViewModal: false,
    selectedRecord: null,
    imagePreview: null
  });

  const [form] = Form.useForm();
  const fileInputRef = useRef(null);

  // Sample data
  const datasource = [
    { 
      id: 1, Img: blogimg2, InventoryCode: "INV001", Category: "Electronics", 
      Material: "Aluminum", HSNCode: "8517", Product: "Smartphone", Shape: "Rectangle", 
      Colour: "Black", Specs: "6.1 inch, 128GB", Quality: "Premium", PackOff: "Retail Box", 
      CostPriceBase: "25000.00", Markup: "20%", SellPrice: "30000.00", GrossProfit: "5000.00", 
      GST: "18.00", PriceWithGST: "35400.00", GSTAmount: "5400.00", GSTInward: "0.00", 
      GSTPayable: "5400.00", NetProfit: "4600.00", Status: "In Stock" 
    },
    { 
      id: 2, Img: blogimg2, InventoryCode: "INV002", Category: "Electronics", 
      Material: "Plastic", HSNCode: "8517", Product: "Tablet", Shape: "Rectangle", 
      Colour: "White", Specs: "10 inch, 64GB", Quality: "Standard", PackOff: "Retail Box", 
      CostPriceBase: "15000.00", Markup: "25%", SellPrice: "18750.00", GrossProfit: "3750.00", 
      GST: "18.00", PriceWithGST: "22125.00", GSTAmount: "3375.00", GSTInward: "0.00", 
      GSTPayable: "3375.00", NetProfit: "375.00", Status: "In Stock" 
    },
    { 
      id: 3, Img: blogimg2, InventoryCode: "INV003", Category: "Accessories", 
      Material: "Leather", HSNCode: "4202", Product: "Phone Case", Shape: "Custom", 
      Colour: "Brown", Specs: "Universal Fit", Quality: "Premium", PackOff: "Blister Pack", 
      CostPriceBase: "500.00", Markup: "100%", SellPrice: "1000.00", GrossProfit: "500.00", 
      GST: "18.00", PriceWithGST: "1180.00", GSTAmount: "180.00", GSTInward: "0.00", 
      GSTPayable: "180.00", NetProfit: "320.00", Status: "Out of Stock" 
    }
  ];

  // Filtered data
  const filteredData = datasource.filter(item => {
    const matchesSearch = Object.values(item).some(value => 
      value.toString().toLowerCase().includes(state.searchText.toLowerCase())
    );
    return matchesSearch && 
           (!state.filterCategory || item.Category === state.filterCategory) && 
           (!state.filterStatus || item.Status === state.filterStatus);
  });

  // Helper functions
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  const handleModal = (type, record = null) => {
    if (type === 'add') {
      form.resetFields();
      updateState({ showAddModal: true, imagePreview: null });
    } else if (type === 'edit') {
      const editData = {
        inventoryCode: record.InventoryCode,
        category: record.Category,
        material: record.Material,
        hsnCode: record.HSNCode,
        product: record.Product,
        shape: record.Shape,
        colour: record.Colour,
        specs: record.Specs,
        quality: record.Quality,
        packOff: record.PackOff,
        costPriceBase: parseFloat(record.CostPriceBase),
        markup: record.Markup,
        sellPrice: parseFloat(record.SellPrice),
        grossProfit: parseFloat(record.GrossProfit),
        gst: parseFloat(record.GST),
        priceWithGST: parseFloat(record.PriceWithGST),
        gstAmount: parseFloat(record.GSTAmount),
        gstInward: parseFloat(record.GSTInward),
        gstPayable: parseFloat(record.GSTPayable),
        netProfit: parseFloat(record.NetProfit),
        status: record.Status
      };
      
      form.setFieldsValue(editData);
      updateState({ 
        showEditModal: true, 
        selectedRecord: record, 
        imagePreview: record.Img 
      });
    } else if (type === 'view') {
      updateState({ selectedRecord: record, showViewModal: true });
    }
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Form values:', values);
      message.success('Item saved successfully!');
      updateState({ showEditModal: false, showAddModal: false, imagePreview: null });
      form.resetFields();
    } catch (error) {
      message.error('Failed to save item. Please try again.');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => updateState({ imagePreview: e.target.result });
      reader.readAsDataURL(file);
    }
  };

  // Table columns
  const columns = [
    { 
      title: "Product", 
      dataIndex: "InventoryCode", 
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar src={record.Img} size={48} style={{ borderRadius: "8px" }} />
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>{text}</div>
            <div style={{ color: "#8c8c8c", fontSize: "12px" }}>{record.Product}</div>
          </div>
        </div>
      )
    },
    { 
      title: "Category", 
      dataIndex: "Category", 
      render: (text) => <Tag color="blue">{text}</Tag> 
    },
    { 
      title: "Material", 
      dataIndex: "Material" 
    },
    { 
      title: "HSN Code", 
      dataIndex: "HSNCode", 
      render: (text) => <code style={{ fontSize: "12px" }}>{text}</code> 
    },
    { 
      title: "Quality", 
      dataIndex: "Quality", 
      render: (text) => <Tag color={text === "Premium" ? "gold" : "default"}>{text}</Tag> 
    },
    { 
      title: "Cost Price", 
      dataIndex: "CostPriceBase", 
      align: "right", 
      render: (text) => `₹${parseFloat(text).toLocaleString()}` 
    },
    { 
      title: "Sell Price", 
      dataIndex: "SellPrice", 
      align: "right", 
      render: (text) => <span style={{ color: "#52c41a", fontWeight: "600" }}>₹{parseFloat(text).toLocaleString()}</span> 
    },
    { 
      title: "Net Profit", 
      dataIndex: "NetProfit", 
      align: "right", 
      render: (text) => <span style={{ color: "#1890ff" }}>₹{parseFloat(text).toLocaleString()}</span> 
    },
    { 
      title: "Status", 
      dataIndex: "Status", 
      render: (text) => <Tag color={text === "In Stock" ? "success" : "error"}>{text}</Tag> 
    },
    { 
      title: "Actions", 
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleModal('view', record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleModal('edit', record)} />
          <Button type="text" icon={<DeleteOutlined />} danger />
        </Space>
      )
    }
  ];

  // Form fields configuration
  const basicFields = [
    { name: "inventoryCode", label: "Inventory Code", required: true, span: 8 },
    { name: "category", label: "Category", required: true, span: 8, type: "select", 
      options: ["Electronics", "Accessories", "Furniture", "Clothing"] },
    { name: "product", label: "Product", required: true, span: 8 },
    { name: "material", label: "Material", required: true, span: 8 },
    { name: "hsnCode", label: "HSN Code", required: true, span: 8 },
    { name: "shape", label: "Shape", required: true, span: 8 },
    { name: "colour", label: "Colour", required: true, span: 8 },
    { name: "quality", label: "Quality", required: true, span: 8, type: "select",
      options: ["Premium", "Standard", "Basic"] },
    { name: "packOff", label: "Pack Off", required: true, span: 8 },
    { name: "specs", label: "Specifications", required: true, span: 24, type: "textarea" }
  ];

  const pricingFields = [
    { name: "costPriceBase", label: "Cost Price", required: true, span: 8, type: "number" },
    { name: "markup", label: "Markup (%)", required: true, span: 8, suffix: "%" },
    { name: "sellPrice", label: "Sell Price", required: true, span: 8, type: "number" },
    { name: "grossProfit", label: "Gross Profit", required: true, span: 8, type: "number" },
    { name: "gst", label: "GST (%)", required: true, span: 8, type: "number", max: 100 },
    { name: "priceWithGST", label: "Price with GST", required: true, span: 8, type: "number" },
    { name: "gstAmount", label: "GST Amount", required: true, span: 8, type: "number" },
    { name: "gstInward", label: "GST Inward", required: true, span: 8, type: "number" },
    { name: "gstPayable", label: "GST Payable", required: true, span: 8, type: "number" },
    { name: "netProfit", label: "Net Profit", required: true, span: 8, type: "number" }
  ];

  // Render form field
  const renderField = (field) => {
    const { name, label, required, span, type, options, suffix, max } = field;
    const rules = required ? [{ required: true, message: `Please enter ${label.toLowerCase()}` }] : [];

    let input;
    if (type === "select") {
      input = (
        <Select placeholder={`Select ${label.toLowerCase()}`}>
          {options.map(option => (
            <Select.Option key={option} value={option}>{option}</Select.Option>
          ))}
        </Select>
      );
    } else if (type === "textarea") {
      input = <Input.TextArea rows={2} placeholder={`Enter ${label.toLowerCase()}`} />;
    } else if (type === "number") {
      input = (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          max={max}
          precision={2}
          placeholder={`Enter ${label.toLowerCase()}`}
          formatter={value => suffix ? `${value}${suffix}` : `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/₹\s?|(,*)|%/g, '')}
        />
      );
    } else {
      input = <Input placeholder={`Enter ${label.toLowerCase()}`} suffix={suffix} />;
    }

    return (
      <Col key={name} span={span}>
        <Form.Item name={name} label={label} rules={rules}>
          {input}
        </Form.Item>
      </Col>
    );
  };

  // Form Modal Component
  const FormModal = ({ show, onClose, isEdit, title }) => (
    <Modal 
      title={
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          padding: "8px 0"
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "#1890ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            {isEdit ? <EditOutlined /> : <PlusOutlined />}
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>{title}</div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {isEdit ? "Update inventory details" : "Add new inventory item"}
            </div>
          </div>
        </div>
      }
      open={show} 
      onCancel={onClose} 
      footer={null} 
      width={1000}
      destroyOnClose
      centered
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="middle"
      >
        {/* Image Upload */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "24px", 
          padding: "16px",
          background: "#fafafa",
          borderRadius: "8px",
          border: "1px dashed #d9d9d9"
        }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            border: "2px dashed #d9d9d9", 
            borderRadius: "8px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 12px", 
            overflow: "hidden",
            background: "white"
          }}>
            {state.imagePreview ? (
              <img 
                src={state.imagePreview} 
                alt="Preview" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            ) : (
              <UploadOutlined style={{ fontSize: "20px", color: "#8c8c8c" }} />
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            style={{ display: "none" }} 
          />
          <Button 
            size="small"
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            {state.imagePreview ? "Change" : "Upload"}
          </Button>
        </div>

        {/* Basic Information */}
        <Card title="Basic Information" size="small" style={{ marginBottom: "16px" }}>
          <Row gutter={16}>
            {basicFields.map(renderField)}
          </Row>
        </Card>

        {/* Pricing Information */}
        <Card title="Pricing Information" size="small" style={{ marginBottom: "16px" }}>
          <Row gutter={16}>
            {pricingFields.map(renderField)}
          </Row>
        </Card>

        {/* Status */}
        <Card title="Status" size="small" style={{ marginBottom: "24px" }}>
          <Form.Item
            name="status"
            label="Inventory Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value="In Stock">In Stock</Select.Option>
              <Select.Option value="Out of Stock">Out of Stock</Select.Option>
            </Select>
          </Form.Item>
        </Card>

        {/* Form Actions */}
        <div style={{ 
          textAlign: "right", 
          borderTop: "1px solid #f0f0f0", 
          paddingTop: "16px" 
        }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {isEdit ? "Update Item" : "Add Item"}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );

  FormModal.propTypes = { 
    show: PropTypes.bool.isRequired, 
    onClose: PropTypes.func.isRequired, 
    isEdit: PropTypes.bool.isRequired, 
    title: PropTypes.string.isRequired 
  };

  // Card View Component
  const CardView = ({ data }) => (
    <Row gutter={[16, 16]}>
      {data.map(item => (
        <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
          <Card 
            hoverable 
            cover={
              <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#fafafa" }}>
                <Avatar src={item.Img} size={64} />
              </div>
            } 
            actions={[
              <EyeOutlined key="view" onClick={() => handleModal('view', item)} />, 
              <EditOutlined key="edit" onClick={() => handleModal('edit', item)} />, 
              <DeleteOutlined key="delete" />
            ]}
          >
            <Card.Meta 
              title={item.InventoryCode}
              description={
                <div>
                  <Tag color="blue" style={{ marginBottom: "8px" }}>{item.Category}</Tag>
                  <div><strong>Product:</strong> {item.Product}</div>
                  <div><strong>Price:</strong> ₹{parseFloat(item.SellPrice).toLocaleString()}</div>
                  <div style={{ marginTop: "8px" }}>
                    <Tag color={item.Status === "In Stock" ? "success" : "error"}>{item.Status}</Tag>
                  </div>
                </div>
              } 
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  CardView.propTypes = { data: PropTypes.array.isRequired };

  return (
    <>
      <Header />
      <Sidebar id="menu-item3" id1="menu-items3" activeClassName="staff-list" />
      <div className="page-wrapper">
        <div className="content">
          {/* Header */}
          <div style={{ 
            background: "linear-gradient(135deg, #c1a078 0%, #d4b896 100%)", 
            borderRadius: "12px", 
            padding: "24px", 
            color: "white",
            marginBottom: "24px"
          }}>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
              Inventory Management
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
              Manage your inventory items and their details
            </p>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <Card style={{ borderRadius: "12px" }}>
                {/* Controls */}
                <div style={{ marginBottom: "24px" }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                        Inventory List
                      </h3>
                    </Col>
                    <Col>
                      <Space>
                        <Button 
                          type={state.viewMode === "grid" ? "primary" : "default"} 
                          icon={<UnorderedListOutlined />} 
                          onClick={() => updateState({ viewMode: "grid" })}
                          // style={{ color: "#403222",backgroundColor: "#c1a078" }}
                        >
                          Grid
                        </Button>
                        <Button 
                          type={state.viewMode === "card" ? "primary" : "default"} 
                          icon={<AppstoreOutlined />} 
                          onClick={() => updateState({ viewMode: "card" })}
                          // style={{ color: "#403222",backgroundColor: "#c1a078" }}
                        >
                          Card
                        </Button>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />} 
                          onClick={() => handleModal('add')}
                          // style={{ backgroundColor: "#c1a078",color: "#403222"}}
                        >
                          Add SKU
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={8}>
                    <Input 
                      placeholder="Search inventory..." 
                      prefix={<SearchOutlined />} 
                      value={state.searchText} 
                      onChange={(e) => updateState({ searchText: e.target.value })} 
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Select 
                      placeholder="Filter by Category..." 
                      value={state.filterCategory} 
                      onChange={(value) => updateState({ filterCategory: value })} 
                      allowClear 
                      style={{ width: "100%" }}
                    >
                      {[...new Set(datasource.map(item => item.Category))].map(category => 
                        <Select.Option key={category} value={category}>{category}</Select.Option>
                      )}
                    </Select>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Select 
                      placeholder="Filter by Status..." 
                      value={state.filterStatus} 
                      onChange={(value) => updateState({ filterStatus: value })} 
                      allowClear 
                      style={{ width: "100%" }}
                    >
                      <Select.Option value="In Stock">In Stock</Select.Option>
                      <Select.Option value="Out of Stock">Out of Stock</Select.Option>
                    </Select>
                  </Col>
                </Row>

                {/* Data Display */}
                {state.viewMode === "grid" ? (
                  <Table 
                    columns={columns} 
                    dataSource={filteredData} 
                    rowKey="id" 
                    pagination={{ 
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`, 
                      showSizeChanger: true, 
                      onShowSizeChange, 
                      itemRender 
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
      
      {/* Modals */}
      <FormModal 
        show={state.showAddModal} 
        onClose={() => updateState({ showAddModal: false })} 
        isEdit={false} 
        title="Add New SKU"
      />
      
      <FormModal 
        show={state.showEditModal} 
        onClose={() => updateState({ showEditModal: false })} 
        isEdit={true} 
        title="Edit SKU"
      />
      
      {/* View Modal */}
      <Modal 
        title={state.selectedRecord && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar src={state.selectedRecord?.Img} size={40} />
            <div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>
                {state.selectedRecord?.InventoryCode}
              </div>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {state.selectedRecord?.Product}
              </div>
            </div>
          </div>
        )} 
        open={state.showViewModal} 
        onCancel={() => updateState({ showViewModal: false })} 
        footer={<Button onClick={() => updateState({ showViewModal: false })}>Close</Button>} 
        width={700}
      >
        {state.selectedRecord && (
          <Row gutter={16} style={{ marginTop: "16px" }}>
            <Col span={12}>
              <Card size="small" title="Basic Information">
                <p><strong>Category:</strong> <Tag color="blue">{state.selectedRecord.Category}</Tag></p>
                <p><strong>Material:</strong> {state.selectedRecord.Material}</p>
                <p><strong>HSN Code:</strong> {state.selectedRecord.HSNCode}</p>
                <p><strong>Quality:</strong> {state.selectedRecord.Quality}</p>
                <p><strong>Specs:</strong> {state.selectedRecord.Specs}</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Pricing">
                <p><strong>Cost Price:</strong> ₹{state.selectedRecord.CostPriceBase}</p>
                <p><strong>Sell Price:</strong> ₹{state.selectedRecord.SellPrice}</p>
                <p><strong>GST:</strong> {state.selectedRecord.GST}%</p>
                <p><strong>Net Profit:</strong> ₹{state.selectedRecord.NetProfit}</p>
                <p><strong>Status:</strong> <Tag color={state.selectedRecord.Status === "In Stock" ? "success" : "error"}>{state.selectedRecord.Status}</Tag></p>
              </Card>
            </Col>
          </Row>
        )}
      </Modal>
    </>
  );
};

export default InventoryList;