import React, { useState } from 'react'
import { Eye, Edit, Search, Package, Plus, Save, X, Layers, DollarSign, TrendingUp, BarChart3 } from 'lucide-react'

import useTheme from '../hooks/useTheme'

const mockSKUs = [
  {
    id: 1, srNo: 'SKU001', inventoryCode: 'INV-2025-001', category: 'Electronics', material: 'Plastic',
    hsnCode: '85176290', product: 'Bluetooth Speaker', shape: 'Cylindrical', colour: 'Black',
    specs: '10W, Bluetooth 5.0', quality: 'Premium', packOff: '1 Unit',
    costPrice: 1500, markup: 66.67, sellPrice: 2500, grossProfit: 1000,
    gst: 18, priceWithGST: 2950, gstAmount: 450, gstInward: 270, gstPayable: 180, netProfit: 730
  },
  {
    id: 2, srNo: 'SKU002', inventoryCode: 'INV-2025-002', category: 'Furniture', material: 'Wood',
    hsnCode: '94036090', product: 'Office Chair', shape: 'Ergonomic', colour: 'Brown',
    specs: 'Height Adjustable, 360° Swivel', quality: 'Standard', packOff: '1 Unit',
    costPrice: 3500, markup: 42.86, sellPrice: 5000, grossProfit: 1500,
    gst: 18, priceWithGST: 5900, gstAmount: 900, gstInward: 630, gstPayable: 270, netProfit: 870
  },
  {
    id: 3, srNo: 'SKU003', inventoryCode: 'INV-2025-003', category: 'Textiles', material: 'Cotton',
    hsnCode: '61051000', product: 'T-Shirt', shape: 'Round Neck', colour: 'Blue',
    specs: 'Size: M, 100% Cotton', quality: 'Premium', packOff: '1 Piece',
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
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = skus.filter(s => 
    (s.product.toLowerCase().includes(search.toLowerCase()) || 
     s.category.toLowerCase().includes(search.toLowerCase()) ||
     s.inventoryCode.toLowerCase().includes(search.toLowerCase())) &&
    (activeFilter === 'all' || 
     (activeFilter === 'high-margin' && s.markup >= 50) ||
     (activeFilter === 'low-stock' && Math.random() > 0.7) ||
     (activeFilter === 'premium' && s.quality === 'Premium'))
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

  const handleSave = (type) => {
    if (type === 'sku') {
      const calculatedData = calculateValues(editData)
      setSKUs(prev => skus.find(s => s.id === editData.id) ? prev.map(s => s.id === editData.id ? calculatedData : s) : [...prev, calculatedData])
    } else {
      setPriceSlabs(prev => priceSlabs.find(p => p.id === editData.id) ? prev.map(p => p.id === editData.id ? editData : p) : [...prev, editData])
    }
    setModal('')
    setEditData(null)
  }

  const stats = [
    { label: 'Total SKUs', value: skus.length, icon: Package, color: '#10b981', filter: 'all' },
    { label: 'High Margin (50%+)', value: skus.filter(s => s.markup >= 50).length, icon: TrendingUp, color: '#f59e0b', filter: 'high-margin' },
    { label: 'Premium Quality', value: skus.filter(s => s.quality === 'Premium').length, icon: Layers, color: '#8b5cf6', filter: 'premium' },
    { label: 'Price Slabs', value: priceSlabs.length, icon: BarChart3, color: '#ef4444', filter: 'all' }
  ]

  const tabs = [
    { id: 'skus', label: 'SKU Management', icon: Package },
    { id: 'pricing', label: 'Price Slabs', icon: DollarSign }
  ]

  const skuFields = [
    { key: 'srNo', label: 'Sr No', type: 'text' }, { key: 'inventoryCode', label: 'Inventory Code', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' }, { key: 'material', label: 'Material', type: 'text' },
    { key: 'hsnCode', label: 'HSN Code', type: 'text' }, { key: 'product', label: 'Product', type: 'text' },
    { key: 'shape', label: 'Shape', type: 'text' }, { key: 'colour', label: 'Colour', type: 'text' },
    { key: 'specs', label: 'Specs', type: 'text' }, { key: 'quality', label: 'Quality', type: 'select', options: ['Standard', 'Premium'] },
    { key: 'packOff', label: 'Pack Off', type: 'text' }, { key: 'costPrice', label: 'Cost Price', type: 'number' },
    { key: 'markup', label: 'Markup (%)', type: 'number' }, { key: 'gst', label: 'GST (%)', type: 'number' }
  ]

  const slabFields = [
    { key: 'name', label: 'Slab Name', type: 'text' }, { key: 'minQty', label: 'Min Quantity', type: 'number' },
    { key: 'maxQty', label: 'Max Quantity', type: 'number' }, { key: 'discount', label: 'Discount (%)', type: 'number' },
    { key: 'description', label: 'Description', type: 'text' }
  ]

  const viewFields = [
    ['Sr No', selected?.srNo], ['Inventory Code', selected?.inventoryCode], ['Category', selected?.category],
    ['Material', selected?.material], ['HSN Code', selected?.hsnCode], ['Shape', selected?.shape],
    ['Colour', selected?.colour], ['Quality', selected?.quality], ['Cost Price', `₹${selected?.costPrice}`],
    ['Markup', `${selected?.markup.toFixed(2)}%`], ['Sell Price', `₹${selected?.sellPrice.toFixed(2)}`],
    ['Price with GST', `₹${selected?.priceWithGST.toFixed(2)}`], ['GST Amount', `₹${selected?.gstAmount.toFixed(2)}`],
    ['Net Profit', `₹${selected?.netProfit.toFixed(2)}`], ['Specs', selected?.specs], ['Pack Off', selected?.packOff]
  ]

  return (
    <div className={`min-h-screen p-4 transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Inventory Management</h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage SKUs and pricing strategies</p>
      </div>

      {/* Tabs */}
      <div className={`mb-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
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
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
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
          {/* Search & Add */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text" 
                placeholder="Search SKUs, products, or categories..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg transition-colors ${
                  isDark 
                    ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <button 
              onClick={() => {
                setEditData({
                  id: Date.now(), srNo: '', inventoryCode: '', category: '', material: '', hsnCode: '',
                  product: '', shape: '', colour: '', specs: '', quality: '', packOff: '',
                  costPrice: 0, markup: 0, sellPrice: 0, grossProfit: 0, gst: 18,
                  priceWithGST: 0, gstAmount: 0, gstInward: 0, gstPayable: 0, netProfit: 0
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => {
              const IconComponent = stat.icon
              const isActive = activeFilter === stat.filter
              return (
                <div 
                  key={i} 
                  onClick={() => setActiveFilter(isActive ? 'all' : stat.filter)}
                  className={`border rounded-lg p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                  } ${isActive ? 'ring-2 ring-amber-400' : ''}`}
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

          {/* SKU Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((sku) => (
              <div key={sku.id} className={`border rounded-lg shadow-sm p-4 transition-colors ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{sku.product}</h3>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{sku.srNo}</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{sku.category} • {sku.inventoryCode}</p>
                </div>
                
                <div className={`space-y-1 mb-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div>HSN: {sku.hsnCode} • {sku.colour} {sku.shape}</div>
                  <div>Cost: ₹{sku.costPrice} → Sell: ₹{sku.sellPrice.toFixed(0)}</div>
                  <div className="flex justify-between">
                    <span>Markup: {sku.markup.toFixed(1)}%</span>
                    <span className="font-medium text-green-600">Profit: ₹{sku.netProfit.toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelected(sku); setModal('viewSKU') }} 
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Eye className="w-3 h-3" /> View
                  </button>
                  <button 
                    onClick={() => { setEditData({...sku}); setModal('editSKU') }} 
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs text-white rounded hover:opacity-90"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
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
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Price Slabs</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage quantity-based pricing tiers</p>
            </div>
            <button 
              onClick={() => {
                setEditData({ id: Date.now(), name: '', minQty: 1, maxQty: 10, discount: 0, description: '' })
                setModal('editSlab')
              }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
              style={{ backgroundColor: '#c79e73' }}
            >
              <Plus className="w-4 h-4" /> Add Price Slab
            </button>
          </div>

          <div className={`rounded-lg shadow-sm overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  {['Name', 'Quantity Range', 'Discount', 'Description', 'Actions'].map(header => (
                    <th key={header} className={`px-4 py-3 text-left text-xs font-medium uppercase ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {priceSlabs.map((slab) => (
                  <tr key={slab.id}>
                    <td className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{slab.name}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{slab.minQty} - {slab.maxQty}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{slab.discount}%</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{slab.description}</td>
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
          <div className={`rounded-xl max-w-${modal === 'viewSKU' ? '4xl' : modal === 'editSKU' ? '5xl' : 'md'} w-full max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {modal === 'viewSKU' ? selected?.product : 
                 modal === 'editSKU' ? (editData?.id === Date.now() ? 'Add SKU' : 'Edit SKU') : 
                 'Edit Price Slab'}
              </h2>
              <button onClick={() => setModal('')} className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
                <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
            
            {modal === 'viewSKU' && selected && (
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                {viewFields.map(([label, value], i) => (
                  <div key={i} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <strong className={isDark ? 'text-white' : 'text-gray-900'}>{label}:</strong> {value}
                  </div>
                ))}
              </div>
            )}

            {modal === 'editSKU' && editData && (
              <>
                <div className="p-4 grid grid-cols-3 gap-4">
                  {skuFields.map(field => (
                    <div key={field.key}>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={editData[field.key]}
                          onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
                          className={`w-full p-2 border rounded text-sm transition-colors ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 text-white' 
                              : 'border-gray-200 bg-white text-gray-900'
                          }`}
                        >
                          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={editData[field.key]}
                          onChange={(e) => setEditData({...editData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
                          className={`w-full p-2 border rounded text-sm transition-colors ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                              : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className={`p-4 border-t flex gap-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button 
                    onClick={() => handleSave('sku')}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    <Save className="w-4 h-4" /> Save SKU
                  </button>
                  <button 
                    onClick={() => setModal('')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modal === 'editSlab' && editData && (
              <>
                <div className="p-4 space-y-4">
                  {slabFields.map(field => (
                    <div key={field.key}>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{field.label}</label>
                      <input
                        type={field.type}
                        value={editData[field.key]}
                        onChange={(e) => setEditData({...editData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
                        className={`w-full p-2 border rounded text-sm transition-colors ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <div className={`p-4 border-t flex gap-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button 
                    onClick={() => handleSave('slab')}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
                    style={{ backgroundColor: '#c79e73' }}
                  >
                    <Save className="w-4 h-4" /> Save Slab
                  </button>
                  <button 
                    onClick={() => setModal('')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
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