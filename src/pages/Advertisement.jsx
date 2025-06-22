import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import AdminService from '../Firebase/services/adminApiService';

export default function AdvertisementModule() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sliderIndex, setSliderIndex] = useState({ Header: 0, Middle: 0 });
  const { isDark } = useTheme();
  const hasFetched = useRef(false);

  const [form, setForm] = useState({
    title: '', images: [], placement: 'Header', is_active: true,
    start_date: '', end_date: '', priority: 1
  });

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

  // Load data
  useEffect(() => {
    if (hasFetched.current) return;
    const load = async () => {
      try {
        hasFetched.current = true;
        const result = await AdminService.getBanners();
        if (result.success) {
          const banners = Array.isArray(result.data) ? result.data :
                         result.data?.banners || result.data?.data || [];
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

  // Helper functions
  const resetForm = () => {
    setForm({ title: '', images: [], placement: 'Header', is_active: true,
             start_date: '', end_date: '', priority: 1 });
    setShowForm(false);
    setEditing(null);
  };

  const getImageUrl = (ad) => ad.image_url || ad.imageUrl || ad.images?.[0]?.url || '';

  // Event handlers
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const imageObjs = Array.from(files).map(file => ({
        originFileObj: file, url: URL.createObjectURL(file)
      }));
      setForm(prev => ({ ...prev, images: imageObjs }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = editing
        ? await AdminService.updateBanner(editing.id, { ...form, id: editing.id })
        : await AdminService.addBanner(form);

      if (result.success) {
        if (editing) {
          setAds(prev => prev.map(ad => ad.id === editing.id 
            ? { ...ad, ...form, image_url: ad.image_url } : ad));
        } else {
          const newAd = result.data || { ...form, id: Date.now(), image_url: form.images[0]?.url };
          setAds(prev => [...prev, newAd]);
        }
        resetForm();
      } else {
        setError(result.error || 'Operation failed');
      }
    } catch (err) {
      setError('Operation failed: ' + err.message);
    }
  };

  const handleEdit = (ad) => {
    setForm({
      title: ad.title || '', images: [], placement: ad.placement || 'Header',
      is_active: ad.is_active !== false, start_date: ad.start_date || '',
      end_date: ad.end_date || '', priority: ad.priority || 1
    });
    setEditing(ad);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advertisement?')) return;
    try {
      const result = await AdminService.deleteBanner(id);
      if (result.success) {
        setAds(prev => prev.filter(ad => ad.id !== id));
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
      } else {
        setError(result.error || 'Status update failed');
      }
    } catch (err) {
      setError('Status update failed: ' + err.message);
    }
  };

  // Components
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
    <div className={`max-w-7xl mx-auto p-6 min-h-screen ${theme.bg}`}>
      {/* Header */}
      <div className={`${theme.card} rounded-lg shadow-sm p-6 mb-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text}`}>Advertisement Management</h1>
            <p className={`${theme.muted} mt-2`}>Configure and manage mobile app advertisements</p>
          </div>
          <Btn onClick={() => setShowForm(true)}
               className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium" style={{ backgroundColor: '#c79e73' }}>
            <Plus className="w-4 h-4" />Add Advertisement
          </Btn>
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

      {/* Management Interface */}
      <div className={showForm ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
        {/* Form Section */}
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
                <Input type="text" name="title" value={form.title}
                       onChange={handleChange} required placeholder="Enter advertisement title" />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.text} mb-2`}>Placement</label>
                <select name="placement" value={form.placement} onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${theme.input}`}>
                  {placements.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {!editing && (
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleChange} name="images"
                         className={`w-full px-3 py-2 border ${theme.border} rounded-lg`} required />
                  {form.images.length > 0 && (
                    <div className="mt-3">
                      <img src={form.images[0].url} alt="Preview"
                           className="max-w-full h-32 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>
              )}

              {editing && (
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Current Image</label>
                  <img src={getImageUrl(editing.images[0])} alt=""
                       className="max-w-full h-32 object-cover rounded-lg border"
                       onError={(e) => { e.target.src = '' }} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Start Date</label>
                  <Input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>End Date</label>
                  <Input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.text} mb-2`}>Priority</label>
                  <Input type="number" name="priority" value={form.priority}
                         onChange={handleChange} min="1" />
                </div>
                <div className="flex items-center">
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="is_active" checked={form.is_active}
                           onChange={handleChange} className="rounded text-blue-600" />
                    <span className={`ml-2 text-sm font-medium ${theme.text}`}>Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Btn type="submit"
                     className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-medium " style={{ backgroundColor: '#c79e73' }}>
                  <Save className="w-4 h-4" />{editing ? 'Update' : 'Save'}
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
        <div className={`${showForm ? '' : 'col-span-full'} ${theme.card} rounded-lg shadow-sm overflow-hidden`}>
          <div className={`p-6 border-b ${theme.border}`}>
            <h2 className={`text-xl font-semibold ${theme.text}`}>Advertisement List ({ads.length})</h2>
          </div>

          {ads.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className={`text-lg font-medium ${theme.text} mb-2`}>No advertisements found</h3>
              <p className={`${theme.muted} mb-4`}>Start by creating your first advertisement</p>
              <Btn onClick={() => setShowForm(true)}
                   className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4" />Add Advertisement
              </Btn>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                      Image
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                      Title
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                      Placement
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                      Priority
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                      Duration
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.border}`}>
                  {ads.map((ad, index) => (
                    <tr key={ad.id || index} className={theme.hover}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={getImageUrl(ad.images[0])}
                          alt={ad.title || 'Ad'}
                          className="w-16 h-10 object-cover rounded border"
                          onError={(e) => { e.target.src = '' }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${theme.text}`}>
                          {ad.title || 'Untitled Advertisement'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={
                          ad.placement === 'Header' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${theme.muted}`}>
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
                               className={`p-2 rounded-lg ${ad.is_active !== false 
                                 ? 'text-green-600 hover:bg-green-50' 
                                 : 'text-gray-400 hover:bg-gray-50'}`}
                               title={ad.is_active !== false ? 'Deactivate' : 'Activate'}>
                            {ad.is_active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
    </div>
  );
}