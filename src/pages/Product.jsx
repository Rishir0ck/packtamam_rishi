import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, Package, X, Image, DollarSign, Layers, ArrowRight, ArrowLeft, CheckCircle, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import adminService from '../Firebase/services/adminApiService'; // Import your admin service

export default function ProductForm({ editProduct = null }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [images, setImages] = useState(editProduct?.images || []);
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    category_id: editProduct?.category_id || '',
    material_id: editProduct?.material_id || '',
    hsn_code: editProduct?.hsn_code || '',
    shape: editProduct?.shape || '',
    colour: editProduct?.colour || '',
    specs: editProduct?.specs || '',
    quality: editProduct?.quality || '',
    inventoryCode: editProduct?.inventoryCode || '',
    inStock: editProduct?.inStock || 'Yes'
  });
  const [sizes, setSizes] = useState(editProduct?.sizes || [{
    id: 1, size: '', costPrice: '', markupPrice: '', sellPrice: '', grossProfit: '',
    gst: '', gstAmount: '', priceWithGst: '', payableGst: '', netProfit: '', packOff: '',
    priceSlabs: [{ id: 1, quantity: '', price: '', gst: '', finalPrice: '' }]
  }]);

  const { isDark } = useTheme();
  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white', muted: 'text-gray-300', 
    border: 'border-gray-700', input: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900', muted: 'text-gray-600', 
    border: 'border-gray-200', input: 'bg-white border-gray-300', hover: 'hover:bg-gray-50'
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: Package, desc: 'Product details and images' },
    { id: 2, title: 'Sizes & Pricing', icon: IndianRupee, desc: 'Individual size pricing' },
    { id: 3, title: 'Bulk Pricing', icon: Layers, desc: 'Price slabs for bulk orders' },
    { id: 4, title: 'Review', icon: CheckCircle, desc: 'Final review and save' }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, materialsRes] = await Promise.all([
        adminService.getCategories(),
        adminService.getMaterials()
      ]);
      
      if (categoriesRes.success) setCategories(categoriesRes.data || []);
      if (materialsRes.success) setMaterials(materialsRes.data || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
    setLoading(false);
  };

  const Input = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false, className = "", options = null }) => (
    <div className={className}>
      <label className={`block text-sm font-medium ${theme.text} mb-1`}>{label}</label>
      {options && Array.isArray(options) ? (
        <select value={value || ''} onChange={onChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}>
          <option value="">Select {label}</option>
          {options.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      ) : (
        <input
          type={type} value={value || ''} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input} ${readOnly ? 'opacity-60' : ''}`}
          step={type === 'number' ? '0.01' : undefined}
        />
      )}
    </div>
  );

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const calculateSizePrice = (sizeId, field, value) => {
    setSizes(prev => prev.map(size => {
      if (size.id !== sizeId) return size;
      const updated = { ...size, [field]: value };
      
      // Auto-calculate pricing fields
      if (field === 'costPrice' || field === 'markupPrice') {
        const cost = parseFloat(field === 'costPrice' ? value : size.costPrice) || 0;
        const markup = parseFloat(field === 'markupPrice' ? value : size.markupPrice) || 0;
        updated.sellPrice = (cost + markup).toFixed(2);
        updated.grossProfit = markup.toFixed(2);
      }
      
      if (['sellPrice', 'gst', 'costPrice', 'markupPrice'].includes(field)) {
        const sellPrice = parseFloat(updated.sellPrice) || 0;
        const gstRate = parseFloat(field === 'gst' ? value : size.gst) || 0;
        const gstAmount = (sellPrice * gstRate) / 100;
        const costPrice = parseFloat(updated.costPrice) || 0;
        
        updated.gstAmount = gstAmount.toFixed(2);
        updated.priceWithGst = (sellPrice + gstAmount).toFixed(2);
        updated.payableGst = gstAmount.toFixed(2);
        updated.netProfit = (sellPrice - costPrice).toFixed(2);
      }
      return updated;
    }));
  };

  const calculateSlabPrice = (sizeId, slabId, field, value) => {
    setSizes(prev => prev.map(size => {
      if (size.id !== sizeId) return size;
      return {
        ...size,
        priceSlabs: size.priceSlabs.map(slab => {
          if (slab.id !== slabId) return slab;
          const updated = { ...slab, [field]: value };
          if (field === 'price' || field === 'gst') {
            const price = parseFloat(field === 'price' ? value : slab.price) || 0;
            const gstRate = parseFloat(field === 'gst' ? value : slab.gst) || 0;
            updated.finalPrice = (price + (price * gstRate) / 100).toFixed(2);
          }
          return updated;
        })
      };
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        url: e.target.result, 
        name: file.name,
        originFileObj: file // Store original file for API
      }]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => setImages(prev => prev.filter(img => img.id !== id));
  
  const addSize = () => setSizes(prev => [...prev, {
    id: Date.now(), size: '', costPrice: '', markupPrice: '', sellPrice: '', grossProfit: '',
    gst: '', gstAmount: '', priceWithGst: '', payableGst: '', netProfit: '', packOff: '',
    priceSlabs: [{ id: 1, quantity: '', price: '', gst: '', finalPrice: '' }]
  }]);

  const removeSize = (sizeId) => setSizes(prev => prev.filter(size => size.id !== sizeId));
  
  const addPriceSlab = (sizeId) => setSizes(prev => prev.map(size => 
    size.id === sizeId && size.priceSlabs.length < 10
      ? { ...size, priceSlabs: [...size.priceSlabs, { id: Date.now(), quantity: '', price: '', gst: '', finalPrice: '' }] }
      : size
  ));

  const removePriceSlab = (sizeId, slabId) => setSizes(prev => prev.map(size =>
    size.id === sizeId ? { ...size, priceSlabs: size.priceSlabs.filter(slab => slab.id !== slabId) } : size
  ));

  const nextStep = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare product data for API
      const productData = {
        ...formData,
        images: images.filter(img => img.originFileObj), // Only new images for API
        sizes // Include sizes data
      };

      let result;
      if (editProduct) {
        result = await adminService.updateProduct(editProduct.id, productData);
      } else {
        result = await adminService.addProduct(productData);
      }

      if (result.success) {
        // Save price slabs for each size
        for (const size of sizes) {
          for (const slab of size.priceSlabs) {
            if (slab.quantity && slab.price) {
              const slabData = {
                product_id: result.data?.id || editProduct?.id,
                size_id: size.id,
                min_qty: parseInt(slab.quantity),
                max_qty: parseInt(slab.quantity) + 99, // Adjust as needed
                price_per_unit: parseFloat(slab.price)
              };
              
              if (slab.id && editProduct) {
                await adminService.updatePriceSlab(slab.id, slabData.min_qty, slabData.max_qty, slabData.price_per_unit);
              } else {
                await adminService.addPriceSlab(slabData.min_qty, slabData.max_qty, slabData.price_per_unit);
              }
            }
          }
        }
        
        navigate('/inventory-management');
      } else {
        alert('Failed to save product: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    }
    setLoading(false);
  };

  const StepProgress = () => (
    <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-6 py-4 border-b ${theme.border}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isActive ? 'bg-blue-600 border-blue-600 text-white' :
                isCompleted ? 'bg-green-500 border-green-500 text-white' :
                'border-gray-300 text-gray-400' + (isDark ? ' bg-gray-600' : ' bg-white')
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="ml-2 hidden sm:block">
                <p className={`font-medium text-sm ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : theme.muted}`}>
                  {step.title}
                </p>
                <p className={`text-xs ${theme.muted}`}>{step.desc}</p>
              </div>
              {index < steps.length - 1 && <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  const BasicInfoStep = () => (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className={`rounded-xl p-6 ${theme.card} border ${theme.border}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
          <Image className="w-5 h-5" />Product Images
        </h3>
        <div className={`border-2 border-dashed ${theme.border} rounded-lg p-6 text-center hover:border-blue-400 transition-colors mb-4`}>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className={`w-10 h-10 ${theme.muted} mx-auto mb-2`} />
            <p className={`${theme.text} font-medium`}>Upload Images</p>
            <p className={`${theme.muted} text-sm`}>Multiple files supported</p>
          </label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {images.map(img => (
            <div key={img.id} className="relative group">
              <img src={img.url} alt={img.name} className="w-full h-16 object-cover rounded-lg" />
              <button onClick={() => removeImage(img.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className={`rounded-xl p-6 ${theme.card} border ${theme.border}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Product Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Product Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
          <Input label="Category" value={formData.category_id} onChange={(e) => handleInputChange('category_id', e.target.value)} options={categories} />
          <Input label="Material" value={formData.material_id} onChange={(e) => handleInputChange('material_id', e.target.value)} options={materials} />
          <Input label="HSN Code" value={formData.hsn_code} onChange={(e) => handleInputChange('hsn_code', e.target.value)} />
          <Input label="Shape" value={formData.shape} onChange={(e) => handleInputChange('shape', e.target.value)} />
          <Input label="Color" value={formData.colour} onChange={(e) => handleInputChange('colour', e.target.value)} />
          <Input label="Quality" value={formData.quality} onChange={(e) => handleInputChange('quality', e.target.value)} />
          <Input label="Inventory Code" value={formData.inventoryCode} onChange={(e) => handleInputChange('inventoryCode', e.target.value)} />
        </div>
        <div className="mt-3">
          <Input label="Specifications" value={formData.specs} onChange={(e) => handleInputChange('specs', e.target.value)} />
        </div>
        <div className="mt-3">
          <Input label="In Stock" value={formData.inStock} onChange={(e) => handleInputChange('inStock', e.target.value)} 
            options={[{id: 'Yes', name: 'Yes'}, {id: 'No', name: 'No'}]} />
        </div>
      </div>
    </div>
  );

  const SizePricingStep = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-semibold ${theme.text}`}>Product Sizes & Individual Pricing</h3>
        <button onClick={addSize} className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2" style={{ backgroundColor: '#c79e73' }}>
          <Plus className="w-4 h-4" />Add Size
        </button>
      </div>
      <div className="space-y-6">
        {sizes.map((size, index) => (
          <div key={size.id} className={`rounded-xl p-6 ${theme.card} border ${theme.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-medium text-lg ${theme.text}`}>Size #{index + 1}</h4>
              {sizes.length > 1 && (
                <button onClick={() => removeSize(size.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                  <Trash2 className="w-4 h-4" />Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Size Details', fields: [['Size', 'size'], ['Pack Off', 'packOff']] },
                { title: 'Cost & Markup', fields: [['Cost Price (₹)', 'costPrice', 'number'], ['Markup Price (₹)', 'markupPrice', 'number'], ['Gross Profit (₹)', 'grossProfit', 'number', true]] },
                { title: 'Selling Price', fields: [['Sell Price (₹)', 'sellPrice', 'number', true], ['GST (%)', 'gst', 'number'], ['GST Amount (₹)', 'gstAmount', 'number', true]] },
                { title: 'Final Price', fields: [['Price with GST (₹)', 'priceWithGst', 'number', true], ['Payable GST (₹)', 'payableGst', 'number', true], ['Net Profit (₹)', 'netProfit', 'number', true]] }
              ].map(section => (
                <div key={section.title} className="space-y-3">
                  <h5 className={`font-medium text-center py-2 rounded-lg text-sm ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-blue-100 text-blue-800'}`}>{section.title}</h5>
                  {section.fields.map(([label, field, type = 'text', readOnly = false]) => (
                    <Input key={field} label={label} type={type} value={size[field]} readOnly={readOnly}
                      onChange={(e) => calculateSizePrice(size.id, field, e.target.value)} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BulkPricingStep = () => (
    <div>
      <h3 className={`text-lg font-semibold mb-6 ${theme.text}`}>Bulk Pricing Slabs (Pack-wise)</h3>
      <div className="space-y-6">
        {sizes.map((size, sizeIndex) => (
          <div key={size.id} className={`rounded-xl p-6 ${theme.card} border ${theme.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-medium text-lg ${theme.text}`}>{size.size || `Size ${sizeIndex + 1}`} - Bulk Pricing</h4>
              <button onClick={() => addPriceSlab(size.id)}
                className="text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1" style={{ backgroundColor: '#c79e73' }}>
                <Plus className="w-3 h-3" />Add Slab
              </button>
            </div>
            <div className={`${theme.card} rounded-lg p-4 overflow-x-auto border ${theme.border}`}>
              <div className={`grid grid-cols-12 gap-4 mb-3 text-sm font-medium ${theme.text} min-w-[700px]`}>
                {['#', 'Min Quantity', 'Price/Pack (₹)', 'GST (%)', 'Final Price (₹)', 'Action'].map((header, i) => (
                  <div key={header} className={`col-span-${[1, 2, 2, 2, 2, 1][i]}`}>{header}</div>
                ))}
              </div>
              <div className="space-y-3 min-w-[700px]">
                {size.priceSlabs.map((slab, index) => (
                  <div key={slab.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className={`col-span-1 text-sm ${theme.muted}`}>#{index + 1}</div>
                    {[
                      ['quantity', 2, 'Min packs'],
                      ['price', 2, 'Price'],
                      ['gst', 2, 'GST%'],
                    ].map(([field, span, placeholder]) => (
                      <div key={field} className={`col-span-${span}`}>
                        <input type="number" value={slab[field]} onChange={(e) => calculateSlabPrice(size.id, slab.id, field, e.target.value)}
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`} 
                          placeholder={placeholder} step={field === 'price' || field === 'gst' ? '0.01' : undefined} />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <input type="number" value={slab.finalPrice} className={`w-full p-2 border rounded opacity-60 ${theme.input}`} readOnly />
                    </div>
                    <div className="col-span-1 text-center">
                      {size.priceSlabs.length > 1 && (
                        <button onClick={() => removePriceSlab(size.id, slab.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold mb-6 ${theme.text}`}>Review Product Details</h3>
      
      {/* Basic Info Table */}
      <div className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}>
        <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className={`font-semibold ${theme.text}`}>Basic Information</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className={`divide-y ${theme.border}`}>
              {[
                ['Product Name', formData.name],
                ['Category', categories.find(c => c.id == formData.category_id)?.name || 'Not selected'],
                ['Material', materials.find(m => m.id == formData.material_id)?.name || 'Not selected'],
                ['HSN Code', formData.hsn_code],
                ['Shape', formData.shape],
                ['Color', formData.colour],
                ['Quality', formData.quality],
                ['Specifications', formData.specs],
                ['In Stock', formData.inStock],
                ['Images', `${images.length} uploaded`]
              ].map(([field, value]) => (
                <tr key={field} className={theme.hover}>
                  <td className={`px-4 py-2 font-medium ${theme.text}`}>{field}</td>
                  <td className={`px-4 py-2 ${theme.text}`}>{value || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}>
        <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className={`font-semibold ${theme.text}`}>Sizes & Pricing Summary</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>{['Size', 'Pack Off', 'Cost (₹)', 'Markup (₹)', 'Sell (₹)', 'GST (%)', 'Final (₹)', 'Profit (₹)', 'Slabs'].map(h => 
                <th key={h} className={`px-3 py-2 text-left font-medium ${theme.text}`}>{h}</th>
              )}</tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {sizes.map((size, i) => (
                <tr key={size.id} className={theme.hover}>
                  <td className={`px-3 py-2 font-medium ${theme.text}`}>{size.size || `Size ${i + 1}`}</td>
                  <td className={`px-3 py-2 ${theme.text}`}>{size.packOff || '-'}</td>
                  <td className={`px-3 py-2 ${theme.text}`}>₹{size.costPrice || '0.00'}</td>
                  <td className={`px-3 py-2 ${theme.text}`}>₹{size.markupPrice || '0.00'}</td>
                  <td className={`px-3 py-2 ${theme.text}`}>₹{size.sellPrice || '0.00'}</td>
                  <td className={`px-3 py-2 ${theme.text}`}>{size.gst || '0'}%</td>
                  <td className={`px-3 py-2 font-bold text-green-600`}>₹{size.priceWithGst || '0.00'}</td>
                  <td className={`px-3 py-2 font-medium text-blue-600`}>₹{size.netProfit || '0.00'}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {size.priceSlabs.length}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={theme.text}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 min-h-screen ${theme.bg}`}>
      <div className={`max-w-7xl mx-auto ${theme.card} rounded-2xl shadow-xl overflow-hidden border ${theme.border}`}>
        {/* Header */}
        <div className={`${theme.card} rounded-lg shadow-sm p-6 mb-6 border-b ${theme.border}`}>
          <h1 className={`text-2xl font-bold ${theme.text} flex items-center gap-3`}>
            <Package className="w-7 h-7" />
            {editProduct ? 'Edit Product' : 'Product Management System'}
          </h1>
          <p className={`${theme.muted} mt-1`}>Professional multi-step product creation</p>
        </div>

        <StepProgress />

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && <BasicInfoStep />}
          {currentStep === 2 && <SizePricingStep />}
          {currentStep === 3 && <BulkPricingStep />}
          {currentStep === 4 && <ReviewStep />}
        </div>

        {/* Navigation */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-6 py-4 flex justify-between border-t ${theme.border}`}>
          <button onClick={prevStep} disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
              currentStep === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}>
            <ArrowLeft className="w-4 h-4" />Previous
          </button>
          {currentStep < 4 ? (
            <button onClick={nextStep}
              className=" text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2" style={{ backgroundColor: '#c79e73' }}>
              Next<ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="text-white px-8 py-2 rounded-lg transition-all flex items-center gap-2" style={{ backgroundColor: '#c79e73' }}>
              Save Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}