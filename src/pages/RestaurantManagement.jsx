import React, { useState, useContext } from 'react'
import { Eye, Edit, Search, Store, MapPin, Star, Users, Plus, Save, X, Phone, Mail, ChefHat, Filter } from 'lucide-react'
import { ThemeContext } from '../context/ThemeContext'

const mockApprovedRestaurants = [
  {
    id: 1, name: "Spice Garden Restaurant", owner: "Raj Patel", email: "raj@spicegarden.com", 
    phone: "+91 98765 43210", address: "123 Main Street, Vadodara", cuisine: "Indian, Chinese",
    rating: 4.5, joinedDate: "2025-01-15", status: "active",
    profileImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    restaurantImg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    franchises: [
      { id: 101, name: "Spice Garden - CG Road", address: "CG Road, Ahmedabad", manager: "Amit Shah", phone: "+91 98765 11111", status: "active" },
      { id: 102, name: "Spice Garden - SG Mall", address: "SG Mall, Ahmedabad", manager: "Priya Patel", phone: "+91 98765 22222", status: "active" }
    ]
  },
  {
    id: 2, name: "Pizza Corner", owner: "Maria Rodriguez", email: "maria@pizzacorner.com",
    phone: "+91 87654 32109", address: "456 Park Avenue, Vadodara", cuisine: "Italian, Fast Food",
    rating: 4.2, joinedDate: "2025-02-10", status: "active",
    profileImg: "https://images.unsplash.com/photo-1494790108755-2616b612b639?w=150&h=150&fit=crop&crop=face",
    restaurantImg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    franchises: []
  },
  {
    id: 3, name: "Burger House", owner: "John Smith", email: "john@burgerhouse.com",
    phone: "+91 76543 21098", address: "789 Food Street, Vadodara", cuisine: "American, Burgers",
    rating: 4.0, joinedDate: "2025-03-05", status: "inactive",
    profileImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    restaurantImg: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
    franchises: [
      { id: 301, name: "Burger House Express", address: "Railway Station, Vadodara", manager: "Ravi Kumar", phone: "+91 76543 33333", status: "active" }
    ]
  },
  {
    id: 4, name: "Taco Bell", owner: "Carlos Martinez", email: "carlos@tacobell.com",
    phone: "+91 98765 54321", address: "567 Spice Street, Vadodara", cuisine: "Mexican, Fast Food",
    rating: 3.8, joinedDate: "2025-01-20", status: "active",
    profileImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    restaurantImg: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    franchises: []
  },
  {
    id: 5, name: "Sushi Master", owner: "Hiroshi Tanaka", email: "hiroshi@sushimaster.com",
    phone: "+91 87654 98765", address: "890 Ocean Drive, Vadodara", cuisine: "Japanese, Sushi",
    rating: 4.8, joinedDate: "2025-02-28", status: "inactive",
    profileImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    restaurantImg: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    franchises: [
      { id: 501, name: "Sushi Master Express", address: "Mall Road, Vadodara", manager: "Kenji Yamamoto", phone: "+91 87654 11111", status: "active" },
      { id: 502, name: "Sushi Master Deluxe", address: "Business District, Vadodara", manager: "Yuki Sato", phone: "+91 87654 22222", status: "inactive" }
    ]
  }
]

