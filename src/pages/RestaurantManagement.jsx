import React, { useState, useContext } from 'react'
import { Eye, Edit, Search, Store, MapPin, Star, Users, Plus, Save, X, Phone, Mail, ChefHat } from 'lucide-react'
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
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [newFranchise, setNewFranchise] = useState({ name: '', address: '', manager: '', phone: '' })
  const [activeFilter, setActiveFilter] = useState('all')

  const getFilteredRestaurants = () => {
    let filtered = restaurants.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase())
    )
    switch (activeFilter) {
      case 'active': return filtered.filter(r => r.status === 'active')
      case 'inactive': return filtered.filter(r => r.status === 'inactive')
      case 'with-franchises': return filtered.filter(r => r.franchises?.length > 0)
      case 'high-rated': return filtered.filter(r => r.rating >= 4.5)
      default: return filtered
    }
  }

  const filtered = getFilteredRestaurants()

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
    { label: 'Total Restaurants', value: restaurants.length, icon: Store, color: '#c79e73', filter: 'all', description: 'All restaurants' },
    { label: 'Active', value: restaurants.filter(r => r.status === 'active').length, icon: Users, color: '#10b981', filter: 'active', description: 'Active restaurants only' },
    { label: 'Total Franchises', value: restaurants.reduce((acc, r) => acc + (r.franchises?.length || 0), 0), icon: MapPin, color: '#8b5cf6', filter: 'with-franchises', description: 'Restaurants with franchises' },
    { label: 'High Rated (4.5+)', value: restaurants.filter(r => r.rating >= 4.5).length, icon: Star, color: '#f59e0b', filter: 'high-rated', description: 'Restaurants rated 4.5 and above' }
  ]

  // Theme classes
  const bg = isDark ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600'
  const textTertiary = isDark ? 'text-gray-400' : 'text-gray-500'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white'
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  const modalBg = isDark ? 'bg-gray-800' : 'bg-white'
  const overlayBg = isDark ? 'bg-gray-700' : 'bg-gray-50'

  return (
    <div className={`min-h-screen ${bg} p-4 transition-colors`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>Restaurant Management</h1>
        <p className={`text-sm ${textSecondary}`}>Manage approved restaurants and their franchises</p>
        {activeFilter !== 'all' && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-sm ${textSecondary}`}>Filtered by:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">
              {stats.find(s => s.filter === activeFilter)?.description}
            </span>
            <button onClick={() => setActiveFilter('all')} className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textTertiary}`} />
        <input
          type="text" 
          placeholder="Search restaurants, owners, or cuisine..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 border ${border} ${inputBg} ${textPrimary} placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none transition-colors`}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon
          const isActive = activeFilter === stat.filter
          return (
            <div 
              key={i} 
              onClick={() => setActiveFilter(activeFilter === stat.filter ? 'all' : stat.filter)}
              className={`${cardBg} border rounded-lg p-4 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md transform hover:scale-105 ${
                isActive ? 'border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900' : `${border} hover:border-gray-300 dark:hover:border-gray-600`
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${textSecondary}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{stat.value}</p>
                  {isActive && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Click to clear filter</p>}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-80'}`} style={{ backgroundColor: stat.color }}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className={`text-sm ${textSecondary}`}>
          Showing {filtered.length} of {restaurants.length} restaurants
          {activeFilter !== 'all' && ` (filtered by ${stats.find(s => s.filter === activeFilter)?.description?.toLowerCase()})`}
        </p>
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className={textTertiary}>
              <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No restaurants found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className={`${cardBg} ${border} rounded-lg border shadow-sm overflow-hidden`}>
              <div className="h-32 bg-gray-200 overflow-hidden">
                <img src={r.restaurantImg} alt={r.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src={r.profileImg} alt={r.owner} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h3 className={`font-semibold text-sm ${textPrimary}`}>{r.name}</h3>
                    <p className={`text-xs ${textSecondary}`}>{r.owner}</p>
                  </div>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                    r.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
                
                <div className={`space-y-1 mb-3 text-xs ${textSecondary}`}>
                  <div className="flex items-center gap-1">
                    <ChefHat className="w-3 h-3" /> {r.cuisine}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {r.address.split(',')[0]}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {r.rating}
                    {r.franchises?.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded text-xs">
                        {r.franchises.length} franchise{r.franchises.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelected(r); setModal('view') }} 
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 ${textSecondary} rounded transition-colors`}
                  >
                    <Eye className="w-3 h-3" /> View
                  </button>
                  <button 
                    onClick={() => handleEdit(r)} 
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs text-white rounded transition-colors"
                    style={{ backgroundColor: '#c79e73' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b8926a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#c79e73'}
                  >
                    <Edit className="w-3 h-3" /> Edit
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
          <div className={`${modalBg} rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${border} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${textPrimary}`}>{selected.name}</h2>
              <button onClick={() => setModal('')} className={`p-2 ${hoverBg} rounded-lg`}>
                <X className={`w-5 h-5 ${textSecondary}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <img src={selected.restaurantImg} alt={selected.name} className="w-full h-48 object-cover rounded-lg" />
              
              <div className={`grid grid-cols-2 gap-4 text-sm ${textSecondary}`}>
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
              
              <div className={textSecondary}>📍 {selected.address}</div>

              {selected.franchises?.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-2 ${textPrimary}`}>Franchises ({selected.franchises.length})</h3>
                  <div className="space-y-2">
                    {selected.franchises.map((f) => (
                      <div key={f.id} className={`${overlayBg} rounded-lg p-3 text-sm`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-medium ${textPrimary}`}>{f.name}</div>
                            <div className={textSecondary}>{f.address}</div>
                            <div className={textSecondary}>Manager: {f.manager}</div>
                            <div className={textSecondary}>{f.phone}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            f.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
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
          <div className={`${modalBg} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-4 border-b ${border} flex items-center justify-between`}>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Edit {editData.name}</h2>
              <button onClick={() => setModal('')} className={`p-2 ${hoverBg} rounded-lg`}>
                <X className={`w-5 h-5 ${textSecondary}`} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {['name', 'owner', 'email', 'phone'].map(field => (
                  <div key={field} className={field === 'address' ? 'col-span-2' : ''}>
                    <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} {field === 'name' && 'Restaurant'} {field === 'owner' && 'Name'}
                    </label>
                    <input 
                      value={editData[field]} 
                      onChange={(e) => setEditData({...editData, [field]: e.target.value})}
                      className={`w-full p-2 border ${border} ${inputBg} ${textPrimary} rounded text-sm`}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Address</label>
                  <input 
                    value={editData.address} 
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    className={`w-full p-2 border ${border} ${inputBg} ${textPrimary} rounded text-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Cuisine</label>
                  <input 
                    value={editData.cuisine} 
                    onChange={(e) => setEditData({...editData, cuisine: e.target.value})}
                    className={`w-full p-2 border ${border} ${inputBg} ${textPrimary} rounded text-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Status</label>
                  <select 
                    value={editData.status} 
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    className={`w-full p-2 border ${border} ${inputBg} ${textPrimary} rounded text-sm`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Franchises */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${textPrimary}`}>Franchises</h3>
                </div>
                
                {/* Add New Franchise */}
                <div className={`${overlayBg} rounded-lg p-3 mb-3`}>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {['name', 'address', 'manager', 'phone'].map(field => (
                      <input 
                        key={field}
                        placeholder={`Franchise ${field === 'manager' ? 'manager name' : field === 'phone' ? 'phone number' : field}`}
                        value={newFranchise[field]} 
                        onChange={(e) => setNewFranchise({...newFranchise, [field]: e.target.value})}
                        className={`p-2 border ${border} ${inputBg} ${textPrimary} rounded text-sm`}
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
                    <div key={f.id} className={`${overlayBg} rounded-lg p-3`}>
                      <div className="flex justify-between items-start">
                        <div className="text-sm space-y-1">
                          <div className={`font-medium ${textPrimary}`}>{f.name}</div>
                          <div className={textSecondary}>{f.address}</div>
                          <div className={textSecondary}>Manager: {f.manager} • {f.phone}</div>
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
              <div className={`flex gap-2 pt-4 border-t ${border}`}>
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
                  className={`px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 ${textSecondary} rounded-lg transition-colors`}
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