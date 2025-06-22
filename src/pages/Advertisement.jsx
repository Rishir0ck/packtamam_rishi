import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X, Smartphone, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import AdminService from '../Firebase/services/adminApiService';

export default function AdvertisementModule() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [sliderIndex, setSliderIndex] = useState({ Header: 0, Middle: 0, Footer: 0 });
  const { isDark } = useTheme();
  const hasFetched = useRef(false);

  const [formData, setFormData] = useState({
    title: '', images: [], placement: 'Header', is_active: true, 
    start_date: '', end_date: '', priority: 1
  });

  const placements = [
    { value: 'Header', label: 'Header', description: 'Top of the screen' },
    { value: 'Middle', label: 'Middle', description: 'Content area' }
  ];

  const theme = isDark ? {
    bg: 'bg-gray-900', cardBg: 'bg-gray-800', text: 'text-white', 
    textMuted: 'text-gray-300', border: 'border-gray-700', 
    input: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700'
  } : {
    bg: 'bg-gray-50', cardBg: 'bg-white', text: 'text-gray-900', 
    textMuted: 'text-gray-600', border: 'border-gray-200', 
    input: 'bg-white border-gray-300', hover: 'hover:bg-gray-50'
  };

  useEffect(() => {
    if (hasFetched.current) return;
    
    const loadBanners = async () => {
      try {
        hasFetched.current = true;
        const result = await AdminService.getBanners();
        if (result.success) {
          const banners = result.data?.banners || result.data || [];
          setAds(Array.isArray(banners) ? banners : []);
        } else {
          setError(result.error || 'Failed to load advertisements');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };
    
    loadBanners();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const imageObjects = files.map(file => ({
        originFileObj: file, url: URL.createObjectURL(file)
      }));
      setFormData(prev => ({ ...prev, images: imageObjects }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = editingAd 
        ? await AdminService.updateBanner(editingAd.id, formData)
        : await AdminService.addBanner(formData);

      if (result.success) {
        if (editingAd) {
          setAds(prev => prev.map(ad => ad.id === editingAd.id ? { ...ad, ...formData } : ad));
        } else {
          setAds(prev => [...prev, result.data]);
        }
        resetForm();
      } else {
        setError(result.error || 'Operation failed');
      }
    } catch (err) {
      setError('Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', images: [], placement: 'Header', is_active: true, 
                 start_date: '', end_date: '', priority: 1 });
    setShowAddForm(false);
    setEditingAd(null);
  };

  const handleEdit = (ad) => {
    setFormData({
      id: ad.id, title: ad.title || '', images: [], placement: ad.placement || 'Header',
      is_active: ad.is_active !== undefined ? ad.is_active : true,
      start_date: ad.start_date || '', end_date: ad.end_date || '',
      priority: ad.priority || 1
    });
    setEditingAd(ad);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      const result = await AdminService.deleteBanner(id);
      if (result.success) {
        setAds(prev => prev.filter(ad => ad.id !== id));
      } else {
        setError(result.error || 'Delete failed');
      }
    }
  };

  const toggleActive = async (ad) => {
    const result = await AdminService.updateBanner(ad.id, { ...ad, is_active: !ad.is_active });
    if (result.success) {
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !ad.is_active } : a));
    } else {
      setError(result.error || 'Status update failed');
    }
  };

  const getAdsByPlacement = (placement) => ads.filter(ad => 
    ad.placement === placement && ad.is_active
  ).sort((a, b) => (a.priority || 1) - (b.priority || 1));

  const handleSlide = (placement, direction) => {
    const adsCount = getAdsByPlacement(placement).length;
    if (adsCount > 0) {
      setSliderIndex(prev => ({
        ...prev,
        [placement]: direction === 'next' 
          ? (prev[placement] + 1) % adsCount
          : prev[placement] === 0 ? adsCount - 1 : prev[placement] - 1
      }));
    }
  };

  // Compact components
  const Btn = ({ onClick, className = '', children, ...props }) => (
    <button onClick={onClick} className={`transition-colors ${className}`} {...props}>
      {children}
    </button>
  );

  const Input = ({ className = '', ...props }) => (
    <input className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.input} ${className}`} {...props} />
  );

  const Badge = ({ color, children }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {children}
    </span>
  );

  const AdSlider = ({ placement, heightClass }) => {
    const adsForPlacement = getAdsByPlacement(placement);
    if (adsForPlacement.length === 0) return null;

    const currentAd = adsForPlacement[sliderIndex[placement]] || adsForPlacement[0];
    
    return (
      <div className="relative group">
        <img src={currentAd.image_url} alt={currentAd.title} 
             className={`w-full ${heightClass} object-cover`} />
        <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">Ad</div>
        
        {adsForPlacement.length > 1 && (
          <>
            <Btn onClick={() => handleSlide(placement, 'prev')} 
                 className="absolute left-1 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-3 h-3" />
            </Btn>
            <Btn onClick={() => handleSlide(placement, 'next')} 
                 className="absolute right-1 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-3 h-3" />
            </Btn>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {adsForPlacement.map((_, index) => (
                <div key={index} className={`w-1.5 h-1.5 rounded-full ${
                  index === sliderIndex[placement] ? 'bg-white' : 'bg-white bg-opacity-50'
                }`} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 min-h-screen ${theme.bg}`}>
        <div className={`${theme.cardBg} rounded-lg shadow-sm p-6`}>
          <div className="animate-pulse space-y-4">
            <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/3`}></div>
            <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/2`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 min-h-screen ${theme.bg}`}>
      {/* Header */}
      <div className={`${theme.cardBg} rounded-lg shadow-sm p-6 mb-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text}`}>Advertisement Management</h1>
            <p className={`${theme.textMuted} mt-2`}>Configure and manage mobile app advertisements ({ads.length} total)</p>
          </div>
          <div className="flex gap-3">
            <Btn onClick={() => setPreviewMode(!previewMode)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                   previewMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                 }`}>
              <Smartphone className="w-4 h-4" />
              {previewMode ? 'Exit Preview' : 'Mobile Preview'}
            </Btn>
            <Btn onClick={() => setShowAddForm(true)}
                 className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4" />Add Advertisement
            </Btn>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <Btn onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </Btn>
          </div>
        </div>
      )}

      {previewMode ? (
        /* Mobile Preview */
        <div className="flex justify-center">
          <div className={`${theme.cardBg} rounded-lg shadow-lg p-4 max-w-sm w-full`}>
            <div className="text-center mb-4">
              <h3 className={`text-lg font-semibold ${theme.text}`}>Mobile App Preview</h3>
              <p className={`text-sm ${theme.textMuted}`}>How ads appear on mobile</p>
            </div>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden`} 
                 style={{ aspectRatio: '9/16' }}>
              <div className="bg-blue-600 text-white p-2 text-center text-sm font-medium">App Header</div>
              
              <AdSlider placement="Header" heightClass="h-20" />

              <div className="p-4 space-y-3">
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-6 rounded`}></div>
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-4 rounded w-3/4`}></div>
                
                <div className="my-3">
                  <AdSlider placement="Middle" heightClass="h-24" />
                </div>

                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-4 rounded w-2/3`}></div>
                <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-6 rounded`}></div>
              </div>

              <div className="mt-auto">
                <AdSlider placement="Footer" heightClass="h-16" />
                <div className="bg-gray-800 text-white p-2 text-center text-sm">App Footer</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Management Interface */
        <div className={showAddForm ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
          {/* Form Section */}
          {showAddForm && (
            <div className={`${theme.cardBg} rounded-lg shadow-sm p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${theme.text}`}>
                  {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
                </h2>
                <Btn onClick={resetForm} className={`${theme.textMuted} hover:text-gray-700`}>
                  <X className="w-5 h-5" />
                </Btn>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Title</label>
                  <Input type="text" name="title" value={formData.title} 
                         onChange={handleInputChange} required placeholder="Enter advertisement title" />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Placement</label>
                  <select name="placement" value={formData.placement} onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.input}`}>
                    {placements.map(p => (
                      <option key={p.value} value={p.value}>{p.label} - {p.description}</option>
                    ))}
                  </select>
                </div>

                {!editingAd && (
                  <div>
                    <label className={`block text-sm font-medium ${theme.text} mb-2`}>Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} 
                           className={`w-full px-3 py-2 border ${theme.border} rounded-lg`} required />
                    {formData.images.length > 0 && (
                      <div className="mt-3">
                        <img src={formData.images[0].url} alt="Preview" 
                             className="max-w-full h-32 object-cover rounded-lg border" />
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text} mb-2`}>Start Date</label>
                    <Input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.text} mb-2`}>End Date</label>
                    <Input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.text} mb-2`}>Priority</label>
                    <Input type="number" name="priority" value={formData.priority} 
                           onChange={handleInputChange} min="1" />
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center">
                      <input type="checkbox" name="is_active" checked={formData.is_active} 
                             onChange={handleInputChange} className="rounded text-blue-600" />
                      <span className={`ml-2 text-sm font-medium ${theme.text}`}>Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Btn type="submit" 
                       className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-medium bg-orange-500 hover:bg-orange-600">
                    <Save className="w-4 h-4" />{editingAd ? 'Update' : 'Save'}
                  </Btn>
                  <Btn type="button" onClick={resetForm} 
                       className={`px-6 py-2 border ${theme.border} ${theme.text} rounded-lg ${theme.hover} font-medium`}>
                    Cancel
                  </Btn>
                </div>
              </form>
            </div>
          )}

          {/* Table Section */}
          <div className={`${showAddForm ? '' : 'col-span-full'} ${theme.cardBg} rounded-lg shadow-sm overflow-hidden`}>
            <div className={`p-6 border-b ${theme.border}`}>
              <h2 className={`text-xl font-semibold ${theme.text}`}>Advertisement List ({ads.length})</h2>
            </div>

            {ads.length === 0 ? (
              <div className="p-12 text-center">
                <h3 className={`text-lg font-medium ${theme.text} mb-2`}>No advertisements found</h3>
                <p className={`${theme.textMuted} mb-4`}>Start by creating your first advertisement</p>
                <Btn onClick={() => setShowAddForm(true)} 
                     className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" />Add Advertisement
                </Btn>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textMuted} uppercase tracking-wider`}>
                        Advertisement
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textMuted} uppercase tracking-wider`}>
                        Placement
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textMuted} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textMuted} uppercase tracking-wider`}>
                        Priority
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textMuted} uppercase tracking-wider`}>
                        Duration
                      </th>
                      <th className={`px-6 py-3 text-right text-xs font-medium ${theme.textMuted} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border}`}>
                    {ads.map(ad => (
                      <tr key={ad.id} className={theme.hover}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img src={ad.image_url} alt="" 
                                 className="w-16 h-10 object-cover rounded border mr-4" 
                                 onError={(e) => { e.target.src = 'https://via.placeholder.com/64x40?text=No+Image' }} />
                            <div>
                              <div className={`text-sm font-medium ${theme.text}`}>{ad.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge color={
                            ad.placement === 'Header' ? 'bg-blue-100 text-blue-800' :
                            ad.placement === 'Middle' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }>
                            {ad.placement}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge color={ad.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${theme.text}`}>{ad.priority || 1}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${theme.textMuted}`}>
                            {ad.start_date || ad.end_date ? (
                              <div>
                                {ad.start_date && <div>From: {ad.start_date}</div>}
                                {ad.end_date && <div>To: {ad.end_date}</div>}
                              </div>
                            ) : (
                              'No date set'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Btn onClick={() => toggleActive(ad)} 
                                 className={`p-2 rounded-lg ${ad.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                                 title={ad.is_active ? 'Deactivate' : 'Activate'}>
                              <Eye className="w-4 h-4" />
                            </Btn>
                            <Btn onClick={() => handleEdit(ad)} 
                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                 title="Edit">
                              <Edit className="w-4 h-4" />
                            </Btn>
                            <Btn onClick={() => handleDelete(ad.id)} 
                                 className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                 title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}