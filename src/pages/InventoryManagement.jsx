import React, { useState } from 'react'
import { Eye, Edit, Search, Package, Plus, Save, X, Layers, DollarSign, TrendingUp, BarChart3, Filter, Upload, Trash2 } from 'lucide-react'

import useTheme from '../hooks/useTheme'

const mockSKUs = [
  {
    id: 1, srNo: 'SKU001', inventoryCode: 'INV-2025-001', category: 'Electronics', material: 'Plastic',
    hsnCode: '85176290', product: 'Bluetooth Speaker', shape: 'Cylindrical', colour: 'Black',
    specs: '10W, Bluetooth 5.0', quality: 'Premium', packOff: '1 Unit', images: [],
    costPrice: 1500, markup: 66.67, sellPrice: 2500, grossProfit: 1000,
    gst: 18, priceWithGST: 2950, gstAmount: 450, gstInward: 270, gstPayable: 180, netProfit: 730
  },
  {
    id: 2, srNo: 'SKU002', inventoryCode: 'INV-2025-002', category: 'Furniture', material: 'Wood',
    hsnCode: '94036090', product: 'Office Chair', shape: 'Ergonomic', colour: 'Brown',
    specs: 'Height Adjustable, 360° Swivel', quality: 'Standard', packOff: '1 Unit', images: [],
    costPrice: 3500, markup: 42.86, sellPrice: 5000, grossProfit: 1500,
    gst: 18, priceWithGST: 5900, gstAmount: 900, gstInward: 630, gstPayable: 270, netProfit: 870
  },
  {
    id: 3, srNo: 'SKU003', inventoryCode: 'INV-2025-003', category: 'Textiles', material: 'Cotton',
    hsnCode: '61051000', product: 'T-Shirt', shape: 'Round Neck', colour: 'Blue',
    specs: 'Size: M, 100% Cotton', quality: 'Premium', packOff: '1 Piece', images: [],
    costPrice: 300, markup: 100, sellPrice: 600, grossProfit: 300,
    gst: 12, priceWithGST: 672, gstAmount: 72, gstInward: 36, gstPayable: 36, netProfit: 264
  }
]

const mockPriceSlabs = [
  { id: 1, name: 'Retail', minQty: 1, maxQty: 10, discount: 0, description: 'Individual customers' },
  { id: 2, name: 'Wholesale', minQty: 11, maxQty: 50, discount: 10, description: 'Small businesses' },
  { id: 3, name: 'Distributor', minQty: 51, maxQty: 100, discount: 15, description: 'Regional distributors' },
  { id: 4, name: 'Corporate', minQty: 101, maxQty: 999, discount: 20, description: 'Large corporations' }
]

