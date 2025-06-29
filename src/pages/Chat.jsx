import React, { useState } from 'react';
import { MessageSquare, Settings, Edit3, Check, X, AlertCircle, Save, Plus, Trash2 } from 'lucide-react';

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

  const statusColors = {
    'open': 'bg-red-100 text-red-800 border-red-200',
    'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'resolved': 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityColors = {
    'high': 'text-red-600',
    'medium': 'text-yellow-600',
    'low': 'text-gray-600'
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
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="text-blue-600" />
          Chat Module Management
        </h1>
        <p className="text-gray-600 mt-2">Manage bot prompts and monitor chat system issues</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Add New Bot Prompt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Bot Name"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Bot Prompt"
                value={newPrompt.prompt}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, prompt: e.target.value }))}
                className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
              />
            </div>
            <button
              onClick={addPrompt}
              disabled={!newPrompt.name || !newPrompt.prompt}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Add Prompt
            </button>
          </div>

          <div className="grid gap-4">
            {botPrompts.map(prompt => (
              <div key={prompt.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{prompt.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prompt.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {prompt.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPrompt(editingPrompt === prompt.id ? null : prompt.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deletePrompt(prompt.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <textarea
                      value={prompt.prompt}
                      onChange={(e) => setBotPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, prompt: e.target.value } : p))}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={prompt.active}
                          onChange={(e) => setBotPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, active: e.target.checked } : p))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                      <button
                        onClick={() => setEditingPrompt(null)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{prompt.prompt}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'problems' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Problem Management</h2>
            <div className="flex gap-2">
              {['all', 'open', 'in-progress', 'resolved'].map(filter => (
                <button
                  key={filter}
                  className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 capitalize"
                >
                  {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {problems.map(problem => (
                    <tr key={problem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{problem.title}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {['open', 'in-progress', 'resolved'].map(status => (
                            <button
                              key={status}
                              onClick={() => updateProblemStatus(problem.id, status)}
                              disabled={problem.status === status}
                              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                problem.status === status
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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
        </div>
      )}
    </div>
  );
};

