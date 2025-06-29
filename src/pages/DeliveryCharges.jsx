import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, Tag, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import useTheme from '../hooks/useTheme'

export default function DeliveryCharges() {
  const [countries] = useState(Country.getAllCountries());
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [discountSlabs, setDiscountSlabs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [savedDiscounts, setSavedDiscounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 5;

  const { isDark } = useTheme();

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900',
    card: 'bg-gray-800',
    text: 'text-white',
    muted: 'text-gray-300',
    border: 'border-gray-700',
    input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    hover: 'hover:bg-gray-700',
    tableHeader: 'bg-gray-700',
    tableRow: 'hover:bg-gray-750',
    btn: 'bg-gray-700 hover:bg-gray-600 text-white',
    formBg: 'bg-gray-700',
    slabBg: 'bg-gray-700',
    isDark: true
  } : {
    bg: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-600',
    border: 'border-gray-200',
    input: 'bg-white border-gray-300 placeholder-gray-500',
    hover: 'hover:bg-gray-50',
    tableHeader: 'bg-gray-50',
    tableRow: 'hover:bg-gray-50',
    btn: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    formBg: 'bg-gray-50',
    slabBg: 'bg-white',
    isDark: false
  };

  const [formData, setFormData] = useState({
    minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '', description: ''
  });

  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry));
      setSelectedState('');
      setSelectedCities([]);
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      setCities(City.getCitiesOfState(selectedCountry, selectedState));
      setSelectedCities([]);
    }
  }, [selectedState, selectedCountry]);

  const handleCityToggle = (cityName) => {
    setSelectedCities(prev => 
      prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
    );
  };

  const handleSlabSubmit = () => {
    if (!formData.minAmount || !formData.discountValue) return;

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

    setFormData({ minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '', description: '' });
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
    if (!selectedState || selectedCities.length === 0 || discountSlabs.length === 0) return;

    const newDiscount = {
      id: Date.now(),
      country: countries.find(c => c.isoCode === selectedCountry)?.name,
      state: states.find(s => s.isoCode === selectedState)?.name,
      cities: [...selectedCities],
      slabs: [...discountSlabs],
      createdAt: new Date().toISOString(),
      slabCount: discountSlabs.length
    };

    setSavedDiscounts(prev => [...prev, newDiscount]);
    setSelectedState('');
    setSelectedCities([]);
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
    if (sortField !== field) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className={`max-w-7xl mx-auto p-4 min-h-screen ${theme.bg}`}>
      <div className={`rounded-lg shadow-sm border ${theme.card} ${theme.border}`}>
        <div className={`border-b px-4 py-3 ${theme.border}`}>
          <h1 className={`text-xl font-bold flex items-center gap-2 ${theme.text}`}>
            <Truck className="w-5 h-5 text-blue-600" />
            Delivery Charges Management
          </h1>
        </div>

        <div className="p-4 space-y-4">
          {/* Location Selection */}
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.input}`}
              >
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                State *
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.input}`}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                Cities * ({selectedCities.length} selected)
              </label>
              <div className={`border rounded-lg p-2 max-h-24 overflow-y-auto ${theme.input}`}>
                {cities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1">
                    {cities.map((city) => (
                      <label
                        key={city.name}
                        className={`flex items-center gap-1 text-xs p-1 rounded ${theme.hover}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCities.includes(city.name)}
                          onChange={() => handleCityToggle(city.name)}
                          className="w-3 h-3 text-blue-600 rounded"
                        />
                        <span className={theme.text}>{city.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className={`text-sm py-1 ${theme.muted}`}>
                    Select a state first
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discount Slabs */}
          {selectedCities.length > 0 && (
            <div className={`border rounded-lg p-3 ${theme.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-lg font-semibold ${theme.text}`}>Discount Slabs</h3>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Slab
                </button>
              </div>

              {showForm && (
                <div className={`p-3 rounded mb-3 ${theme.formBg}`}>
                  <div className="grid md:grid-cols-6 gap-2">
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minAmount: e.target.value,
                        }))
                      }
                      className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                      placeholder="Min Amount"
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
                      className={`px-2 py-1 text-sm border rounded ${theme.input}`}
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
                      className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
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
                      className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                      placeholder="Value"
                    />
                    <button
                      onClick={handleSlabSubmit}
                      className="bg-green-600 text-white py-1 text-sm rounded hover:bg-green-700"
                    >
                      {editingIndex >= 0 ? "Update" : "Add"}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingIndex(-1);
                        setFormData({
                          minAmount: "",
                          maxAmount: "",
                          discountType: "percentage",
                          discountValue: "",
                          description: "",
                        });
                      }}
                      className={`px-2 py-1 rounded ${theme.hover} ${theme.muted}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {discountSlabs.map((slab, index) => (
                  <div
                    key={slab.id}
                    className={`flex items-center justify-between p-2 border rounded text-sm ${theme.slabBg} ${theme.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${theme.text}`}>
                        ₹{slab.minAmount}
                        {slab.maxAmount ? ` - ₹${slab.maxAmount}` : "+"}
                      </span>
                      <span className="text-green-600">
                        {slab.discountValue}
                        {slab.discountType === "percentage" ? "%" : "₹"} OFF
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(index)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {discountSlabs.length > 0 && (
                <button
                  onClick={handleSaveDiscount}
                  className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium"
                >
                  Save Configuration
                </button>
              )}
            </div>
          )}

          {/* Saved Discounts Table */}
          {savedDiscounts.length > 0 && (
            <div className={`border rounded-lg overflow-hidden ${theme.border}`}>
              <div className={`px-4 py-2 border-b ${theme.tableHeader} ${theme.border}`}>
                <h3 className={`text-lg font-semibold ${theme.text}`}>Saved Configurations</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${theme.tableHeader} ${theme.border}`}>
                    <tr>
                      <th
                        className={`px-4 py-2 text-left text-sm font-medium cursor-pointer ${theme.text} ${theme.hover}`}
                        onClick={() => handleSort("state")}
                      >
                        <div className="flex items-center gap-1">
                          State <SortIcon field="state" />
                        </div>
                      </th>
                      <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>
                        Cities
                      </th>
                      <th
                        className={`px-4 py-2 text-left text-sm font-medium cursor-pointer ${theme.text} ${theme.hover}`}
                        onClick={() => handleSort("slabCount")}
                      >
                        <div className="flex items-center gap-1">
                          Slabs <SortIcon field="slabCount" />
                        </div>
                      </th>
                      <th
                        className={`px-4 py-2 text-left text-sm font-medium cursor-pointer ${theme.text} ${theme.hover}`}
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center gap-1">
                          Created <SortIcon field="createdAt" />
                        </div>
                      </th>
                      <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {paginatedDiscounts.map((discount) => (
                      <tr
                        key={discount.id}
                        className={`transition-colors ${theme.tableRow}`}
                      >
                        <td className={`px-4 py-3 text-sm font-medium ${theme.text}`}>
                          {discount.state}
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>
                          {discount.cities.slice(0, 2).join(", ")}
                          {discount.cities.length > 2 &&
                            ` +${discount.cities.length - 2}`}
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>
                          {discount.slabs.length}
                        </td>
                        <td className={`px-4 py-3 text-sm ${theme.text}`}>
                          {new Date(discount.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {discount.slabs.map((slab, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                ₹{slab.minAmount}
                                {slab.maxAmount
                                  ? `-₹${slab.maxAmount}`
                                  : "+"}: {slab.discountValue}
                                {slab.discountType === "percentage" ? "%" : "₹"}
                              </span>
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
                <div className={`px-4 py-2 border-t flex items-center justify-between ${theme.tableHeader} ${theme.border}`}>
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
                      className={`p-1 rounded border disabled:opacity-50 transition-colors ${theme.btn} ${theme.border}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 py-1 text-sm rounded border transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : `${theme.btn} ${theme.border}`
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
                      className={`p-1 rounded border disabled:opacity-50 transition-colors ${theme.btn} ${theme.border}`}
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