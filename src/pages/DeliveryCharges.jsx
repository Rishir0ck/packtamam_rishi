import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, Truck, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import useTheme from '../hooks/useTheme';
import adminApiService from '../Firebase/services/adminApiService';

export default function DeliveryCharges() {
  const { isDark } = useTheme();
  const [countries] = useState(Country.getAllCountries());
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [chargeSlabs, setChargeSlabs] = useState([]);
  const [showSlabForm, setShowSlabForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewConfig, setViewConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const itemsPerPage = 5;
  const [editingSlabIndex, setEditingSlabIndex] = useState(-1);
  const [editSlabData, setEditSlabData] = useState({
    min_amount: '', max_amount: '', charges_type: 'percentage', charge: ''
  });

  const [formData, setFormData] = useState({
    minAmount: '', maxAmount: '', chargesType: 'percentage', charge: ''
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

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getDeliveries();
      console.log('API Response:', response); // Add this for debugging
      
      if (response.success) {
        // Handle different possible response structures
        let deliveries = [];
        
        if (Array.isArray(response.data)) {
          deliveries = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          deliveries = response.data.data;
        } else if (response.data && Array.isArray(response.data.deliveries)) {
          deliveries = response.data.deliveries;
        } else if (response.deliveries && Array.isArray(response.deliveries)) {
          deliveries = response.deliveries;
        }
        
        console.log('Processed deliveries:', deliveries); // Add this for debugging
        setSavedConfigs(deliveries);
      } else {
        console.error('API returned success: false', response);
        setSavedConfigs([]);
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
      setSavedConfigs([]);
      alert('Failed to load delivery configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlab = (slab, index) => {
    setEditSlabData({
      id: slab.id || slab.id,
      min_amount: slab.min_amount || slab.minAmount || '',
      max_amount: slab.max_amount || slab.maxAmount || '',
      charges_type: slab.charges_type || slab.chargesType || 'percentage',
      charge: slab.charge || ''
    });
    setEditingSlabIndex(index);
  };

  const handleUpdateSlab = async () => {
    console.log("editSlabData:", editSlabData);
    if (!editSlabData.min_amount || !editSlabData.charge) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        id: editSlabData.id,
        min_amount: editSlabData.min_amount,
        max_amount: editSlabData.max_amount,
        charges_type: editSlabData.charges_type,
        charge: editSlabData.charge,
      };
    const response = await adminApiService.updateDeliveryCharges(payload);

      if (response.success) {
        // Update the viewConfig with the new slab data
        const updatedSlabs = [...(viewConfig.slabs || viewConfig.pricing_slabs || viewConfig.delivery_charges)];
        updatedSlabs[editingSlabIndex] = {
          ...updatedSlabs[editingSlabIndex],
          min_amount: editSlabData.min_amount,
          max_amount: editSlabData.max_amount,
          charges_type: editSlabData.charges_type,
          charge: editSlabData.charge
        };
        
        // setViewConfig(prev => ({
        //   ...prev,
        //   [viewConfig.slabs ? 'slabs' : viewConfig.pricing_slabs ? 'pricing_slabs' : 'delivery_charges']: updatedSlabs
        // }));

        const updatedViewConfig = {
        ...viewConfig,
        [viewConfig.slabs ? 'slabs' : viewConfig.pricing_slabs ? 'pricing_slabs' : 'delivery_charges']: updatedSlabs
      };
      
      setViewConfig(updatedViewConfig);
      // Update the savedConfigs array to reflect the changes
      setSavedConfigs(prev => prev.map(config => 
        (config.id || config._id) === (viewConfig.id || viewConfig._id) 
          ? updatedViewConfig 
          : config
      ));
        
        // Reset editing state
        setEditingSlabIndex(-1);
        setEditSlabData({ min_amount: '', max_amount: '', charges_type: 'percentage', charge: '' });
        
        // Reload the main list
        // await loadDeliveries();
        
        alert('Slab updated successfully!');
      } else {
        alert('Failed to update slab: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating slab:', error);
      alert('Failed to update slab');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSlabIndex(-1);
    setEditSlabData({ min_amount: '', max_amount: '', charges_type: 'percentage', charge: '' });
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

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

  //useEffect to show slab form when city is selected
  useEffect(() => {
    if (selectedCity) {
      setShowSlabForm(true);
    } else {
      setShowSlabForm(false);
      setChargeSlabs([]);
    }
  }, [selectedCity]);

  const handleSlabSubmit = () => {
    if (!formData.minAmount || !formData.charge || chargeSlabs.length >= 3) return;

    const newSlab = {
      ...formData,
      minAmount: parseFloat(formData.minAmount),
      maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
      charge: parseFloat(formData.charge),
      id: Date.now()
    };

    if (editingIndex >= 0) {
      setChargeSlabs(prev => prev.map((slab, idx) => idx === editingIndex ? newSlab : slab));
      setEditingIndex(-1);
    } else {
      setChargeSlabs(prev => [...prev, newSlab]);
    }

    setFormData({ minAmount: '', maxAmount: '', chargesType: 'percentage', charge: '' });
  };

  const handleEdit = (index) => {
    setFormData(chargeSlabs[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setChargeSlabs(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveConfig = async () => {
    if (!selectedState || !selectedCity || chargeSlabs.length === 0) {
      alert('Please fill all required fields and add at least one slab');
      return;
    }

    try {
      setLoading(true);
      const pricing = {
        state: states.find(s => s.isoCode === selectedState)?.name,
        city: selectedCity,
        is_active : true,
        delivery_charges: chargeSlabs.map(charges => ({
          min_amount: charges.minAmount,
          max_amount: charges.maxAmount,
          charges_type: charges.chargesType,
          charge: charges.charge
        }))
      };
      console.log('Sending data:', pricing); // Add this for debugging
      const response = await adminApiService.addDeliveryLocation(pricing);
      console.log('Save response:', response); // Add this for debugging

      if (response.success) {
      // Reset form
      setSelectedState('');
      setSelectedCity('');
      setChargeSlabs([]);
      setShowSlabForm(false);
      
      // Reload the list after a short delay to ensure backend processing is complete
      setTimeout(() => {
        loadDeliveries();
      }, 1000);
      
      alert('Configuration saved successfully!');
    } else {
      console.error('Save failed:', response);
      alert('Failed to save configuration: ' + (response.message || 'Unknown error'));
    }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      const response = await adminApiService.updateDeliveryStatus(id, !currentStatus);
      
      if (response.success) {
        await loadDeliveries(); // Reload the list
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const sortedConfigs = useMemo(() => {
    // Ensure savedConfigs is always an array before processing
    const configsArray = Array.isArray(savedConfigs) ? savedConfigs : [];
    
    return [...configsArray].sort((a, b) => {
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

  // Ensure savedConfigs is an array for length calculation
  const totalPages = Math.ceil((Array.isArray(savedConfigs) ? savedConfigs.length : 0) / itemsPerPage);

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
    if (!slabs || !Array.isArray(slabs)) return 'N/A';
    const types = [...new Set(slabs.map(s => s.charges_type || s.chargesType || 'fixed'))];
    return types.map(type => type === 'percentage' ? 'In Percentage(%)' : 'In Fixed(₹)').join(', ');
  };

  if (loading) {
    return (
      <div className={`max-w-full mx-auto p-4 min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`text-lg ${theme.text}`}>Loading...</div>
      </div>
    );
  }

  if (viewConfig) {
    return (
      <div className={`max-w-full mx-auto p-4 min-h-screen ${theme.bg}`}>
        <div className={`rounded-lg shadow-sm border ${theme.card} ${theme.border}`}>
          <div className={`border-b px-4 py-3 flex justify-between items-center ${theme.border}`}>
            <h1 className={`text-xl font-bold ${theme.text}`}>View Configuration</h1>
            <button onClick={() => setViewConfig(null)} className="bg-gray-500 text-white px-3 py-1 rounded">
              Back
            </button>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${theme.text}`}>Location Details</h3>
                <div className="space-y-2">
                  <p className={theme.text}><span className="font-medium">Country:</span> {viewConfig.country || 'India'}</p>
                  <p className={theme.text}><span className="font-medium">State:</span> {viewConfig.state}</p>
                  <p className={theme.text}><span className="font-medium">City:</span> {viewConfig.city}</p>
                  <p className={theme.text}><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      (viewConfig.is_active ?? viewConfig.status === 'active') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {(viewConfig.is_active ?? viewConfig.status === 'active') ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${theme.text}`}>Charge Slabs</h3>
                <div className="space-y-2">
                  {(viewConfig.slabs || viewConfig.pricing_slabs || viewConfig.delivery_charges || []).map((slab, index) => (
                    <div key={index} className={`p-3 border rounded ${theme.border} ${theme.card}`}>
                      {editingSlabIndex === index ? (
                        // Edit form
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <input
                              type="number"
                              value={editSlabData.min_amount}
                              onChange={(e) => setEditSlabData(prev => ({ ...prev, min_amount: e.target.value }))}
                              className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                              placeholder="Min Amount"
                            />
                            <input
                              type="number"
                              value={editSlabData.max_amount}
                              onChange={(e) => setEditSlabData(prev => ({ ...prev, max_amount: e.target.value }))}
                              className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                              placeholder="Max Amount"
                            />
                            <select
                              value={editSlabData.charges_type}
                              onChange={(e) => setEditSlabData(prev => ({ ...prev, charges_type: e.target.value }))}
                              className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                            >
                              <option value="percentage">Percentage %</option>
                              <option value="fixed">Fixed ₹</option>
                            </select>
                            <input
                              type="number"
                              step="0.01"
                              value={editSlabData.charge}
                              onChange={(e) => setEditSlabData(prev => ({ ...prev, charge: e.target.value }))}
                              className={`px-2 py-1 text-sm border rounded ${theme.input}`}
                              placeholder="Charge Value"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateSlab}
                              disabled={loading}
                              className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {loading ? 'Updating...' : 'Update'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display view
                        <div>
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${theme.text}`}>
                              ₹{slab.min_amount || slab.minAmount}{(slab.max_amount || slab.maxAmount) ? ` - ₹${slab.max_amount || slab.maxAmount}` : "+"}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-semibold">
                                {slab.charge || slab.charge}{(slab.charges_type || slab.chargesType) === "percentage" ? "%" : "₹"} Charge
                              </span>
                              <button
                                onClick={() => handleEditSlab(slab, index)}
                                className="bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${theme.muted}`}>
                            Type: {(slab.charges_type || slab.chargesType) === 'percentage' ? 'In Percentage(%)' : 'In Fixed(₹)'}
                          </p>
                        </div>
                      )}
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
                    className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
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
                    className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
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
                    className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Discount Slabs */}
              {showSlabForm && (
                <div className={`border rounded-lg p-4 ${theme.border}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-lg font-semibold ${theme.text}`}>
                      Delivery Charge Slabs ({chargeSlabs.length}/3)
                    </h3>
                  </div>

                  {/* Slab Form */}
                  <div className={`p-3 rounded mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid md:grid-cols-6 gap-2">
                      <input
                        type="number"
                        value={formData.minAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, minAmount: e.target.value }))}
                        className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                        placeholder="Min Amount"
                      />
                      <input
                        type="number"
                        value={formData.maxAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: e.target.value }))}
                        className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                        placeholder="Max Amount"
                      />
                      <select
                        value={formData.chargesType}
                        onChange={(e) => setFormData(prev => ({ ...prev, chargesType: e.target.value }))}
                        className={`w-full px-1 py-2 text-sm border rounded ${theme.input}`}
                      >
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed ₹</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.charge}
                        onChange={(e) => setFormData(prev => ({ ...prev, charge: e.target.value }))}
                        className={`w-full px-3 py-2 text-sm border rounded ${theme.input}`}
                        placeholder="Value"
                      />
                      <button
                        onClick={handleSlabSubmit}
                        disabled={!formData.minAmount || !formData.charge || chargeSlabs.length >= 3}
                        className="bg-green-600 text-white py-1 text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {editingIndex >= 0 ? "Update" : "Add"}
                      </button>
                      <button
                        onClick={() => {
                          setFormData({ minAmount: '', maxAmount: '', chargesType: 'percentage', charge: '' });
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
                    {chargeSlabs.map((slab, index) => (
                      <div key={slab.id} className={`flex items-center justify-between p-2 border rounded text-sm ${theme.card} ${theme.border}`}>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${theme.text}`}>
                            ₹{slab.minAmount}{slab.maxAmount ? ` - ₹${slab.maxAmount}` : "+"}
                          </span>
                          <span className="text-green-600">
                            {slab.charge}{slab.chargesType === "percentage" ? "%" : "₹"} Charge
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

                  {chargeSlabs.length > 0 && (
                    <button
                      onClick={handleSaveConfig}
                      disabled={loading}
                      className="w-full mt-3 text-white py-2 rounded font-medium disabled:opacity-50"
                      style={{ backgroundColor: '#c79e73' }}
                    >
                      {loading ? 'Saving...' : 'Save Configuration'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* List Tab */
            Array.isArray(savedConfigs) && savedConfigs.length > 0 && (
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
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>Charges Type</th>
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>Status</th>
                        {/* <th className={`px-4 py-2 text-left text-sm font-medium cursor-pointer ${theme.text} ${theme.hover}`} onClick={() => handleSort("createdAt")}>
                          <div className="flex items-center gap-1">Created <SortIcon field="createdAt" /></div>
                        </th> */}
                        <th className={`px-4 py-2 text-left text-sm font-medium ${theme.text}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {paginatedConfigs.map((config, index) => (
                        <tr key={config.id || config._id || index} className={`transition-colors ${theme.hover}`}>
                          <td className={`px-4 py-3 text-sm ${theme.text}`}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${theme.text}`}>{config.state}</td>
                          <td className={`px-4 py-3 text-sm ${theme.text}`}>{config.city}</td>
                          <td className={`px-4 py-3 text-sm ${theme.text}`}>{getChargesTypeDisplay(config.slabs || config.pricing_slabs || config.delivery_charges)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleStatus(config.id || config._id, config.is_active ?? (config.status === 'active'))}
                              disabled={loading}
                              className={`px-2 py-1 text-xs rounded-full disabled:opacity-50 ${
                                (config.is_active ?? (config.status === 'active'))
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {(config.is_active ?? (config.status === 'active')) ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          {/* <td className={`px-4 py-3 text-sm ${theme.text}`}>
                            {new Date(config.createdAt || config.created_at || config.created_at).toLocaleDateString()}
                          </td> */}
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