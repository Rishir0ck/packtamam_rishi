import React, { useState, useMemo, useContext } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronUp, ChevronDown, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext'

export default function ProfileManager(){
  const { isDark } = useContext(ThemeContext);
  
  const [profiles, setProfiles] = useState([
    { id: 1, name: 'Super Admin', email: 'admin@company.com', role: 'Administrator', status: 'Active', modules: ['users', 'settings', 'reports', 'billing'] },
    { id: 2, name: 'John Manager', email: 'john@company.com', role: 'Manager', status: 'Active', modules: ['users', 'reports'] },
    { id: 3, name: 'Sarah Editor', email: 'sarah@company.com', role: 'Editor', status: 'Inactive', modules: ['content', 'media'] },
    { id: 4, name: 'Mike Analyst', email: 'mike@company.com', role: 'Analyst', status: 'Active', modules: ['reports', 'analytics'] },
    { id: 5, name: 'Lisa Support', email: 'lisa@company.com', role: 'Support', status: 'Active', modules: ['tickets', 'users'] },
  ]);

  const modules = ['users', 'settings', 'reports', 'billing', 'content', 'media', 'analytics', 'tickets', 'dashboard', 'notifications'];
  
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const [formData, setFormData] = useState({
    name: '', email: '', role: '', status: 'Active', modules: []
  });

  // Theme utility function (same as in Policy component)
  const themeClass = (light, dark = '') => isDark ? `${dark} dark` : light;

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [profiles, search]);

  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [filteredProfiles, sortField, sortDir]);

  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProfiles.slice(start, start + itemsPerPage);
  }, [sortedProfiles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProfiles.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const openModal = (profile = null) => {
    setEditingProfile(profile);
    setFormData(profile ? { ...profile } : { name: '', email: '', role: '', status: 'Active', modules: [] });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProfile(null);
    setFormData({ name: '', email: '', role: '', status: 'Active', modules: [] });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.role) return;
    if (editingProfile) {
      setProfiles(profiles.map(p => p.id === editingProfile.id ? { ...formData, id: editingProfile.id } : p));
    } else {
      setProfiles([...profiles, { ...formData, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  const handleModuleChange = (module) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter(m => m !== module)
        : [...prev.modules, module]
    }));
  };

  const SortHeader = ({ field, children }) => (
    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${themeClass('text-gray-500 hover:bg-gray-50', 'text-gray-300 hover:bg-gray-700')}`} onClick={() => handleSort(field)}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </div>
    </th>
  );

  return (
    <div className={`p-6 min-h-screen ${themeClass('bg-gray-50', 'bg-gray-900')}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`rounded-lg shadow ${themeClass('bg-white', 'bg-gray-800 border border-gray-700')}`}>
          <div className={`px-6 py-4 border-b ${themeClass('border-gray-200', 'border-gray-700')}`}>
            <div className="flex justify-between items-center">
              <h1 className={`text-2xl font-bold ${themeClass('text-gray-900', 'text-white')}`}>Profile Management</h1>
              <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Profile</span>
              </button>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white placeholder-gray-400')}`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className={`${themeClass('bg-gray-50', 'bg-gray-700')}`}>
                <tr>
                  <SortHeader field="name">Name</SortHeader>
                  <SortHeader field="email">Email</SortHeader>
                  <SortHeader field="role">Role</SortHeader>
                  <SortHeader field="status">Status</SortHeader>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>Modules</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClass('bg-white divide-gray-200', 'bg-gray-800 divide-gray-600')}`}>
                {paginatedProfiles.map((profile) => (
                  <tr key={profile.id} className={`${themeClass('hover:bg-gray-50', 'hover:bg-gray-700')}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${themeClass('text-gray-900', 'text-white')}`}>{profile.name}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClass('text-gray-500', 'text-gray-400')}`}>{profile.email}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClass('text-gray-500', 'text-gray-400')}`}>{profile.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.modules.map(module => (
                          <span key={module} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {module}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => openModal(profile)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(profile.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </div>
      </div>

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
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Name</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Email</label>
                  <input
                    type="email"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Role</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Status</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClass('text-gray-700', 'text-gray-300')}`}>Assign Modules</label>
                <div className="grid grid-cols-3 gap-2">
                  {modules.map(module => (
                    <label key={module} className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition-colors ${themeClass('border-gray-200 hover:bg-gray-50', 'border-gray-600 hover:bg-gray-700')}`}>
                      <input
                        type="checkbox"
                        checked={formData.modules.includes(module)}
                        onChange={() => handleModuleChange(module)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm capitalize ${themeClass('text-gray-700', 'text-gray-300')}`}>{module}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
};