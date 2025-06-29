import React, { useState } from 'react';
import { MessageSquare, Settings, Edit3, Check, X, AlertCircle, Save, Plus, Trash2 } from 'lucide-react';
import useTheme from '../hooks/useTheme';

export default function ChatModule(){
  const [activeTab, setActiveTab] = useState('prompts');
  const [botPrompts, setBotPrompts] = useState([
    { id: 1, name: 'Customer Support Bot', prompt: 'You are a helpful customer support assistant. Always be polite and professional when helping customers with their inquiries.', active: true },
    { id: 2, name: 'Sales Assistant Bot', prompt: 'You are a knowledgeable sales assistant. Help customers find the right products and answer questions about features and pricing.', active: false }
  ]);
  const [problems, setProblems] = useState([
    { id: 1, title: 'Bot not responding to greetings', status: 'open', priority: 'high', date: '2024-01-15' },
    { id: 2, title: 'Incorrect product recommendations', status: 'in-progress', priority: 'medium', date: '2024-01-14' },
    { id: 3, title: 'Response timeout issues', status: 'resolved', priority: 'low', date: '2024-01-13' },
    { id: 4, title: 'Language detection failing', status: 'open', priority: 'high', date: '2024-01-12' }
  ]);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [newPrompt, setNewPrompt] = useState({ name: '', prompt: '' });
  const { isDark } = useTheme();

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900',
    card: 'bg-gray-800',
    text: 'text-white',
    muted: 'text-gray-300',
    border: 'border-gray-700',
    input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    hover: 'hover:bg-gray-700',
    tableHeader: 'bg-gray-700',
    tableRow: 'hover:bg-gray-750'
  } : {
    bg: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-600',
    border: 'border-gray-200',
    input: 'bg-white border-gray-300 placeholder-gray-500',
    hover: 'hover:bg-gray-50',
    tableHeader: 'bg-gray-50',
    tableRow: 'hover:bg-gray-50'
  };

  const statusColors = {
    'open': isDark ? 'bg-red-900 text-red-200 border-red-800' : 'bg-red-100 text-red-800 border-red-200',
    'in-progress': isDark ? 'bg-yellow-900 text-yellow-200 border-yellow-800' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'resolved': isDark ? 'bg-green-900 text-green-200 border-green-800' : 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityColors = {
    'high': isDark ? 'text-red-400' : 'text-red-600',
    'medium': isDark ? 'text-yellow-400' : 'text-yellow-600',
    'low': isDark ? 'text-gray-400' : 'text-gray-600'
  };

  const updatePrompt = (id, updates) => {
    setBotPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setEditingPrompt(null);
  };

  const addPrompt = () => {
    if (newPrompt.name && newPrompt.prompt) {
      setBotPrompts(prev => [...prev, { ...newPrompt, id: Date.now(), active: false }]);
      setNewPrompt({ name: '', prompt: '' });
    }
  };

  const deletePrompt = (id) => {
    setBotPrompts(prev => prev.filter(p => p.id !== id));
  };

  const updateProblemStatus = (id, status) => {
    setProblems(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 min-h-screen ${theme.bg}`}>
      {/* Header with theme toggle */}
      <div className={`${theme.card} rounded-lg shadow-sm p-6 mb-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text} flex items-center gap-3`}>
              <MessageSquare className="text-blue-600" />
              Chat Module Management
            </h1>
            <p className={`${theme.muted} mt-2`}>Manage bot prompts and monitor chat system issues</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`${theme.card} rounded-lg shadow-sm mb-6`}>
        <div className={`border-b ${theme.border}`}>
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'prompts', label: 'Bot Prompts', icon: Settings },
              { id: 'problems', label: 'Problem List', icon: AlertCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${theme.muted} hover:text-blue-600 hover:border-gray-300`
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'prompts' && (
        <div className="space-y-6">
          {/* Add New Prompt Form */}
          <div className={`${theme.card} rounded-lg shadow-sm p-6 border ${theme.border}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
              <Plus size={20} />
              Add New Bot Prompt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Bot Name"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}
              />
              <textarea
                placeholder="Bot Prompt"
                value={newPrompt.prompt}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, prompt: e.target.value }))}
                className={`md:col-span-2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${theme.input}`}
                rows="2"
              />
            </div>
            <button
              onClick={addPrompt}
              disabled={!newPrompt.name || !newPrompt.prompt}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add Prompt
            </button>
          </div>

          {/* Prompts List */}
          <div className="grid gap-4">
            {botPrompts.map(prompt => (
              <div key={prompt.id} className={`${theme.card} border ${theme.border} rounded-lg p-6 shadow-sm`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-xl font-semibold ${theme.text}`}>{prompt.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prompt.active 
                        ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                        : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                    }`}>
                      {prompt.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPrompt(editingPrompt === prompt.id ? null : prompt.id)}
                      className={`p-2 ${theme.muted} hover:text-blue-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-50'} rounded-md transition-colors`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deletePrompt(prompt.id)}
                      className={`p-2 ${theme.muted} hover:text-red-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-red-50'} rounded-md transition-colors`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {editingPrompt === prompt.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={prompt.name}
                      onChange={(e) => setBotPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, name: e.target.value } : p))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}
                    />
                    <textarea
                      value={prompt.prompt}
                      onChange={(e) => setBotPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, prompt: e.target.value } : p))}
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${theme.input}`}
                    />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={prompt.active}
                          onChange={(e) => setBotPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, active: e.target.checked } : p))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${theme.text}`}>Active</span>
                      </label>
                      <button
                        onClick={() => setEditingPrompt(null)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`${theme.text} leading-relaxed`}>{prompt.prompt}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'problems' && (
        <div className={`${theme.card} rounded-lg shadow-sm overflow-hidden`}>
          <div className={`p-6 border-b ${theme.border}`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${theme.text}`}>Problem Management</h2>
              <div className="flex gap-2">
                {['all', 'open', 'in-progress', 'resolved'].map(filter => (
                  <button
                    key={filter}
                    className={`px-3 py-1 text-sm rounded-md ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${theme.text} capitalize transition-colors`}
                  >
                    {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={theme.tableHeader}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Problem</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Priority</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${theme.card} divide-y ${theme.border}`}>
                {problems.map(problem => (
                  <tr key={problem.id} className={theme.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${theme.text}`}>{problem.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium capitalize ${priorityColors[problem.priority]}`}>
                        {problem.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusColors[problem.status]}`}>
                        {problem.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.muted}`}>{problem.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {['open', 'in-progress', 'resolved'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateProblemStatus(problem.id, status)}
                            disabled={problem.status === status}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              problem.status === status
                                ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                                : `${isDark ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`
                            }`}
                          >
                            {status.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

