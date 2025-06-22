import React, { useState, useEffect, useContext } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Filter, Eye, Copy, Download, Upload } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext'

export default function PolicyAdmin() {
  const { isDark } = useContext(ThemeContext);
  
  const [policies, setPolicies] = useState([
    { id: 1, name: 'S3FullAccess', type: 'AWS Managed', effect: 'Allow', resources: ['arn:aws:s3:::*'], actions: ['s3:*'], conditions: {}, version: '2012-10-17', createdAt: '2024-01-15', status: 'Active' },
    { id: 2, name: 'EC2ReadOnly', type: 'Custom', effect: 'Allow', resources: ['arn:aws:ec2:*:*:*'], actions: ['ec2:Describe*'], conditions: { 'StringEquals': { 'aws:RequestedRegion': 'us-east-1' } }, version: '2012-10-17', createdAt: '2024-01-10', status: 'Active' }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentForm, setCurrentForm] = useState({
    name: '', type: 'Custom', effect: 'Allow', resources: [''], actions: [''], 
    conditions: {}, version: '2012-10-17', status: 'Active'
  });

  const policyTypes = ['All', 'AWS Managed', 'Custom', 'Inline'];
  const effects = ['Allow', 'Deny'];
  const commonActions = [
    's3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket',
    'ec2:DescribeInstances', 'ec2:StartInstances', 'ec2:StopInstances',
    'iam:ListUsers', 'iam:CreateUser', 'iam:DeleteUser',
    'lambda:InvokeFunction', 'lambda:CreateFunction'
  ];

  // Theme utility function
  const themeClass = (light, dark = '') => isDark ? `${dark} dark` : light;

  const openModal = (policy = null) => {
    setEditingPolicy(policy);
    setCurrentForm(policy ? { ...policy } : {
      name: '', type: 'Custom', effect: 'Allow', resources: [''], actions: [''], 
      conditions: {}, version: '2012-10-17', status: 'Active'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPolicy(null);
    setCurrentForm({ name: '', type: 'Custom', effect: 'Allow', resources: [''], actions: [''], conditions: {}, version: '2012-10-17', status: 'Active' });
  };

  const handleSave = () => {
    if (!currentForm.name.trim()) return;
    
    const policyData = {
      ...currentForm,
      id: editingPolicy ? editingPolicy.id : Date.now(),
      createdAt: editingPolicy ? editingPolicy.createdAt : new Date().toISOString().split('T')[0],
      resources: currentForm.resources.filter(r => r.trim()),
      actions: currentForm.actions.filter(a => a.trim())
    };

    if (editingPolicy) {
      setPolicies(prev => prev.map(p => p.id === editingPolicy.id ? policyData : p));
    } else {
      setPolicies(prev => [...prev, policyData]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(prev => prev.filter(p => p.id !== id));
    }
  };

  const duplicatePolicy = (policy) => {
    const newPolicy = { ...policy, id: Date.now(), name: `${policy.name}_Copy`, createdAt: new Date().toISOString().split('T')[0] };
    setPolicies(prev => [...prev, newPolicy]);
  };

  const exportPolicy = (policy) => {
    const policyJson = {
      Version: policy.version,
      Statement: [{
        Effect: policy.effect,
        Action: policy.actions,
        Resource: policy.resources,
        ...(Object.keys(policy.conditions).length > 0 && { Condition: policy.conditions })
      }]
    };
    const blob = new Blob([JSON.stringify(policyJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.name}.json`;
    a.click();
  };

  const filteredPolicies = policies.filter(policy => 
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'All' || policy.type === filterType)
  );

  const updateFormArray = (field, index, value) => {
    setCurrentForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addFormArrayItem = (field) => {
    setCurrentForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeFormArrayItem = (field, index) => {
    setCurrentForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  return (
    <div className={`min-h-screen p-6 ${themeClass('bg-gray-50', 'bg-gray-900')}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`rounded-lg shadow-sm p-6 mb-6 ${themeClass('bg-white', 'bg-gray-800 border border-gray-700')}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-3xl font-bold ${themeClass('text-gray-900', 'text-white')}`}>Policy Management</h1>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
              />
            </div>
            <button 
              onClick={() => openModal()} 
              className=" text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              style={{ backgroundColor: '#c79e73' }}
            >
              <Plus size={20} /> Create Policy
            </button>
          </div>
        </div>

        {/* Policies Table */}
        <div className={`rounded-lg shadow-sm overflow-hidden ${themeClass('bg-white', 'bg-gray-800 border border-gray-700')}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${themeClass('bg-gray-50', 'bg-gray-700')}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>Policy Name</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>Type</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>Effect</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>Created</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClass('text-gray-500', 'text-gray-300')}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClass('bg-white divide-gray-200', 'bg-gray-800 divide-gray-600')}`}>
                {filteredPolicies.map(policy => (
                  <tr key={policy.id} className={`${themeClass('hover:bg-gray-50', 'hover:bg-gray-700')}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${themeClass('text-gray-900', 'text-white')}`}>{policy.name}</div>
                      <div className={`text-sm ${themeClass('text-gray-500', 'text-gray-400')}`}>{policy.actions.length} actions, {policy.resources.length} resources</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        policy.type === 'AWS Managed' ? 'bg-blue-100 text-blue-800' :
                        policy.type === 'Custom' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        policy.effect === 'Allow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {policy.effect}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        policy.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClass('text-gray-500', 'text-gray-400')}`}>{policy.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openModal(policy)} className="text-blue-600 hover:text-blue-900" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => duplicatePolicy(policy)} className="text-green-600 hover:text-green-900" title="Duplicate">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => exportPolicy(policy)} className="text-purple-600 hover:text-purple-900" title="Export">
                          <Download size={16} />
                        </button>
                        <button onClick={() => handleDelete(policy.id)} className="text-red-600 hover:text-red-900" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${themeClass('bg-white', 'bg-gray-800')}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${themeClass('text-gray-900', 'text-white')}`}>{editingPolicy ? 'Edit Policy' : 'Create Policy'}</h2>
                <button onClick={closeModal} className={`${themeClass('text-gray-400 hover:text-gray-600', 'text-gray-400 hover:text-gray-300')}`}>
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Policy Name</label>
                    <input
                      type="text"
                      value={currentForm.name}
                      onChange={(e) => setCurrentForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                      placeholder="Enter policy name"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Type</label>
                    <select
                      value={currentForm.type}
                      onChange={(e) => setCurrentForm(prev => ({ ...prev, type: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    >
                      {policyTypes.slice(1).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Effect</label>
                    <select
                      value={currentForm.effect}
                      onChange={(e) => setCurrentForm(prev => ({ ...prev, effect: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    >
                      {effects.map(effect => <option key={effect} value={effect}>{effect}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Status</label>
                    <select
                      value={currentForm.status}
                      onChange={(e) => setCurrentForm(prev => ({ ...prev, status: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Actions</label>
                    {currentForm.actions.map((action, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={action}
                          onChange={(e) => updateFormArray('actions', index, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                          placeholder="e.g., s3:GetObject"
                          list="common-actions"
                        />
                        <button
                          onClick={() => removeFormArrayItem('actions', index)}
                          className={`px-3 py-2 rounded-lg ${themeClass('text-red-600 hover:bg-red-50', 'text-red-400 hover:bg-red-900')}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFormArrayItem('actions')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Action
                    </button>
                    <datalist id="common-actions">
                      {commonActions.map(action => <option key={action} value={action} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClass('text-gray-700', 'text-gray-300')}`}>Resources</label>
                    {currentForm.resources.map((resource, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={resource}
                          onChange={(e) => updateFormArray('resources', index, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                          placeholder="e.g., arn:aws:s3:::my-bucket/*"
                        />
                        <button
                          onClick={() => removeFormArrayItem('resources', index)}
                          className={`px-3 py-2 rounded-lg ${themeClass('text-red-600 hover:bg-red-50', 'text-red-400 hover:bg-red-900')}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFormArrayItem('resources')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Resource
                    </button>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${themeClass('text-gray-700', 'text-gray-300')}`}>Conditions (JSON)</label>
                <textarea
                  value={JSON.stringify(currentForm.conditions, null, 2)}
                  onChange={(e) => {
                    try {
                      setCurrentForm(prev => ({ ...prev, conditions: JSON.parse(e.target.value) }));
                    } catch (err) {
                      // Invalid JSON, keep previous value
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm ${themeClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-700 text-white')}`}
                  rows="4"
                  placeholder='{"StringEquals": {"aws:RequestedRegion": "us-east-1"}}'
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-lg transition-colors ${themeClass('text-gray-700 bg-gray-100 hover:bg-gray-200', 'text-gray-300 bg-gray-700 hover:bg-gray-600')}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingPolicy ? 'Update' : 'Create'} Policy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};