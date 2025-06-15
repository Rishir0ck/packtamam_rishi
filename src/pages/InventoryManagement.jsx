import React, { useState, useEffect } from 'react'
import { Eye, Edit, Search, Package, Plus, Save, X, Layers, DollarSign, TrendingUp, BarChart3, Filter, Upload, Trash2, AlertCircle } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import adminService from '../Firebase/services/adminApiService'

export default function InventoryManagement() {
  const { isDark } = useTheme()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [priceSlabs, setPriceSlabs] = useState([])
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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [productsRes, categoriesRes, materialsRes, priceSlabsRes] = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories(),
        adminService.getMaterials(),
        adminService.listPriceSlabs()
      ])

      // Ensure we always set arrays, with proper fallbacks
      if (productsRes.success) {
        const productsData = productsRes.data?.products || productsRes.data || []
        setProducts(Array.isArray(productsData) ? productsData : [])
      }
      
      if (categoriesRes.success) {
        const categoriesData = categoriesRes.data?.categories || categoriesRes.data || []
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      }
      
      if (materialsRes.success) {
        const materialsData = materialsRes.data?.materials || materialsRes.data || []
        setMaterials(Array.isArray(materialsData) ? materialsData : [])
      }
      
      if (priceSlabsRes.success) {
        const priceSlabsData = priceSlabsRes.data?.priceSlabs || priceSlabsRes.data || []
        setPriceSlabs(Array.isArray(priceSlabsData) ? priceSlabsData : [])
      }
    } catch (err) {
      setError('Failed to load data: ' + err.message)
      console.error('Data loading error:', err)
    }
    setLoading(false)
  }

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Unknown'
  const getMaterialName = (id) => materials.find(m => m.id === id)?.name || 'Unknown'

  // Safeguard the filter function with additional checks
  const filtered = Array.isArray(products) ? products.filter(p => 
    (p?.name?.toLowerCase().includes(search.toLowerCase()) || 
     getCategoryName(p?.category_id).toLowerCase().includes(search.toLowerCase()) || 
     p?.hsn_code?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || 
     (filter === 'premium' && p?.quality === 'Premium') ||
     (filter === 'recent' && p?.created_at && new Date(p.created_at) > new Date(Date.now() - 7*24*60*60*1000)))
  ) : []

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      originFileObj: file
    }))
    setEditData(p => ({ ...p, images: [...(p.images || []), ...newImages] }))
  }

  const handleSave = async (type) => {
    setLoading(true)
    try {
      if (type === 'product') {
        const isEdit = products.find(p => p.id === editData.id)
        const result = isEdit 
          ? await adminService.updateProduct(editData.id, editData)
          : await adminService.addProduct(editData)
        
        if (result.success) {
          await loadData()
          setModal('')
          setEditData(null)
        } else {
          setError(result.error)
        }
      } else if (type === 'priceSlab') {
        const isEdit = priceSlabs.find(s => s.id === editData.id)
        const result = isEdit
          ? await adminService.updatePriceSlab(editData.id, editData.min_qty, editData.max_qty, editData.price_per_unit)
          : await adminService.addPriceSlab(editData.min_qty, editData.max_qty, editData.price_per_unit)
        
        if (result.success) {
          await loadData()
          setModal('')
          setEditData(null)
        } else {
          setError(result.error)
        }
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: '#c79e73', filter: 'all' },
    { label: 'Premium', value: products.filter(p => p?.quality === 'Premium').length, icon: Layers, color: '#8b5cf6', filter: 'premium' },
    { label: 'Categories', value: categories.length, icon: TrendingUp, color: '#f59e0b', filter: 'all' },
    { label: 'Price Slabs', value: priceSlabs.length, icon: BarChart3, color: '#ef4444', filter: 'all' }
  ]

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'pricing', label: 'Price Slabs', icon: DollarSign }
  ]

  const productFields = [
    { key: 'name', label: 'Product Name', required: true },
    { key: 'category_id', label: 'Category', type: 'select', options: categories.map(c => ({ value: c.id, label: c.name })), required: true },
    { key: 'material_id', label: 'Material', type: 'select', options: materials.map(m => ({ value: m.id, label: m.name })), required: true },
    { key: 'hsn_code', label: 'HSN Code' },
    { key: 'shape', label: 'Shape' },
    { key: 'colour', label: 'Colour' },
    { key: 'specs', label: 'Specifications' },
    { key: 'quality', label: 'Quality', type: 'select', options: [{ value: 'Standard', label: 'Standard' }, { value: 'Premium', label: 'Premium' }] }
  ]

  const slabFields = [
    { key: 'min_qty', label: 'Min Quantity', type: 'number', required: true },
    { key: 'max_qty', label: 'Max Quantity', type: 'number', required: true },
    { key: 'price_per_unit', label: 'Price Per Unit', type: 'number', required: true }
  ]

  if (loading && products.length === 0) {
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
        <p className={`text-sm ${t.muted}`}>Manage products and pricing strategies</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
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
              <input type="text" placeholder="Search products, categories, or HSN codes..." value={search} onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg transition-colors ${t.input}`} />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} 
                className={`pl-9 pr-8 py-2.5 border rounded-lg appearance-none transition-colors min-w-[140px] ${t.input}`}>
                <option value="all">All Products</option>
                <option value="premium">Premium</option>
                <option value="recent">Recent</option>
              </select>
            </div>
            <button onClick={() => { 
              setEditData({ name: '', category_id: '', material_id: '', hsn_code: '', shape: '', colour: '', specs: '', quality: 'Standard', images: [] }); 
              setModal('editProduct') 
            }}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#c79e73' }}>
              <Plus className="w-4 h-4" /> Add Product
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

          <div className="space-y-3">
            {filtered.map((product) => (
              <div key={product.id} className={`border rounded-lg shadow-sm p-4 transition-colors ${t.card}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold ${t.text}`}>{product.name}</h3>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{product.hsn_code}</span>
                      <span className={`text-xs px-2 py-1 rounded ${product.quality === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {product.quality}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className={t.muted}>Category</p><p className={`font-medium ${t.text}`}>{getCategoryName(product.category_id)}</p></div>
                      <div><p className={t.muted}>Material</p><p className={`font-medium ${t.text}`}>{getMaterialName(product.material_id)}</p></div>
                      <div><p className={t.muted}>Shape</p><p className={`font-medium ${t.text}`}>{product.shape || 'N/A'}</p></div>
                      <div><p className={t.muted}>Colour</p><p className={`font-medium ${t.text}`}>{product.colour || 'N/A'}</p></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => { setSelected(product); setModal('viewProduct') }} className={`p-2 rounded-lg transition-colors ${t.btn}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditData({...product}); setModal('editProduct') }} 
                      className="p-2 text-white rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: '#c79e73' }}>
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'pricing' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-lg font-semibold ${t.text}`}>Price Slabs</h2>
              <p className={`text-sm ${t.muted}`}>Manage quantity-based pricing tiers</p>
            </div>
            <button onClick={() => { 
              setEditData({ min_qty: 1, max_qty: 10, price_per_unit: 0 }); 
              setModal('editSlab') 
            }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style={{ backgroundColor: '#c79e73' }}>
              <Plus className="w-4 h-4" /> Add Price Slab
            </button>
          </div>

          <div className={`rounded-lg shadow-sm overflow-hidden ${t.card}`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  {['Min Qty', 'Max Qty', 'Price per Unit', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase ${t.muted}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {priceSlabs.map((slab) => (
                  <tr key={slab.id}>
                    <td className={`px-4 py-3 text-sm ${t.text}`}>{slab.min_qty}</td>
                    <td className={`px-4 py-3 text-sm ${t.text}`}>{slab.max_qty}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${t.text}`}>₹{slab.price_per_unit}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditData({...slab}); setModal('editSlab') }} 
                        className="text-amber-600 hover:text-amber-800 text-sm transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl w-full max-h-[90vh] overflow-y-auto ${modal.includes('Product') ? 'max-w-3xl' : 'max-w-md'} ${t.card}`}>
            <div className={`p-4 border-b flex items-center justify-between ${t.border}`}>
              <h2 className={`text-lg font-bold ${t.text}`}>
                {modal === 'viewProduct' ? selected?.name : 
                 modal === 'editProduct' ? (products.find(p => p.id === editData?.id) ? 'Edit Product' : 'Add Product') : 
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
                    ['Category', getCategoryName(selected.category_id)],
                    ['Material', getMaterialName(selected.material_id)],
                    ['HSN Code', selected.hsn_code],
                    ['Shape', selected.shape || 'N/A'],
                    ['Colour', selected.colour || 'N/A'],
                    ['Quality', selected.quality],
                    ['Specifications', selected.specs || 'N/A']
                  ].map(([label, value], i) => (
                    <div key={i}>
                      <p className={`text-xs font-medium ${t.muted}`}>{label}</p>
                      <p className={`font-medium ${t.text}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal === 'editProduct' && editData && (
              <>
                <div className="p-4 max-h-96 overflow-y-auto">
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

                  <div className="grid grid-cols-2 gap-3">
                    {productFields.map(field => (
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
                        ) : (
                          <input type={field.type || 'text'} value={editData[field.key] || ''}
                            onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
                            className={`w-full p-2 border rounded text-sm transition-colors ${t.input}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`p-4 border-t flex gap-2 ${t.border}`}>
                  <button onClick={() => handleSave('product')} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50" 
                    style={{ backgroundColor: '#c79e73' }}>
                    <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setModal('')} className={`px-4 py-2 rounded-lg text-sm transition-colors ${t.btn}`}>Cancel</button>
                </div>
              </>
            )}

            {modal === 'editSlab' && editData && (
              <>
                <div className="p-4 space-y-3">
                  {slabFields.map(field => (
                    <div key={field.key}>
                      <label className={`block text-sm font-medium mb-1 ${t.text}`}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input type={field.type || 'text'} value={editData[field.key] || ''}
                        onChange={(e) => setEditData({...editData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
                        className={`w-full p-2 border rounded text-sm transition-colors ${t.input}`} />
                    </div>
                  ))}
                </div>
                <div className={`p-4 border-t flex gap-2 ${t.border}`}>
                  <button onClick={() => handleSave('priceSlab')} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50" 
                    style={{ backgroundColor: '#c79e73' }}>
                    <Save className="w-4 h-4" /> {loading ? 'Saving..' : 'Save'}
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