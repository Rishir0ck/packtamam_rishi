import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, UserCheck, Truck, Star, Clock } from 'lucide-react';

export default function DeliveryPartner (){
  const [partners, setPartners] = useState([
    { id: 1, name: 'John Smith', email: 'john@delivery.com', phone: '+1234567890', status: 'Active', rating: 4.8, deliveries: 156, joinDate: '2024-01-15', vehicle: 'Motorcycle', zone: 'North Zone' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@delivery.com', phone: '+1234567891', status: 'Active', rating: 4.9, deliveries: 203, joinDate: '2024-02-10', vehicle: 'Car', zone: 'South Zone' },
    { id: 3, name: 'Mike Wilson', email: 'mike@delivery.com', phone: '+1234567892', status: 'Inactive', rating: 4.6, deliveries: 89, joinDate: '2024-03-05', vehicle: 'Bicycle', zone: 'East Zone' },
    { id: 4, name: 'Emily Davis', email: 'emily@delivery.com', phone: '+1234567893', status: 'Active', rating: 4.7, deliveries: 145, joinDate: '2024-01-20', vehicle: 'Motorcycle', zone: 'West Zone' },
    { id: 5, name: 'David Brown', email: 'david@delivery.com', phone: '+1234567894', status: 'Pending', rating: 0, deliveries: 0, joinDate: '2024-06-20', vehicle: 'Car', zone: 'Central Zone' },
    { id: 6, name: 'Lisa Anderson', email: 'lisa@delivery.com', phone: '+1234567895', status: 'Active', rating: 4.9, deliveries: 287, joinDate: '2023-11-10', vehicle: 'Motorcycle', zone: 'North Zone' },
    { id: 7, name: 'Robert Taylor', email: 'robert@delivery.com', phone: '+1234567896', status: 'Active', rating: 4.5, deliveries: 134, joinDate: '2024-04-15', vehicle: 'Car', zone: 'South Zone' },
    { id: 8, name: 'Jennifer Lee', email: 'jennifer@delivery.com', phone: '+1234567897', status: 'Inactive', rating: 4.3, deliveries: 67, joinDate: '2024-05-01', vehicle: 'Bicycle', zone: 'East Zone' },
    { id: 9, name: 'Christopher White', email: 'chris@delivery.com', phone: '+1234567898', status: 'Active', rating: 4.8, deliveries: 198, joinDate: '2024-01-08', vehicle: 'Motorcycle', zone: 'West Zone' },
    { id: 10, name: 'Amanda Garcia', email: 'amanda@delivery.com', phone: '+1234567899', status: 'Active', rating: 4.6, deliveries: 176, joinDate: '2024-02-28', vehicle: 'Car', zone: 'Central Zone' },
    { id: 11, name: 'Thomas Martinez', email: 'thomas@delivery.com', phone: '+1234567800', status: 'Pending', rating: 0, deliveries: 0, joinDate: '2024-06-25', vehicle: 'Motorcycle', zone: 'North Zone' },
    { id: 12, name: 'Jessica Rodriguez', email: 'jessica@delivery.com', phone: '+1234567801', status: 'Active', rating: 4.7, deliveries: 212, joinDate: '2023-12-15', vehicle: 'Car', zone: 'South Zone' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAddModal, setShowAddModal] = useState(false);

  const statusColors = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-red-100 text-red-800',
    Pending: 'bg-yellow-100 text-yellow-800'
  };

  const vehicleIcons = {
    Motorcycle: '🏍️',
    Car: '🚗',
    Bicycle: '🚲'
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
    }
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const filteredAndSortedPartners = useMemo(() => {
    let filtered = partners.filter(partner => {
      const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           partner.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || partner.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [partners, searchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPartners = filteredAndSortedPartners.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                Delivery Partners
              </h1>
              <p className="text-gray-600 mt-1">Manage your delivery partner network</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Partner
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-green-600">{partners.filter(p => p.status === 'Active').length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{partners.filter(p => p.status === 'Pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(partners.filter(p => p.rating > 0).reduce((acc, p) => acc + p.rating, 0) / 
                    partners.filter(p => p.rating > 0).length).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search partners by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Partner {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Status {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('rating')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Rating {getSortIcon('rating')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('deliveries')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Deliveries {getSortIcon('deliveries')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle & Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('joinDate')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Join Date {getSortIcon('joinDate')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {partner.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                          <div className="text-sm text-gray-500">ID: #{partner.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.email}</div>
                      <div className="text-sm text-gray-500">{partner.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[partner.status]}`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">
                          {partner.rating > 0 ? partner.rating : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{partner.deliveries}</div>
                      <div className="text-xs text-gray-500">completed</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <span>{vehicleIcons[partner.vehicle]}</span>
                        {partner.vehicle}
                      </div>
                      <div className="text-sm text-gray-500">{partner.zone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(partner.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded">
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedPartners.length)} of{' '}
              {filteredAndSortedPartners.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

