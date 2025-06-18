import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, Save, X, Smartphone, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import useTheme from '../hooks/useTheme'

export default function AdvertisementModule() {
  const [ads, setAds] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState('all');
  const { isDark } = useTheme()
  const [sliderIndex, setSliderIndex] = useState({ header: 0, middle: 0, footer: 0 });

  const [formData, setFormData] = useState({
    title: '', imageUrl: '', placement: 'header', active: true, clickUrl: '', startDate: '', endDate: '', priority: 1
  });

  const placements = [
    { value: 'header', label: 'Header', description: 'Top of the screen' },
    { value: 'middle', label: 'Middle', description: 'Content area' },
    { value: 'footer', label: 'Footer', description: 'Bottom of the screen' }
  ];

  useEffect(() => {
    setAds([
      { id: 1, title: 'Summer Sale Banner', imageUrl: 'https://picsum.photos/400/160?random=1', placement: 'header', active: true, clickUrl: 'https://example.com/summer-sale', startDate: '2024-06-01', endDate: '2024-08-31', priority: 1 },
      { id: 2, title: 'Winter Sale', imageUrl: 'https://picsum.photos/400/160?random=2', placement: 'header', active: true, clickUrl: 'https://example.com/winter-sale', startDate: '2024-06-01', endDate: '2024-08-31', priority: 2 },
      { id: 3, title: 'Spring Collection', imageUrl: 'https://picsum.photos/400/160?random=3', placement: 'header', active: true, clickUrl: 'https://example.com/spring', startDate: '2024-06-01', endDate: '2024-08-31', priority: 3 },
      { id: 4, title: 'Fall Discount', imageUrl: 'https://picsum.photos/400/160?random=4', placement: 'header', active: true, clickUrl: 'https://example.com/fall', startDate: '2024-06-01', endDate: '2024-08-31', priority: 4 },
      { id: 5, title: 'Product Showcase 1', imageUrl: 'https://picsum.photos/400/200?random=5', placement: 'middle', active: true, clickUrl: 'https://example.com/product1', startDate: '2024-06-01', endDate: '2024-12-31', priority: 1 },
      { id: 6, title: 'Product Showcase 2', imageUrl: 'https://picsum.photos/400/200?random=6', placement: 'middle', active: true, clickUrl: 'https://example.com/product2', startDate: '2024-06-01', endDate: '2024-12-31', priority: 2 },
      { id: 7, title: 'Product Showcase 3', imageUrl: 'https://picsum.photos/400/200?random=7', placement: 'middle', active: true, clickUrl: 'https://example.com/product3', startDate: '2024-06-01', endDate: '2024-12-31', priority: 3 },
      { id: 8, title: 'App Download 1', imageUrl: 'https://picsum.photos/400/120?random=8', placement: 'footer', active: true, clickUrl: 'https://play.google.com/store', startDate: '2024-06-01', endDate: '2024-12-31', priority: 1 },
      { id: 9, title: 'App Download 2', imageUrl: 'https://picsum.photos/400/120?random=9', placement: 'footer', active: true, clickUrl: 'https://apps.apple.com', startDate: '2024-06-01', endDate: '2024-12-31', priority: 2 },
      { id: 10, title: 'Newsletter', imageUrl: 'https://picsum.photos/400/120?random=10', placement: 'footer', active: true, clickUrl: 'https://example.com/newsletter', startDate: '2024-06-01', endDate: '2024-12-31', priority: 3 }
    ]);
  }, []);

  const theme = isDark ? {
    bg: 'bg-gray-900', cardBg: 'bg-gray-800', text: 'text-white', textMuted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700'
  } : {
    bg: 'bg-gray-50', cardBg: 'bg-white', text: 'text-gray-900', textMuted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300', hover: 'hover:bg-gray-50'
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFormData(prev => ({ ...prev, imageUrl: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAd) {
      setAds(prev => prev.map(ad => ad.id === editingAd.id ? { ...formData, id: editingAd.id } : ad));
      setEditingAd(null);
    } else {
      setAds(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', imageUrl: '', placement: 'header', active: true, clickUrl: '', startDate: '', endDate: '', priority: 1 });
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

  const toggleActive = (id) => setAds(prev => prev.map(ad => ad.id === id ? { ...ad, active: !ad.active } : ad));

  const filteredAds = selectedPlacement === 'all' ? ads : ads.filter(ad => ad.placement === selectedPlacement);
  const getAdsByPlacement = (placement) => ads.filter(ad => ad.placement === placement && ad.active).sort((a, b) => a.priority - b.priority);

  const nextSlide = (placement) => {
    const adsCount = getAdsByPlacement(placement).length;
    if (adsCount > 0) {
      setSliderIndex(prev => ({ ...prev, [placement]: (prev[placement] + 1) % adsCount }));
    }
  };

  const prevSlide = (placement) => {
    const adsCount = getAdsByPlacement(placement).length;
    if (adsCount > 0) {
      setSliderIndex(prev => ({ ...prev, [placement]: prev[placement] === 0 ? adsCount - 1 : prev[placement] - 1 }));
    }
  };

  const AdSlider = ({ placement, heightClass }) => {
    const adsForPlacement = getAdsByPlacement(placement);
    if (adsForPlacement.length === 0) return null;

    const currentAd = adsForPlacement[sliderIndex[placement]] || adsForPlacement[0];
    
    return (
      <div className="relative group">
        <img src={currentAd.imageUrl} alt={currentAd.title} className={`w-full ${heightClass} object-cover`} />
        <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">Ad</div>
        
        {adsForPlacement.length > 1 && (
          <>
            <button 
              onClick={() => prevSlide(placement)}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button 
              onClick={() => nextSlide(placement)}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {adsForPlacement.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-1.5 h-1.5 rounded-full ${index === sliderIndex[placement] ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const Button = ({ onClick, className = '', children, ...props }) => (
    <button onClick={onClick} className={`transition-colors ${className}`} {...props}>{children}</button>
  );

  const Input = ({ className = '', ...props }) => (
    <input className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme.input} ${className}`} {...props} />
  );

  const Badge = ({ color, children }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>{children}</span>
  );

  return (
    <div className={`max-w-7xl mx-auto p-6 min-h-screen ${theme.bg}`}>
      {/* Header */}
      <div className={`${theme.cardBg} rounded-lg shadow-sm p-6 mb-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text}`}>Advertisement Management</h1>
            <p className={`${theme.textMuted} mt-2`}>Configure and manage mobile app advertisements</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${previewMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <Smartphone className="w-4 h-4" />
              {previewMode ? 'Exit Preview' : 'Mobile Preview'}
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4" />Add Advertisement
            </Button>
          </div>
        </div>
      </div>

      {previewMode ? (
        /* Mobile Preview */
        <div className="flex justify-center">
          <div className={`${theme.cardBg} rounded-lg shadow-lg p-4 max-w-sm w-full`}>
            <div className="text-center mb-4">
              <h3 className={`text-lg font-semibold ${theme.text}`}>Mobile App Preview</h3>
              <p className={`text-sm ${theme.textMuted}`}>How ads appear on mobile</p>
            </div>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden`} style={{ aspectRatio: '9/16' }}>
              <div className="bg-blue-600 text-white p-2 text-center text-sm font-medium">App Header</div>
              
              <AdSlider placement="header" heightClass="h-20" />

              <div className="p-4 space-y-3">
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-6 rounded`}></div>
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-4 rounded w-3/4`}></div>
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-4 rounded w-1/2`}></div>
                
                <div className="my-3">
                  <AdSlider placement="middle" heightClass="h-24" />
                </div>

                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-4 rounded w-2/3`}></div>
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-6 rounded`}></div>
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-4 rounded w-3/4`}></div>
              </div>

              <div className="mt-auto">
                <AdSlider placement="footer" heightClass="h-16" />
                <div className="bg-gray-800 text-white p-2 text-center text-sm">App Footer</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Management Interface */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form Section */}
          {showAddForm && (
            <div className={`lg:col-span-2 ${theme.cardBg} rounded-lg shadow-sm p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${theme.text}`}>
                  {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
                </h2>
                <Button onClick={resetForm} className={`${theme.textMuted} hover:text-gray-700`}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Advertisement Title</label>
                  <Input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Enter advertisement title" />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Placement</label>
                  <select name="placement" value={formData.placement} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme.input}`}>
                    {placements.map(p => (
                      <option key={p.value} value={p.value}>{p.label} - {p.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Upload Image</label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className={`flex items-center gap-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2 rounded-lg cursor-pointer transition-colors`}>
                      <Upload className="w-4 h-4" />Choose Image
                    </label>
                    <Input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="flex-1" placeholder="Or enter image URL" />
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-3">
                      <img src={formData.imageUrl} alt="Preview" className="max-w-full h-32 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Click URL</label>
                  <Input type="url" name="clickUrl" value={formData.clickUrl} onChange={handleInputChange} placeholder="https://example.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text} mb-2`}>Start Date</label>
                    <Input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text} mb-2`}>End Date</label>
                    <Input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text} mb-2`}>Priority</label>
                    <Input type="number" name="priority" value={formData.priority} onChange={handleInputChange} min="1" />
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center">
                      <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                      <span className={`ml-2 text-sm font-medium ${theme.text}`}>Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmit} className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-medium bg-orange-500 hover:bg-orange-600">
                    <Save className="w-4 h-4" />{editingAd ? 'Update' : 'Save'} Advertisement
                  </Button>
                  <Button onClick={resetForm} className={`px-6 py-2 border ${theme.border} ${theme.text} rounded-lg ${theme.hover} font-medium`}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Ads List */}
          <div className={`${showAddForm ? 'lg:col-span-2' : 'lg:col-span-4'} ${theme.cardBg} rounded-lg shadow-sm`}>
            <div className={`p-6 border-b ${theme.border}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${theme.text}`}>Advertisement List</h2>
                <div className="flex items-center gap-3">
                  <select value={selectedPlacement} onChange={(e) => setSelectedPlacement(e.target.value)} className={`px-3 py-1 border ${theme.border} rounded-lg text-sm ${theme.input}`}>
                    <option value="all">All Placements</option>
                    {placements.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <span className={`text-sm ${theme.textMuted}`}>{filteredAds.length} advertisements</span>
                </div>
              </div>
            </div>

            <div className={`divide-y ${theme.border}`}>
              {filteredAds.map(ad => (
                <div key={ad.id} className={`p-6 ${theme.hover} transition-colors`}>
                  <div className="flex items-start gap-4">
                    <img src={ad.imageUrl} alt={ad.title} className="w-24 h-16 object-cover rounded-lg border" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold ${theme.text}`}>{ad.title}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge color={
                              ad.placement === 'header' ? 'bg-blue-100 text-blue-800' :
                              ad.placement === 'middle' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }>
                              {placements.find(p => p.value === ad.placement)?.label}
                            </Badge>
                            <Badge color={ad.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {ad.active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className={`text-xs ${theme.textMuted}`}>Priority: {ad.priority}</span>
                          </div>
                          {ad.clickUrl && <p className={`text-sm ${theme.textMuted} mt-1 truncate`}>Links to: {ad.clickUrl}</p>}
                          {ad.startDate && ad.endDate && <p className={`text-xs ${theme.textMuted} mt-1`}>{ad.startDate} to {ad.endDate}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => toggleActive(ad.id)} className={`p-2 rounded-lg ${ad.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`} title={ad.active ? 'Deactivate' : 'Activate'}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleEdit(ad)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleDelete(ad.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAds.length === 0 && (
                <div className="p-12 text-center">
                  <Monitor className={`w-12 h-12 mx-auto mb-4 ${theme.textMuted}`} />
                  <h3 className={`text-lg font-medium ${theme.text} mb-2`}>No advertisements found</h3>
                  <p className={`${theme.textMuted} mb-4`}>
                    {selectedPlacement === 'all' ? 'Start by creating your first advertisement' : `No advertisements found for ${placements.find(p => p.value === selectedPlacement)?.label} placement`}
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" />Add Advertisement
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}