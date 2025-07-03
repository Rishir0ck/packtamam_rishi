import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Tag, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [savedDiscounts, setSavedDiscounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
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
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700', buttonSuccess: 'bg-green-600 hover:bg-green-700',
    buttonDanger: 'bg-red-600 hover:bg-red-700', badge: 'bg-green-900 text-green-200'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300', select: 'bg-white border-gray-300',
    hover: 'hover:bg-gray-50', buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
    buttonSuccess: 'bg-green-600 hover:bg-green-700', buttonDanger: 'bg-red-600 hover:bg-red-700',
    badge: 'bg-green-100 text-green-800'
  };

  // Fetch data
  const fetchData = async () => {
    if (!productData?.category_id) return;
    try {
      setLoading(true);
      // Fetch subcategories
      const subCatResponse = await adminApiService.getSubCategories(productData.category_id);
      setSubcategories(subCatResponse.data.data);
      console.log(subCatResponse.data.data);
      // Extract sizes from product inventories
      const sizes = productData.inventories?.map(inv => ({
        id: inv.id,
        name: inv.size || 'Standard Size',
        inventory_id: inv.id
      })) || [];
      setProductSizes(sizes);
      
      // Fetch existing discounts for this product
      await fetchDiscounts();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // API calls
  const fetchDiscounts = async () => {
    try {
      // Replace with actual API call when ready
      // const response = await adminApiService.getProductDiscounts(productData.id);
      // setSavedDiscounts(response.data.discounts || []);
      
      // For now, using mock data
      setSavedDiscounts([]);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  const saveDiscount = async () => {
    if (!selectedSubcategory || !selectedSize || !discountValue) {
      alert('Please fill all fields');
      return;
    }

    const discountData = {
      product_id: productData.id,
      subcategory_id: selectedSubcategory,
      size_id: selectedSize,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      created_at: new Date().toISOString()
    };

    try {
      setLoading(true);
      if (editingId) {
        // Update existing discount
        // await adminApiService.updateProductDiscount(editingId, discountData);
        setSavedDiscounts(prev => prev.map(d => d.id === editingId ? {...discountData, id: editingId} : d));
        console.log('Discount updated:', discountData);
      } else {
        // Create new discount
        // const response = await adminApiService.createProductDiscount(discountData);
        // setSavedDiscounts(prev => [...prev, response.data.discount]);
        setSavedDiscounts(prev => [...prev, {...discountData, id: Date.now()}]);
        console.log('Discount created:', discountData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('Error saving discount');
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

  // Form handlers
  const resetForm = () => {
    setSelectedSubcategory('');
    setSelectedSize('');
    setDiscountValue('');
    setDiscountType('percentage');
    setEditingId(null);
  };

  const handleEdit = (discount) => {
    setSelectedSubcategory(discount.subcategory_id);
    setSelectedSize(discount.size_id);
    setDiscountValue(discount.discount_value);
    setDiscountType(discount.discount_type);
    setEditingId(discount.id);
  };

  // Get display names
  const getSubcategoryName = (id) => subcategories.find(s => s.id.toString() === id.toString())?.name || 'Unknown';
  const getSizeName = (id) => productSizes.find(s => s.id.toString() === id.toString())?.name || 'Unknown';

  // Pagination
  const totalPages = Math.ceil(savedDiscounts.length / itemsPerPage);
  const paginatedDiscounts = savedDiscounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                <Tag size={24} className="text-blue-600" />
                <div>
                  <h1 className={`text-xl font-bold ${theme.text}`}>
                    Discount Management
                  </h1>
                  <p className={`text-sm ${theme.muted}`}>
                    Product: {productData.name}
                  </p>
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${theme.badge}`}>
              {savedDiscounts.length} Discounts
            </div>
          </div>
        </div>

        {/* Discount Form */}
        <div className={`p-6 border-b ${theme.border}`}>
          <h2 className={`text-lg font-semibold ${theme.text} mb-4`}>
            {editingId ? 'Edit Discount' : 'Add New Discount'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subcategory Select */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                Subcategory
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.select}`}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Select */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.select}`}
              >
                <option value="">Select Size</option>
                {productSizes.map(size => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount Type */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.select}`}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                Discount Value
              </label>
              <input
                type="number"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '0.00' : '0.00'}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={saveDiscount}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${theme.buttonSuccess}`}
            >
              <Plus size={16} className="inline mr-2" />
              {editingId ? 'Update Discount' : 'Add Discount'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className={`px-4 py-2 border rounded-lg transition-colors ${theme.text} ${theme.border} ${theme.hover}`}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Discounts List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme.text}`}>
              Active Discounts
            </h3>
            {savedDiscounts.length > 0 && (
              <span className={`text-sm ${theme.muted}`}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, savedDiscounts.length)} of {savedDiscounts.length} discounts
              </span>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className={`mt-2 ${theme.muted}`}>Loading...</p>
            </div>
          )}

          {!loading && savedDiscounts.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className={`mx-auto ${theme.muted} mb-4`} />
              <p className={`text-lg ${theme.muted}`}>No discounts added yet</p>
              <p className={`text-sm ${theme.muted} mt-2`}>
                Create your first discount using the form above
              </p>
            </div>
          )}

          {!loading && paginatedDiscounts.length > 0 && (
            <div className="space-y-4">
              {paginatedDiscounts.map(discount => (
                <div key={discount.id} className={`p-4 border rounded-lg ${theme.border} ${theme.hover}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className={`font-medium ${theme.text}`}>
                            {getSubcategoryName(discount.subcategory_id)}
                          </h4>
                          <p className={`text-sm ${theme.muted}`}>
                            Size: {getSizeName(discount.size_id)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${theme.text}`}>
                            {discount.discount_type === 'percentage' 
                              ? `${discount.discount_value}%` 
                              : `₹${discount.discount_value}`}
                          </div>
                          <p className={`text-xs ${theme.muted}`}>
                            {discount.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(discount)}
                        className={`p-2 rounded-lg ${theme.hover} transition-colors`}
                        title="Edit discount"
                      >
                        <Edit2 size={16} className={theme.text} />
                      </button>
                      <button
                        onClick={() => deleteDiscount(discount.id)}
                        className={`p-2 rounded-lg hover:bg-red-50 transition-colors`}
                        title="Delete discount"
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