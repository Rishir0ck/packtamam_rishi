import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, Save, X, Smartphone, Monitor } from 'lucide-react';

const AdvertisementModule = () => {
  const [ads, setAds] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState('all');

  // Sample initial ads data
  useEffect(() => {
    const sampleAds = [
      {
        id: 1,
        title: 'Summer Sale Banner',
        imageUrl: 'https://via.placeholder.com/400x200/ff6b6b/ffffff?text=Summer+Sale+50%25+OFF',
        placement: 'header',
        active: true,
        clickUrl: 'https://example.com/summer-sale',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        priority: 1
      },
      {
        id: 2,
        title: 'Product Showcase',
        imageUrl: 'https://via.placeholder.com/300x300/4ecdc4/ffffff?text=New+Product',
        placement: 'middle',
        active: true,
        clickUrl: 'https://example.com/new-product',
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        priority: 2
      },
      {
        id: 3,
        title: 'App Download',
        imageUrl: 'https://via.placeholder.com/400x100/45b7d1/ffffff?text=Download+Our+App',
        placement: 'footer',
        active: false,
        clickUrl: 'https://play.google.com/store',
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        priority: 3
      }
    ];
    setAds(sampleAds);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    placement: 'header',
    active: true,
    clickUrl: '',
    startDate: '',
    endDate: '',
    priority: 1
  });

  const placements = [
    { value: 'header', label: 'Header', description: 'Top of the screen' },
    { value: 'middle', label: 'Middle', description: 'Content area' },
    { value: 'footer', label: 'Footer', description: 'Bottom of the screen' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAd) {
      setAds(prev => prev.map(ad => 
        ad.id === editingAd.id 
          ? { ...formData, id: editingAd.id }
          : ad
      ));
      setEditingAd(null);
    } else {
      const newAd = {
        ...formData,
        id: Date.now()
      };
      setAds(prev => [...prev, newAd]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      placement: 'header',
      active: true,
      clickUrl: '',
      startDate: '',
      endDate: '',
      priority: 1
    });
    setShowAddForm(false);
    setEditingAd(null);
  };

  const handleEdit = (ad) => {
    setFormData(ad);
    setEditingAd(ad);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      setAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  const toggleActive = (id) => {
    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, active: !ad.active } : ad
    ));
  };

  const filteredAds = selectedPlacement === 'all' 
    ? ads 
    : ads.filter(ad => ad.placement === selectedPlacement);

  const getAdsByPlacement = (placement) => {
    return ads.filter(ad => ad.placement === placement && ad.active)
      .sort((a, b) => a.priority - b.priority);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advertisement Management</h1>
            <p className="text-gray-600 mt-2">Configure and manage mobile app advertisements</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                previewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              {previewMode ? 'Exit Preview' : 'Mobile Preview'}
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Advertisement
            </button>
          </div>
        </div>
      </div>

      {previewMode ? (
        /* Mobile Preview */
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm w-full">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Mobile App Preview</h3>
              <p className="text-sm text-gray-600">How ads appear on mobile</p>
            </div>
            
            <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
              {/* Header Ads */}
              <div className="bg-blue-600 text-white p-2 text-center text-sm font-medium">
                App Header
              </div>
              <div className="space-y-1">
                {getAdsByPlacement('header').map(ad => (
                  <div key={ad.id} className="relative">
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title}
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                      Ad
                    </div>
                  </div>
                ))}
              </div>

              {/* Content Area */}
              <div className="p-4 space-y-3">
                <div className="bg-gray-300 h-6 rounded"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                
                {/* Middle Ads */}
                {getAdsByPlacement('middle').map(ad => (
                  <div key={ad.id} className="relative my-3">
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title}
                      className="w-full h-24 object-cover rounded"
                    />
                    <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                      Ad
                    </div>
                  </div>
                ))}

                <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                <div className="bg-gray-300 h-6 rounded"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4"></div>
              </div>

              {/* Footer Ads */}
              <div className="mt-auto">
                {getAdsByPlacement('footer').map(ad => (
                  <div key={ad.id} className="relative">
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title}
                      className="w-full h-16 object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                      Ad
                    </div>
                  </div>
                ))}
                <div className="bg-gray-800 text-white p-2 text-center text-sm">
                  App Footer
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Management Interface */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form Section */}
          {showAddForm && (
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advertisement Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter advertisement title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placement
                  </label>
                  <select
                    name="placement"
                    value={formData.placement}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {placements.map(placement => (
                      <option key={placement.value} value={placement.value}>
                        {placement.label} - {placement.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Or enter image URL"
                    />
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="max-w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Click URL
                  </label>
                  <input
                    type="url"
                    name="clickUrl"
                    value={formData.clickUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <input
                      type="number"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {editingAd ? 'Update' : 'Save'} Advertisement
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ads List */}
          <div className={`${showAddForm ? 'lg:col-span-2' : 'lg:col-span-4'} bg-white rounded-lg shadow-sm`}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Advertisement List</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedPlacement}
                    onChange={(e) => setSelectedPlacement(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Placements</option>
                    {placements.map(placement => (
                      <option key={placement.value} value={placement.value}>
                        {placement.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-500">
                    {filteredAds.length} advertisements
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredAds.map(ad => (
                <div key={ad.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-24 h-16 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              ad.placement === 'header' ? 'bg-blue-100 text-blue-800' :
                              ad.placement === 'middle' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {placements.find(p => p.value === ad.placement)?.label}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              ad.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {ad.active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">Priority: {ad.priority}</span>
                          </div>
                          {ad.clickUrl && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              Links to: {ad.clickUrl}
                            </p>
                          )}
                          {ad.startDate && ad.endDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              {ad.startDate} to {ad.endDate}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(ad.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              ad.active 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={ad.active ? 'Deactivate' : 'Activate'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(ad)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAds.length === 0 && (
                <div className="p-12 text-center">
                  <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements found</h3>
                  <p className="text-gray-600 mb-4">
                    {selectedPlacement === 'all' 
                      ? 'Start by creating your first advertisement'
                      : `No advertisements found for ${placements.find(p => p.value === selectedPlacement)?.label} placement`
                    }
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Advertisement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementModule;