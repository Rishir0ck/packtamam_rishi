import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown, Eye, MapPin, Phone, Mail, Star, Truck, Moon, Sun } from 'lucide-react';
import useTheme from '../hooks/useTheme'

export default function DeliveryPartnerAdmin() {
  const { isDark } = useTheme();
  const [partners, setPartners] = useState([
    { id: 1, name: 'John Smith', email: 'john@delivery.com', phone: '+1-555-0101', zone: 'North Zone', status: 'Active', rating: 4.8, deliveries: 245, vehicle: 'Bike', joinDate: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@delivery.com', phone: '+1-555-0102', zone: 'South Zone', status: 'Active', rating: 4.9, deliveries: 312, vehicle: 'Car', joinDate: '2024-02-20' },
    { id: 3, name: 'Mike Wilson', email: 'mike@delivery.com', phone: '+1-555-0103', zone: 'East Zone', status: 'Inactive', rating: 4.5, deliveries: 128, vehicle: 'Bike', joinDate: '2024-03-10' },
    { id: 4, name: 'Emily Davis', email: 'emily@delivery.com', phone: '+1-555-0104', zone: 'West Zone', status: 'Active', rating: 4.7, deliveries: 189, vehicle: 'Scooter', joinDate: '2024-01-25' },
    { id: 5, name: 'David Brown', email: 'david@delivery.com', phone: '+1-555-0105', zone: 'Central Zone', status: 'Suspended', rating: 3.9, deliveries: 67, vehicle: 'Car', joinDate: '2024-04-05' },
    { id: 6, name: 'Lisa Garcia', email: 'lisa@delivery.com', phone: '+1-555-0106', zone: 'North Zone', status: 'Active', rating: 4.8, deliveries: 298, vehicle: 'Bike', joinDate: '2024-01-30' },
    { id: 7, name: 'Tom Anderson', email: 'tom@delivery.com', phone: '+1-555-0107', zone: 'South Zone', status: 'Active', rating: 4.6, deliveries: 156, vehicle: 'Scooter', joinDate: '2024-03-15' },
    { id: 8, name: 'Anna Martinez', email: 'anna@delivery.com', phone: '+1-555-0108', zone: 'East Zone', status: 'Active', rating: 4.9, deliveries: 278, vehicle: 'Car', joinDate: '2024-02-10' },
    { id: 9, name: 'Chris Lee', email: 'chris@delivery.com', phone: '+1-555-0109', zone: 'West Zone', status: 'Inactive', rating: 4.2, deliveries: 89, vehicle: 'Bike', joinDate: '2024-04-20' },
    { id: 10, name: 'Jennifer White', email: 'jen@delivery.com', phone: '+1-555-0110', zone: 'Central Zone', status: 'Active', rating: 4.7, deliveries: 234, vehicle: 'Scooter', joinDate: '2024-02-28' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', zone: '', status: 'Active', rating: 0, deliveries: 0, vehicle: 'Bike'
  });

  const zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
  const vehicles = ['Bike', 'Scooter', 'Car', 'Van'];
  const statuses = ['Active', 'Inactive', 'Suspended'];

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
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.zone.toLowerCase().includes(searchTerm.toLowerCase())
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
      setFormData({ name: '', email: '', phone: '', zone: zones[0], status: 'Active', rating: 0, deliveries: 0, vehicle: 'Bike' });
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

  const getStatusBadge = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      Suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`;
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-500' : theme.muted}`} />
      <ChevronDown className={`w-3 h-3 -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-blue-500' : theme.muted}`} />
    </span>
  );

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto">
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
              placeholder="Search partners by name, email, or zone..."
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
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('name')}>
                    Partner <SortIcon field="name" />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('zone')}>
                    Zone <SortIcon field="zone" />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('status')}>
                    Status <SortIcon field="status" />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('rating')}>
                    Rating <SortIcon field="rating" />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('deliveries')}>
                    Deliveries <SortIcon field="deliveries" />
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.muted} uppercase tracking-wider cursor-pointer ${theme.hover} transition-colors`} onClick={() => handleSort('vehicle')}>
                    Vehicle <SortIcon field="vehicle" />
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${theme.muted} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${theme.card} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedPartners.map((partner) => (
                  <tr key={partner.id} className={`${theme.tableRow} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${theme.text}`}>{partner.name}</div>
                        <div className={`text-sm ${theme.muted} flex items-center gap-1`}>
                          <Mail className="w-3 h-3" />
                          {partner.email}
                        </div>
                        <div className={`text-sm ${theme.muted} flex items-center gap-1`}>
                          <Phone className="w-3 h-3" />
                          {partner.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 text-sm ${theme.text}`}>
                        <MapPin className={`w-3 h-3 ${theme.muted}`} />
                        {partner.zone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getStatusBadge(partner.status)} ${isDark ? 'dark' : ''}`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className={`text-sm font-medium ${theme.text}`}>{partner.rating}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text} font-medium`}>
                      {partner.deliveries}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme.text}`}>
                      {partner.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                Previous
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
                Next
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
                  <div className={theme.text}><strong>Name:</strong> {selectedPartner?.name}</div>
                  <div className={theme.text}><strong>Email:</strong> {selectedPartner?.email}</div>
                  <div className={theme.text}><strong>Phone:</strong> {selectedPartner?.phone}</div>
                  <div className={theme.text}><strong>Zone:</strong> {selectedPartner?.zone}</div>
                  <div className={theme.text}><strong>Status:</strong> <span className={`${getStatusBadge(selectedPartner?.status)} ${isDark ? 'dark' : ''}`}>{selectedPartner?.status}</span></div>
                  <div className={theme.text}><strong>Rating:</strong> {selectedPartner?.rating}/5.0</div>
                  <div className={theme.text}><strong>Total Deliveries:</strong> {selectedPartner?.deliveries}</div>
                  <div className={theme.text}><strong>Vehicle:</strong> {selectedPartner?.vehicle}</div>
                  <div className={theme.text}><strong>Join Date:</strong> {selectedPartner?.joinDate}</div>
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
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                    required
                  />
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                  >
                    {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                  </select>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                  >
                    {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Rating (0-5)"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                  />
                  <input
                    type="number"
                    placeholder="Total Deliveries"
                    min="0"
                    value={formData.deliveries}
                    onChange={(e) => setFormData({...formData, deliveries: parseInt(e.target.value)})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                  />
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    className={`w-full p-2 border rounded-lg transition-colors ${theme.input}`}
                  >
                    {vehicles.map(vehicle => <option key={vehicle} value={vehicle}>{vehicle}</option>)}
                  </select>
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