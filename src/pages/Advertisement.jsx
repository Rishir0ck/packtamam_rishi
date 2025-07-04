import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, AlertCircle } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import AdminService from '../Firebase/services/adminApiService';

export default function AdvertisementModule() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showView, setShowView] = useState(null);
  const { isDark } = useTheme();
  const hasFetched = useRef(false);

  const initialFormState = {
    title: '',
    placement: 'Header',
    priority: 1,
    images: [],
    is_active: true
  };

  const [formState, setFormState] = useState(initialFormState);

  const placements = [
    { value: 'Header', label: 'Header - Top of screen' },
    { value: 'Middle', label: 'Middle - Content area' }
  ];

  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white',
    muted: 'text-gray-300', border: 'border-gray-700',
    input: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900',
    muted: 'text-gray-600', border: 'border-gray-200',
    input: 'bg-white border-gray-300', hover: 'hover:bg-gray-50'
  };

  useEffect(() => {
    if (hasFetched.current) return;
    const load = async () => {
      try {
        hasFetched.current = true;
        const result = await AdminService.getBanners();
        if (result.success) {
          const banners = Array.isArray(result.data) ? result.data : result.data?.banners || result.data?.data || [];
          setAds(banners);
        } else {
          setError(result.error || 'Failed to load advertisements');
        }
      } catch (err) {
        setError('Connection failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = useCallback(() => {
    setFormState(initialFormState);
    setShowForm(false);
    setEditing(null);
  }, []);

  const getImageUrl = (ad) => {
    if (!ad) return '';
    if (typeof ad === 'string') return ad;
    return ad.image_url || ad.imageUrl || (ad.images?.[0]?.url || ad.images?.[0]?.image_url || ad.images?.[0]) || '';
  };

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    setFormState(prev => {
      if (type === 'file') {
        return { 
          ...prev, 
          images: Array.from(files).map(file => ({
            originFileObj: file, 
            url: URL.createObjectURL(file)
          }))
        };
      }
      if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      }
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!editing && (!formState.images || formState.images.length === 0)) {
      setError('Please select an image');
      return;
    }
    
    try {
      const result = editing
        ? await AdminService.updateBanner(editing.id, editing.placement, editing.image_url, editing.priority, formState.title)
        : await AdminService.addBanner(formState);

      if (result.success) {
        if (editing) {
          setAds(prev => prev.map(ad => ad.id === editing.id 
            ? { ...ad, ...formState, image_url: getImageUrl(ad) } : ad));
        } else {
          // Fixed: Handle the response data properly
          const newAd = result.data || result.banner || {};
          const adToAdd = {
            id: newAd.id || Date.now().toString(),
            title: newAd.title || formState.title,
            placement: newAd.placement || formState.placement,
            priority: newAd.priority || formState.priority,
            is_active: newAd.is_active !== undefined ? newAd.is_active : formState.is_active,
            image_url: newAd.image_url || formState.images[0]?.url || '',
            images: newAd.images || formState.images
          };
          setAds(prev => [...prev, adToAdd]);
        }
        resetForm();
      } else {
        setError(result.error || 'Operation failed');
      }
    } catch (err) {
      setError('Operation failed: ' + err.message);
    }
  };

  const handleEdit = useCallback((ad) => {
    setFormState({
      title: ad.title || '', 
      placement: ad.placement || 'Header', 
      priority: ad.priority || 1,
      images: [],
      is_active: ad.is_active !== false,
    });
    setEditing(ad);
    setShowForm(true);
    setShowView(null);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advertisement?')) return;
    try {
      const result = await AdminService.deleteBanner(id);
      if (result.success) {
        setAds(prev => prev.filter(ad => ad.id !== id));
        setShowView(null);
      } else {
        setError(result.error || 'Delete failed');
      }
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const toggleActive = async (ad) => {
    try {
      const newStatus = !ad.is_active;
      const result = await AdminService.updateBanner(ad.id, { ...ad, is_active: newStatus });
      if (result.success) {
        setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: newStatus } : a));
        if (showView?.id === ad.id) {
          setShowView({ ...showView, is_active: newStatus });
        }
      } else {
        setError(result.error || 'Status update failed');
      }
    } catch (err) {
      setError('Status update failed: ' + err.message);
    }
  };

  const Btn = ({ onClick, className = '', children, ...props }) => (
    <button onClick={onClick} className={`transition-colors ${className}`} {...props}>
      {children}
    </button>
  );

  const Badge = ({ color, children }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {children}
    </span>
  );

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 min-h-screen ${theme.bg}`}>
        <div className={`${theme.card} rounded-lg shadow-sm p-6`}>
          <div className="animate-pulse space-y-4">
            <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/3`}></div>
            <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/2`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-full mx-auto p-6 min-h-screen ${theme.bg}`}>
      <div className={`${theme.card} rounded-lg shadow-sm p-6 mb-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text}`}>Advertisement Management</h1>
            <p className={`${theme.muted} mt-2`}>Configure and manage mobile app advertisements</p>
          </div>
          <Btn onClick={() => {setShowForm(true); setShowView(null); }}
               className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium" style={{ backgroundColor: '#c79e73' }}>
            <Plus className="w-4 h-4" />Add Advertisement
          </Btn>
        </div>
      </div>

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

      <div className={showForm ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
        {showForm && (
          <div className={`${theme.card} rounded-lg shadow-sm p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${theme.text}`}>
                {editing ? 'Edit Advertisement' : 'Add New Advertisement'}
              </h2>
              <Btn onClick={resetForm} className={`${theme.muted} hover:text-gray-700`}>
                <X className="w-5 h-5" />
              </Btn>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme.text} mb-2`}>Title</label>
                <input
                  type="text" 
                  name="title" 
                  value={formState.title}
                  onChange={handleChange} 
                  required 
                  placeholder="Enter advertisement title"
                  className={`w-full px-3 py-2 rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.text} mb-2`}>Placement</label>
                <select 
                  name="placement" 
                  value={formState.placement} 
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg ${theme.input}`}
                >
                  {placements.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {!editing && (
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Upload Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleChange} 
                    name="images"
                    className={`w-full px-3 py-2 border ${theme.border} rounded-lg`} 
                    required 
                  />
                  {formState.images.length > 0 && (
                    <div className="mt-3">
                      <img 
                        src={formState.images[0].url} 
                        alt="Preview"
                        className="max-w-full h-32 object-cover rounded-lg border" 
                      />
                    </div>
                  )}
                </div>
              )}

              {editing && (
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Current Image</label>
                  {getImageUrl(editing) ? (
                    <img 
                      src={getImageUrl(editing)} 
                      alt=""
                      className="max-w-full h-32 object-cover rounded-lg border"
                      onError={(e) => { e.target.style.display = 'none' }} 
                    />
                  ) : (
                    <div className="max-w-full h-32 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500">
                      No Image Available
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Priority</label>
                  <input
                    type="number" 
                    name="priority" 
                    value={formState.priority}
                    onChange={handleChange} 
                    min="1"
                    className={`w-full px-3 py-2 rounded-lg ${theme.input}`}
                  />
                </div>
                <div className="flex items-center">
                  <label className="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      checked={formState.is_active}
                      onChange={handleChange} 
                      className="rounded text-blue-600" 
                    />
                    <span className={`ml-2 text-sm font-medium ${theme.text}`}>Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Btn 
                  type="submit"
                  className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-medium" style={{ backgroundColor: '#c79e73' }}
                >
                  <Save className="w-4 h-4" />{editing ? 'Update' : 'Save'}
                </Btn>
                <Btn 
                  type="button" 
                  onClick={resetForm}
                  className={`px-6 py-2 border ${theme.border} ${theme.text} rounded-lg ${theme.hover} font-medium`}
                >
                  Cancel
                </Btn>
              </div>
            </form>
          </div>
        )}

        {showView && (
          <div className={`${theme.card} rounded-lg shadow-sm p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${theme.text}`}>Advertisement Details</h2>
              <Btn onClick={() => setShowView(null)} className={`${theme.muted} hover:text-gray-700`}>
                <X className="w-5 h-5" />
              </Btn>
            </div>

            <div className="space-y-4">
              <div>
                {getImageUrl(showView) ? (
                  <img 
                    src={getImageUrl(showView)} 
                    alt=""
                    className="w-full object-cover rounded-lg border"
                    onError={(e) => { e.target.style.display = 'none' }} 
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.muted}`}>Title</label>
                  <p className={`${theme.text} font-medium`}>{showView.title || 'Untitled'}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.muted}`}>Placement</label>
                  <Badge color={showView.placement === 'Header' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                    {showView.placement || 'Header'}
                  </Badge>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.muted}`}>Status</label>
                  <Badge color={showView.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {showView.is_active !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.muted}`}>Priority</label>
                  <p className={`${theme.text} font-medium`}>{showView.priority || 1}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Btn 
                  onClick={() => handleEdit(showView)}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium bg-[#cca883]"
                >
                  <Edit className="w-4 h-4" />Edit
                </Btn>
                <Btn 
                  onClick={() => toggleActive(showView)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    showView.is_active !== false 
                      ? 'bg-[#ff2a2a] text-white' 
                      : 'bg-[#28a81d] text-white'
                  }`}
                >
                  {showView.is_active !== false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showView.is_active !== false ? 'Deactivate' : 'Activate'}
                </Btn>
              </div>
            </div>
          </div>
        )}

        <div className={`${showForm || showView ? '' : 'col-span-full'} ${theme.card} rounded-lg shadow-sm overflow-hidden`}>
          <div className={`p-6 border-b ${theme.border}`}>
            <h2 className={`text-xl font-semibold ${theme.text}`}>Advertisement List ({ads.length})</h2>
          </div>

          {ads.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className={`text-lg font-medium ${theme.text} mb-2`}>No advertisements found</h3>
              <p className={`${theme.muted} mb-4`}>Start by creating your first advertisement</p>
              <Btn 
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4" />Add Advertisement
              </Btn>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    {['Sr.No.','Image', 'Title', 'Placement', 'Status', 'Priority', 'Actions'].map(header => (
                      <th key={header} className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider ${header === 'Actions' ? 'text-right' : ''}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.border}`}>
                  {ads.map((ad, index) => (
                    <tr key={ad.id || index} className={theme.hover}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${theme.text}`}>{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getImageUrl(ad) ? (
                          <img
                            src={getImageUrl(ad)}
                            alt=""
                            className="w-16 h-12 object-cover rounded border"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${theme.text}`}>
                          {ad.title || 'Untitled Advertisement'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={ad.placement === 'Header' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                          {ad.placement || 'Header'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={ad.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {ad.is_active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${theme.text}`}>{ad.priority || 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Btn 
                            onClick={() => { setShowView(ad); setShowForm(false); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Btn>
                          <Btn 
                            onClick={() => handleEdit(ad)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Btn>
                          <Btn 
                            onClick={() => handleDelete(ad.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
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
    </div>
  );
}