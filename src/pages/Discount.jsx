import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Tag, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import adminApiService from '../Firebase/services/adminApiService';

export default function Discount() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const productData = location.state?.editData;

  // State management
  const [subcategories, setSubcategories] = useState([]);
  const [productSizes, setProductSizes] = useState([]);
  const [productSubcategories, setProductSubcategories] = useState([]);
  const [activeTab, setActiveTab] = useState('discount'); // 'discount' or 'subcategory'
  
  // Discount form states
  const [selectedSize, setSelectedSize] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [savedDiscounts, setSavedDiscounts] = useState([]);
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  
  // Subcategory form states
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Redirect if no product data
  useEffect(() => {
    if (!productData) {
      navigate('/inventory-management');
      return;
    }
    fetchData();
  }, [productData, navigate]);

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', muted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white',
    select: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700', buttonSuccess: 'bg-[#c79e73]',
    buttonDanger: 'bg-red-600 hover:bg-red-700', badge: 'bg-green-900 text-green-200',
    tab: 'bg-gray-700 border-gray-600', tabActive: 'bg-[#c79e73] text-white'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300', select: 'bg-white border-gray-300',
    hover: 'hover:bg-gray-50', buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
    buttonSuccess: 'bg-[#c79e73]', buttonDanger: 'bg-red-600 hover:bg-red-700',
    badge: 'bg-green-100 text-green-800', tab: 'bg-gray-100 border-gray-300',
    tabActive: 'bg-[#c79e73] text-white'
  };

  // Fetch data
  const fetchData = async () => {
    if (!productData?.category_id) return;
    try {
      setLoading(true);
      
      // Fetch available subcategories
      const subCatResponse = await adminApiService.getSubCategories(productData.category_id);
      setSubcategories(subCatResponse.data.data);
      
      // Extract sizes from product inventories
      const sizes = productData.inventories?.map(inv => ({
        id: inv.id,
        name: inv.size || 'Standard Size',
        inventory_id: inv.id
      })) || [];
      setProductSizes(sizes);
      
      // Fetch existing discounts and subcategories for this product
      await Promise.all([fetchDiscounts(), fetchProductSubcategories()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // API calls
  const fetchDiscounts = async () => {
    try {
      // Replace with actual API call
      // const response = await adminApiService.getProductDiscounts(productData.id);
      // setSavedDiscounts(response.data.discounts || []);
      setSavedDiscounts([]);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  const fetchProductSubcategories = async () => {
    try {
      // Replace with actual API call
      // const response = await adminApiService.getProductSubcategories(productData.id);
      // setProductSubcategories(response.data.subcategories || []);
      setProductSubcategories([]);
    } catch (error) {
      console.error('Error fetching product subcategories:', error);
    }
  };

  const saveDiscount = async () => {
    if (!selectedSize || !discountValue) {
      alert('Please fill all fields');
      return;
    }

    const discountData = {
      product_id: productData.id,
      size_id: selectedSize,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      created_at: new Date().toISOString()
    };

    try {
      setLoading(true);
      if (editingDiscountId) {
        // Update existing discount
        // await adminApiService.updateProductDiscount(editingDiscountId, discountData);
        setSavedDiscounts(prev => prev.map(d => d.id === editingDiscountId ? {...discountData, id: editingDiscountId} : d));
        console.log('Discount updated:', discountData);
      } else {
        // Create new discount
        // const response = await adminApiService.createProductDiscount(discountData);
        setSavedDiscounts(prev => [...prev, {...discountData, id: Date.now()}]);
        console.log('Discount created:', discountData);
      }
      resetDiscountForm();
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('Error saving discount');
    } finally {
      setLoading(false);
    }
  };

  const saveSubcategory = async () => {
    if (!selectedSubcategory) {
      alert('Please select a subcategory');
      return;
    }

    const subcategoryData = {
      product_id: productData.id,
      subcategory_id: selectedSubcategory,
      created_at: new Date().toISOString()
    };

    try {
      setLoading(true);
      if (editingSubcategoryId) {
        // Update existing subcategory assignment
        // await adminApiService.updateProductSubcategory(editingSubcategoryId, subcategoryData);
        setProductSubcategories(prev => prev.map(s => s.id === editingSubcategoryId ? {...subcategoryData, id: editingSubcategoryId} : s));
        console.log('Subcategory updated:', subcategoryData);
      } else {
        // Create new subcategory assignment
        // const response = await adminApiService.assignProductSubcategory(subcategoryData);
        setProductSubcategories(prev => [...prev, {...subcategoryData, id: Date.now()}]);
        console.log('Subcategory assigned:', subcategoryData);
      }
      resetSubcategoryForm();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Error saving subcategory');
    } finally {
      setLoading(false);
    }
  };

  const deleteDiscount = async (id) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;
    try {
      // await adminApiService.deleteProductDiscount(id);
      setSavedDiscounts(prev => prev.filter(d => d.id !== id));
      console.log('Discount deleted:', id);
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const deleteSubcategory = async (id) => {
    if (!confirm('Are you sure you want to remove this subcategory?')) return;
    try {
      // await adminApiService.removeProductSubcategory(id);
      setProductSubcategories(prev => prev.filter(s => s.id !== id));
      console.log('Subcategory removed:', id);
    } catch (error) {
      console.error('Error removing subcategory:', error);
    }
  };

  // Add this function after the deleteSubcategory function
  const saveAndNavigate = () => {
    const productDataWithDiscounts = {
      ...productData,
      discounts: savedDiscounts.map(discount => ({
        size_id: discount.size_id,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value
      })),
      subcategories: productSubcategories.map(sub => ({
        subcategory_id: sub.subcategory_id
      }))
    };
    
    // Navigate back to inventory management with updated data
    navigate('/inventory-management', { 
      state: { 
        productData: productDataWithDiscounts,
        fromDiscount: true 
      } 
    });
  };

  // Form handlers
  const resetDiscountForm = () => {
    setSelectedSize('');
    setDiscountValue('');
    setDiscountType('percentage');
    setEditingDiscountId(null);
  };

  const resetSubcategoryForm = () => {
    setSelectedSubcategory('');
    setEditingSubcategoryId(null);
  };

  const handleEditDiscount = (discount) => {
    setSelectedSize(discount.size_id);
    setDiscountValue(discount.discount_value);
    setDiscountType(discount.discount_type);
    setEditingDiscountId(discount.id);
  };

  const handleEditSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory.subcategory_id);
    setEditingSubcategoryId(subcategory.id);
  };

  // Get display names
  const getSubcategoryName = (id) => subcategories.find(s => s.id.toString() === id.toString())?.name || 'Unknown';
  const getSizeName = (id) => productSizes.find(s => s.id.toString() === id.toString())?.name || 'Unknown';

  // Pagination
  const currentData = activeTab === 'discount' ? savedDiscounts : productSubcategories;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!productData) return null;

  return (
    <div className={`max-w-6xl mx-auto p-4 min-h-screen ${theme.bg}`}>
      <div className={`${theme.card} rounded-lg shadow-lg`}>
        {/* Header */}
        <div className={`p-6 border-b ${theme.border}`}>
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <button
        onClick={() => navigate('/inventory-management')}
        className={`p-2 rounded-lg ${theme.hover} transition-colors`}
      >
        <ArrowLeft size={20} className={theme.text} />
      </button>
      <div className="flex items-center space-x-2">
        <Tag size={24} className="text-amber-600" />
        <div>
          <h1 className={`text-xl font-bold ${theme.text}`}>
            Product Management
          </h1>
          <p className={`text-sm ${theme.muted}`}>
            Product: {productData.name}
          </p>
        </div>
      </div>
    </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${theme.badge}`}>
        {savedDiscounts.length} Discounts | {productSubcategories.length} Subcategories
      </div>
  </div>
</div>

        {/* Tabs */}
        <div className={`px-6 pt-6 border-b ${theme.border}`}>
          <div className="flex space-x-1">
            <button
              onClick={() => {setActiveTab('discount'); setCurrentPage(1);}}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'discount' ? theme.tabActive : `${theme.tab} ${theme.text}`
              }`}
            >
              Add New Discount
            </button>
            <button
              onClick={() => {setActiveTab('subcategory'); setCurrentPage(1);}}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'subcategory' ? theme.tabActive : `${theme.tab} ${theme.text}`
              }`}
            >
              Add SubCategory
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className={`p-6 border-b ${theme.border}`}>
          {activeTab === 'discount' ? (
            // Discount Form
            <>
              <h2 className={`text-lg font-semibold ${theme.text} mb-4`}>
                {editingDiscountId ? 'Edit Discount' : 'Add New Discount'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${theme.select}`}
                  >
                    <option value="">Select Size</option>
                    {productSizes.map(size => (
                      <option key={size.id} value={size.id}>{size.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${theme.select}`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0.00"
                    className={`w-full p-2 border rounded-lg ${theme.input}`}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={saveDiscount}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${theme.buttonSuccess}`}
                >
                  <Plus size={16} className="inline mr-2" />
                  {editingDiscountId ? 'Update Discount' : 'Add Discount'}
                </button>
                {editingDiscountId && (
                  <button
                    onClick={resetDiscountForm}
                    className={`px-4 py-2 border rounded-lg transition-colors ${theme.text} ${theme.border} ${theme.hover}`}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            // Subcategory Form
            <>
              <h2 className={`text-lg font-semibold ${theme.text} mb-4`}>
                {editingSubcategoryId ? 'Edit Subcategory' : 'Add SubCategory'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Subcategory</label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${theme.select}`}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={saveSubcategory}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${theme.buttonSuccess}`}
                >
                  <Plus size={16} className="inline mr-2" />
                  {editingSubcategoryId ? 'Update Subcategory' : 'Add Subcategory'}
                </button>
                {editingSubcategoryId && (
                  <button
                    onClick={resetSubcategoryForm}
                    className={`px-4 py-2 border rounded-lg transition-colors ${theme.text} ${theme.border} ${theme.hover}`}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Data List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme.text}`}>
              {activeTab === 'discount' ? 'Active Discounts' : 'Assigned Subcategories'}
            </h3>
            {currentData.length > 0 && (
              <span className={`text-sm ${theme.muted}`}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} items
              </span>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <p className={`mt-2 ${theme.muted}`}>Loading...</p>
            </div>
          )}

          {!loading && currentData.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className={`mx-auto ${theme.muted} mb-4`} />
              <p className={`text-lg ${theme.muted}`}>
                No {activeTab === 'discount' ? 'discounts' : 'subcategories'} added yet
              </p>
              <p className={`text-sm ${theme.muted} mt-2`}>
                Create your first {activeTab === 'discount' ? 'discount' : 'subcategory assignment'} using the form above
              </p>
            </div>
          )}

          {!loading && paginatedData.length > 0 && (
            <div className="space-y-4">
              {paginatedData.map(item => (
                <div key={item.id} className={`p-4 border rounded-lg ${theme.border} ${theme.hover}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {activeTab === 'discount' ? (
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className={`font-medium ${theme.text}`}>
                              Size: {getSizeName(item.size_id)}
                            </h4>
                            <p className={`text-sm ${theme.muted}`}>
                              {item.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${theme.text}`}>
                              {item.discount_type === 'percentage' 
                                ? `${item.discount_value}%` 
                                : `₹${item.discount_value}`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className={`font-medium ${theme.text}`}>
                            {getSubcategoryName(item.subcategory_id)}
                          </h4>
                          <p className={`text-sm ${theme.muted}`}>
                            Assigned to product
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => activeTab === 'discount' ? handleEditDiscount(item) : handleEditSubcategory(item)}
                        className={`p-2 rounded-lg ${theme.hover} transition-colors`}
                        title={`Edit ${activeTab}`}
                      >
                        <Edit2 size={16} className={theme.text} />
                      </button>
                      <button
                        onClick={() => activeTab === 'discount' ? deleteDiscount(item.id) : deleteSubcategory(item.id)}
                        className={`p-2 rounded-lg hover:bg-red-50 transition-colors`}
                        title={`Delete ${activeTab}`}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 ${theme.text} ${theme.border} ${theme.hover}`}
              >
                <ChevronLeft size={16} className="mr-2" />
                Previous
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === page 
                        ? `${theme.buttonPrimary} text-white` 
                        : `${theme.text} ${theme.hover}`
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 ${theme.text} ${theme.border} ${theme.hover}`}
              >
                Next
                <ChevronRight size={16} className="ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}