export default function RestaurantManagement() {
  const { isDark } = useContext(ThemeContext)
  const [restaurants, setRestaurants] = useState(mockApprovedRestaurants)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [newFranchise, setNewFranchise] = useState({ name: '', address: '', manager: '', phone: '' })

  const filtered = restaurants.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || 
      (filter === 'active' && r.status === 'active') ||
      (filter === 'inactive' && r.status === 'inactive') ||
      (filter === 'with-franchises' && r.franchises?.length > 0) ||
      (filter === 'high-rated' && r.rating >= 4.5)
    return matchSearch && matchFilter
  })

  const handleEdit = (restaurant) => {
    setEditData({ ...restaurant })
    setModal('edit')
  }

  const handleSave = () => {
    setRestaurants(prev => prev.map(r => r.id === editData.id ? editData : r))
    setModal('')
    setEditData(null)
  }

  const addFranchise = () => {
    if (newFranchise.name && newFranchise.address) {
      const franchise = { ...newFranchise, id: Date.now(), status: 'active' }
      setEditData(prev => ({ ...prev, franchises: [...(prev.franchises || []), franchise] }))
      setNewFranchise({ name: '', address: '', manager: '', phone: '' })
    }
  }

  const removeFranchise = (franchiseId) => {
    setEditData(prev => ({ ...prev, franchises: prev.franchises.filter(f => f.id !== franchiseId) }))
  }

  const stats = [
    { label: 'Total', value: restaurants.length, icon: Store, color: '#c79e73', filter: 'all' },
    { label: 'Active', value: restaurants.filter(r => r.status === 'active').length, icon: Users, color: '#10b981', filter: 'active' },
    { label: 'Inactive', value: restaurants.filter(r => r.status === 'inactive').length, icon: MapPin, color: '#ef4444', filter: 'inactive' },
    { label: 'With Franchises', value: restaurants.filter(r => r.franchises?.length > 0).length, icon: Store, color: '#8b5cf6', filter: 'with-franchises' },
    { label: 'High Rated (4.5+)', value: restaurants.filter(r => r.rating >= 4.5).length, icon: Star, color: '#f59e0b', filter: 'high-rated' }
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 transition-colors`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>Restaurant Management</h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage approved restaurants and their franchises</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text" 
            placeholder="Search restaurants, owners, or cuisine..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border ${
              isDark 
                ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
            } rounded-lg focus:outline-none transition-colors`}
          />
        </div>
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className={`pl-9 pr-8 py-2.5 border ${
              isDark 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : 'border-gray-200 bg-white text-gray-900'
            } rounded-lg focus:outline-none appearance-none transition-colors min-w-[180px]`}
          >
            <option value="all">All Restaurants</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="with-franchises">With Franchises</option>
            <option value="high-rated">High Rated (4.5+)</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={i} 
              onClick={() => setFilter(stat.filter)}
              className={`${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
              } rounded-lg p-3 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${
                filter === stat.filter ? 'ring-2' : ''
              }`}
              style={{ 
                ringColor: filter === stat.filter ? '#c79e73' : 'transparent'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Restaurant List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Store className={`w-12 h-12 mx-auto mb-4 opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>No restaurants found</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-4 transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={r.profileImg} alt={r.owner} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        r.status === 'active' 
                          ? isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                          : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {r.status}
                      </span>
                      {r.franchises?.length > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {r.franchises.length} franchise{r.franchises.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-4 mt-1`}>
                      <span>👤 {r.owner}</span>
                      <span>🍽️ {r.cuisine}</span>
                      <span>⭐ {r.rating}</span>
                      <span>📍 {r.address.split(',')[0]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setSelected(r); setModal('view') }} 
                    className={`p-2 ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } rounded-lg transition-colors`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(r)} 
                    className="p-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#c79e73' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b8926a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#c79e73'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selected.name}</h2>
              <button onClick={() => setModal('')} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <img src={selected.restaurantImg} alt={selected.name} className="w-full h-48 object-cover rounded-lg" />
              
              <div className={`grid grid-cols-2 gap-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="space-y-2">
                  <div>👤 {selected.owner}</div>
                  <div>📧 {selected.email}</div>
                  <div>📞 {selected.phone}</div>
                </div>
                <div className="space-y-2">
                  <div>🍽️ {selected.cuisine}</div>
                  <div>⭐ {selected.rating} Rating</div>
                  <div>📅 {selected.joinedDate}</div>
                </div>
              </div>
              
              <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>📍 {selected.address}</div>

              {selected.franchises?.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Franchises ({selected.franchises.length})</h3>
                  <div className="space-y-2">
                    {selected.franchises.map((f) => (
                      <div key={f.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 text-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.name}</div>
                            <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>{f.address}</div>
                            <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>Manager: {f.manager}</div>
                            <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>{f.phone}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            f.status === 'active' 
                              ? isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                              : isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {f.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit {editData.name}</h2>
              <button onClick={() => setModal('')} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {['name', 'owner', 'email', 'phone'].map(field => (
                  <div key={field}>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {field.charAt(0).toUpperCase() + field.slice(1)} {field === 'name' && 'Restaurant'}
                    </label>
                    <input 
                      value={editData[field]} 
                      onChange={(e) => setEditData({...editData, [field]: e.target.value})}
                      className={`w-full p-2 border ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-200 bg-white text-gray-900'
                      } rounded text-sm`}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
                  <input 
                    value={editData.address} 
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    className={`w-full p-2 border ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded text-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Cuisine</label>
                  <input 
                    value={editData.cuisine} 
                    onChange={(e) => setEditData({...editData, cuisine: e.target.value})}
                    className={`w-full p-2 border ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded text-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select 
                    value={editData.status} 
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    className={`w-full p-2 border ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-200 bg-white text-gray-900'
                    } rounded text-sm`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Franchises */}
              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Franchises</h3>
                
                {/* Add New Franchise */}
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 mb-3`}>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {['name', 'address', 'manager', 'phone'].map(field => (
                      <input 
                        key={field}
                        placeholder={`Franchise ${field}`}
                        value={newFranchise[field]} 
                        onChange={(e) => setNewFranchise({...newFranchise, [field]: e.target.value})}
                        className={`p-2 border ${
                          isDark 
                            ? 'border-gray-600 bg-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                        } rounded text-sm`}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={addFranchise}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm text-white rounded transition-colors"
                    style={{ backgroundColor: '#c79e73' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b8926a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#c79e73'}
                  >
                    <Plus className="w-4 h-4" /> Add Franchise
                  </button>
                </div>

                {/* Existing Franchises */}
                <div className="space-y-2">
                  {editData.franchises?.map((f) => (
                    <div key={f.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                      <div className="flex justify-between items-start">
                        <div className="text-sm space-y-1">
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.name}</div>
                          <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>{f.address}</div>
                          <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>Manager: {f.manager} • {f.phone}</div>
                        </div>
                        <button 
                          onClick={() => removeFranchise(f.id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm"
                  style={{ backgroundColor: '#c79e73' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b8926a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#c79e73'}
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button 
                  onClick={() => setModal('')}
                  className={`px-4 py-2 text-sm ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  } rounded-lg transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}