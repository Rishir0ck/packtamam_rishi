import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Eye, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Truck, RefreshCw } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import adminApiService from '../Firebase/services/adminApiService';

export default function DeliveryPartnerAdmin() {
  const { isDark } = useTheme();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({ name: '', tracking_link: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', muted: 'text-gray-300',
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    hover: 'hover:bg-gray-700', tableHeader: 'bg-gray-700', tableRow: 'hover:bg-gray-750',
    modalBg: 'bg-gray-800', buttonSecondary: 'bg-gray-600 hover:bg-gray-500'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600',
    border: 'border-gray-200', input: 'bg-white border-gray-300 placeholder-gray-500',
    hover: 'hover:bg-gray-50', tableHeader: 'bg-gray-50', tableRow: 'hover:bg-gray-50',
    modalBg: 'bg-white', buttonSecondary: 'bg-gray-300 hover:bg-gray-400'
  };

  // Memoize loadPartners to prevent unnecessary re-renders
  const loadPartners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getDeliveryPartners();
      
      // Debug logging
      console.log('API Response:', response);
      
      // Handle nested response structure: response.data.data
      const partnersData = response?.data?.data || response?.data || response || [];
      console.log('Partners Data:', partnersData);
      console.log('Is Array:', Array.isArray(partnersData));
      
      setPartners(Array.isArray(partnersData) ? partnersData : []);
    } catch (error) {
      console.error('Error loading partners:', error);
      setPartners([]); // Ensure partners is always an array
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  // Load partners only once on mount
  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const filteredAndSortedPartners = useMemo(() => {
    // Ensure partners is always an array
    const partnersArray = Array.isArray(partners) ? partners : [];
    
    // Debug logging
    console.log('Partners in filter:', partnersArray);
    console.log('Partners length:', partnersArray.length);
    
    let filtered = partnersArray.filter(partner =>
      partner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log('Filtered partners:', filtered);

    filtered.sort((a, b) => {
      let aVal = a[sortField]?.toLowerCase() || '';
      let bVal = b[sortField]?.toLowerCase() || '';
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return filtered;
  }, [partners, searchTerm, sortField, sortDirection]);

  const paginatedPartners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPartners.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedPartners, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedPartners.length / itemsPerPage);

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const openModal = useCallback((mode, partner = null) => {
    setModalMode(mode);
    setSelectedPartner(partner);
    setFormData(mode === 'add' ? { name: '', tracking_link: '' } : { ...partner });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedPartner(null);
    setFormData({ name: '', tracking_link: '' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      await adminApiService.addDeliveryPartner(formData.name, formData.tracking_link);
      
      // Instead of reloading all partners, just add the new one to the existing list
      // This is more efficient and avoids unnecessary API calls
      const newPartner = {
        id: formData.id, // Temporary ID, replace with actual ID from API response if available
        name: formData.name,
        tracking_link: formData.tracking_link,
        created_at: new Date().toLocaleString(),
        updated_at: new Date().toLocaleString(),
      };
      
      setPartners(prevPartners => [...prevPartners, newPartner]);
      closeModal();
    } catch (error) {
      console.error('Error adding partner:', error);
      // If adding fails, you might want to show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-500' : theme.muted}`} />
      <ChevronDown className={`w-3 h-3 -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-blue-500' : theme.muted}`} />
    </span>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          <p className={`mt-4 ${theme.text}`}>Loading partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-200`}>
      <div className="max-w-full p-4 mx-auto">
        {/* Header */}
        <div className={`${theme.card} rounded-lg shadow-sm border ${theme.border} p-6 mb-6 transition-colors duration-200`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${theme.text} flex items-center gap-2`}>
                <Truck className="w-6 h-6 text-amber-600" />
                Delivery Partners
              </h1>
              <p className={`${theme.muted} mt-1`}>Manage your delivery partner network</p>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-[#c79e73] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Partner
            </button>
          </div>

          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.muted} w-4 h-4`} />
            <input
              type="text"
              placeholder="Search partners by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none ${theme.input}`}
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
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('tracking_link')}>
                    Tracking URL <SortIcon field="tracking_link" />
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${theme.card} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedPartners.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={`px-6 py-8 text-center ${theme.muted}`}>
                      {searchTerm ? 'No partners found matching your search.' : 'No delivery partners found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedPartners.map((partner, index) => (
                    <tr key={partner.id} className={`${theme.tableRow} transition-colors`}>
                      <td className="px-4 py-4 text-sm font-medium">
                        <span className={`text-sm ${theme.text}`}>{(currentPage - 1) * itemsPerPage + index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${theme.text}`}>{partner.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1 text-sm ${theme.text}`}>
                          {partner.tracking_link}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal('view', partner)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`${theme.modalBg} rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto transition-colors duration-200`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme.text}`}>
                {modalMode === 'add' ? 'Add New Partner' : 'Partner Details'}
              </h2>
              
              {modalMode === 'view' ? (
                <div className="space-y-4">
                  <div className={theme.text}><strong>Partner Name:</strong> {selectedPartner?.name}</div>
                  <div className={theme.text}><strong>Tracking URL:</strong> {selectedPartner?.tracking_link}</div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={closeModal}
                      className={`flex-1 ${theme.buttonSecondary} ${isDark ? 'text-white' : 'text-gray-700'} py-2 px-4 rounded-lg transition-colors`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Partner Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                    required
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    placeholder="Tracking URL"
                    value={formData.tracking_link}
                    onChange={(e) => setFormData({...formData, tracking_link: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#c79e73] disabled:bg-amber-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Partner'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className={`flex-1 ${theme.buttonSecondary} ${isDark ? 'text-white' : 'text-gray-700'} py-2 px-4 rounded-lg transition-colors disabled:opacity-50`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};