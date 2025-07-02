import React, { useState, useMemo, useEffect } from 'react';
import { MessageSquare, AlertCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Loader2, Bot, Save, Edit3, RefreshCcw } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import adminApiService from '../Firebase/services/adminApiService';

export default function ChatModule() {
  const [activeTab, setActiveTab] = useState('problems');
  const [problems, setProblems] = useState([]);
  const [botData, setBotData] = useState([]);
  const [loading, setLoading] = useState({ problems: false, bot: false });
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingBot, setEditingBot] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    if (activeTab === 'problems' && problems.length === 0) fetchProblems();
    if (activeTab === 'bot' && botData.length === 0) fetchBotData();
  }, [activeTab]);

  const fetchProblems = async () => {
    try {
      setLoading(prev => ({ ...prev, problems: true }));
      setError(null);
      const response = await adminApiService.getProblems();
      console.log('Problems API Response:', response);
      const data = response?.data?.data || response?.data || [];
      // Transform API data to match component expectations
      const transformedData = data.map(item => ({
        id: item.id,
        title: item.message, // API uses 'message', component expects 'title'
        status: item.status?.toLowerCase() === 'sent' ? 'open' : item.status?.toLowerCase() || 'open',
        mobile_number : item.mobile_number, email: item.email,
        //priority: 'medium', // API doesn't have priority, default to medium
        date: item.created_at,
        user: item.user
      }));
      console.log('Transformed Problems:', transformedData);
      setProblems(transformedData);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error('Problems Error:', err);
    } finally {
      setLoading(prev => ({ ...prev, problems: false }));
    }
  };

  const fetchBotData = async () => {
    try {
      setLoading(prev => ({ ...prev, bot: true }));
      setError(null);
      const response = await adminApiService.getBotData();
      console.log('Bot API Response:', response);
      // Handle nested data structure
      const data = response?.data?.data || response?.data || [];
      console.log('Bot Data:', data);
      setBotData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch bot data');
      console.error('Bot Error:', err);
    } finally {
      setLoading(prev => ({ ...prev, bot: false }));
    }
  };

  const updateProblemStatus = async (id, status) => {
    try {
      await adminApiService.changeProblemStatus(id, status);
      setProblems(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const updateBotMessage = async () => {
    try {
      await adminApiService.updateBotMessages(editingBot.type, editMessage);
      setBotData(prev => prev.map(b => b.type === editingBot.type ? { ...b, message: editMessage } : b));
      setEditingBot(null);
      setEditMessage('');
    } catch (err) {
      setError('Failed to update bot message');
    }
  };

  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', muted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300 text-gray-900'
  };

  const statusColors = {
    open: isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
    'in-progress': isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
    resolved: isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    high: isDark ? 'text-red-400' : 'text-red-600',
    medium: isDark ? 'text-yellow-400' : 'text-yellow-600',
    low: isDark ? 'text-gray-400' : 'text-gray-600'
  };

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = [p?.title, p?.status, p?.mobile_number, p?.user?.owner_name, p?.user?.business_name].some(field => 
        field?.toLowerCase().includes(search.toLowerCase())
      );
      const matchesStatus = filterStatus === 'all' || p?.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [problems, search, filterStatus]);

  const sortedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      let aVal = a?.[sortField], bVal = b?.[sortField];
      if (sortField === 'date') {
        aVal = new Date(aVal); bVal = new Date(bVal);
      } else {
        aVal = String(aVal || '').toLowerCase(); 
        bVal = String(bVal || '').toLowerCase();
      }
      return sortDir === 'asc' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
    });
  }, [filteredProblems, sortField, sortDir]);

  const paginatedData = useMemo(() => {
    const data = activeTab === 'problems' ? sortedProblems : botData;
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [sortedProblems, botData, currentPage, itemsPerPage, activeTab]);

  const totalPages = Math.ceil((activeTab === 'problems' ? sortedProblems : botData).length / itemsPerPage);

  const handleSort = (field) => {
    setSortField(field);
    setSortDir(sortField === field && sortDir === 'asc' ? 'desc' : 'asc');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch('');
  };

  const SortHeader = ({ field, children }) => (
    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => handleSort(field)}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </div>
    </th>
  );

  const TabButton = ({ id, icon: Icon, label, count }) => (
    <button onClick={() => handleTabChange(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === id ? (isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-800') : (isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700')}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full">{count}</span>}
    </button>
  );

  if (loading.problems || loading.bot) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className={theme.muted}>Loading...</p>
        </div>
      </div>
    );
  }

  // Debug render
  console.log('Current State:', { problems, botData, activeTab, paginatedData });

  return (
    <div className={`max-w-full mx-auto p-4 min-h-screen ${theme.bg}`}>
      {/* Header */}
      <div className={`${theme.card} rounded-lg shadow-sm p-6 mb-6`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text} flex items-center gap-3`}>
              <MessageSquare className="text-amber-600" />
              Chat System Management
            </h1>
            <p className={`${theme.muted} mt-2`}>Manage problems and bot configurations</p>
          </div>
          <div className="flex gap-2">
            <TabButton id="problems" icon={AlertCircle} label="Problems" count={problems.length} />
            <TabButton id="bot" icon={Bot} label="Bot Messages" count={botData.length} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className={`${theme.card} rounded-lg shadow-sm overflow-hidden`}>
        <div className={`p-6 border-b ${theme.border}`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
              {activeTab === 'problems' ? (
                <>
                  <AlertCircle className="text-amber-600" />
                  Problem Management ({sortedProblems.length})
                </>
              ) : (
                <>
                  <Bot className="text-amber-600" />
                  Bot Message Management ({botData.length})
                </>
              )}
            </h2>
            
            {activeTab === 'problems' && (
              <div className="flex flex-wrap gap-2">
                {['all', 'open', 'in-progress', 'resolved'].map(filter => (
                  <button key={filter} onClick={() => { setFilterStatus(filter); setCurrentPage(1); }} className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${filterStatus === filter ? (isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-800') : (isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700')}`}>
                    {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'problems' ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                   <th className={`px-4 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Sr. No.</th>
                  <SortHeader field="title">Problem</SortHeader>
                  <SortHeader field="title">Problem</SortHeader>
                  <SortHeader field="mobile_number">Contact</SortHeader>
                  <SortHeader field="status">Status</SortHeader>
                  <SortHeader field="date">Date</SortHeader>
                  {/* <th className={`px-4 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Actions</th> */}
                </tr>
              </thead>
              <tbody className={`${theme.card} divide-y ${theme.border}`}>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={`px-6 py-8 text-center ${theme.muted}`}>
                      {problems.length === 0 ? 'No problems found' : 'No problems match your search'}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((problem, index) => (
                    <tr key={problem.id} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-4 text-sm font-medium"><span className={`text-sm ${theme.text}`}>{index + 1}</span></td>
                      <td className="px-4 py-4">
                        <div className={`text-sm font-medium ${theme.text} max-w-xs`}>
                          <div className="truncate" title={problem.title}>
                            {problem.title || 'No Title'}
                          </div>
                          <div className={`text-xs ${theme.muted} truncate`} title={problem.user?.owner_name}>
                            {problem.user?.owner_name} - {problem.user?.business_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${theme.text} capitalize`}>
                          {problem.user.mobile_number || 'N/A'}
                        </span>
                        <div className={`text-xs ${theme.muted} truncate`} title={problem.user?.mobile_number}>
                            {problem.user?.email}
                          </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[problem.status] || statusColors.open}`}>
                          {(problem.status || 'open').replace('-', ' ')}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-sm ${theme.muted}`}>
                        {problem.date || 'N/A'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          {['open', 'in-progress', 'resolved'].map(status => (
                            <button key={status} onClick={() => updateProblemStatus(problem.id, status)} disabled={problem.status === status} className={`px-2 py-1 text-xs rounded transition-colors ${problem.status === status ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed` : `${isDark ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}`}>
                              {status.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Sr. No.</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Type</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Message</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${theme.card} divide-y ${theme.border}`}>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className={`px-6 py-8 text-center ${theme.muted}`}>No bot messages found</td>
                  </tr>
                ) : (
                  paginatedData.map((bot, index) => (
                    <tr key={bot.type} className={isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-4 text-sm font-medium"><span className={`text-sm ${theme.text}`}>{index + 1}</span></td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${theme.text} capitalize`}>{bot.type || 'Unknown'}</span>
                      </td>
                      <td className="px-4 py-4">
                        {editingBot?.type === bot.type ? (
                          <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} className={`w-full p-2 text-sm border rounded resize-none ${theme.input}`} rows="3" />
                        ) : (
                          <div className={`text-sm ${theme.text} max-w-md truncate`} title={bot.message}>
                            {bot.message || 'No message set'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {editingBot?.type === bot.type ? (
                          <div className="flex gap-2">
                            <button onClick={updateBotMessage} className={`px-3 py-1 text-xs rounded transition-colors ${isDark ? 'bg-green-700 hover:bg-green-600 text-green-200' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}>
                              <Save className="w-3 h-3" />
                            </button>
                            <button onClick={() => { setEditingBot(null); setEditMessage(''); }} className={`px-3 py-1 text-xs rounded transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingBot(bot); setEditMessage(bot.message || ''); }} className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${isDark ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${theme.border}`}>
            <div className={`text-sm ${theme.muted}`}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, (activeTab === 'problems' ? sortedProblems : botData).length)} of {(activeTab === 'problems' ? sortedProblems : botData).length} results
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`p-2 rounded disabled:opacity-50 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`px-3 py-1 text-sm ${theme.muted}`}>{currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`p-2 rounded disabled:opacity-50 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}