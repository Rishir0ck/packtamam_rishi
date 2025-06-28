import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, RefreshCw, Copy, Download } from 'lucide-react';
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

  const themeClass = (light, dark = '') => isDark ? `${dark} dark` : light;

  // Fixed fetch function - removed useCallback to prevent dependency issues
  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AdminApiService.getPolicies();
      
      // Extract data array from the response
      const data = response?.data || [];
      console.log('Extracted data:', data); // Only this debug log
      
      // Ensure data is array
      const policiesArray = Array.isArray(data) ? data : [];
      
      setPolicies(policiesArray);
    } catch (err) {
      console.error('Fetch policies error:', err);
      setError(err.message || 'Failed to fetch policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  // Load policies on mount - removed dependency array to prevent re-creation
  useEffect(() => {
    fetchPolicies();
  }, []); // Empty dependency array - only run once on mount

  // Filter policies based on title and content
  const filteredPolicies = policies.filter(policy => {
    if (!policy) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (policy.title || '')?.toLowerCase().includes(searchLower) ||
      (policy.content || '')?.toLowerCase().includes(searchLower)
    );
  });

  const resetForm = () => ({ title: '', content: '' });

  const openModal = (policy = null) => {
    setEditingPolicy(policy);
    setCurrentForm(policy ? {
      title: policy.title || '',
      content: policy.content || '',
    } : resetForm());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPolicy(null);
    setCurrentForm(resetForm());
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
      };

      if (editingPolicy) {
        const updatedPolicy = await AdminApiService.updatePolicy(editingPolicy.id, policyData);
        // Update local state with response data or fallback to form data
        const updatedData = updatedPolicy?.data || updatedPolicy || { ...editingPolicy, ...policyData };
        setPolicies(prev => prev.map(p => 
          p.id === editingPolicy.id ? updatedData : p
        ));
      } else {
        const newPolicy = await AdminApiService.createPolicy(policyData);
        // Handle different response structures
        const newPolicyData = newPolicy?.data || newPolicy || { 
          ...policyData, 
          id: Date.now().toString() // Fallback ID if not provided
        };
        setPolicies(prev => [...prev, newPolicyData]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || `Failed to ${editingPolicy ? 'update' : 'create'} policy`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    
    setLoading(true);
    setError(null);
    try {
      await AdminApiService.deletePolicy(id);
      setPolicies(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete policy');
    } finally {
      setLoading(false);
    }
  };

  const duplicatePolicy = async (policy) => {
    setLoading(true);
    setError(null);
    try {
      const { id, created_at, updated_at, slug, ...newPolicyData } = policy;
      const duplicated = await AdminApiService.createPolicy({ 
        ...newPolicyData, 
        title: `${policy.title || 'Policy'} (Copy)`,
      });
      const duplicatedData = duplicated?.data || duplicated || { 
        ...newPolicyData, 
        id: Date.now().toString(),
        title: `${policy.title || 'Policy'} (Copy)`
      };
      setPolicies(prev => [...prev, duplicatedData]);
    } catch (err) {
      console.error('Duplicate error:', err);
      setError(err.message || 'Failed to duplicate policy');
    } finally {
      setLoading(false);
    }
  };

  const exportPolicy = (policy) => {
    const policyData = {
      title: policy.title,
      content: policy.content,
      created_at: policy.created_at,
      id: policy.id
    };
    
    const blob = new Blob([JSON.stringify(policyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.title || 'policy'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Button = ({ onClick, disabled, className, children, icon: Icon, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${className} disabled:opacity-50`} 
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );

  return (
    <div className={`min-h-screen p-6 ${themeClass('bg-gray-50', 'bg-gray-900')}`}>
      <div className="max-w-7xl mx-auto">
        
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
            Policy Management
          </h1>
          
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white', 'border-gray-600 bg-gray-700 text-white')}`}
              />
            </div>
            <Button 
              onClick={() => openModal()} 
              disabled={loading}
              className=" text-white px-4 py-2 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: '#c79e73' }}
              icon={Plus}
            >
              Add Policy
            </Button>
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
                    {['Title', 'Content', 'Created', 'Actions'].map(header => (
                      <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClass('bg-white divide-gray-200', 'bg-gray-800 divide-gray-600')}`}>
                  {filteredPolicies.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        <div>
                          {searchTerm ? `No policies match your search "${searchTerm}"` : 
                           policies.length === 0 ? 'No policies found. Click "Add Policy" to create one.' : 
                           'No policies match your search criteria.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPolicies.map((policy, index) => (
                      <tr key={policy.id || index} className={themeClass('hover:bg-gray-50', 'hover:bg-gray-700')}>
                        <td className="px-6 py-4">
                          <div className={`font-medium ${themeClass('text-gray-900', 'text-white')}`}>
                            {policy.title || 'Untitled'}
                          </div>
                          <div className="text-xs text-gray-400">ID: {policy.id}</div>
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
                            <Button onClick={() => openModal(policy)} className="text-blue-600 hover:text-blue-900" icon={Edit2} title="Edit" />
                            {/* <Button onClick={() => duplicatePolicy(policy)} className="text-green-600 hover:text-green-900" icon={Copy} title="Duplicate" disabled={loading} />
                            <Button onClick={() => exportPolicy(policy)} className="text-purple-600 hover:text-purple-900" icon={Download} title="Export" /> */}
                            <Button onClick={() => handleDelete(policy.id)} className="text-red-600 hover:text-red-900" icon={Trash2} title="Delete" disabled={loading} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={currentForm.title}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter policy title"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white', 'border-gray-600 bg-gray-700 text-white')}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>
                    Content *
                  </label>
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