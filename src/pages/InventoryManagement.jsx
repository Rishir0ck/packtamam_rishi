// InventoryManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { AlertCircle, X, Package, TrendingUp, Layers } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import adminService from '../Firebase/services/adminApiService'
import ProductsTab from './ProductsTab'
import Discount from './Discount'
import CategoriesTab from './CategoriesTab'
import MaterialsTab from './MaterialsTab'
import SubCategoryTab from './SubCategoryTab'

export default function InventoryManagement() {
  const { isDark } = useTheme()
  const [data, setData] = useState({ products: [], categories: [], materials: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('products')
  const [isInitialized, setIsInitialized] = useState(false)

  const theme = useMemo(() => ({
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    muted: isDark ? 'text-gray-400' : 'text-gray-600',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
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
      const [products, categories, materials, subCategories] = await Promise.allSettled([
        adminService.getProducts(),
        adminService.getCategories(),
        adminService.getMaterials(),
        adminService.getSubCategories()
      ])
      setData({
        products: extractData(products.value),
        categories: extractData(categories.value),
        materials: extractData(materials.value),
        subCategories: extractData(subCategories.value)
      })
      setIsInitialized(true)
    } catch (err) {
      setError(`Failed to load data: ${err.message}`)
    }
    setLoading(false)
  }, [loading, extractData])

  useEffect(() => {
    if (!isInitialized) loadData()
  }, [isInitialized, loadData])

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

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'discount', label: 'Discount', icon: TrendingUp },
    { id: 'subCategories', label: 'Sub Categories', icon: Package },
    { id: 'categories', label: 'Categories', icon: TrendingUp },
    { id: 'materials', label: 'Materials', icon: Layers }
  ]

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
        <p className={`text-lg ${theme.muted}`}>Manage products, categories, materials & discounts</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className={`mb-6 border-b ${theme.border}`}>
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 border-b-2 font-medium flex items-center gap-2 ${
                  activeTab === tab.id ? 'border-amber-500 text-amber-600' : `border-transparent ${theme.muted}`
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'products' && (
        <ProductsTab data={data.products} loading={loading} apiCall={apiCall} theme={theme} />
      )}
      {activeTab === 'categories' && (
        <CategoriesTab data={data.categories} loading={loading} apiCall={apiCall} theme={theme} />
      )}
      {activeTab === 'materials' && (
        <MaterialsTab data={data.materials} loading={loading} apiCall={apiCall} theme={theme} />
      )}
      {activeTab === 'subCategories' && (
        <SubCategoryTab data={data.subCategories} loading={loading} apiCall={apiCall} theme={theme} />
      )}
      {activeTab === 'discount' && (
        <Discount data={data.discount} loading={loading} apiCall={apiCall} theme={theme} />
      )}
    </div>
  )
}