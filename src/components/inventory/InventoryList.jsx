import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  Table, Input, Select, Button, message, Modal, Row, Col, Card, Avatar, Tag, 
  Space, Form,
  //  InputNumber,
   Upload, Image, Spin
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  AppstoreOutlined, UnorderedListOutlined, InboxOutlined, ReloadOutlined
} from "@ant-design/icons";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { onShowSizeChange, itemRender } from "../Pagination";
// import AdminService from "../services/adminService";
import AdminService from "../../Firebase/services/adminApiService";

const { Dragger } = Upload;

const InventoryList = () => {
  const [state, setState] = useState({
    viewMode: "grid",
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

  // Utility function to update state
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    updateState({ loading: true });
    try {
      const [productsRes, categoriesRes, materialsRes] = await Promise.all([
        AdminService.getProducts(),
        AdminService.getCategories(),
        AdminService.getMaterials()
      ]);

      updateState({
        products: productsRes.success ? productsRes.data : [],
        categories: categoriesRes.success ? categoriesRes.data : [],
        materials: materialsRes.success ? materialsRes.data : [],
        loading: false
      });

      if (!productsRes.success) message.error(productsRes.error);
      if (!categoriesRes.success) message.error(categoriesRes.error);
      if (!materialsRes.success) message.error(materialsRes.error);
    } catch (error) {
      message.error('Failed to load data');
      updateState({ loading: false });
    }
  };

  // Filter products based on search and category
  const filteredData = state.products.filter(item => {
    const matchesSearch = Object.values(item).some(value => 
      value?.toString().toLowerCase().includes(state.searchText.toLowerCase())
    );
    return matchesSearch && (!state.filterCategory || item.category_id === state.filterCategory);
  });

  // Modal handlers
  const openModal = (type, record = null) => {
    if (type === 'add') {
      form.resetFields();
      updateState({ showAddModal: true, uploadedImages: [] });
    } else if (type === 'edit') {
      form.setFieldsValue({
        name: record.name,
        category_id: record.category_id,
        material_id: record.material_id,
        hsn_code: record.hsn_code,
        shape: record.shape,
        colour: record.colour,
        specs: record.specs,
        quality: record.quality
      });
      
      // Convert existing images to upload format
      const existingImages = record.images?.map((img, index) => ({
        uid: index,
        name: `image-${index}`,
        status: 'done',
        url: img
      })) || [];
      
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

  // Handle form submission
  const handleSubmit = async (values) => {
    const submitData = {
      ...values,
      images: state.uploadedImages.filter(img => img.originFileObj)
    };

    updateState({ loading: true });
    
    try {
      let result;
      if (state.showEditModal && state.selectedRecord) {
        result = await AdminService.updateProduct(state.selectedRecord.id, submitData);
      } else {
        result = await AdminService.addProduct(submitData);
      }

      if (result.success) {
        message.success(state.showEditModal ? 'Product updated successfully!' : 'Product added successfully!');
        closeModals();
        loadData(); // Reload data
      } else {
        message.error(result.error || 'Failed to save product');
      }
    } catch (error) {
      message.error('Failed to save product. Please try again.');
    } finally {
      updateState({ loading: false });
    }
  };

  // Handle product deletion
  const handleDelete = async (productId) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        updateState({ loading: true });
        const result = await AdminService.deleteProduct(productId);
        
        if (result.success) {
          message.success('Product deleted successfully!');
          loadData(); // Reload data
        } else {
          message.error(result.error || 'Failed to delete product');
        }
        updateState({ loading: false });
      }
    });
  };

  // Image upload configuration
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

  // Get category/material name by ID
  const getCategoryName = (categoryId) => {
    const category = state.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getMaterialName = (materialId) => {
    const material = state.materials.find(mat => mat.id === materialId);
    return material?.name || 'Unknown';
  };

  // Table columns
  const columns = [
    { 
      title: "Product", 
      dataIndex: "name", 
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar 
            src={record.images?.[0]} 
            size={48} 
            style={{ borderRadius: "8px" }}
          >
            {text?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>{text}</div>
            <div style={{ color: "#8c8c8c", fontSize: "12px" }}>{record.specs}</div>
          </div>
        </div>
      )
    },
    { 
      title: "Category", 
      dataIndex: "category_id", 
      render: (categoryId) => <Tag color="blue">{getCategoryName(categoryId)}</Tag> 
    },
    { 
      title: "Material", 
      dataIndex: "material_id", 
      render: (materialId) => getMaterialName(materialId) 
    },
    { 
      title: "HSN Code", 
      dataIndex: "hsn_code", 
      render: (text) => <code>{text}</code> 
    },
    { 
      title: "Quality", 
      dataIndex: "quality", 
      render: (text) => <Tag color={text === "Premium" ? "gold" : "default"}>{text}</Tag> 
    },
    { 
      title: "Shape", 
      dataIndex: "shape" 
    },
    { 
      title: "Colour", 
      dataIndex: "colour",
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              backgroundColor: text?.toLowerCase() || '#ccc',
              border: '1px solid #d9d9d9'
            }} 
          />
          {text}
        </div>
      )
    },
    { 
      title: "Actions", 
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => openModal('view', record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => openModal('edit', record)} />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  // Form Modal Component
  const FormModal = ({ show, onClose, isEdit, title }) => (
    <Modal 
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", background: "#1890ff",
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
        {/* Image Upload */}
        <Card title="Product Images" size="small" style={{ marginBottom: "16px" }}>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: "36px", color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text">Click or drag files to upload images</p>
          </Dragger>
        </Card>

        {/* Basic Information */}
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
                  {state.categories.map(category => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
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
                  {state.materials.map(material => (
                    <Select.Option key={material.id} value={material.id}>
                      {material.name}
                    </Select.Option>
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

        {/* Form Actions */}
        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={state.loading}>
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

  // Card View Component
  const CardView = ({ data }) => (
    <Row gutter={[16, 16]}>
      {data.map(item => (
        <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
          <Card 
            hoverable 
            cover={
              <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#fafafa" }}>
                <Avatar src={item.images?.[0]} size={64}>
                  {item.name?.[0]?.toUpperCase()}
                </Avatar>
              </div>
            } 
            actions={[
              <EyeOutlined key="view" onClick={() => openModal('view', item)} />, 
              <EditOutlined key="edit" onClick={() => openModal('edit', item)} />, 
              <DeleteOutlined key="delete" onClick={() => handleDelete(item.id)} />
            ]}
          >
            <Card.Meta 
              title={item.name}
              description={
                <div>
                  <Tag color="blue">{getCategoryName(item.category_id)}</Tag>
                  <div><strong>Material:</strong> {getMaterialName(item.material_id)}</div>
                  <div><strong>HSN:</strong> {item.hsn_code}</div>
                  <div><strong>Quality:</strong> {item.quality}</div>
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
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>Product Management</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>Manage your product inventory</p>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <Card style={{ borderRadius: "12px" }}>
                {/* Controls */}
                <div style={{ marginBottom: "24px" }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                        Product List ({filteredData.length})
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
                          type={state.viewMode === "grid" ? "primary" : "default"} 
                          icon={<UnorderedListOutlined />} 
                          onClick={() => updateState({ viewMode: "grid" })}
                        >
                          Grid
                        </Button>
                        <Button 
                          type={state.viewMode === "card" ? "primary" : "default"} 
                          icon={<AppstoreOutlined />} 
                          onClick={() => updateState({ viewMode: "card" })}
                        >
                          Card
                        </Button>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />} 
                          onClick={() => openModal('add')}
                        >
                          Add Product
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>

                {/* Filters */}
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
                      placeholder="Filter by Category..." 
                      value={state.filterCategory} 
                      onChange={(value) => updateState({ filterCategory: value })} 
                      allowClear 
                      style={{ width: "100%" }}
                    >
                      {state.categories.map(category => 
                        <Select.Option key={category.id} value={category.id}>
                          {category.name}
                        </Select.Option>
                      )}
                    </Select>
                  </Col>
                </Row>

                {/* Data Display */}
                <Spin spinning={state.loading}>
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
      
      {/* View Modal */}
      <Modal 
        title="Product Details"
        open={state.showViewModal} 
        onCancel={closeModals} 
        footer={<Button onClick={closeModals}>Close</Button>} 
        width={700}
      >
        {state.selectedRecord && (
          <div>
            {/* Product Images */}
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
                  <p><strong>Shape:</strong> {state.selectedRecord.shape}</p>
                  <p><strong>Colour:</strong> {state.selectedRecord.colour}</p>
                  <p><strong>Specs:</strong> {state.selectedRecord.specs}</p>
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