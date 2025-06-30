import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, RefreshCw, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import AdminApiService from '../Firebase/services/adminApiService';

export default function PolicyAdmin() {
  const { isDark } = useContext(ThemeContext);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentForm, setCurrentForm] = useState({ title: '', content: '' });
  
  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');

  const themeClass = (light, dark = '') => isDark ? `${dark} dark` : light;

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AdminApiService.getPolicies();
      const data = response?.data?.data || response?.data || response || [];
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Sorting and filtering logic
  const processedPolicies = useMemo(() => {
    let filtered = policies.filter(policy => {
      if (!policy) return false;
      const search = searchTerm.toLowerCase();
      return (policy.title || '').toLowerCase().includes(search) ||
             (policy.content || '').toLowerCase().includes(search);
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = (a[sortField] || '').toString().toLowerCase();
      const bVal = (b[sortField] || '').toString().toLowerCase();
      const result = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? result : -result;
    });

    return filtered;
  }, [policies, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedPolicies.length / itemsPerPage);
  const paginatedPolicies = processedPolicies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const openModal = (policy = null) => {
    setEditingPolicy(policy);
    setCurrentForm(policy ? { title: policy.title || '', content: policy.content || '' } : { title: '', content: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPolicy(null);
    setCurrentForm({ title: '', content: '' });
  };

  const handleSave = async () => {
    if (!currentForm.title?.trim() || !currentForm.content?.trim()) {
      return setError('Title and content are required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const policyData = {
        title: currentForm.title.trim(),
        content: currentForm.content.trim(),
        created_at: new Date().toISOString().split('T')[0] // Add timestamp
      };

      if (editingPolicy) {
        const response = await AdminApiService.updatePolicy(editingPolicy.id, policyData);
        const updatedPolicy = response?.data || { ...editingPolicy, ...policyData };
        setPolicies(prev => prev.map(p => p.id === editingPolicy.id ? updatedPolicy : p));
      } else {
        const response = await AdminApiService.createPolicy(policyData);
        // Handle different possible response structures
        const newPolicy = response?.data?.data || response?.data || { 
          ...policyData, 
          id: response?.id || Date.now().toString() 
        };
        setPolicies(prev => [newPolicy, ...prev]); // Add to beginning
      }
      
      closeModal();
    } catch (err) {
      setError(err.message || `Failed to ${editingPolicy ? 'update' : 'create'} policy`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    
    setLoading(true);
    try {
      await AdminApiService.deletePolicy(id);
      setPolicies(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete policy');
    } finally {
      setLoading(false);
    }
  };

  const Button = ({ onClick, disabled, className, children, icon: Icon, ...props }) => (
    <button onClick={onClick} disabled={disabled} className={`${className} disabled:opacity-50`} {...props}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );

  const SortHeader = ({ field, children }) => {
    const getSortIcon = () => {
      if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
      return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
    };

    return (
      <th 
        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 ${themeClass('text-gray-500 hover:bg-gray-100', 'text-gray-300 hover:bg-gray-600')}`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          {getSortIcon()}
        </div>
      </th>
    );
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className={`px-6 py-3 flex items-center justify-between border-t ${themeClass('border-gray-200', 'border-gray-600')}`}>
        <div className={`text-sm ${themeClass('text-gray-700', 'text-gray-300')}`}>
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedPolicies.length)} of {processedPolicies.length} results
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded flex items-center gap-1 ${themeClass('text-gray-600 hover:bg-gray-100', 'text-gray-300 hover:bg-gray-700')}`}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded ${currentPage === pageNum 
                  ? 'bg-blue-500 text-white' 
                  : themeClass('text-gray-600 hover:bg-gray-100', 'text-gray-300 hover:bg-gray-700')
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded flex items-center gap-1 ${themeClass('text-gray-600 hover:bg-gray-100', 'text-gray-300 hover:bg-gray-700')}`}
            icon={ChevronRight}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-6 ${themeClass('bg-gray-50', 'bg-gray-900')}`}>
      <div className="max-w-full mx-auto">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <Button onClick={() => setError(null)} className="text-red-500 hover:text-red-700" icon={X} />
          </div>
        )}

        {/* Header */}
        <div className={`rounded-lg shadow-sm p-6 mb-6 ${themeClass('bg-white', 'bg-gray-800 border border-gray-700')}`}>
          <h1 className={`text-3xl font-bold mb-4 ${themeClass('text-gray-900', 'text-white')}`}>
            Policy Management ({processedPolicies.length})
          </h1>
          
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white', 'border-gray-600 bg-gray-700 text-white')}`}
              />
            </div>
            {/* <Button 
              onClick={() => openModal()} 
              disabled={loading}
              className="text-white px-4 py-2 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: '#c79e73' }}
              icon={Plus}
            >
              Add Policy
            </Button> */}
          </div>
        </div>

        {/* Policies Table */}
        <div className={`rounded-lg shadow-sm overflow-hidden ${themeClass('bg-white', 'bg-gray-800 border border-gray-700')}`}>
          {loading && policies.length === 0 ? (
            <div className="flex justify-center items-center p-8">
              <RefreshCw className="animate-spin w-6 h-6 text-blue-500 mr-2" />
              <span className="text-gray-600">Loading policies...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={themeClass('bg-gray-50', 'bg-gray-700')}>
                  <tr>
                    <SortHeader field="title">Title</SortHeader>
                    <SortHeader field="content">Content</SortHeader>
                    <SortHeader field="created_at">Created</SortHeader>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClass('bg-white divide-gray-200', 'bg-gray-800 divide-gray-600')}`}>
                  {paginatedPolicies.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? `No policies match "${searchTerm}"` : 
                         policies.length === 0 ? 'No policies found. Click "Add Policy" to create one.' : 
                         'No policies match your search.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedPolicies.map((policy) => (
                      <tr key={policy.id} className={themeClass('hover:bg-gray-50', 'hover:bg-gray-700')}>
                        <td className="px-6 py-4">
                          <div className={`font-medium ${themeClass('text-gray-900', 'text-white')}`}>
                            {policy.title || 'Untitled'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm max-w-xs truncate ${themeClass('text-gray-500', 'text-gray-400')}`}>
                            {policy.content || 'No content'}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${themeClass('text-gray-500', 'text-gray-400')}`}>
                          {policy.created_at || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              onClick={() => openModal(policy)} 
                              className="text-blue-600 hover:text-blue-900" 
                              icon={Edit2} 
                              title="Edit" 
                            />
                            <Button 
                              onClick={() => handleDelete(policy.id)} 
                              className="text-red-600 hover:text-red-900" 
                              icon={Trash2} 
                              title="Delete" 
                              disabled={loading} 
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <Pagination />
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${themeClass('bg-white', 'bg-gray-800')}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${themeClass('text-gray-900', 'text-white')}`}>
                  {editingPolicy ? 'Edit Policy' : 'Add Policy'}
                </h2>
                <Button onClick={closeModal} className={themeClass('text-gray-400 hover:text-gray-600', 'text-gray-400 hover:text-gray-300')} icon={X} />
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Title *</label>
                  <input
                    type="text"
                    value={currentForm.title}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter policy title"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white', 'border-gray-600 bg-gray-700 text-white')}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Content *</label>
                  <textarea
                    value={currentForm.content}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter policy content"
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white', 'border-gray-600 bg-gray-700 text-white')}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-lg ${themeClass('text-gray-700 bg-gray-100 hover:bg-gray-200', 'text-gray-300 bg-gray-700 hover:bg-gray-600')}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !currentForm.title?.trim() || !currentForm.content?.trim()}
                  className="text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: '#c79e73' }}
                  icon={loading ? RefreshCw : Save}
                >
                  {editingPolicy ? 'Update' : 'Add'} Policy
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}