import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Edit2, Trash2, Tag, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

export default function Discount() {
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
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            Discount Management
          </h1>
        </div>

        <div className="p-4 space-y-4">
          {/* Location Selection */}
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {countries.map(country => (
                  <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cities * ({selectedCities.length} selected)
              </label>
              <div className="border rounded-lg p-2 max-h-24 overflow-y-auto bg-white">
                {cities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1">
                    {cities.map(city => (
                      <label key={city.name} className="flex items-center gap-1 text-xs hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCities.includes(city.name)}
                          onChange={() => handleCityToggle(city.name)}
                          className="w-3 h-3 text-blue-600 rounded"
                        />
                        <span>{city.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm py-1">Select a state first</div>
                )}
              </div>
            </div>
          </div>

          {/* Discount Slabs */}
          {selectedCities.length > 0 && (
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Discount Slabs</h3>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" />Add Slab
                </button>
              </div>

              {showForm && (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <div className="grid md:grid-cols-6 gap-2">
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData(prev => ({...prev, minAmount: e.target.value}))}
                      className="px-2 py-1 text-sm border rounded"
                      placeholder="Min Amount"
                    />
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData(prev => ({...prev, maxAmount: e.target.value}))}
                      className="px-2 py-1 text-sm border rounded"
                      placeholder="Max Amount"
                    />
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({...prev, discountType: e.target.value}))}
                      className="px-2 py-1 text-sm border rounded"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({...prev, discountValue: e.target.value}))}
                      className="px-2 py-1 text-sm border rounded"
                      placeholder="Value"
                    />
                    <button
                      onClick={handleSlabSubmit}
                      className="bg-green-600 text-white py-1 text-sm rounded hover:bg-green-700"
                    >
                      {editingIndex >= 0 ? 'Update' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingIndex(-1);
                        setFormData({ minAmount: '', maxAmount: '', discountType: 'percentage', discountValue: '', description: '' });
                      }}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {discountSlabs.map((slab, index) => (
                  <div key={slab.id} className="flex items-center justify-between p-2 bg-white border rounded text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">₹{slab.minAmount}{slab.maxAmount ? ` - ₹${slab.maxAmount}` : '+'}</span>
                      <span className="text-green-600">{slab.discountValue}{slab.discountType === 'percentage' ? '%' : '₹'} OFF</span>
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
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="text-lg font-semibold">Saved Configurations</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th 
                        className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('state')}
                      >
                        <div className="flex items-center gap-1">
                          State <SortIcon field="state" />
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cities</th>
                      <th 
                        className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('slabCount')}
                      >
                        <div className="flex items-center gap-1">
                          Slabs <SortIcon field="slabCount" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Created <SortIcon field="createdAt" />
                        </div>
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDiscounts.map(discount => (
                      <tr key={discount.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{discount.state}</td>
                        <td className="px-4 py-3 text-sm">{discount.cities.slice(0, 2).join(', ')}{discount.cities.length > 2 && ` +${discount.cities.length - 2}`}</td>
                        <td className="px-4 py-3 text-sm">{discount.slabs.length}</td>
                        <td className="px-4 py-3 text-sm">{new Date(discount.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {discount.slabs.map((slab, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                ₹{slab.minAmount}{slab.maxAmount ? `-₹${slab.maxAmount}` : '+'}: {slab.discountValue}{slab.discountType === 'percentage' ? '%' : '₹'}
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
                <div className="bg-gray-50 px-4 py-2 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, savedDiscounts.length)} of {savedDiscounts.length} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded border disabled:opacity-50 hover:bg-gray-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 py-1 text-sm rounded border ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded border disabled:opacity-50 hover:bg-gray-200"
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