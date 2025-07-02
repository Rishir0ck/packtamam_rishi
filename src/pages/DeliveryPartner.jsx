import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown, Eye, MapPin, ChevronLeft, ChevronRight, Star, Truck, Moon, Sun } from 'lucide-react';
import useTheme from '../hooks/useTheme'

export default function DeliveryPartnerAdmin() {
  const { isDark } = useTheme();
  const [partners, setPartners] = useState([
    { id: 1, name: 'John Smith', tracking_url: 'North Zone'},
    { id: 2, name: 'Sarah Johnson', tracking_url: 'South Zone'},
    { id: 3, name: 'Mike Wilson', tracking_url: 'East Zone'},
    { id: 4, name: 'Emily Davis', tracking_url: 'West Zone'},
    { id: 5, name: 'David Brown', tracking_url: 'Central Zone'},
    { id: 6, name: 'Lisa Garcia', tracking_url: 'North Zone'},
    { id: 7, name: 'Tom Anderson', tracking_url: 'South Zone'},
    { id: 8, name: 'Anna Martinez', tracking_url: 'East Zone'},
    { id: 9, name: 'Chris Lee', tracking_url: 'West Zone'},
    { id: 10, name: 'Jennifer White', tracking_url: 'Central Zone'},
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({ name: '', tracking_url: ''});

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
    tableRow: 'hover:bg-gray-750',
    modalBg: 'bg-gray-800',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: 'bg-gray-600 hover:bg-gray-500',
    isDark: true
  } : {
    bg: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-600',
    border: 'border-gray-200',
    input: 'bg-white border-gray-300 placeholder-gray-500',
    hover: 'hover:bg-gray-50',
    tableHeader: 'bg-gray-50',
    tableRow: 'hover:bg-gray-50',
    modalBg: 'bg-white',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: 'bg-gray-300 hover:bg-gray-400',
    isDark: false
  };

  const filteredAndSortedPartners = useMemo(() => {
    let filtered = partners.filter(partner =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [partners, searchTerm, sortField, sortDirection]);

  const paginatedPartners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPartners.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedPartners, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedPartners.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openModal = (mode, partner = null) => {
    setModalMode(mode);
    setSelectedPartner(partner);
    if (mode === 'add') {
      setFormData({ name: '', tracking_url: '', status: 'Active' });
    } else if (partner) {
      setFormData({ ...partner });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPartner(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newPartner = {
        ...formData,
        id: Math.max(...partners.map(p => p.id)) + 1,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setPartners([...partners, newPartner]);
    } else if (modalMode === 'edit') {
      setPartners(partners.map(p => p.id === selectedPartner.id ? { ...formData, id: selectedPartner.id } : p));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this delivery partner?')) {
      setPartners(partners.filter(p => p.id !== id));
    }
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-500' : theme.muted}`} />
      <ChevronDown className={`w-3 h-3 -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-blue-500' : theme.muted}`} />
    </span>
  );

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-200`}>
      <div className="max-w-full p-4 mx-auto">
        {/* Header */}
        <div className={`${theme.card} rounded-lg shadow-sm border ${theme.border} p-6 mb-6 transition-colors duration-200`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
                  <Truck className="w-6 h-6 text-amber-600" />
                  Delivery Partners
                </h1>
                <p className={`${theme.muted} mt-1`}>Manage your delivery partner network</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal('add')}
                className={`${theme.button} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium`}
                style={{ backgroundColor: '#c79e73' }}
              >
                <Plus className="w-4 h-4" />
                Add Partner
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.muted} w-4 h-4`} />
            <input
              type="text"
              placeholder="Search partners by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme.input}`}
            />
          </div>
        </div>

        {/* Table */}
        <div className={`${theme.card} rounded-lg shadow-sm border ${theme.border} transition-colors duration-200`}>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className={`${theme.tableHeader} border-b ${theme.border}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider`}>Sr. No.</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('name')}>
                    Partner <SortIcon field="name" />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('zone')}>
                    Tracking URL <SortIcon field="tracking_url" />
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${theme.card} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedPartners.map((partner, index) => (
                  <tr key={partner.id} className={`${theme.tableRow} transition-colors`}>
                    <td className="px-4 py-4 text-sm font-medium"><span className={`text-sm ${theme.text}`}>{index + 1}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${theme.text}`}>{partner.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 text-sm ${theme.text}`}>
                        <MapPin className={`w-3 h-3 ${theme.muted}`} />
                        {partner.tracking_url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal('view', partner)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', partner)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          title="Edit Partner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Partner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`${theme.card} px-6 py-3 border-t ${theme.border} flex items-center justify-between`}>
            <div className={`text-sm ${theme.muted}`}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedPartners.length)} of {filteredAndSortedPartners.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm border ${theme.border} rounded-md ${theme.hover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${theme.text}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : `border ${theme.border} ${theme.hover} ${theme.text}`
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm border ${theme.border} rounded-md ${theme.hover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${theme.text}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.modalBg} rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto transition-colors duration-200`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme.text}`}>
                {modalMode === 'add' ? 'Add New Partner' : modalMode === 'edit' ? 'Edit Partner' : 'Partner Details'}
              </h2>
              
              {modalMode === 'view' ? (
                <div className="space-y-4">
                  <div className={theme.text}><strong>Partner Name:</strong> {selectedPartner?.name}</div>
                  <div className={theme.text}><strong>Tracking:</strong> {selectedPartner?.tracking_url}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Partner Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                    required
                  />
                  <input
                    type="url"
                    placeholder="Tracking URL"
                    value={formData.tracking_url}
                    onChange={(e) => setFormData({...formData, tracking_url: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                    required
                  />
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={`flex-1 ${theme.button} text-white py-2 px-4 rounded-lg transition-colors`}
                      style={{ backgroundColor: '#c79e73' }}
                    >
                      {modalMode === 'add' ? 'Add Partner' : 'Update Partner'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`flex-1 ${theme.buttonSecondary} ${isDark ? 'text-white' : 'text-gray-700'} py-2 px-4 rounded-lg transition-colors`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {modalMode === 'view' && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => openModal('edit', selectedPartner)}
                    className={`flex-1 ${theme.button} text-white py-2 px-4 rounded-lg transition-colors`}
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    Edit Partner
                  </button>
                  <button
                    onClick={closeModal}
                    className={`flex-1 ${theme.buttonSecondary} ${isDark ? 'text-white' : 'text-gray-700'} py-2 px-4 rounded-lg transition-colors`}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};