// ProductsTab.jsx
import React, { useState, useMemo } from 'react'
import { Search, Plus, Package, TrendingUp, TrendingDown, Layers, Eye, Edit, Power, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import ActionButton from './ActionButton'
import adminService from '../Firebase/services/adminApiService'

export default function ProductsTab({ data, loading, apiCall, theme }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState('')
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const filteredData = useMemo(() => {
    return data.filter(p => {
      const searchMatch = !search || [
        p.name, p.hsn_code, p.shape, p.colour,
        p.category?.name, p.material?.name
      ].some(field => field?.toLowerCase().includes(search.toLowerCase()))

      const filterMatch = filter === 'all' ||
        (filter === 'premium' && p.quality === 'Premium') ||
        (filter === 'active' && p.is_active) ||
        (filter === 'inactive' && !p.is_active)
      return searchMatch && filterMatch
    })
  }, [data, search, filter])

  const stats = useMemo(() => [
    { label: 'Total', value: data.length, icon: Package, color: '#c79e73', filter: 'all' },
    { label: 'Active', value: data.filter(p => p?.is_active).length, icon: TrendingUp, color: '#10b981', filter: 'active' },
    { label: 'Inactive', value: data.filter(p => !p?.is_active).length, icon: TrendingDown, color: '#ef4444', filter: 'inactive' },
    { label: 'Premium', value: data.filter(p => p?.quality === 'Premium').length, icon: Layers, color: '#8b5cf6', filter: 'premium' }
  ], [data])

  const toggleStatus = (id, status) => {
    apiCall(() => adminService.updateProductStatus(id, !status))
  }

  const deleteItem = (id) => {
    if (!confirm('Delete this product?')) return
    apiCall(() => adminService.deleteProduct?.(id))
  }

  if (!filteredData.length) {
    return (
      <div className="text-center py-16">
        <Package className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
        <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No products found</h3>
        <p className={`${theme.muted}`}>
          {filter !== 'all' ? `No ${filter} products available` : 'Start by adding your first product'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg ${theme.input || 'border-gray-200 bg-white'}`}
          />
        </div>
        <button
          onClick={() => navigate('/product')}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium"
          style={{ backgroundColor: '#c79e73' }}
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              onClick={() => setFilter(stat.filter)}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${theme.card} ${
                filter === stat.filter ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme.muted}`}>{stat.label}</p>
                  <p className={`text-2xl font-bold ${theme.text}`}>{stat.value}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: stat.color }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className={`border rounded-lg overflow-hidden ${theme.card}`}>
        <table className="w-full">
          <thead className={`${theme.isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              {['Image', 'Product', 'Category', 'Material', 'HSN', 'Quality', 'Price', 'Status', 'Actions'].map(header => (
                <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item) => (
              <tr key={item.id} className={`${theme.tableRow || 'hover:bg-gray-50'}`}>
                <td className={`px-4 py-3 text-sm ${theme.text}`}>
                  {item.images?.length > 0 ? (
                    <img src={item.images[0].image_url} alt="Product" className="w-28 h-18 object-cover rounded" />
                  ) : '-'}
                </td>
                <td className={`px-4 py-3 ${theme.text}`}>
                  <div className="font-medium">{item.name}</div>
                  {(item.shape || item.colour) && (
                    <div className={`text-sm ${theme.muted}`}>
                      {[item.shape, item.colour].filter(Boolean).join(' • ')}
                    </div>
                  )}
                </td>
                <td className={`px-4 py-3 text-sm ${theme.text}`}>{item.category?.name || '-'}</td>
                <td className={`px-4 py-3 text-sm ${theme.text}`}>{item.material?.name || '-'}</td>
                <td className={`px-4 py-3 text-sm ${theme.text}`}>{item.hsn_code || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.quality === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.quality}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${theme.text}`}>
                  ₹{item.inventory?.price_with_gst || item.inventory?.sell_price || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={`text-sm ${item.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <ActionButton
                      onClick={() => { setSelected(item); setModal('view') }}
                      color="#6b7280" icon={Eye} title="View"
                    />
                    <ActionButton
                      onClick={() => navigate('/product', { state: { editData: item } })}
                      color="#c79e73" icon={Edit} title="Edit"
                    />
                    <ActionButton
                      onClick={() => toggleStatus(item.id, item.is_active)}
                      color={item.is_active ? '#ef4444' : '#10b981'}
                      icon={Power}
                      title={item.is_active ? 'Deactivate' : 'Activate'}
                    />
                    <ActionButton
                      onClick={() => deleteItem(item.id)}
                      color="#ef4444" icon={Trash2} title="Delete"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modal === 'view'}
        onClose={() => setModal('')}
        title={selected?.name}
        theme={theme}
      >
        {selected && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                ['Image', selected.images?.[0]?.image_url, 'image'],
                ['Name', selected.name],
                ['Category', selected.category?.name || 'N/A'],
                ['Material', selected.material?.name || 'N/A'],
                ['HSN Code', selected.hsn_code || 'N/A'],
                ['Shape', selected.shape || 'N/A'],
                ['Colour', selected.colour || 'N/A'],
                ['Quality', selected.quality],
                ['Cost Price', `₹${selected.inventory?.cost_price || 0}`],
                ['Sell Price', `₹${selected.inventory?.sell_price || 0}`],
                ['Price with GST', `₹${selected.inventory?.price_with_gst || 0}`],
                ['Stock', selected.inventory?.in_stock ? 'Yes' : 'No'],
                ['Status', selected.is_active ? 'Active' : 'Inactive']
              ].map(([label, value, type], i) => (
                <div key={i}>
                  <p className={`text-sm font-medium ${theme.muted}`}>{label}</p>
                  <p className={`mt-1 ${theme.text}`}>
                    {type === 'image' && value ? (
                      <img src={value} alt="Selected" className="w-26 h-20 object-cover rounded" />
                    ) : (
                      value || '-'
                    )}
                  </p>
                </div>
              ))}
              {selected.specs && (
                <div className="col-span-2">
                  <p className={`text-sm font-medium ${theme.muted}`}>Description</p>
                  <p className={`mt-1 ${theme.text}`}>{selected.specs}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}