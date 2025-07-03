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
      navigate('/product');
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
      setSubcategories(subCatResponse.data.data.subcategories || []);
      console.log(subCatResponse.data.data.subcategories);
      // Extract sizes from product data (assuming sizes are in productData.sizes array)
      setProductSizes(productData.sizes || []);
      
      // Fetch existing discounts
      await fetchDiscounts();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // API calls (ready for integration)
  const fetchDiscounts = async () => {
    try {
      // Replace with actual API call
      // const response = await adminApiService.getProductDiscounts(productData.id);
      // setSavedDiscounts(response.data.discounts || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  const saveDiscount = async () => {
    if (!selectedSubcategory || !selectedSize || !discountValue) return;

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
      } else {
        // Create new discount
        // const response = await adminApiService.createProductDiscount(discountData);
        // setSavedDiscounts(prev => [...prev, response.data.discount]);
        setSavedDiscounts(prev => [...prev, {...discountData, id: Date.now()}]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving discount:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDiscount = async (id) => {
    try {
      // await adminApiService.deleteProductDiscount(id);
      setSavedDiscounts(prev => prev.filter(d => d.id !== id));
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
      <div className={`${theme.card} rounded-lg shadow-sm border ${theme.border}`}>
        
        {/* Header */}
        <div className={`border-b ${theme.border} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/inventory-management")} className={`p-2 rounded-lg ${theme.hover}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-xl font-bold ${theme.text} flex items-center gap-2`}>
                <Tag className="w-5 h-5 text-blue-600" />
                Product Discount Management
              </h1>
              <p className={`text-sm ${theme.muted}`}>Configure discounts for {productData.name}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Product Info */}
          <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className={`font-semibold ${theme.text}`}>Product: {productData.name}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className={`font-medium ${theme.muted}`}>Category:</span> {productData.category?.name || 'N/A'}</div>
              <div><span className={`font-medium ${theme.muted}`}>Material:</span> {productData.material?.name || 'N/A'}</div>
              <div><span className={`font-medium ${theme.muted}`}>HSN:</span> {productData.hsn_code || 'N/A'}</div>
              <div><span className={`font-medium ${theme.muted}`}>Available Sizes:</span> {productSizes.length}</div>
            </div>
          </div>

          {/* Discount Form */}
          <div className={`border ${theme.border} rounded-lg p-4`}>
            <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
              {editingId ? 'Edit Discount' : 'Add New Discount'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${theme.select}`}
                disabled={loading}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>

              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${theme.select}`}
                disabled={loading}
              >
                <option value="">Select Size</option>
                {productSizes.map(size => (
                  <option key={size.id} value={size.id}>{size.name}</option>
                ))}
              </select>

              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${theme.select}`}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>

              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${theme.input}`}
                placeholder="Discount Value"
                step="0.01"
              />

              <div className="flex gap-2">
                <button
                  onClick={saveDiscount}
                  disabled={loading || !selectedSubcategory || !selectedSize || !discountValue}
                  className={`flex-1 ${theme.buttonSuccess} text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Update' : 'Add'}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className={`px-4 py-2 border ${theme.border} rounded-lg ${theme.hover}`}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Saved Discounts */}
          {savedDiscounts.length > 0 && (
            <div className={`border ${theme.border} rounded-lg overflow-hidden`}>
              <div className={`bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b ${theme.border}`}>
                <h3 className={`font-semibold ${theme.text}`}>Saved Discounts ({savedDiscounts.length})</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`bg-gray-50 dark:bg-gray-800 border-b ${theme.border}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme.text}`}>Subcategory</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme.text}`}>Size</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme.text}`}>Discount</th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme.text}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDiscounts.map(discount => (
                      <tr key={discount.id} className={`border-b ${theme.border} ${theme.hover}`}>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>{getSubcategoryName(discount.subcategory_id)}</td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>{getSizeName(discount.size_id)}</td>
                        <td className={`px-4 py-3 text-sm`}>
                          <span className={`${theme.badge} px-2 py-1 rounded text-xs`}>
                            {discount.discount_value}{discount.discount_type === 'percentage' ? '%' : '₹'} OFF
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm`}>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(discount)}
                              className={`p-1 text-blue-600 ${theme.hover} rounded`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteDiscount(discount.id)}
                              className={`p-1 text-red-600 ${theme.hover} rounded`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t ${theme.border} flex justify-between items-center`}>
                  <span className={`text-sm ${theme.muted}`}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, savedDiscounts.length)} of {savedDiscounts.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded border ${theme.border} disabled:opacity-50 ${theme.hover}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`px-3 py-2 text-sm ${theme.text}`}>{currentPage} / {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded border ${theme.border} disabled:opacity-50 ${theme.hover}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}