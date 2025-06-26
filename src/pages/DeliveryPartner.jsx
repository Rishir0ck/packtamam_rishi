import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown, Eye, MapPin, Phone, Mail, Star, Truck } from 'lucide-react';


export default function DeliveryPartnerAdmin () {
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
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Suspended: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`;
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
      <ChevronDown className={`w-3 h-3 -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                Delivery Partners
              </h1>
              <p className="text-gray-600 mt-1">Manage your delivery partner network</p>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Partner
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search partners by name, email, or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                    Partner <SortIcon field="name" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('zone')}>
                    Zone <SortIcon field="zone" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                    Status <SortIcon field="status" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('rating')}>
                    Rating <SortIcon field="rating" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('deliveries')}>
                    Deliveries <SortIcon field="deliveries" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('vehicle')}>
                    Vehicle <SortIcon field="vehicle" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {partner.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {partner.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {partner.zone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(partner.status)}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{partner.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {partner.deliveries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {partner.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal('view', partner)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', partner)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Edit Partner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
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
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedPartners.length)} of {filteredAndSortedPartners.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">
                {modalMode === 'add' ? 'Add New Partner' : modalMode === 'edit' ? 'Edit Partner' : 'Partner Details'}
              </h2>
              
              {modalMode === 'view' ? (
                <div className="space-y-4">
                  <div><strong>Name:</strong> {selectedPartner?.name}</div>
                  <div><strong>Email:</strong> {selectedPartner?.email}</div>
                  <div><strong>Phone:</strong> {selectedPartner?.phone}</div>
                  <div><strong>Zone:</strong> {selectedPartner?.zone}</div>
                  <div><strong>Status:</strong> <span className={getStatusBadge(selectedPartner?.status)}>{selectedPartner?.status}</span></div>
                  <div><strong>Rating:</strong> {selectedPartner?.rating}/5.0</div>
                  <div><strong>Total Deliveries:</strong> {selectedPartner?.deliveries}</div>
                  <div><strong>Vehicle:</strong> {selectedPartner?.vehicle}</div>
                  <div><strong>Join Date:</strong> {selectedPartner?.joinDate}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Partner Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                  </select>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
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
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Total Deliveries"
                    min="0"
                    value={formData.deliveries}
                    onChange={(e) => setFormData({...formData, deliveries: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {vehicles.map(vehicle => <option key={vehicle} value={vehicle}>{vehicle}</option>)}
                  </select>
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      {modalMode === 'add' ? 'Add Partner' : 'Update Partner'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
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
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Edit Partner
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
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
