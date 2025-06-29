import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, Tag, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Package, Clock, Info, Moon, Sun } from 'lucide-react';
import useTheme from '../hooks/useTheme';

export default function Discount() {
  const { isDark } = useTheme();
  
  const [products] = useState([
    { id: 1, name: 'Laptop Pro 15"', category: 'Electronics', brand: 'TechBrand', price: 75000, sku: 'LP-001' },
    { id: 2, name: 'Wireless Headphones', category: 'Electronics', brand: 'AudioMax', price: 8500, sku: 'WH-002' },
    { id: 3, name: 'Coffee Maker', category: 'Appliances', brand: 'BrewMaster', price: 12000, sku: 'CM-003' },
    { id: 4, name: 'Gaming Chair', category: 'Furniture', brand: 'ComfortPlus', price: 25000, sku: 'GC-004' },
    { id: 5, name: 'Smartphone X', category: 'Electronics', brand: 'MobileTech', price: 45000, sku: 'SP-005' }
  ]);
  
  const [subcategories, setSubcategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [discountSlabs, setDiscountSlabs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [savedDiscounts, setSavedDiscounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    minAmount: '', 
    maxAmount: '', 
    discountType: 'percentage', 
    discountValue: '', 
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isTimeSpecific: false
  });

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900',
    card: 'bg-gray-800',
    text: 'text-white',
    muted: 'text-gray-300',
    border: 'border-gray-700',
    input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    select: 'bg-gray-700 border-gray-600 text-white',
    hover: 'hover:bg-gray-700',
    hoverLight: 'hover:bg-gray-600',
    tableHeader: 'bg-gray-700',
    tableRow: 'hover:bg-gray-750',
    formBg: 'bg-gray-750',
    infoBg: 'bg-blue-900 border-blue-800',
    infoText: 'text-blue-200',
    infoIcon: 'text-blue-400',
    slabBg: 'bg-gray-700 border-gray-600',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: 'bg-gray-600 hover:bg-gray-700',
    buttonSuccess: 'bg-green-600 hover:bg-green-700',
    buttonDanger: 'bg-red-600 hover:bg-red-700',
    badge: 'bg-green-900 text-green-200',
    badgeBlue: 'bg-blue-900 text-blue-200'
  } : {
    bg: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-600',
    border: 'border-gray-200',
    input: 'bg-white border-gray-300 placeholder-gray-500',
    select: 'bg-white border-gray-300',
    hover: 'hover:bg-gray-50',
    hoverLight: 'hover:bg-gray-100',
    tableHeader: 'bg-gray-50',
    tableRow: 'hover:bg-gray-50',
    formBg: 'bg-gray-50',
    infoBg: 'bg-blue-50 border-blue-200',
    infoText: 'text-blue-900',
    infoIcon: 'text-blue-600',
    slabBg: 'bg-white border-gray-200',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: 'bg-gray-600 hover:bg-gray-700',
    buttonSuccess: 'bg-green-600 hover:bg-green-700',
    buttonDanger: 'bg-red-600 hover:bg-red-700',
    badge: 'bg-green-100 text-green-800',
    badgeBlue: 'bg-blue-100 text-blue-800'
  };

  // Mock API call for subcategories
  const fetchSubcategories = async (category) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subcategoryMap = {
      'Electronics': ['Laptops', 'Smartphones', 'Audio', 'Gaming', 'Accessories'],
      'Appliances': ['Kitchen', 'Home', 'Personal Care', 'Cleaning'],
      'Furniture': ['Office', 'Living Room', 'Bedroom', 'Storage']
    };
    
    return subcategoryMap[category] || [];
  };

  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.id.toString() === selectedProduct);
      if (product) {
        fetchSubcategories(product.category).then(subs => {
          setSubcategories(subs);
          setSelectedSubcategory('');
        });
      }
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedProduct, products]);

  const handleSlabSubmit = () => {
    if (!formData.minAmount || !formData.discountValue || !formData.startDate || !formData.endDate) return;

    const newSlab = {
      ...formData,
      minAmount: parseFloat(formData.minAmount),
      maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
      discountValue: parseFloat(formData.discountValue),
      id: Date.now()
    };

    if (editingIndex >= 0) {
      setDiscountSlabs(prev => prev.map((slab, idx) => idx === editingIndex ? newSlab : slab));
      setEditingIndex(-1);
    } else {
      setDiscountSlabs(prev => [...prev, newSlab]);
    }

    setFormData({ 
      minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '', description: '',
      startDate: '', endDate: '', startTime: '', endTime: '', isTimeSpecific: false
    });
    setShowForm(false);
  };

  const handleEdit = (index) => {
    setFormData(discountSlabs[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    setDiscountSlabs(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveDiscount = () => {
    if (!selectedProduct || !selectedSubcategory || discountSlabs.length === 0) return;

    const product = products.find(p => p.id.toString() === selectedProduct);
    const newDiscount = {
      id: Date.now(),
      product: product,
      subcategory: selectedSubcategory,
      slabs: [...discountSlabs],
      createdAt: new Date().toISOString(),
      slabCount: discountSlabs.length
    };

    setSavedDiscounts(prev => [...prev, newDiscount]);
    setSelectedProduct('');
    setSelectedSubcategory('');
    setDiscountSlabs([]);
    setShowForm(false);
  };

  const sortedDiscounts = useMemo(() => {
    return [...savedDiscounts].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortField === 'productName') {
        aVal = a.product.name;
        bVal = b.product.name;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [savedDiscounts, sortField, sortDirection]);

  const paginatedDiscounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedDiscounts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDiscounts, currentPage]);

  const totalPages = Math.ceil(savedDiscounts.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'Not set';
    const dateStr = new Date(date).toLocaleDateString();
    return time ? `${dateStr} ${time}` : dateStr;
  };

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct);

  return (
    <div className={`max-w-7xl mx-auto p-4 min-h-screen ${theme.bg}`}>
      <div className={`${theme.card} rounded-lg shadow-sm border ${theme.border}`}>
        <div className={`border-b ${theme.border} px-4 py-3`}>
          <div className="flex justify-between items-center">
            <h1 className={`text-xl font-bold ${theme.text} flex items-center gap-2`}>
              <Tag className="w-5 h-5 text-blue-600" />
              Product Discount Management
            </h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Product Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-1`}>Product *</label>
              <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.select}`}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₹{product.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-1`}>Subcategory *</label>
              <select 
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!selectedProduct}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.select} disabled:opacity-50`}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Details */}
          {selectedProductData && (
            <div className={`${theme.infoBg} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Package className={`w-5 h-5 ${theme.infoIcon}`} />
                <h3 className={`text-lg font-semibold ${theme.infoText}`}>Product Information</h3>
                <Info className={`w-4 h-4 ${theme.infoIcon}`} />
              </div>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${theme.muted}`}>Name:</span>
                  <p className={theme.text}>{selectedProductData.name}</p>
                </div>
                <div>
                  <span className={`font-medium ${theme.muted}`}>Category:</span>
                  <p className={theme.text}>{selectedProductData.category}</p>
                </div>
                <div>
                  <span className={`font-medium ${theme.muted}`}>Brand:</span>
                  <p className={theme.text}>{selectedProductData.brand}</p>
                </div>
                <div>
                  <span className={`font-medium ${theme.muted}`}>SKU:</span>
                  <p className={theme.text}>{selectedProductData.sku}</p>
                </div>
              </div>
            </div>
          )}

          {/* Discount Slabs */}
          {selectedProduct && selectedSubcategory && (
            <div className={`border ${theme.border} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <h3 className={`text-lg font-semibold ${theme.text}`}>Time-Based Discount Slabs</h3>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className={`${theme.buttonPrimary} text-white px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors`}
                >
                  <Plus className="w-4 h-4" />Add Slab
                </button>
              </div>

              {showForm && (
                <div className={`${theme.formBg} p-4 rounded mb-4 space-y-3 border ${theme.border}`}>
                  <div className="grid md:grid-cols-4 gap-3">
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData(prev => ({...prev, minAmount: e.target.value}))}
                      className={`px-3 py-2 text-sm border rounded ${theme.input}`}
                      placeholder="Min Amount *"
                    />
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData(prev => ({...prev, maxAmount: e.target.value}))}
                      className={`px-3 py-2 text-sm border rounded ${theme.input}`}
                      placeholder="Max Amount"
                    />
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({...prev, discountType: e.target.value}))}
                      className={`px-3 py-2 text-sm border rounded ${theme.select}`}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({...prev, discountValue: e.target.value}))}
                      className={`px-3 py-2 text-sm border rounded ${theme.input}`}
                      placeholder="Discount Value *"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium ${theme.text} mb-1`}>Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                        className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${theme.text} mb-1`}>End Date *</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                        className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isTimeSpecific}
                        onChange={(e) => setFormData(prev => ({...prev, isTimeSpecific: e.target.checked}))}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className={`text-sm font-medium ${theme.text}`}>Set Specific Time</span>
                    </label>
                  </div>

                  {formData.isTimeSpecific && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium ${theme.text} mb-1`}>Start Time</label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData(prev => ({...prev, startTime: e.target.value}))}
                          className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium ${theme.text} mb-1`}>End Time</label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({...prev, endTime: e.target.value}))}
                          className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                      placeholder="Description (optional)"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingIndex(-1);
                        setFormData({ 
                          minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '', description: '',
                          startDate: '', endDate: '', startTime: '', endTime: '', isTimeSpecific: false
                        });
                      }}
                      className={`px-4 py-2 ${theme.muted} ${theme.hover} rounded border ${theme.border} transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSlabSubmit}
                      className={`px-4 py-2 ${theme.buttonSuccess} text-white rounded transition-colors`}
                    >
                      {editingIndex >= 0 ? 'Update Slab' : 'Add Slab'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {discountSlabs.map((slab, index) => (
                  <div key={slab.id} className={`${theme.slabBg} border rounded-lg p-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`font-medium ${theme.text}`}>
                          ₹{slab.minAmount}{slab.maxAmount ? ` - ₹${slab.maxAmount}` : '+'}
                        </span>
                        <span className={`${theme.badge} px-2 py-1 rounded text-sm`}>
                          {slab.discountValue}{slab.discountType === 'percentage' ? '%' : '₹'} OFF
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEdit(index)} 
                          className={`p-1 text-blue-600 ${theme.hover} rounded transition-colors`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(index)} 
                          className={`p-1 text-red-600 ${theme.hover} rounded transition-colors`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`mt-2 text-sm ${theme.muted} space-y-1`}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Period: {formatDateTime(slab.startDate, slab.startTime)} to {formatDateTime(slab.endDate, slab.endTime)}</span>
                      </div>
                      {slab.description && (
                        <div className={theme.muted}>{slab.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {discountSlabs.length > 0 && (
                <button
                  onClick={handleSaveDiscount}
                  className={`w-full mt-4 ${theme.buttonSuccess} text-white py-3 rounded font-medium transition-colors`}
                >
                  Save Discount Configuration
                </button>
              )}
            </div>
          )}

          {/* Saved Discounts Table */}
          {savedDiscounts.length > 0 && (
            <div className={`border ${theme.border} rounded-lg overflow-hidden`}>
              <div className={`${theme.formBg} px-4 py-3 border-b ${theme.border}`}>
                <h3 className={`text-lg font-semibold ${theme.text}`}>Saved Discount Configurations</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${theme.tableHeader} border-b ${theme.border}`}>
                    <tr>
                      <th 
                        className={`px-4 py-3 text-left text-sm font-medium ${theme.text} cursor-pointer ${theme.hoverLight}`}
                        onClick={() => handleSort('productName')}
                      >
                        <div className="flex items-center gap-1">
                          Product <SortIcon field="productName" />
                        </div>
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme.text}`}>Subcategory</th>
                      <th 
                        className={`px-4 py-3 text-left text-sm font-medium ${theme.text} cursor-pointer ${theme.hoverLight}`}
                        onClick={() => handleSort('slabCount')}
                      >
                        <div className="flex items-center gap-1">
                          Slabs <SortIcon field="slabCount" />
                        </div>
                      </th>
                      <th 
                        className={`px-4 py-3 text-left text-sm font-medium ${theme.text} cursor-pointer ${theme.hoverLight}`}
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Created <SortIcon field="createdAt" />
                        </div>
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium ${theme.text}`}>Discount Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDiscounts.map(discount => (
                      <tr key={discount.id} className={`border-b ${theme.border} ${theme.tableRow}`}>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`font-medium text-sm ${theme.text}`}>{discount.product.name}</div>
                            <div className={`text-xs ${theme.muted}`}>{discount.product.sku}</div>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>{discount.subcategory}</td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>{discount.slabs.length}</td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>{new Date(discount.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {discount.slabs.map((slab, idx) => (
                              <div key={idx} className="text-xs">
                                <span className={`${theme.badgeBlue} px-2 py-1 rounded mr-2`}>
                                  ₹{slab.minAmount}{slab.maxAmount ? `-₹${slab.maxAmount}` : '+'}: {slab.discountValue}{slab.discountType === 'percentage' ? '%' : '₹'}
                                </span>
                                <div className={`${theme.muted} mt-1`}>
                                  {formatDateTime(slab.startDate, slab.startTime)} to {formatDateTime(slab.endDate, slab.endTime)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`${theme.formBg} px-4 py-3 border-t ${theme.border} flex items-center justify-between`}>
                  <div className={`text-sm ${theme.muted}`}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, savedDiscounts.length)} of {savedDiscounts.length} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded border ${theme.border} disabled:opacity-50 ${theme.hover} transition-colors`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm rounded border ${theme.border} transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : theme.hover}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded border ${theme.border} disabled:opacity-50 ${theme.hover} transition-colors`}
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