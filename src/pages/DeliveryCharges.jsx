import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, Truck, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Moon, Sun } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import useTheme from '../hooks/useTheme'

export default function DeliveryCharges() {
  const { isDark } = useTheme();
  const [countries] = useState(Country.getAllCountries());
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState('');
  const [discountSlabs, setDiscountSlabs] = useState([]);
  const [showSlabForm, setShowSlabForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewConfig, setViewConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'add' or 'list'
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: ''
  });

  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', muted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white',
    hover: 'hover:bg-gray-700', tableHeader: 'bg-gray-700', btn: 'bg-gray-700 hover:bg-gray-600 text-white'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300',
    hover: 'hover:bg-gray-50', tableHeader: 'bg-gray-50', btn: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  };

  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry));
      setSelectedState('');
      setSelectedCity('');
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      setCities(City.getCitiesOfState(selectedCountry, selectedState));
      setSelectedCity('');
    }
  }, [selectedState, selectedCountry]);

  const fetchDeliveryOptions = async () => {
    const mockOptions = [
      { id: 1, name: 'Standard Delivery', type: 'standard' },
      { id: 2, name: 'Express Delivery', type: 'express' },
      { id: 3, name: 'Same Day Delivery', type: 'same_day' }
    ];
    setDeliveryOptions(mockOptions);
  };

  const handleAddDelivery = () => {
    if (!selectedState || !selectedCity) {
      alert('Please select state and city first');
      return;
    }
    fetchDeliveryOptions();
    setShowSlabForm(true);
  };

  const handleSlabSubmit = () => {
    if (!formData.minAmount || !formData.discountValue || discountSlabs.length >= 3) return;

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

    setFormData({ minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '' });
  };

  const handleEdit = (index) => {
    setFormData(discountSlabs[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setDiscountSlabs(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveConfig = () => {
    if (!selectedState || !selectedCity || !selectedDelivery || discountSlabs.length === 0) {
      alert('Please fill all required fields and add at least one slab');
      return;
    }

    const newConfig = {
      id: Date.now(),
      country: countries.find(c => c.isoCode === selectedCountry)?.name,
      state: states.find(s => s.isoCode === selectedState)?.name,
      city: cities.find(c => c.name === selectedCity)?.name,
      delivery: deliveryOptions.find(d => d.id === parseInt(selectedDelivery)),
      slabs: [...discountSlabs],
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setSavedConfigs(prev => [...prev, newConfig]);
    
    setSelectedState('');
    setSelectedCity('');
    setSelectedDelivery('');
    setDiscountSlabs([]);
    setShowSlabForm(false);
    alert('Configuration saved successfully!');
  };

  const toggleStatus = (id) => {
    setSavedConfigs(prev => prev.map(config => 
      config.id === id 
        ? { ...config, status: config.status === 'active' ? 'inactive' : 'active' }
        : config
    ));
  };

  const sortedConfigs = useMemo(() => {
    return [...savedConfigs].sort((a, b) => {
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
  }, [savedConfigs, sortField, sortDirection]);

  const paginatedConfigs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedConfigs.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedConfigs, currentPage]);

  const totalPages = Math.ceil(savedConfigs.length / itemsPerPage);

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

  const getChargesTypeDisplay = (slabs) => {
    const types = [...new Set(slabs.map(s => s.discountType))];
    return types.map(type => type === 'percentage' ? 'In Percentage(%)' : 'In Fixed(₹)').join(', ');
  };

  if (viewConfig) {
    return (
      <div className={`max-w-full mx-auto p-4 min-h-screen ${theme.bg}`}>
        <div className={`rounded-lg shadow-sm border ${theme.card} ${theme.border}`}>
          <div className={`border-b px-4 py-3 flex justify-between items-center ${theme.border}`}>
            <h1 className={`text-xl font-bold ${theme.text}`}>View Configuration</h1>
            <div className="flex gap-2">
              <button onClick={() => setViewConfig(null)} className="bg-gray-500 text-white px-3 py-1 rounded">
                Back
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${theme.text}`}>Location Details</h3>
                <div className="space-y-2">
                  <p className={theme.text}><span className="font-medium">Country:</span> {viewConfig.country}</p>
                  <p className={theme.text}><span className="font-medium">State:</span> {viewConfig.state}</p>
                  <p className={theme.text}><span className="font-medium">City:</span> {viewConfig.city}</p>
                  <p className={theme.text}><span className="font-medium">Delivery:</span> {viewConfig.delivery?.name}</p>
                  <p className={theme.text}><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      viewConfig.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewConfig.status}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${theme.text}`}>Discount Slabs</h3>
                <div className="space-y-2">
                  {viewConfig.slabs.map((slab, index) => (
                    <div key={index} className={`p-3 border rounded ${theme.border} ${theme.card}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${theme.text}`}>
                          ₹{slab.minAmount}{slab.maxAmount ? ` - ₹${slab.maxAmount}` : "+"}
                        </span>
                        <span className="text-green-600 font-semibold">
                          {slab.discountValue}{slab.discountType === "percentage" ? "%" : "₹"} OFF
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${theme.muted}`}>
                        Type: {slab.discountType === 'percentage' ? 'In Percentage(%)' : 'In Fixed(₹)'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-full mx-auto p-4 min-h-screen ${theme.bg}`}>
      <div className={`rounded-lg shadow-sm border ${theme.card} ${theme.border}`}>
        <div className={`border-b px-4 py-3 flex justify-between items-center ${theme.border}`}>
          <h1 className={`text-xl font-bold flex items-center gap-2 ${theme.text}`}>
            <Truck className="w-5 h-5 text-amber-600" />
            Delivery Charges Management
          </h1>
        </div>

        {/* Tabs */}
        <div className={`border-b ${theme.border}`}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'list' 
                  ? `text-amber-600 border-b-2 border-orange-600 ${theme.bg}` 
                  : `${theme.text} ${theme.hover}`
              }`}
            >
              List of Delivery Charges
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'add' 
                  ? `text-amber-600 border-b-2 border-orange-600 ${theme.bg}` 
                  : `${theme.text} ${theme.hover}`
              }`}
            >
              Add Charges
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'add' ? (
            <div className="space-y-4">
              {/* Location Selection */}
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Country</label>
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
                  <label className={`block text-sm font-medium mb-1 ${theme.text}`}>State *</label>
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

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.text}`}>City *</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddDelivery}
                    disabled={!selectedState || !selectedCity}
                    className="w-full text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    Add Delivery
                  </button>
                </div>
              </div>

              {/* Delivery Options & Discount Slabs */}
              {showSlabForm && (
                <div className={`border rounded-lg p-4 ${theme.border}`}>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${theme.text}`}>Delivery Type *</label>
                    <select
                      value={selectedDelivery}
                      onChange={(e) => setSelectedDelivery(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                    >
                      <option value="">Select Delivery Type</option>
                      {deliveryOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-lg font-semibold ${theme.text}`}>
                      Discount Slabs ({discountSlabs.length}/3)
                    </h3>
                  </div>

                  {/* Slab Form */}
                  <div className={`p-3 rounded mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid md:grid-cols-6 gap-2">
                      <input
                        type="number"
                        value={formData.minAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, minAmount: e.target.value }))}
                        className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                        placeholder="Min Amount"
                      />
                      <input
                        type="number"
                        value={formData.maxAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: e.target.value }))}
                        className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                        placeholder="Max Amount"
                      />
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                        className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                      >
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed ₹</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                        className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                        placeholder="Value"
                      />
                      <button
                        onClick={handleSlabSubmit}
                        disabled={!formData.minAmount || !formData.discountValue || discountSlabs.length >= 3}
                        className="bg-green-600 text-white py-1 text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {editingIndex >= 0 ? "Update" : "Add"}
                      </button>
                      <button
                        onClick={() => {
                          setFormData({ minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '' });
                          setEditingIndex(-1);
                        }}
                        className={`px-2 py-1 rounded ${theme.btn}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Slabs List */}
                  <div className="space-y-2">
                    {discountSlabs.map((slab, index) => (
                      <div key={slab.id} className={`flex items-center justify-between p-2 border rounded text-sm ${theme.card} ${theme.border}`}>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${theme.text}`}>
                            ₹{slab.minAmount}{slab.maxAmount ? ` - ₹${slab.maxAmount}` : "+"}
                          </span>
                          <span className="text-green-600">
                            {slab.discountValue}{slab.discountType === "percentage" ? "%" : "₹"} OFF
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(index)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDelete(index)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {discountSlabs.length > 0 && (
                    <button
                      onClick={handleSaveConfig}
                      className="w-full mt-3 text-white py-2 rounded font-medium"
                      style={{ backgroundColor: '#c79e73' }}
                    >
                      Save Configuration
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* List Tab */
            savedConfigs.length > 0 && (
              <div className={`border rounded-lg overflow-hidden ${theme.border}`}>
                <div className={`px-4 py-2 border-b ${theme.tableHeader} ${theme.border}`}>
                  <h3 className={`text-lg font-semibold ${theme.text}`}>Saved Configurations</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`border-b ${theme.tableHeader} ${theme.border}`}>
                      <tr>
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>Sr.No.</th>
                        <th className={`px-4 py-2 text-left text-sm font-medium cursor-pointer ${theme.text} ${theme.hover}`} onClick={() => handleSort("state")}>
                          <div className="flex items-center gap-1">State <SortIcon field="state" /></div>
                        </th>
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>City</th>
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>Delivery Name</th>
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>Charges Type</th>
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>Status</th>
                        <th className={`px-4 py-2 text-left text-sm font-medium cursor-pointer ${theme.text} ${theme.hover}`} onClick={() => handleSort("createdAt")}>
                          <div className="flex items-center gap-1">Created <SortIcon field="createdAt" /></div>
                        </th>
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {paginatedConfigs.map((config, index) => (
                        <tr key={config.id} className={`transition-colors ${theme.hover}`}>
                          <td className={`px-4 py-3 text-sm ${theme.text}`}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${theme.text}`}>{config.state}</td>
                          <td className={`px-4 py-3 text-sm ${theme.text}`}>{config.city}</td>
                          <td className={`px-4 py-3 text-sm ${theme.text}`}>{config.delivery?.name}</td>
                          <td className={`px-4 py-3 text-sm ${theme.text}`}>{getChargesTypeDisplay(config.slabs)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleStatus(config.id)}
                              className={`px-2 py-1 text-xs rounded-full ${
                                config.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {config.status}
                            </button>
                          </td>
                          <td className={`px-4 py-3 text-sm ${theme.text}`}>
                            {new Date(config.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setViewConfig(config)}
                              className="bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
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
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, savedConfigs.length)} of {savedConfigs.length} entries
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-1 rounded border disabled:opacity-50 ${theme.btn} ${theme.border}`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 py-1 text-sm rounded border ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : `${theme.btn} ${theme.border}`
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-1 rounded border disabled:opacity-50 ${theme.btn} ${theme.border}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}