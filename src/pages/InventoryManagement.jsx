import React, { useState, useEffect } from 'react'
import { Eye, Edit, Search, Package, Plus, Save, X, Layers, DollarSign, TrendingUp, BarChart3, Upload, Trash2, AlertCircle, Power } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import adminService from '../Firebase/services/adminApiService'

export default function InventoryManagement() {
  const { isDark } = useTheme()
  const [data, setData] = useState({ products: [], categories: [], materials: [], priceSlabs: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [filter, setFilter] = useState('all')

  const t = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    muted: isDark ? 'text-gray-400' : 'text-gray-600',
    input: isDark ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500',
    btn: isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    border: isDark ? 'border-gray-700' : 'border-gray-200'
  }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [products, categories, materials, priceSlabs] = await Promise.all([
        adminService.getProducts(), adminService.getCategories(), 
        adminService.getMaterials(), adminService.listPriceSlabs()
      ])

      setData({
        products: products.success ? (Array.isArray(products.data?.products || products.data) ? products.data?.products || products.data : []) : [],
        categories: categories.success ? (Array.isArray(categories.data?.categories || categories.data) ? categories.data?.categories || categories.data : []) : [],
        materials: materials.success ? (Array.isArray(materials.data?.materials || materials.data) ? materials.data?.materials || materials.data : []) : [],
        priceSlabs: priceSlabs.success ? (Array.isArray(priceSlabs.data?.priceSlabs || priceSlabs.data) ? priceSlabs.data?.priceSlabs || priceSlabs.data : []) : []
      })
    } catch (err) {
      setError('Failed to load data: ' + err.message)
    }
    setLoading(false)
  }

  const getName = (id, type) => data[type].find(item => item.id === id)?.name || 'Unknown'

  const filtered = data.products.filter(p => 
    (p?.name?.toLowerCase().includes(search.toLowerCase()) || 
     getName(p?.category_id, 'categories').toLowerCase().includes(search.toLowerCase()) || 
     p?.hsn_code?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || 
     (filter === 'premium' && p?.quality === 'Premium') ||
     (filter === 'active' && p?.is_active) ||
     (filter === 'inactive' && !p?.is_active) ||
     (filter === 'recent' && p?.created_at && new Date(p.created_at) > new Date(Date.now() - 7*24*60*60*1000)))
  )

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => ({
      id: Date.now() + Math.random(), name: file.name,
      url: URL.createObjectURL(file), originFileObj: file
    }))
    setEditData(p => ({ ...p, images: [...(p.images || []), ...newImages] }))
  }

  const toggleProductStatus = async (productId, currentStatus) => {
    setLoading(true)
    try {
      const result = await adminService.updateProduct(productId, { is_active: !currentStatus })
      if (result.success) {
        await loadData()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const deleteItem = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    setLoading(true)
    try {
      let result
      if (type === 'product') result = await adminService.deleteProduct(id)
      else if (type === 'priceSlab') result = await adminService.deletePriceSlab(id)
      
      if (result?.success) {
        await loadData()
      } else {
        setError(result?.error || 'Delete failed')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleSave = async (type) => {
    setLoading(true)
    try {
      const isEdit = type === 'product' ? data.products.find(p => p.id === editData.id) : data.priceSlabs.find(s => s.id === editData.id)
      let result
      
      if (type === 'product') {
        result = isEdit ? await adminService.updateProduct(editData.id, editData) : await adminService.addProduct(editData)
      } else {
        result = isEdit 
          ? await adminService.updatePriceSlab(editData.id, editData.min_qty, editData.max_qty, editData.price_per_unit)
          : await adminService.addPriceSlab(editData.min_qty, editData.max_qty, editData.price_per_unit)
      }
      
      if (result.success) {
        await loadData()
        setModal('')
        setEditData(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const stats = [
    { label: 'Total Products', value: data.products.length, icon: Package, color: '#c79e73', filter: 'all' },
    { label: 'Active', value: data.products.filter(p => p?.is_active).length, icon: TrendingUp, color: '#10b981', filter: 'active' },
    { label: 'Premium', value: data.products.filter(p => p?.quality === 'Premium').length, icon: Layers, color: '#8b5cf6', filter: 'premium' },
    { label: 'Price Slabs', value: data.priceSlabs.length, icon: BarChart3, color: '#ef4444', filter: 'all' }
  ]

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'pricing', label: 'Price Slabs', icon: DollarSign },
    { id: 'categories', label: 'Categories', icon: TrendingUp },
    { id: 'materials', label: 'Materials', icon: Layers }
  ]

  const fields = {
    product: [
      { key: 'name', label: 'Product Name', required: true },
      { key: 'category_id', label: 'Category', type: 'select', options: data.categories.map(c => ({ value: c.id, label: c.name })), required: true },
      { key: 'material_id', label: 'Material', type: 'select', options: data.materials.map(m => ({ value: m.id, label: m.name })), required: true },
      { key: 'hsn_code', label: 'HSN Code' },
      { key: 'shape', label: 'Shape' },
      { key: 'colour', label: 'Colour' },
      { key: 'specs', label: 'Specifications' },
      { key: 'quality', label: 'Quality', type: 'select', options: [{ value: 'Standard', label: 'Standard' }, { value: 'Premium', label: 'Premium' }] },
      { key: 'is_active', label: 'Active', type: 'checkbox' }
    ],
    priceSlab: [
      { key: 'min_qty', label: 'Min Quantity', type: 'number', required: true },
      { key: 'max_qty', label: 'Max Quantity', type: 'number', required: true },
      { key: 'price_per_unit', label: 'Price Per Unit', type: 'number', required: true }
    ]
  }

  const renderForm = (type) => (
    <div className="p-4 max-h-96 overflow-y-auto">
      {type === 'product' && (
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${t.text}`}>Product Images</label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center ${t.border}`}>
            <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className={`w-8 h-8 mx-auto mb-2 ${t.muted}`} />
              <p className={`text-sm ${t.muted}`}>Click to upload images</p>
            </label>
          </div>
          {editData.images?.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {editData.images.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.url} alt={img.name} className="w-full h-20 object-cover rounded border" />
                  <button onClick={() => setEditData(p => ({ ...p, images: p.images.filter(i => i.id !== img.id) }))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={`grid gap-3 ${type === 'product' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {fields[type].map(field => (
          <div key={field.key} className={field.key === 'specs' ? 'col-span-2' : ''}>
            <label className={`block text-xs font-medium mb-1 ${t.muted}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'select' ? (
              <select value={editData[field.key] || ''} onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
                className={`w-full p-2 border rounded text-sm transition-colors ${t.input}`}>
                <option value="">Select {field.label}</option>
                {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editData[field.key] || false}
                  onChange={(e) => setEditData({...editData, [field.key]: e.target.checked})}
                  className="rounded" />
                <span className={`text-sm ${t.text}`}>Product is active</span>
              </label>
            ) : (
              <input type={field.type || 'text'} value={editData[field.key] || ''}
                onChange={(e) => setEditData({...editData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
                className={`w-full p-2 border rounded text-sm transition-colors ${t.input}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderGrid = (items, type) => (
    <div className={`grid gap-4 ${type === 'products' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
      {items.map(item => (
        <div key={item.id} className={`border rounded-lg shadow-sm p-4 transition-all hover:shadow-md ${t.card}`}>
          {type === 'products' ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold flex-1 ${t.text}`}>{item.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{item.hsn_code}</span>
                  <span className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className={t.muted}>Category:</span><span className={t.text}>{getName(item.category_id, 'categories')}</span></div>
                <div className="flex justify-between"><span className={t.muted}>Material:</span><span className={t.text}>{getName(item.material_id, 'materials')}</span></div>
                <div className="flex justify-between"><span className={t.muted}>Quality:</span><span className={`px-2 py-1 rounded text-xs ${item.quality === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{item.quality}</span></div>
                <div className="flex justify-between"><span className={t.muted}>Status:</span><span className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelected(item); setModal('viewProduct') }} className={`p-2 rounded-lg transition-colors ${t.btn}`} title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => { setEditData({...item}); setModal('editProduct') }} 
                  className="p-2 text-white rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: '#c79e73' }} title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => toggleProductStatus(item.id, item.is_active)}
                  className={`p-2 rounded-lg transition-colors ${item.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`} title="Toggle Status">
                  <Power className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item.id, 'product')} 
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : type === 'priceSlabs' ? (
            <>
              <div className="text-center mb-3">
                <div className={`text-lg font-bold ${t.text}`}>₹{item.price_per_unit}</div>
                <div className={`text-sm ${t.muted}`}>per unit</div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className={t.muted}>Min Qty:</span><span className={t.text}>{item.min_qty}</span></div>
                <div className="flex justify-between"><span className={t.muted}>Max Qty:</span><span className={t.text}>{item.max_qty}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditData({...item}); setModal('editSlab') }} 
                  className="flex-1 p-2 text-white rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: '#c79e73' }}>
                  <Edit className="w-4 h-4 mx-auto" />
                </button>
                <button onClick={() => deleteItem(item.id, 'priceSlab')} 
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-3">
                <h3 className={`font-semibold ${t.text}`}>{item.name}</h3>
                {item.description && <p className={`text-sm ${t.muted} mt-1`}>{item.description}</p>}
              </div>
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )

  if (loading && data.products.length === 0) {
    return (
      <div className={`min-h-screen p-4 transition-colors ${t.bg}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          <span className={`ml-2 ${t.text}`}>Loading inventory data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 transition-colors ${t.bg}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${t.text}`}>Inventory Management</h1>
        <p className={`text-sm ${t.muted}`}>Manage products, categories, materials and pricing</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className={`mb-6 border-b ${t.border}`}>
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id ? 'border-amber-500 text-amber-600' : `border-transparent ${t.muted} hover:text-gray-300`
                }`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'products' && (
        <>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg transition-colors ${t.input}`} />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`px-4 py-2.5 border rounded-lg ${t.input}`}>
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="premium">Premium</option>
              <option value="recent">Recent</option>
            </select>
            <button onClick={() => { setEditData({ name: '', category_id: '', material_id: '', hsn_code: '', shape: '', colour: '', specs: '', quality: 'Standard', is_active: true, images: [] }); setModal('editProduct') }}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#c79e73' }}>
              <Plus className="w-4 h-4" />Add Product
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} onClick={() => setFilter(stat.filter)}
                  className={`border rounded-lg p-3 shadow-sm cursor-pointer transition-all hover:shadow-md ${t.card} ${filter === stat.filter ? 'ring-2 ring-amber-400' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${t.muted}`}>{stat.label}</p>
                      <p className={`text-xl font-bold ${t.text}`}>{stat.value}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {renderGrid(filtered, 'products')}
        </>
      )}

      {activeTab === 'pricing' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-lg font-semibold ${t.text}`}>Price Slabs</h2>
              <p className={`text-sm ${t.muted}`}>Manage quantity-based pricing tiers</p>
            </div>
            <button onClick={() => { setEditData({ min_qty: 1, max_qty: 10, price_per_unit: 0 }); setModal('editSlab') }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style={{ backgroundColor: '#c79e73' }}>
              <Plus className="w-4 h-4" />Add Price Slab
            </button>
          </div>
          {renderGrid(data.priceSlabs, 'priceSlabs')}
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-lg font-semibold ${t.text}`}>Categories</h2>
          </div>
          {renderGrid(data.categories, 'categories')}
        </>
      )}

      {activeTab === 'materials' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-lg font-semibold ${t.text}`}>Materials</h2>
          </div>
          {renderGrid(data.materials, 'materials')}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl w-full max-h-[90vh] overflow-y-auto ${modal.includes('Product') ? 'max-w-3xl' : 'max-w-md'} ${t.card}`}>
            <div className={`p-4 border-b flex items-center justify-between ${t.border}`}>
              <h2 className={`text-lg font-bold ${t.text}`}>
                {modal === 'viewProduct' ? selected?.name : 
                 modal === 'editProduct' ? (data.products.find(p => p.id === editData?.id) ? 'Edit Product' : 'Add Product') : 
                 'Edit Price Slab'}
              </h2>
              <button onClick={() => setModal('')} className={`p-2 rounded-lg transition-colors ${t.btn}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modal === 'viewProduct' && selected && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Name', selected.name], 
                    ['Category', getName(selected.category_id, 'categories')], 
                    ['Material', getName(selected.material_id, 'materials')], 
                    ['HSN Code', selected.hsn_code], 
                    ['Shape', selected.shape || 'N/A'], 
                    ['Colour', selected.colour || 'N/A'], 
                    ['Quality', selected.quality], 
                    ['Status', selected.is_active ? 'Active' : 'Inactive'],
                    ['Specifications', selected.specs || 'N/A']
                  ].map(([label, value], i) => (
                    <div key={i} className={label === 'Specifications' ? 'col-span-2' : ''}>
                      <p className={`text-xs font-medium ${t.muted}`}>{label}</p>
                      <p className={`font-medium ${t.text}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(modal === 'editProduct' || modal === 'editSlab') && editData && (
              <>
                {renderForm(modal === 'editProduct' ? 'product' : 'priceSlab')}
                <div className={`p-4 border-t flex gap-2 ${t.border}`}>
                  <button onClick={() => handleSave(modal === 'editProduct' ? 'product' : 'priceSlab')} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#c79e73' }}>
                    <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setModal('')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${t.btn}`}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}