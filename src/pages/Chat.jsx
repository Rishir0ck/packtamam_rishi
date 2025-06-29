import React, { useState, useMemo } from 'react';
import { MessageSquare, AlertCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import useTheme from '../hooks/useTheme';

export default function ChatModule(){
  const [problems, setProblems] = useState([
    { id: 1, title: 'Bot not responding to greetings', status: 'open', priority: 'high', date: '2024-01-15' },
    { id: 2, title: 'Incorrect product recommendations', status: 'in-progress', priority: 'medium', date: '2024-01-14' },
    { id: 3, title: 'Response timeout issues', status: 'resolved', priority: 'low', date: '2024-01-13' },
    { id: 4, title: 'Language detection failing', status: 'open', priority: 'high', date: '2024-01-12' }
  ]);
  
  // New state for sorting, pagination, and filtering
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // Reduced for demonstration
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { isDark } = useTheme();

  // Theme configuration
  const theme = isDark ? {
    bg: 'bg-gray-900',
    card: 'bg-gray-800',
    text: 'text-white',
    muted: 'text-gray-300',
    border: 'border-gray-700',
    tableHeader: 'bg-gray-700',
    tableRow: 'hover:bg-gray-750'
  } : {
    bg: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-600',
    border: 'border-gray-200',
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

  // Filter problems based on search and status filter
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase()) ||
                           problem.status.toLowerCase().includes(search.toLowerCase()) ||
                           problem.priority.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || problem.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [problems, search, filterStatus]);

  // Sort filtered problems
  const sortedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle different data types
      if (sortField === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      
      if (sortDir === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [filteredProblems, sortField, sortDir]);

  // Paginate sorted problems
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProblems.slice(start, start + itemsPerPage);
  }, [sortedProblems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProblems.length / itemsPerPage);

  // Sorting handler
  const handleSort = (field) => {
    setSortField(field);
    setSortDir(sortField === field && sortDir === 'asc' ? 'desc' : 'asc');
  };

  // Status filter handler
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Update problem status
  const updateProblemStatus = (id, status) => {
    setProblems(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // Sortable header component
  const SortHeader = ({ field, children }) => (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
        isDark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
      }`} 
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDir === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  return (
    <div className={`max-w-6xl mx-auto p-6 min-h-screen ${theme.bg}`}>
      {/* Header */}
      <div className={`${theme.card} rounded-lg shadow-sm p-6 mb-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text} flex items-center gap-3`}>
              <MessageSquare className="text-amber-600" />
              Chat Module Management
            </h1>
            <p className={`${theme.muted} mt-2`}>Monitor and manage chat system issues</p>
          </div>
        </div>
      </div>

      {/* Problems Section */}
      <div className={`${theme.card} rounded-lg shadow-sm overflow-hidden`}>
        <div className={`p-6 border-b ${theme.border}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
              <AlertCircle className="text-amber-600" />
              Problem Management ({sortedProblems.length})
            </h2>
            <div className="flex gap-2">
              {['all', 'open', 'in-progress', 'resolved'].map(filter => (
                <button
                  key={filter}
                  onClick={() => handleStatusFilter(filter)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                    filterStatus === filter
                      ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-800'
                      : isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search problems..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
              }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className={theme.tableHeader}>
              <tr>
                <SortHeader field="title">Problem</SortHeader>
                <SortHeader field="priority">Priority</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <SortHeader field="date">Date</SortHeader>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${theme.card} divide-y ${theme.border}`}>
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan="5" className={`px-6 py-8 text-center ${theme.muted}`}>
                    {problems.length === 0 ? 'No problems found' : 'No problems match your search'}
                  </td>
                </tr>
              ) : (
                paginatedProblems.map(problem => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t flex items-center justify-between ${theme.border}`}>
            <div className={`text-sm ${theme.muted}`}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedProblems.length)} of {sortedProblems.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded disabled:opacity-50 transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`px-3 py-1 text-sm ${theme.muted}`}>
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded disabled:opacity-50 transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};