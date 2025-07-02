import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, Tag, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Package, Clock, ArrowLeft } from 'lucide-react';
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
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [discountSlabs, setDiscountSlabs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [savedDiscounts, setSavedDiscounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '', 
    description: '', startDate: '', endDate: '', startTime: '', endTime: '', isTimeSpecific: false
  });

  // Redirect if no product data
  useEffect(() => {
    if (!productData) {
      navigate('/product');
      return;
    }
  }, [productData, navigate]);

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', muted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    select: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700',
    tableHeader: 'bg-gray-700', formBg: 'bg-gray-750', infoBg: 'bg-blue-900 border-blue-800',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700', buttonSuccess: 'bg-green-600 hover:bg-green-700',
    badge: 'bg-green-900 text-green-200', badgeBlue: 'bg-blue-900 text-blue-200'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300 placeholder-gray-500',
    select: 'bg-white border-gray-300', hover: 'hover:bg-gray-50',
    tableHeader: 'bg-gray-50', formBg: 'bg-gray-50', infoBg: 'bg-blue-50 border-blue-200',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700', buttonSuccess: 'bg-green-600 hover:bg-green-700',
    badge: 'bg-green-100 text-green-800', badgeBlue: 'bg-blue-100 text-blue-800'
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    if (!productData?.category_id) return;
    try {
      setLoading(true);
      const response = await adminApiService.getSubCategories(productData.category_id);
      setSubcategories(response.data || []);
      console.log("Subcategories fetched:", response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productData) fetchSubcategories();
  }, [productData]);

  // Form handlers
  const resetForm = () => {
    setFormData({ 
      minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '', 
      description: '', startDate: '', endDate: '', startTime: '', endTime: '', isTimeSpecific: false
    });
    setShowForm(false);
    setEditingIndex(-1);
  };

  const handleSlabSubmit = () => {
    if (!formData.minAmount || !formData.discountValue || !formData.startDate || !formData.endDate) return;

    const newSlab = {
      ...formData,
      minAmount: parseFloat(formData.minAmount),
      maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
      discountValue: parseFloat(formData.discountValue),
      id: Date.now()
    };

    setDiscountSlabs(prev => editingIndex >= 0 
      ? prev.map((slab, idx) => idx === editingIndex ? newSlab : slab)
      : [...prev, newSlab]
    );
    resetForm();
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
    if (!selectedSubcategory || discountSlabs.length === 0) return;

    const subcategory = subcategories.find(s => s.id.toString() === selectedSubcategory);
    
    const newDiscount = {
      id: Date.now(),
      product: productData,
      subcategory,
      slabs: [...discountSlabs],
      createdAt: new Date().toISOString(),
      slabCount: discountSlabs.length
    };

    setSavedDiscounts(prev => [...prev, newDiscount]);
    setSelectedSubcategory('');
    setDiscountSlabs([]);
    resetForm();
  };

  // Sorting and pagination
  const sortedDiscounts = useMemo(() => {
    return [...savedDiscounts].sort((a, b) => {
      let aVal = sortField === 'createdAt' ? new Date(a[sortField]) 
                : sortField === 'productName' ? a.product.name 
                : a[sortField];
      let bVal = sortField === 'createdAt' ? new Date(b[sortField]) 
                : sortField === 'productName' ? b.product.name 
                : b[sortField];
      
      return sortDirection === 'asc' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
    });
  }, [savedDiscounts, sortField, sortDirection]);

  const paginatedDiscounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedDiscounts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDiscounts, currentPage]);

  const totalPages = Math.ceil(savedDiscounts.length / itemsPerPage);

  const handleSort = (field) => {
    setSortDirection(sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortField(field);
    setCurrentPage(1);
  };

  const SortIcon = ({ field }) => sortField === field ? 
    (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />) : null;

  const formatDateTime = (date, time) => {
    if (!date) return 'Not set';
    const dateStr = new Date(date).toLocaleDateString();
    return time ? `${dateStr} ${time}` : dateStr;
  };

  if (!productData) return null;

  return (
    <div className={`max-w-7xl mx-auto p-4 min-h-screen ${theme.bg}`}>
      <div
        className={`${theme.card} rounded-lg shadow-sm border ${theme.border}`}
      >
        {/* Header */}
        <div className={`border-b ${theme.border} px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/inventory-management")}
                className={`p-2 rounded-lg ${theme.hover} transition-colors`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1
                  className={`text-xl font-bold ${theme.text} flex items-center gap-2`}
                >
                  <Tag className="w-5 h-5 text-blue-600" />
                  Product Discount Management
                </h1>
                <p className={`text-sm ${theme.muted}`}>
                  Configure discounts for {productData.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Product Details */}
          <div className={`${theme.infoBg} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                Product Information
              </h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className={`font-medium ${theme.muted}`}>Name:</span>
                <p className={theme.text}>{productData.name || "N/A"}</p>
              </div>
              <div>
                <span className={`font-medium ${theme.muted}`}>Category:</span>
                <p className={theme.text}>
                  {productData.category?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className={`font-medium ${theme.muted}`}>Material:</span>
                <p className={theme.text}>
                  {productData.material?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className={`font-medium ${theme.muted}`}>HSN:</span>
                <p className={theme.text}>{productData.hsn_code || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Subcategory Selection */}
          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-1`}>
              Subcategory *
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={loading}
              className={`w-full max-w-md px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.select} disabled:opacity-50`}
            >
              <option value="">
                {loading ? "Loading subcategories..." : "Select Subcategory"}
              </option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Discount Slabs */}
          {selectedSubcategory && (
            <div className={`border ${theme.border} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <h3 className={`text-lg font-semibold ${theme.text}`}>
                    Time-Based Discount Slabs
                  </h3>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className={`${theme.buttonPrimary} text-white px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors`}
                >
                  <Plus className="w-4 h-4" />
                  Add Slab
                </button>
              </div>

              {showForm && (
                <div
                  className={`${theme.formBg} p-4 rounded mb-4 space-y-3 border ${theme.border}`}
                >
                  <div className="grid md:grid-cols-4 gap-3">
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minAmount: e.target.value,
                        }))
                      }
                      className={`px-3 py-2 text-sm border rounded ${theme.input}`}
                      placeholder="Min Amount *"
                    />
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxAmount: e.target.value,
                        }))
                      }
                      className={`px-3 py-2 text-sm border rounded ${theme.input}`}
                      placeholder="Max Amount"
                    />
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountType: e.target.value,
                        }))
                      }
                      className={`px-3 py-2 text-sm border rounded ${theme.select}`}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountValue: e.target.value,
                        }))
                      }
                      className={`px-3 py-2 text-sm border rounded ${theme.input}`}
                      placeholder="Discount Value *"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`block text-xs font-medium ${theme.text} mb-1`}
                      >
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-medium ${theme.text} mb-1`}
                      >
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isTimeSpecific}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isTimeSpecific: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className={`text-sm font-medium ${theme.text}`}>
                        Set Specific Time
                      </span>
                    </label>
                  </div>

                  {formData.isTimeSpecific && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label
                          className={`block text-xs font-medium ${theme.text} mb-1`}
                        >
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-medium ${theme.text} mb-1`}
                        >
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                        />
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                    placeholder="Description (optional)"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={resetForm}
                      className={`px-4 py-2 ${theme.muted} ${theme.hover} rounded border ${theme.border} transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSlabSubmit}
                      className={`px-4 py-2 ${theme.buttonSuccess} text-white rounded transition-colors`}
                    >
                      {editingIndex >= 0 ? "Update Slab" : "Add Slab"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {discountSlabs.map((slab, index) => (
                  <div
                    key={slab.id}
                    className={`${theme.card} border ${theme.border} rounded-lg p-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`font-medium ${theme.text}`}>
                          ₹{slab.minAmount}
                          {slab.maxAmount ? ` - ₹${slab.maxAmount}` : "+"}
                        </span>
                        <span
                          className={`${theme.badge} px-2 py-1 rounded text-sm`}
                        >
                          {slab.discountValue}
                          {slab.discountType === "percentage" ? "%" : "₹"} OFF
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
                        <span>
                          Period:{" "}
                          {formatDateTime(slab.startDate, slab.startTime)} to{" "}
                          {formatDateTime(slab.endDate, slab.endTime)}
                        </span>
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
            <div
              className={`border ${theme.border} rounded-lg overflow-hidden`}
            >
              <div
                className={`${theme.formBg} px-4 py-3 border-b ${theme.border}`}
              >
                <h3 className={`text-lg font-semibold ${theme.text}`}>
                  Saved Discount Configurations
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${theme.tableHeader} border-b ${theme.border}`}
                  >
                    <tr>
                      {[
                        {
                          field: "subcategory",
                          label: "Subcategory",
                          sortable: false,
                        },
                        { field: "slabCount", label: "Slabs" },
                        { field: "createdAt", label: "Created" },
                        {
                          field: "details",
                          label: "Discount Details",
                          sortable: false,
                        },
                      ].map(({ field, label, sortable = true }) => (
                        <th
                          key={field}
                          className={`px-4 py-3 text-left text-sm font-medium ${
                            theme.text
                          } ${sortable ? `cursor-pointer ${theme.hover}` : ""}`}
                          onClick={
                            sortable ? () => handleSort(field) : undefined
                          }
                        >
                          <div className="flex items-center gap-1">
                            {label} {sortable && <SortIcon field={field} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDiscounts.map((discount) => (
                      <tr
                        key={discount.id}
                        className={`border-b ${theme.border} ${theme.hover}`}
                      >
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>
                          {discount.subcategory?.name || "N/A"}
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>
                          {discount.slabs.length}
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>
                          {new Date(discount.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {discount.slabs.map((slab, idx) => (
                              <div key={idx} className="text-xs">
                                <span
                                  className={`${theme.badgeBlue} px-2 py-1 rounded mr-2`}
                                >
                                  ₹{slab.minAmount}
                                  {slab.maxAmount ? `-₹${slab.maxAmount}` : "+"}
                                  : {slab.discountValue}
                                  {slab.discountType === "percentage"
                                    ? "%"
                                    : "₹"}
                                </span>
                                <div className={`${theme.muted} mt-1`}>
                                  {formatDateTime(
                                    slab.startDate,
                                    slab.startTime
                                  )}{" "}
                                  to{" "}
                                  {formatDateTime(slab.endDate, slab.endTime)}
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
                <div
                  className={`${theme.formBg} px-4 py-3 border-t ${theme.border} flex items-center justify-between`}
                >
                  <div className={`text-sm ${theme.muted}`}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      savedDiscounts.length
                    )}{" "}
                    of {savedDiscounts.length} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`p-2 rounded border ${theme.border} disabled:opacity-50 ${theme.hover} transition-colors`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm rounded border ${
                            theme.border
                          } transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : theme.hover
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
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