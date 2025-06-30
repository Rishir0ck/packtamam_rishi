import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronUp, ChevronDown, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import adminApiService from '../Firebase/services/adminApiService';
import Password from 'antd/es/input/Password';

export default function ProfileManager() {
  const { isDark } = useContext(ThemeContext);
  
  const [profiles, setProfiles] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    name: '', email: '', role: '', password:'', is_active: true, modules: []
  });

  const themeClass = (light, dark = '') => isDark ? `${dark} dark` : light;

  // Helper function to get module display name
  const getModuleName = (module) => {
    if (typeof module === 'string') return module;
    if (typeof module === 'object' && module !== null) {
      return module.name || module.title || module.label || String(module.id) || 'Unknown Module';
    }
    return String(module);
  };

  // Helper function to get module identifier for comparisons
  const getModuleId = (module) => {
    if (typeof module === 'string') return module;
    if (typeof module === 'object' && module !== null) {
      return module.id || module.name || module.title || module.label;
    }
    return module;
  };

  // Extract data from API response
  const extractData = (response, dataKey) => {
    if (!response?.success) return [];
    
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data[dataKey])) return data[dataKey];
    if (data && typeof data === 'object') return Object.values(data).filter(Array.isArray)[0] || [];
    return [];
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [profilesRes, modulesRes] = await Promise.all([
        adminApiService.listSubAdmins(),
        adminApiService.listModules()
      ]);
      
      console.log('Profiles Response:', profilesRes);
      console.log('Modules Response:', modulesRes);
      
      const profileData = extractData(profilesRes, 'profiles');
      const moduleData = extractData(modulesRes, 'modules');
      
      console.log('Extracted Profiles:', profileData);
      console.log('Extracted Modules:', moduleData);
      
      setProfiles(profileData);
      setModules(moduleData);
      
      if (!profilesRes?.success) {
        setError(profilesRes?.message || 'Failed to load profiles');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
      setProfiles([]);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => 
      String(p?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(p?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      String(p?.role || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [profiles, search]);

  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      const aVal = String(a?.[sortField] || '');
      const bVal = String(b?.[sortField] || '');
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [filteredProfiles, sortField, sortDir]);

  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProfiles.slice(start, start + itemsPerPage);
  }, [sortedProfiles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProfiles.length / itemsPerPage);

  const handleSort = (field) => {
    setSortField(field);
    setSortDir(sortField === field && sortDir === 'asc' ? 'desc' : 'asc');
  };

  const openModal = (profile = null) => {
    setEditingProfile(profile);
    setFormData(profile ? { 
      name: profile.name || '',
      email: profile.email || '',
      role: profile.role || '',
      password: profile.password || '',
      is_active: profile.is_active ?? true,
      modules: Array.isArray(profile.modules) ? profile.modules : []
    } : { name: '', email: '', role: '', password: '', is_active: true, modules: [] });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProfile(null);
    setFormData({ name: '', email: '', role: '', password: '', is_active: true, modules: [] });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const response = editingProfile ? 
        await adminApiService.updateSubAdmin(editingProfile.id, formData.email, formData.name, formData.role, formData.password, formData.modules, formData.is_active) :
        await adminApiService.addSubAdmin(formData.email, formData.name, formData.role, formData.password, formData.modules, formData.is_active);
      
      if (response.success) {
        await loadData();
        closeModal();
      } else {
        alert(response.message || 'Error saving profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    try {
      const response = await adminApiService.deleteSubAdmin(id);
      if (response.success) {
        await loadData();
      } else {
        alert(response.message || 'Error deleting profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile');
    }
  };

  const handleModuleChange = (module) => {
    const moduleId = getModuleId(module);
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.some(m => getModuleId(m) === moduleId)
        ? prev.modules.filter(m => getModuleId(m) !== moduleId)
        : [...prev.modules, module]
    }));
  };

  const SortHeader = ({ field, children }) => (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${themeClass('text-gray-500 hover:bg-gray-50', 'text-gray-300 hover:bg-gray-700')}`} 
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className={`p-6 min-h-screen flex items-center justify-center ${themeClass('bg-gray-50', 'bg-gray-900')}`}>
        <div className={`text-lg ${themeClass('text-gray-600', 'text-gray-400')}`}>Loading...</div>
      </div>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <div className={`p-6 min-h-screen flex items-center justify-center ${themeClass('bg-gray-50', 'bg-gray-900')}`}>
        <div className={`text-center ${themeClass('text-gray-600', 'text-gray-400')}`}>
          <p className="text-lg mb-4">Error: {error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 text-white rounded-lg bg-yellow-600 hover:bg-yellow-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${themeClass('bg-gray-50', 'bg-gray-900')}`}>
      <div className="max-w-full mx-auto">
        <div className={`rounded-lg shadow ${themeClass('bg-white', 'bg-gray-800 border border-gray-700')}`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${themeClass('border-gray-200', 'border-gray-700')}`}>
            <div className="flex justify-between items-center mb-4">
              <h1 className={`text-2xl font-bold ${themeClass('text-gray-900', 'text-white')}`}>
                Profile Management ({profiles.length})
              </h1>
              <button 
                onClick={() => openModal()} 
                className="text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                style={{ backgroundColor: '#c79e73' }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Profile</span>
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search profiles..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className={`${themeClass('bg-gray-50', 'bg-gray-700')}`}>
                <tr>
                  <SortHeader field="name">Name</SortHeader>
                  <SortHeader field="email">Email</SortHeader>
                  <SortHeader field="role">Role</SortHeader>
                  <SortHeader field="is_active">Status</SortHeader>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>
                    Modules
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClass('bg-white divide-gray-200', 'bg-gray-800 divide-gray-600')}`}>
                {paginatedProfiles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`px-6 py-8 text-center ${themeClass('text-gray-500', 'text-gray-400')}`}>
                      {profiles.length === 0 ? 'No profiles found' : 'No profiles match your search'}
                    </td>
                  </tr>
                ) : (
                  paginatedProfiles.map((profile, index) => (
                    <tr key={profile.id || profile.email || index} className={`${themeClass('hover:bg-gray-50', 'hover:bg-gray-700')}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${themeClass('text-gray-900', 'text-white')}`}>
                          {profile.name || 'N/A'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClass('text-gray-500', 'text-gray-400')}`}>
                        {profile.email || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClass('text-gray-500', 'text-gray-400')}`}>
                        {profile.role || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {profile.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(profile.modules || []).map((module, idx) => (
                            <span key={`${getModuleId(module)}-${idx}`} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {getModuleName(module)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openModal(profile)} 
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(profile.id)} 
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-6 py-4 border-t flex items-center justify-between ${themeClass('border-gray-200', 'border-gray-700')}`}>
              <div className={`text-sm ${themeClass('text-gray-700', 'text-gray-400')}`}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedProfiles.length)} of {sortedProfiles.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded disabled:opacity-50 ${themeClass('hover:bg-gray-100', 'hover:bg-gray-700')}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className={`px-3 py-1 text-sm ${themeClass('text-gray-700', 'text-gray-300')}`}>
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded disabled:opacity-50 ${themeClass('hover:bg-gray-100', 'hover:bg-gray-700')}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${themeClass('bg-white', 'bg-gray-800')}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${themeClass('text-gray-900', 'text-white')}`}>
                {editingProfile ? 'Edit Profile' : 'Add Profile'}
              </h2>
              <button onClick={closeModal} className={`${themeClass('text-gray-400 hover:text-gray-600', 'text-gray-400 hover:text-gray-300')}`}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Name *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Email *</label>
                  <input
                    type="email"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Role *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Password *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Status</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>

              {modules.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClass('text-gray-700', 'text-gray-300')}`}>
                    Assign Modules
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {modules.map((module, idx) => (
                      <label key={`${getModuleId(module)}-${idx}`} className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition-colors ${themeClass('border-gray-200 hover:bg-gray-50', 'border-gray-600 hover:bg-gray-700')}`}>
                        <input
                          type="checkbox"
                          checked={formData.modules.some(m => getModuleId(m) === getModuleId(module))}
                          onChange={() => handleModuleChange(module)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm capitalize ${themeClass('text-gray-700', 'text-gray-300')}`}>
                          {getModuleName(module)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${themeClass('border-gray-300 text-gray-700 hover:bg-gray-50', 'border-gray-600 text-gray-300 hover:bg-gray-700')}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className=" px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2"
                  style={{ backgroundColor: '#c79e73' }}
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProfile ? 'Update' : 'Create'} Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}