export default function InventoryManagement() {
  const { isDark } = useTheme()
  const [skus, setSKUs] = useState(mockSKUs)
  const [priceSlabs, setPriceSlabs] = useState(mockPriceSlabs)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [editData, setEditData] = useState(null)
  const [activeTab, setActiveTab] = useState('skus')
  const [filter, setFilter] = useState('all')

  const filtered = skus.filter(s => 
    (s.product.toLowerCase().includes(search.toLowerCase()) || 
     s.category.toLowerCase().includes(search.toLowerCase()) ||
     s.inventoryCode.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || 
     (filter === 'high-margin' && s.markup >= 50) ||
     (filter === 'low-stock' && Math.random() > 0.7) ||
     (filter === 'premium' && s.quality === 'Premium'))
  )

  const calculateValues = (data) => {
    const sellPrice = data.costPrice * (1 + data.markup / 100)
    const grossProfit = sellPrice - data.costPrice
    const gstAmount = sellPrice * (data.gst / 100)
    const priceWithGST = sellPrice + gstAmount
    const gstInward = data.costPrice * (data.gst / 100)
    const gstPayable = gstAmount - gstInward
    const netProfit = grossProfit - gstInward
    return { ...data, sellPrice, grossProfit, priceWithGST, gstAmount, gstInward, gstPayable, netProfit }
  }

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }))
    setEditData(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }))
  }

  const removeImage = (imageId) => {
    setEditData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }))
  }

  const handleSave = (type) => {
    if (type === 'sku') {
      const calculatedData = calculateValues(editData)
      setSKUs(prev => skus.find(s => s.id === editData.id) ? 
        prev.map(s => s.id === editData.id ? calculatedData : s) : 
        [...prev, { ...calculatedData, id: Date.now() }])
    } else {
      setPriceSlabs(prev => priceSlabs.find(p => p.id === editData.id) ? 
        prev.map(p => p.id === editData.id ? editData : p) : 
        [...prev, { ...editData, id: Date.now() }])
    }
    setModal('')
    setEditData(null)
  }

  const stats = [
    { label: 'Total', value: skus.length, icon: Package, color: '#c79e73', filter: 'all' },
    { label: 'High Margin', value: skus.filter(s => s.markup >= 50).length, icon: TrendingUp, color: '#f59e0b', filter: 'high-margin' },
    { label: 'Premium', value: skus.filter(s => s.quality === 'Premium').length, icon: Layers, color: '#8b5cf6', filter: 'premium' },
    { label: 'Price Slabs', value: priceSlabs.length, icon: BarChart3, color: '#ef4444', filter: 'all' }
  ]

  const tabs = [
    { id: 'skus', label: 'SKU Management', icon: Package },
    { id: 'pricing', label: 'Price Slabs', icon: DollarSign }
  ]

  const skuFields = [
    { key: 'srNo', label: 'Sr No' }, { key: 'inventoryCode', label: 'Inventory Code' },
    { key: 'category', label: 'Category' }, { key: 'material', label: 'Material' },
    { key: 'hsnCode', label: 'HSN Code' }, { key: 'product', label: 'Product' },
    { key: 'shape', label: 'Shape' }, { key: 'colour', label: 'Colour' },
    { key: 'specs', label: 'Specs' }, { key: 'quality', label: 'Quality', type: 'select', options: ['Standard', 'Premium'] },
    { key: 'packOff', label: 'Pack Off' }, { key: 'costPrice', label: 'Cost Price', type: 'number' },
    { key: 'markup', label: 'Markup (%)', type: 'number' }, { key: 'gst', label: 'GST (%)', type: 'number' }
  ]

  const slabFields = [
    { key: 'name', label: 'Slab Name' }, { key: 'minQty', label: 'Min Quantity', type: 'number' },
    { key: 'maxQty', label: 'Max Quantity', type: 'number' }, { key: 'discount', label: 'Discount (%)', type: 'number' },
    { key: 'description', label: 'Description' }
  ]

  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    input: isDark ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500',
    button: isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    border: isDark ? 'border-gray-700' : 'border-gray-200'
  }

  return (
    <div className={`min-h-screen p-4 transition-colors ${themeClasses.bg}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${themeClasses.text}`}>Inventory Management</h1>
        <p className={`text-sm ${themeClasses.textMuted}`}>Manage SKUs and pricing strategies</p>
      </div>

      {/* Tabs */}
      <div className={`mb-6 border-b ${themeClasses.border}`}>
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : `border-transparent ${themeClasses.textMuted} hover:text-gray-300`
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'skus' && (
        <>
          {/* Controls */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" 
                placeholder="Search SKUs, products, or categories..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg transition-colors ${themeClasses.input}`}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                className={`pl-9 pr-8 py-2.5 border rounded-lg appearance-none transition-colors min-w-[140px] ${themeClasses.input}`}
              >
                <option value="all">All SKUs</option>
                <option value="high-margin">High Margin</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <button 
              onClick={() => {
                setEditData({
                  srNo: '', inventoryCode: '', category: '', material: '', hsnCode: '',
                  product: '', shape: '', colour: '', specs: '', quality: 'Standard', packOff: '',
                  costPrice: 0, markup: 0, gst: 18, images: []
                })
                setModal('editSKU')
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: '#c79e73' }}
            >
              <Plus className="w-4 h-4" /> Add SKU
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map((stat, i) => {
              const IconComponent = stat.icon
              return (
                <div 
                  key={i} 
                  onClick={() => setFilter(stat.filter)}
                  className={`border rounded-lg p-3 shadow-sm cursor-pointer transition-all hover:shadow-md ${themeClasses.card} ${
                    filter === stat.filter ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${themeClasses.textMuted}`}>{stat.label}</p>
                      <p className={`text-xl font-bold ${themeClasses.text}`}>{stat.value}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* SKU Cards */}
          <div className="space-y-3">
            {filtered.map((sku) => (
              <div key={sku.id} className={`border rounded-lg shadow-sm p-4 transition-colors ${themeClasses.card}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold ${themeClasses.text}`}>{sku.product}</h3>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{sku.srNo}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        sku.quality === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>{sku.quality}</span>
                      {sku.images?.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {sku.images.length} image{sku.images.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className={themeClasses.textMuted}>Category</p>
                        <p className={`font-medium ${themeClasses.text}`}>{sku.category}</p>
                      </div>
                      <div>
                        <p className={themeClasses.textMuted}>Cost → Sell</p>
                        <p className={`font-medium ${themeClasses.text}`}>₹{sku.costPrice} → ₹{sku.sellPrice.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className={themeClasses.textMuted}>Markup</p>
                        <p className={`font-medium ${themeClasses.text}`}>{sku.markup.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className={themeClasses.textMuted}>Net Profit</p>
                        <p className="font-medium text-green-600">₹{sku.netProfit.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button 
                      onClick={() => { setSelected(sku); setModal('viewSKU') }} 
                      className={`p-2 rounded-lg transition-colors ${themeClasses.button}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setEditData({...sku}); setModal('editSKU') }} 
                      className="p-2 text-white rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#c79e73' }}
                    >
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
              <h2 className={`text-lg font-semibold ${themeClasses.text}`}>Price Slabs</h2>
              <p className={`text-sm ${themeClasses.textMuted}`}>Manage quantity-based pricing tiers</p>
            </div>
            <button 
              onClick={() => {
                setEditData({ name: '', minQty: 1, maxQty: 10, discount: 0, description: '' })
                setModal('editSlab')
              }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
              style={{ backgroundColor: '#c79e73' }}
            >
              <Plus className="w-4 h-4" /> Add Price Slab
            </button>
          </div>

          <div className={`rounded-lg shadow-sm overflow-hidden ${themeClasses.card}`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  {['Name', 'Quantity Range', 'Discount', 'Description', 'Actions'].map(header => (
                    <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {priceSlabs.map((slab) => (
                  <tr key={slab.id}>
                    <td className={`px-4 py-3 text-sm font-medium ${themeClasses.text}`}>{slab.name}</td>
                    <td className={`px-4 py-3 text-sm ${themeClasses.textMuted}`}>{slab.minQty} - {slab.maxQty}</td>
                    <td className={`px-4 py-3 text-sm ${themeClasses.textMuted}`}>{slab.discount}%</td>
                    <td className={`px-4 py-3 text-sm ${themeClasses.textMuted}`}>{slab.description}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => { setEditData({...slab}); setModal('editSlab') }}
                        className="text-amber-600 hover:text-amber-800 text-sm transition-colors"
                      >
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

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl w-full max-h-[90vh] overflow-y-auto ${
            modal === 'viewSKU' ? 'max-w-4xl' : modal === 'editSKU' ? 'max-w-3xl' : 'max-w-md'
          } ${themeClasses.card}`}>
            <div className={`p-4 border-b flex items-center justify-between ${themeClasses.border}`}>
              <h2 className={`text-lg font-bold ${themeClasses.text}`}>
                {modal === 'viewSKU' ? selected?.product : 
                 modal === 'editSKU' ? (skus.find(s => s.id === editData?.id) ? 'Edit SKU' : 'Add SKU') : 
                 'Edit Price Slab'}
              </h2>
              <button onClick={() => setModal('')} className={`p-2 rounded-lg transition-colors ${themeClasses.button}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modal === 'viewSKU' && selected && (
              <div className="p-4">
                {selected.images?.length > 0 && (
                  <div className="mb-4">
                    <h3 className={`text-sm font-medium mb-2 ${themeClasses.text}`}>Images</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {selected.images.map((img, i) => (
                        <img key={i} src={img.url} alt={img.name} className="w-full h-20 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Sr No', selected.srNo], ['Inventory Code', selected.inventoryCode], ['Category', selected.category],
                    ['Material', selected.material], ['HSN Code', selected.hsnCode], ['Shape', selected.shape],
                    ['Colour', selected.colour], ['Quality', selected.quality], ['Cost Price', `₹${selected.costPrice}`],
                    ['Markup', `${selected.markup.toFixed(2)}%`], ['Sell Price', `₹${selected.sellPrice.toFixed(2)}`],
                    ['Price with GST', `₹${selected.priceWithGST.toFixed(2)}`], ['GST Amount', `₹${selected.gstAmount.toFixed(2)}`],
                    ['Net Profit', `₹${selected.netProfit.toFixed(2)}`], ['Specs', selected.specs], ['Pack Off', selected.packOff]
                  ].map(([label, value], i) => (
                    <div key={i} className={themeClasses.textMuted}>
                      <strong className={themeClasses.text}>{label}:</strong> {value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal === 'editSKU' && editData && (
              <>
                <div className="p-4 max-h-96 overflow-y-auto">
                  {/* Image Upload Section */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>Product Images</label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center ${themeClasses.border}`}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${themeClasses.textMuted}`} />
                        <p className={`text-sm ${themeClasses.textMuted}`}>Click to upload images or drag and drop</p>
                      </label>
                    </div>
                    
                    {editData.images?.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {editData.images.map((img) => (
                          <div key={img.id} className="relative group">
                            <img src={img.url} alt={img.name} className="w-full h-20 object-cover rounded border" />
                            <button
                              onClick={() => removeImage(img.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    {skuFields.map(field => (
                      <div key={field.key}>
                        <label className={`block text-xs font-medium mb-1 ${themeClasses.textMuted}`}>{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            value={editData[field.key]}
                            onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
                            className={`w-full p-2 border rounded text-sm transition-colors ${themeClasses.input}`}
                          >
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type={field.type || 'text'}
                            value={editData[field.key]}
                            onChange={(e) => setEditData({...editData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
                            className={`w-full p-2 border rounded text-sm transition-colors ${themeClasses.input}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`p-4 border-t flex gap-2 ${themeClasses.border}`}>
                  <button 
                    onClick={() => handleSave('sku')}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button 
                    onClick={() => setModal('')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${themeClasses.button}`}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modal === 'editSlab' && editData && (
              <>
                <div className="p-4 space-y-3">
                  {slabFields.map(field => (
                    <div key={field.key}>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={editData[field.key]}
                        onChange={(e) => setEditData({...editData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
                        className={`w-full p-2 border rounded text-sm transition-colors ${themeClasses.input}`}
                      />
                    </div>
                  ))}
                </div>
                <div className={`p-4 border-t flex gap-2 ${themeClasses.border}`}>
                  <button 
                    onClick={() => handleSave('slab')}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button 
                    onClick={() => setModal('')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${themeClasses.button}`}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}