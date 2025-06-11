import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  Input, Select, Button, message, Modal, Row, Col, Card, Avatar, Tag, 
  Space, Form, Upload, Image, Spin, Empty
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, EyeOutlined, 
  InboxOutlined, ReloadOutlined
} from "@ant-design/icons";
import Header from "../Header";
import Sidebar from "../Sidebar";
import AdminService from "../../services/adminService"; // Fixed import path

const { Dragger } = Upload;

const InventoryList = () => {
  const [state, setState] = useState({
    searchText: "",
    filterCategory: "",
    loading: false,
    showAddModal: false,
    showEditModal: false,
    showViewModal: false,
    selectedRecord: null,
    uploadedImages: [],
    products: [],
    categories: [],
    materials: []
  });

  const [form] = Form.useForm();
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  useEffect(() => { 
    loadData(); 
  }, []);

  const loadData = async () => {
    updateState({ loading: true });
    try {
      console.log("🔄 Loading inventory data...");
      
      // Load products, categories, and materials
      const [productsRes, categoriesRes, materialsRes] = await Promise.all([
        AdminService.getProducts(),
        AdminService.getCategories(),
        AdminService.getMaterials()
      ]);

      console.log("📦 Products response:", productsRes);
      console.log("📂 Categories response:", categoriesRes);
      console.log("🔧 Materials response:", materialsRes);

      // Handle different response structures
      const products = productsRes.success 
        ? (Array.isArray(productsRes.data) ? productsRes.data : [])
        : [];
      
      const categories = categoriesRes.success 
        ? (Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
        : [];
      
      const materials = materialsRes.success 
        ? (Array.isArray(materialsRes.data) ? materialsRes.data : [])
        : [];

      console.log("✅ Processed data:", { 
        productsCount: products.length, 
        categoriesCount: categories.length, 
        materialsCount: materials.length 
      });

      updateState({
        products,
        categories,
        materials,
        loading: false
      });

      // Show error messages for failed requests
      if (!productsRes.success) message.error(`Products: ${productsRes.error}`);
      if (!categoriesRes.success) message.error(`Categories: ${categoriesRes.error}`);
      if (!materialsRes.success) message.error(`Materials: ${materialsRes.error}`);

    } catch (error) {
      console.error('❌ Failed to load data:', error);
      message.error('Failed to load inventory data');
      updateState({ loading: false });
    }
  };

  const filteredData = (state.products || []).filter(item => {
    if (!item) return false;
    
    const matchesSearch = !state.searchText || 
      Object.values(item).some(value => 
        value?.toString().toLowerCase().includes(state.searchText.toLowerCase())
      );
    
    const matchesCategory = !state.filterCategory || 
      item.category_id === state.filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const openModal = (type, record = null) => {
    form.resetFields();
    updateState({ uploadedImages: [] });

    if (type === 'add') {
      updateState({ showAddModal: true });
    } else if (type === 'edit') {
      const existingImages = (record.images || []).map((img, index) => ({
        uid: `existing-${index}`,
        name: `image-${index}`,
        status: 'done',
        url: img
      }));
      
      form.setFieldsValue({
        name: record.name || '',
        category_id: record.category_id || '',
        material_id: record.material_id || '',
        hsn_code: record.hsn_code || '',
        shape: record.shape || '',
        colour: record.colour || '',
        specs: record.specs || '',
        quality: record.quality || ''
      });
      
      updateState({ 
        showEditModal: true, 
        selectedRecord: record, 
        uploadedImages: existingImages
      });
    } else if (type === 'view') {
      updateState({ selectedRecord: record, showViewModal: true });
    }
  };

  const closeModals = () => {
    updateState({ 
      showAddModal: false, 
      showEditModal: false, 
      showViewModal: false,
      uploadedImages: [],
      selectedRecord: null
    });
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    const submitData = {
      ...values,
      images: state.uploadedImages.filter(img => img.originFileObj)
    };

    updateState({ loading: true });
    
    try {
      console.log("💾 Submitting product data:", submitData);
      
      const result = state.showEditModal && state.selectedRecord
        ? await AdminService.updateProduct(state.selectedRecord.id, submitData)
        : await AdminService.addProduct(submitData);

      if (result.success) {
        message.success(state.showEditModal ? 'Product updated successfully!' : 'Product added successfully!');
        closeModals();
        await loadData(); // Reload data
      } else {
        message.error(result.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      message.error('Failed to save product. Please try again.');
    } finally {
      updateState({ loading: false });
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList: state.uploadedImages,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          uid: Date.now() + Math.random(),
          name: file.name,
          status: 'done',
          url: e.target.result,
          originFileObj: file
        };
        updateState({ uploadedImages: [...state.uploadedImages, newImage] });
      };
      reader.readAsDataURL(file);
      return false;
    },
    onRemove: (file) => {
      updateState({
        uploadedImages: state.uploadedImages.filter(img => img.uid !== file.uid)
      });
    },
    listType: "picture-card"
  };

  const getCategoryName = (categoryId) => {
    const category = state.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getMaterialName = (materialId) => {
    const material = state.materials.find(mat => mat.id === materialId);
    return material?.name || 'Unknown Material';
  };

  const ProductCard = ({ item }) => (
    <Card 
      hoverable 
      cover={
        <div style={{ 
          textAlign: "center", 
          padding: "20px", 
          backgroundColor: "#fafafa", 
          height: "120px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Avatar 
            src={item.images?.[0]} 
            size={64}
            style={{ backgroundColor: "#c1a078" }}
          >
            {item.name?.[0]?.toUpperCase() || 'P'}
          </Avatar>
        </div>
      } 
      actions={[
        <EyeOutlined key="view" onClick={() => openModal('view', item)} />, 
        <EditOutlined key="edit" onClick={() => openModal('edit', item)} />
      ]}
      style={{ height: "100%" }}
    >
      <Card.Meta 
        title={<div style={{ fontSize: "14px", fontWeight: "600" }}>{item.name || 'Unnamed Product'}</div>}
        description={
          <div style={{ fontSize: "12px" }}>
            <Tag color="blue" size="small">{getCategoryName(item.category_id)}</Tag>
            <div style={{ marginTop: "4px" }}>
              <strong>Material:</strong> {getMaterialName(item.material_id)}
            </div>
            <div>
              <strong>HSN:</strong> <code style={{ fontSize: "11px" }}>{item.hsn_code || 'N/A'}</code>
            </div>
            {item.quality && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: "4px" }}>
                <strong>Quality:</strong> 
                <Tag size="small" color={item.quality === "Premium" ? "gold" : "default"}>
                  {item.quality}
                </Tag>
              </div>
            )}
            {item.colour && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: "4px" }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: item.colour?.toLowerCase() || '#ccc',
                  border: '1px solid #d9d9d9'
                }} />
                <span>{item.colour}</span>
              </div>
            )}
          </div>
        } 
      />
    </Card>
  );

  const FormModal = ({ show, onClose, isEdit, title }) => (
    <Modal 
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", background: "#c1a078",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white"
          }}>
            {isEdit ? <EditOutlined /> : <PlusOutlined />}
          </div>
          <span>{title}</span>
        </div>
      }
      open={show} 
      onCancel={onClose} 
      footer={null} 
      width="90vw"
      style={{ maxWidth: "900px" }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Card title="Product Images" size="small" style={{ marginBottom: "16px" }}>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: "36px", color: "#c1a078" }} />
            </p>
            <p className="ant-upload-text">Click or drag files to upload images</p>
          </Dragger>
        </Card>

        <Card title="Product Details" size="small" style={{ marginBottom: "16px" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="name" 
                label="Product Name" 
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="category_id" 
                label="Category" 
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  {state.categories.map(cat => (
                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="material_id" 
                label="Material" 
                rules={[{ required: true, message: 'Please select material' }]}
              >
                <Select placeholder="Select material">
                  {state.materials.map(mat => (
                    <Select.Option key={mat.id} value={mat.id}>{mat.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="hsn_code" 
                label="HSN Code" 
                rules={[{ required: true, message: 'Please enter HSN code' }]}
              >
                <Input placeholder="Enter HSN code" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shape" label="Shape">
                <Input placeholder="Enter shape" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="colour" label="Colour">
                <Input placeholder="Enter colour" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quality" label="Quality">
                <Select placeholder="Select quality">
                  <Select.Option value="Premium">Premium</Select.Option>
                  <Select.Option value="Standard">Standard</Select.Option>
                  <Select.Option value="Basic">Basic</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="specs" label="Specifications">
                <Input.TextArea rows={3} placeholder="Enter product specifications" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              style={{ backgroundColor: "#c1a078", borderColor: "#c1a078" }} 
              type="primary" 
              htmlType="submit" 
              loading={state.loading}
            >
              {isEdit ? "Update Product" : "Add Product"}
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

  return (
    <>
      <Header />
      <Sidebar id="menu-item3" id1="menu-items3" activeClassName="staff-list" />
      <div className="page-wrapper">
        <div className="content">
          {/* Header Section */}
          <div style={{ 
            background: "linear-gradient(135deg, #c1a078 0%, #d4b896 100%)", 
            borderRadius: "12px", 
            padding: "24px", 
            color: "white",
            marginBottom: "24px"
          }}>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>Product Management</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>Manage your product inventory</p>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <Card style={{ borderRadius: "12px" }}>
                {/* Controls Section */}
                <div style={{ marginBottom: "24px" }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                        Product Grid ({filteredData.length})
                      </h3>
                    </Col>
                    <Col>
                      <Space>
                        <Button 
                          icon={<ReloadOutlined />} 
                          onClick={loadData} 
                          loading={state.loading}
                        >
                          Refresh
                        </Button>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />} 
                          onClick={() => openModal('add')} 
                          style={{ backgroundColor: "#c1a078", borderColor: "#c1a078" }}
                        >
                          Add Product
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {/* Search Section */}
                <Row gutter={16} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={12}>
                    <Input 
                      placeholder="Search products..." 
                      prefix={<SearchOutlined />} 
                      value={state.searchText} 
                      onChange={(e) => updateState({ searchText: e.target.value })} 
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Select
                      placeholder="Filter by category"
                      value={state.filterCategory}
                      onChange={(value) => updateState({ filterCategory: value })}
                      allowClear
                      style={{ width: '100%' }}
                    >
                      {state.categories.map(cat => (
                        <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                      ))}
                    </Select>
                  </Col>
                </Row>

                {/* Products Grid */}
                <Spin spinning={state.loading}>
                  {filteredData.length === 0 ? (
                    <Empty 
                      description={
                        state.loading ? "Loading products..." : "No products found"
                      }
                      style={{ padding: "40px 0" }}
                    />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {filteredData.map(item => (
                        <Col key={item.id || Math.random()} xs={24} sm={12} lg={8} xl={6}>
                          <ProductCard item={item} />
                        </Col>
                      ))}
                    </Row>
                  )}
                </Spin>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <FormModal 
        show={state.showAddModal} 
        onClose={closeModals} 
        isEdit={false} 
        title="Add New Product"
      />
      
      <FormModal 
        show={state.showEditModal} 
        onClose={closeModals} 
        isEdit={true} 
        title="Edit Product"
      />
      
      <Modal 
        title="Product Details"
        open={state.showViewModal} 
        onCancel={closeModals} 
        footer={<Button onClick={closeModals}>Close</Button>} 
        width={700}
      >
        {state.selectedRecord && (
          <div>
            {state.selectedRecord.images?.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <Image.PreviewGroup>
                  <Row gutter={[8, 8]}>
                    {state.selectedRecord.images.map((img, index) => (
                      <Col key={index} span={6}>
                        <Image
                          width="100%"
                          height={80}
                          src={img}
                          style={{ objectFit: "cover", borderRadius: "6px" }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </div>
            )}
            
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="Basic Information">
                  <p><strong>Name:</strong> {state.selectedRecord.name}</p>
                  <p><strong>Category:</strong> <Tag color="blue">{getCategoryName(state.selectedRecord.category_id)}</Tag></p>
                  <p><strong>Material:</strong> {getMaterialName(state.selectedRecord.material_id)}</p>
                  <p><strong>HSN Code:</strong> {state.selectedRecord.hsn_code}</p>
                  <p><strong>Quality:</strong> {state.selectedRecord.quality}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Details">
                  <p><strong>Shape:</strong> {state.selectedRecord.shape || 'N/A'}</p>
                  <p><strong>Colour:</strong> {state.selectedRecord.colour || 'N/A'}</p>
                  <p><strong>Specs:</strong> {state.selectedRecord.specs || 'N/A'}</p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default InventoryList;