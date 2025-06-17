import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Eye, Edit, Search, Package, Plus, Save, X, Layers, TrendingUp, Upload, Trash2, AlertCircle, Power } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import adminService from '../Firebase/services/adminApiService'

export default function InventoryManagement() {
  const { isDark } = useTheme()
  const [data, setData] = useState({ products: [], categories: [], materials: [], priceSlabs: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [filter, setFilter] = useState('all')
  const [isInitialized, setIsInitialized] = useState(false)

  const theme = useMemo(() => ({
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    muted: isDark ? 'text-gray-400' : 'text-gray-600',
    input: isDark ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500',
    btn: isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    tableRow: isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
  }), [isDark])

  const extractData = useCallback((response) => {
    if (!response?.success) return []
    const responseData = response.data || response
    return Array.isArray(responseData) ? responseData : Object.values(responseData).find(Array.isArray) || []
  }, [])

  const loadData = useCallback(async () => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const [products, categories, materials, priceSlabs] = await Promise.allSettled([
        adminService.getProducts(), 
        adminService.getCategories(), 
        adminService.getMaterials(), 
        adminService.listPriceSlabs()
      ])
      
      setData({
        products: extractData(products.value),
        categories: extractData(categories.value),
        materials: extractData(materials.value),
        priceSlabs: extractData(priceSlabs.value)
      })
      setIsInitialized(true)
    } catch (err) {
      setError(`Failed to load data: ${err.message}`)
    }
    setLoading(false)
  }, [loading, extractData])

  useEffect(() => { !isInitialized && loadData() }, [isInitialized, loadData])

  const getName = useCallback((id, type) => 
    data[type]?.find(item => item.id === id)?.name || 'Unknown', [data])

  const filteredData = useMemo(() => {
    if (activeTab !== 'products') return data[activeTab] || []
    return data.products.filter(p => {
      const searchMatch = !search || [
        p.name, p.hsn_code, p.shape, p.colour, 
        getName(p.category_id, 'categories'), 
        getName(p.material_id, 'materials')
      ].some(field => field?.toLowerCase().includes(search.toLowerCase()))
      
      const filterMatch = filter === 'all' || 
        (filter === 'premium' && p.quality === 'Premium') || 
        (filter === 'active' && p.is_active) || 
        (filter === 'inactive' && !p.is_active)
      return searchMatch && filterMatch
    })
  }, [data, activeTab, search, filter, getName])

  const handleImageUpload = useCallback((files) => {
    const images = Array.from(files).map(file => ({
      id: Date.now() + Math.random(), 
      name: file.name, 
      url: URL.createObjectURL(file), 
      originFileObj: file
    }))
    setEditData(prev => ({ ...prev, images: [...(prev.images || []), ...images] }))
  }, [])

  const apiCall = useCallback(async (fn, onSuccess = () => {}) => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const result = await fn()
      if (result?.success !== false) { 
        await loadData()
        onSuccess()
      } else {
        setError(result?.error || 'Operation failed')
      }
    } catch (err) { 
      setError(err.message) 
    }
    setLoading(false)
  }, [loading, loadData])

  const toggleStatus = useCallback((id, status) => 
    apiCall(() => adminService.updateProductStatus(id, !status)), [apiCall])

  const deleteItem = useCallback((id, type) => {
    if (!confirm(`Delete this ${type}?`)) return
    apiCall(() => {
      if (type === 'product') return adminService.deleteProduct?.(id)
      if (type === 'priceSlab') return adminService.deletePriceSlab?.(id)
      return Promise.reject(new Error('Delete operation not supported for this type'))
    })
  }, [apiCall])

  const saveItem = useCallback(() => {
    if (!editData) return
    
    const isProduct = modal === 'editProduct'
    const isEdit = data[isProduct ? 'products' : 'priceSlabs'].some(item => item.id === editData.id)
    
    const operation = isProduct 
      ? (isEdit 
          ? () => adminService.updateProduct(editData.id, editData)
          : () => adminService.addProduct(editData))
      : (isEdit 
          ? () => adminService.updatePriceSlab(editData.id, editData.min_qty, editData.max_qty, editData.price_per_unit)
          : () => adminService.addPriceSlab(editData.min_qty, editData.max_qty, editData.price_per_unit))
    
    apiCall(operation, () => { 
      setModal('')
      setEditData(null) 
    })
  }, [data, editData, modal, apiCall])

  const stats = useMemo(() => [
    { label: 'Total', value: data.products.length, icon: Package, color: '#c79e73', filter: 'all' },
    { label: 'Active', value: data.products.filter(p => p?.is_active).length, icon: TrendingUp, color: '#10b981', filter: 'active' },
    { label: 'Premium', value: data.products.filter(p => p?.quality === 'Premium').length, icon: Layers, color: '#8b5cf6', filter: 'premium' }
  ], [data])

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'priceSlabs', label: 'Price Slabs', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: TrendingUp },
    { id: 'materials', label: 'Materials', icon: Layers }
  ]

  const productFields = [
    { key: 'name', label: 'Product Name', required: true },
    { key: 'category_id', label: 'Category', type: 'select', options: data.categories.map(c => ({ value: c.id, label: c.name })), required: true },
    { key: 'material_id', label: 'Material', type: 'select', options: data.materials.map(m => ({ value: m.id, label: m.name })), required: true },
    { key: 'hsn_code', label: 'HSN Code' },
    { key: 'shape', label: 'Shape' },
    { key: 'colour', label: 'Colour' },
    { key: 'specs', label: 'Specifications', span: 2 },
    { key: 'quality', label: 'Quality', type: 'select', options: [{ value: 'Standard', label: 'Standard' }, { value: 'Premium', label: 'Premium' }] },
    { key: 'inventory_code', label: 'Inventory Code' },
    { key: 'cost_price', label: 'Cost Price (₹)', type: 'number' },
    { key: 'markup', label: 'Markup (%)', type: 'number' },
    { key: 'sell_price', label: 'Sell Price (₹)', type: 'number' },
    { key: 'gross_profit', label: 'Gross Profit (₹)', type: 'number' },
    { key: 'gst', label: 'GST (%)', type: 'number' },
    { key: 'price_with_gst', label: 'Price with GST (₹)', type: 'number' },
    { key: 'gst_amount', label: 'GST Amount (₹)', type: 'number' },
    { key: 'gst_payable', label: 'GST Payable (₹)', type: 'number' },
    { key: 'net_profit', label: 'Net Profit (₹)', type: 'number' },
    { key: 'in_stock', label: 'In Stock', type: 'number' },
    { key: 'pack_off', label: 'Pack Off', type: 'number' },
    // { key: 'document', label: 'Document', type: 'file' },
    { key: 'is_active', label: 'Active Status', type: 'checkbox', span: 2 }
  ]

  const priceSlabFields = [
    { key: 'min_qty', label: 'Min Qty', type: 'number', required: true },
    { key: 'max_qty', label: 'Max Qty', type: 'number', required: true },
    { key: 'price_per_unit', label: 'Price/Unit', type: 'number', required: true }
  ]

  const ActionButton = ({ onClick, color, icon: Icon, title }) => (
    <button onClick={onClick} className="p-2 rounded text-white hover:opacity-80 transition-opacity" 
      style={{ backgroundColor: color }} title={title}>
      <Icon className="w-4 h-4" />
    </button>
  )

  const renderTable = () => {
    if (activeTab === 'products') {
      return (
        <div className={`border rounded-lg overflow-hidden ${theme.card}`}>
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                {['Image','Product', 'Category', 'Material', 'HSN', 'Quality', 'Status', 'Actions'].map(header => (
                  <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className={theme.tableRow}>
                    <td className={`px-4 py-3 text-sm  ${theme.text}`}>{item.images?.length > 0 ? (item.images.map((img, idx) => (<img key={idx} src={img.image_url} alt={`Image ${idx + 1}`} className="w-16 h-16 object-cover mr-2 inline-block" />
                          ))
                        ) : (
                          '-'
                        )}</td>
                  <td className={`px-4 py-3 ${theme.text}`}>
                    <div className="font-medium">{item.name}</div>
                    {(item.shape || item.colour) && (
                      <div className={`text-sm ${theme.muted}`}>
                        {[item.shape, item.colour].filter(Boolean).join(' • ')}
                      </div>
                    )}
                  </td>
                      <td className={`px-4 py-3 text-sm ${theme.text}`}>{getName(item.category_id, 'categories')}</td>
                  <td className={`px-4 py-3 text-sm ${theme.text}`}>{getName(item.material_id, 'materials')}</td>
                  <td className={`px-4 py-3 text-sm ${theme.text}`}>{item.hsn_code || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      item.quality === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.quality}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <ActionButton onClick={() => { setSelected(item); setModal('view') }} 
                        color="#6b7280" icon={Eye} title="View" />
                      <ActionButton onClick={() => { setEditData({...item}); setModal('editProduct') }} 
                        color="#c79e73" icon={Edit} title="Edit" />
                      <ActionButton onClick={() => toggleStatus(item.id, item.is_active)} 
                        color={item.is_active ? '#ef4444' : '#10b981'} icon={Power} title="Toggle Status" />
                      <ActionButton onClick={() => deleteItem(item.id, 'product')} 
                        color="#ef4444" icon={Trash2} title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'priceSlabs') {
      return (
        <div className={`border rounded-lg overflow-hidden ${theme.card}`}>
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                {['Min Qty', 'Max Qty', 'Price/Unit', 'Actions'].map(header => (
                  <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className={theme.tableRow}>
                  <td className={`px-4 py-3 font-medium ${theme.text}`}>{item.min_qty}</td>
                  <td className={`px-4 py-3 font-medium ${theme.text}`}>{item.max_qty}</td>
                  <td className={`px-4 py-3 font-bold text-lg ${theme.text}`}>₹{item.price_per_unit}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <ActionButton onClick={() => { setEditData({...item}); setModal('editSlab') }} 
                        color="#c79e73" icon={Edit} title="Edit" />
                      <ActionButton onClick={() => deleteItem(item.id, 'priceSlab')} 
                        color="#ef4444" icon={Trash2} title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div className={`border rounded-lg overflow-hidden ${theme.card}`}>
        <table className="w-full">
          <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              {['Image','Name', 'Status'].map(header => (
                <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.muted}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item) => (
              <tr key={item.id} className={theme.tableRow}>
                <td className={`px-4 py-3 text-sm ${theme.text}`}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />
                  ) : '-'}
                </td>
                <td className={`px-4 py-3 font-medium ${theme.text}`}>{item.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderModal = () => {
    if (!modal) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-lg w-full max-h-[90vh] overflow-y-auto ${
          modal.includes('Product') ? 'max-w-3xl' : 'max-w-lg'
        } ${theme.card}`}>
          <div className={`p-4 border-b flex items-center justify-between ${theme.border}`}>
            <h2 className={`text-xl font-bold ${theme.text}`}>
              {modal === 'view' ? selected?.name : 
               modal === 'editProduct' ? (editData?.id ? 'Edit Product' : 'Add Product') : 
               editData?.id ? 'Edit Price Slab' : 'Add Price Slab'}
            </h2>
            <button onClick={() => setModal('')} className={`p-2 rounded ${theme.btn}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {modal === 'view' && selected && (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Image', selected.images?.[0]?.image_url,'image_url'], 
                  ['Name', selected.name], 
                  ['Category', getName(selected.category_id, 'categories')], 
                  ['Material', getName(selected.material_id, 'materials')], 
                  ['HSN Code', selected.hsn_code || 'N/A'], 
                  ['Shape', selected.shape || 'N/A'], 
                  ['Colour', selected.colour || 'N/A'], 
                  ['Quality', selected.quality], 
                  ['Status', selected.is_active ? 'Active' : 'Inactive']
                ].map(([label, value], i) => (
                  <div key={i}>
                    <p className={`text-sm font-medium ${theme.muted}`}>{label}</p>
                   {/* <p className={`mt-1 ${theme.text}`}>{value}</p> */}
                   <p className={`mt-1 ${theme.text}`}>
                    {label === 'Image' && value ? (
                      <img src={value} alt="Selected" className="w-16 h-16 object-cover rounded" />
                    ) : (
                      value || '-'
                    )}
                  </p>
                  </div>
                ))}
                {selected.specs && (
                  <div className="col-span-2">
                    <p className={`text-sm font-medium ${theme.muted}`}>Specifications</p>
                    <p className={`mt-1 ${theme.text}`}>{selected.specs}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(modal === 'editProduct' || modal === 'editSlab') && editData && (
            <>
              <div className="p-4 max-h-96 overflow-y-auto">
                {modal === 'editProduct' && (
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${theme.text}`}>Images</label>
                    <div className={`border-2 border-dashed rounded p-4 text-center ${theme.border}`}>
                      <input type="file" multiple accept="image/*" 
                        onChange={(e) => handleImageUpload(e.target.files)} className="hidden" id="img" />
                      <label htmlFor="img" className="cursor-pointer">
                        <Upload className={`w-6 h-6 mx-auto mb-1 ${theme.muted}`} />
                        <p className={`text-xs ${theme.muted}`}>Upload Images</p>
                      </label>
                    </div>
                    {editData?.images?.length > 0 && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {editData.images.map((img) => (
                          <div key={img.id} className="relative group">
                            <img src={img.image_url} alt="" className="w-full h-16 object-cover rounded" />
                            <button onClick={() => setEditData(p => ({ 
                              ...p, images: p.images.filter(i => i.id !== img.id) 
                            }))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100">
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className={`grid gap-3 ${modal === 'editProduct' ? 'grid-cols-2' : ''}`}>
                  {(modal === 'editProduct' ? productFields : priceSlabFields).map(field => (
                    <div key={field.key} className={field.key === 'specs' ? 'col-span-2' : ''}>
                      <label className={`block text-sm mb-1 ${theme.muted}`}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select value={editData?.[field.key] || ''} 
                          onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
                          className={`w-full p-2 border rounded ${theme.input}`}>
                          <option value="">Select {field.label}</option>
                          {field.options?.map(opt => 
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          )}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={editData?.[field.key] || false}
                            onChange={(e) => setEditData({...editData, [field.key]: e.target.checked})} />
                          <span className={`text-sm ${theme.text}`}>Active</span>
                        </label>
                      ) : (
                        <input type={field.type || 'text'} value={editData?.[field.key] || ''}
                          onChange={(e) => setEditData({...editData, [field.key]: 
                            field.type === 'number' ? +e.target.value || 0 : e.target.value})}
                          className={`w-full p-2 border rounded ${theme.input}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className={`p-4 border-t flex gap-3 ${theme.border}`}>
                <button onClick={saveItem} disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50" 
                  style={{ backgroundColor: '#c79e73' }}>
                  <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setModal('')} className={`px-6 py-3 rounded-lg font-medium ${theme.btn}`}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading && !isInitialized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <span className={`text-lg ${theme.text}`}>Loading inventory...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${theme.bg}`}>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${theme.text}`}>Inventory Management</h1>
        <p className={`text-lg ${theme.muted}`}>Manage products, categories, materials & pricing</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-5 h-5" /></button>
        </div>
      )}

      <div className={`mb-6 border-b ${theme.border}`}>
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-3 border-b-2 font-medium flex items-center gap-2 ${
                  activeTab === tab.id ? 'border-amber-500 text-amber-600' : `border-transparent ${theme.muted}`
                }`}>
                <Icon className="w-5 h-5" />{tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'products' && (
        <>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search products..." value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg ${theme.input}`} />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} 
              className={`px-4 py-3 border rounded-lg ${theme.input}`}>
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="premium">Premium</option>
            </select>
            <button onClick={() => { 
              setEditData({ 
                name: '', category_id: '', material_id: '', hsn_code: '', 
                shape: '', colour: '', specs: '', quality: 'Standard', 
                is_active: true, document: [] 
              }); 
              setModal('editProduct') 
            }} className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium" 
              style={{ backgroundColor: '#c79e73' }}>
              <Plus className="w-5 h-5" />Add Product
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} onClick={() => setFilter(stat.filter)}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${theme.card} ${
                    filter === stat.filter ? 'ring-2 ring-amber-400' : ''
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme.muted}`}>{stat.label}</p>
                      <p className={`text-2xl font-bold ${theme.text}`}>{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                      style={{ backgroundColor: stat.color }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {activeTab === 'priceSlabs' && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-semibold ${theme.text}`}>Price Slabs</h2>
            <p className={`${theme.muted}`}>Manage quantity-based pricing tiers</p>
          </div>
          <button onClick={() => { 
            setEditData({ min_qty: 1, max_qty: 10, price_per_unit: 0 }); 
            setModal('editSlab') 
          }} className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium" 
            style={{ backgroundColor: '#c79e73' }}>
            <Plus className="w-5 h-5" />Add Price Slab
          </button>
        </div>
      )}

      <div className="mb-4">
        <p className={`${theme.muted}`}>
          Showing {filteredData.length} {activeTab.replace('Slabs', ' slabs')} 
          {activeTab === 'products' && filter !== 'all' && ` (${filter})`}
        </p>
      </div>

      {!filteredData.length ? (
        <div className="text-center py-16">
          <Package className={`w-16 h-16 mx-auto mb-4 ${theme.muted}`} />
          <h3 className={`text-xl font-semibold mb-2 ${theme.text}`}>No {activeTab} found</h3>
          <p className={`${theme.muted}`}>
            {activeTab === 'products' && filter !== 'all' ? 
              `No ${filter} products available` : 
              `Start by adding your first ${activeTab.slice(0, -1)}`}
          </p>
        </div>
      ) : renderTable()}

      {renderModal()}
    </div>
  )
}