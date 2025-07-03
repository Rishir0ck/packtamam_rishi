import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, Plus, Trash2, Package, X, Image, ArrowRight, ArrowLeft, CheckCircle, IndianRupee, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import AdminService from '../Firebase/services/adminApiService';
import { message } from 'antd';

// Stable Input component outside main component - KEY FIX #1
const Input = React.memo(({ label, value, onChange, type = "text", placeholder = "", readOnly = false, className = "", theme }) => (
  <div className={className}>
    <label className={`block text-sm font-medium ${theme.text} mb-1`}>{label}</label>
    <input
      type={type} 
      value={value || ''} 
      onChange={onChange}
      placeholder={placeholder} 
      readOnly={readOnly}
      className={`w-full px-3 py-2 border rounded-lg ${theme.input} ${readOnly ? 'opacity-60' : ''}`}
      step={type === 'number' ? '0.01' : undefined}
    />
  </div>
));

export default function ProductForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '', category_id: '', subcategory_id: '', material_id: '', hsn_code: '', shape: '', colour: '',
    specs: '', quality: '', features: ''
  });

  const [sizes, setSizes] = useState([{
    id: 1, size: '', inventory_code: '', costPrice: '', quantity: '',
    priceSlabs: [{ id: 1, costPrice: '', markupPrice: '', sellPrice: '', grossProfit: '', gst: '', gstAmount: '', priceWithGst: '', 
      payableGst: '', netProfit: '', packOff: '', minPack: '' }]
  }]);

  const { isDark } = useTheme();
  
  const theme = useMemo(() => isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white',
    muted: 'text-gray-300', border: 'border-gray-700',
    input: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900',
    muted: 'text-gray-600', border: 'border-gray-200',
    input: 'bg-white border-gray-300', hover: 'hover:bg-gray-50'
  }, [isDark]);

  const steps = useMemo(() => [
    { id: 1, title: 'Basic Info', icon: Package, desc: 'Product details and images' },
    { id: 2, title: 'Sizes & Pricing', icon: IndianRupee, desc: 'Individual size pricing' },
    { id: 3, title: 'Bulk Pricing', icon: Layers, desc: 'Price slabs for bulk orders' },
    { id: 4, title: 'Review', icon: CheckCircle, desc: 'Final review and save' }
  ], []);

  const basicFields = useMemo(() => [
    ['Product Name', 'name'], ['HSN Code', 'hsn_code'], ['Shape', 'shape'], 
    ['Color', 'colour'], ['Quality', 'quality']
  ], []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, materialsRes, subcategoriesRes] = await Promise.all([
          AdminService.getCategories(),
          AdminService.getMaterials(),
          AdminService.getSubCategories(),
        ]);
        
        setCategories(categoriesRes?.success ? categoriesRes.data.data || [] : []);
        setSubCategories(subcategoriesRes?.success ? subcategoriesRes.data.data || [] : []);
        setMaterials(materialsRes?.success ? materialsRes.data.data || [] : []);
      } catch (error) {
        console.error('Failed to load data:', error);
        message.error('Failed to load categories and materials');
        setCategories([]);
        setSubCategories([]);
        setMaterials([]);
      }
    };
    loadData();
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // KEY FIX #2: Stable event handlers with proper closure
  const handleSizeChange = useCallback((sizeId, field, value) => {
    setSizes(prev => prev.map(size => size.id === sizeId ? { ...size, [field]: value } : size));
  }, []);

  const calculateSlabPrice = useCallback((sizeId, slabId, field, value) => {
    setSizes(prev => prev.map(size => {
      if (size.id !== sizeId) return size;
      return {
        ...size,
        priceSlabs: size.priceSlabs.map(slab => {
          if (slab.id !== slabId) return slab;
          const updated = { ...slab, [field]: value };
          
          if (field === 'costPrice' || field === 'markupPrice') {
            const cost = parseFloat(field === 'costPrice' ? value : slab.costPrice) || 0;
            const markup = parseFloat(field === 'markupPrice' ? value : slab.markupPrice) || 0;
            updated.sellPrice = ((cost * markup) / 100 + cost).toFixed(2);
            updated.grossProfit = (parseFloat(updated.sellPrice) - cost).toFixed(2);
          }
          
          if (['sellPrice', 'gst', 'costPrice', 'markupPrice'].includes(field)) {
            const sellPrice = parseFloat(updated.sellPrice) || 0;
            const gstRate = parseFloat(field === 'gst' ? value : slab.gst) || 0;
            const gstAmount = (sellPrice * gstRate) / 100;
            const costPrice = parseFloat(updated.costPrice) || 0;
            
            updated.gstAmount = gstAmount.toFixed(2);
            updated.priceWithGst = (sellPrice + gstAmount).toFixed(2);
            updated.payableGst = gstAmount.toFixed(2);
            updated.netProfit = (sellPrice - costPrice).toFixed(2);
          }
          return updated;
        })
      };
    }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        url: e.target.result, 
        name: file.name,
        originFileObj: file 
      }]);
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = useCallback((id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const addSize = useCallback(() => {
    setSizes(prev => [...prev, {
      id: Date.now(), size: '', inventory_code: '', costPrice: '', quantity: '',
      priceSlabs: [{ id: 1, costPrice: '', markupPrice: '', sellPrice: '', grossProfit: '', gst: '', gstAmount: '', 
        priceWithGst: '', payableGst: '', netProfit: '', packOff: '', minPack: '' }]
    }]);
  }, []);

  const removeSize = useCallback((sizeId) => {
    setSizes(prev => prev.filter(size => size.id !== sizeId));
  }, []);

  const addPriceSlab = useCallback((sizeId) => {
    setSizes(prev => prev.map(size => 
      size.id === sizeId && size.priceSlabs.length < 10
        ? { ...size, priceSlabs: [...size.priceSlabs, { id: Date.now(), costPrice: '', markupPrice: '', sellPrice: '', 
          grossProfit: '', gst: '', gstAmount: '', priceWithGst: '', payableGst: '', netProfit: '',
            packOff: '', minPack: '' }] }
        : size
    ));
  }, []);

  const removePriceSlab = useCallback((sizeId, slabId) => {
    setSizes(prev => prev.map(size =>
      size.id === sizeId ? { ...size, priceSlabs: size.priceSlabs.filter(slab => slab.id !== slabId) } : size
    ));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  }, [currentStep]);
  
  const prevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const validateForm = useCallback(() => {
    if (!formData.name?.trim()) {
      message.error('Product name is required');
      return false;
    }
    if (sizes.length === 0 || !sizes[0].size?.trim()) {
      message.error('At least one size is required');
      return false;
    }
    return true;
  }, [formData.name, sizes]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        material_id: formData.material_id,
        hsn_code: formData.hsn_code,
        shape: formData.shape,
        colour: formData.colour,
        specs: formData.specs,  
        features: formData.features,  
        quality: formData.quality,
        sizes: sizes.map(size => ({
          size: size.size,
          inventory_code: size.inventory_code,
          costPrice: parseFloat(size.costPrice) || 0,
          quantity: parseInt(size.quantity) || 0,
          priceSlabs: size.priceSlabs.filter(slab => slab.costPrice && slab.markupPrice).map(slab => ({
            costPrice: parseFloat(slab.costPrice) || 0,
            markupPrice: parseFloat(slab.markupPrice) || 0,
            sellPrice: parseFloat(slab.sellPrice) || 0,
            grossProfit: parseFloat(slab.grossProfit) || 0,
            gst: parseFloat(slab.gst) || 0,
            priceWithGst: parseFloat(slab.priceWithGst) || 0,
            gstAmount: parseFloat(slab.gstAmount) || 0,
            payableGst: parseFloat(slab.payableGst) || 0,
            netProfit: parseFloat(slab.netProfit) || 0,
            packOff: parseInt(slab.packOff) || 0,
            minPack: parseInt(slab.minPack) || 0
          }))
        })),
        images: images
      };

      const response = await AdminService.addProduct(productData);
      
      if (response.success) {
        message.success('Product added successfully!');
        navigate('/inventory-management');
      } else {
        message.error(response.error || 'Failed to add product');
      }
    } catch (error) {
      message.error('An error occurred while saving the product');
      console.error('Product save error:', error);
    } finally {
      setLoading(false);
    }
  }, [validateForm, formData, sizes, images, navigate]);

  // KEY FIX #3: Memoized step components with stable props
  const StepProgress = useMemo(() => (
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
  ), [currentStep, steps, theme, isDark]);

  const BasicInfoStep = useMemo(() => (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className={`rounded-xl p-6 ${theme.card} border ${theme.border}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
          <Image className="w-5 h-5" />Product Images
        </h3>
        <div className={`border-2 border-dashed ${theme.border} rounded-lg p-6 text-center hover:border-amber-400 transition-colors mb-4`}>
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
          {basicFields.map(([label, field]) => (
            <div key={field}>
              <label className={`block text-sm font-medium ${theme.text} mb-1`}>{label}</label>
              <input
                type="text" 
                value={formData[field]} 
                onChange={(e) => handleInputChange(field, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
              />
            </div>
          ))}
          
          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-1`}>Category</label>
            <select 
              value={formData.category_id} 
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {/* <div>
            <label className={`block text-sm font-medium ${theme.text} mb-1`}>Sub Category</label>
            <select 
              value={formData.subcategory_id} 
              onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}
            >
              <option value="">Select Sub Category</option>
              {subcategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div> */}

          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-1`}>Material</label>
            <select 
              value={formData.material_id} 
              onChange={(e) => handleInputChange('material_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
            >
              <option value="">Select Material</option>
              {materials.map((mat) => (
                <option key={mat.id} value={mat.id}>{mat.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-3">
          <label className={`block text-sm font-medium ${theme.text} mb-1`}>Description</label>
          <textarea
            value={formData.specs} 
            onChange={(e) => handleInputChange('specs', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`} 
            rows={2}
          />
        </div>

        <div className="mt-3">
          <label className={`block text-sm font-medium ${theme.text} mb-1`}>Features</label>
          <textarea
            value={formData.features} 
            onChange={(e) => handleInputChange('features', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`} 
            rows={2}
          />
        </div>
      </div>
    </div>
  ), [theme, basicFields, formData, handleInputChange, categories, subcategories, materials, images, handleImageUpload, removeImage]);

  const SizePricingStep = useMemo(() => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-semibold ${theme.text}`}>Product Sizes & Basic Info</h3>
        <button onClick={addSize} className="bg-[#c79e73] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
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
              <Input 
                label="Size/Specs" 
                value={size.size} 
                onChange={(e) => handleSizeChange(size.id, 'size', e.target.value)}
                theme={theme}
              />
              <Input 
                label="Inventory Code" 
                value={size.inventory_code} 
                onChange={(e) => handleSizeChange(size.id, 'inventory_code', e.target.value)}
                theme={theme}
              />
              <Input 
                label="Base Cost Price (₹)" 
                type="number"
                value={size.costPrice} 
                onChange={(e) => handleSizeChange(size.id, 'costPrice', e.target.value)}
                theme={theme}
              />
              <Input 
                label="Quantity" 
                type="number"
                value={size.quantity} 
                onChange={(e) => handleSizeChange(size.id, 'quantity', e.target.value)}
                theme={theme}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [sizes, theme, addSize, removeSize, handleSizeChange]);

  // const BulkPricingStep = useMemo(() => (
  //   <div>
  //     <h3 className={`text-lg font-semibold mb-6 ${theme.text}`}>Bulk Pricing Slabs (Pack-wise)</h3>
  //     <div className="space-y-6">
  //       {sizes.map((size, sizeIndex) => (
  //         <div key={size.id} className={`rounded-xl p-6 ${theme.card} border ${theme.border}`}>
  //           <div className="flex justify-between items-center mb-4">
  //             <h4 className={`font-medium text-lg ${theme.text}`}>{size.size || `Size ${sizeIndex + 1}`} - Bulk Pricing</h4>
  //             <button
  //               onClick={() => addPriceSlab(size.id)}
  //               className="bg-[#c79e73] text-white px-3 py-1 rounded text-sm flex items-center gap-1"
  //             >
  //               <Plus className="w-3 h-3" /> Add Slab
  //             </button>
  //           </div>
  //           <div className={`${theme.card} rounded-lg p-4 overflow-x-auto border ${theme.border}`}>
  //             <div className="space-y-3 min-w-[900px]">
  //               {size.priceSlabs.map((slab, index) => (
  //                 <div key={slab.id} className="flex gap-4 items-start border-b pb-4">
  //                   <div className={`text-sm ${theme.muted} w-6 shrink-0`}>#{index + 1}</div>
  //                   <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
  //                     {[
  //                       {
  //                         title: 'Pack Details', fields: [
  //                           ['Pack Off', 'packOff', 'number'],
  //                           ['Qty of Pack', 'minPack', 'number']
  //                         ]
  //                       },
  //                       {
  //                         title: 'Cost & Markup', fields: [
  //                           ['Cost Price(₹)', 'costPrice', 'number'],
  //                           ['Markup(%)', 'markupPrice', 'number'],
  //                           ['Gross Profit(₹)', 'grossProfit', 'number', true]
  //                         ]
  //                       },
  //                       {
  //                         title: 'Selling Price', fields: [
  //                           ['Sell Price(₹)', 'sellPrice', 'number', true],
  //                           ['GST(%)', 'gst', 'number'],
  //                           ['GST Amount(₹)', 'gstAmount', 'number', true]
  //                         ]
  //                       },
  //                       {
  //                         title: 'Final Price', fields: [
  //                           ['With GST(₹)', 'priceWithGst', 'number', true]
  //                         ]
  //                       }
  //                     ].map((group) => (
  //                       <div key={group.title} className="flex flex-col gap-1">
  //                         <div className="text-xs font-semibold text-center">{group.title}</div>
  //                         {group.fields.map(([label, field, type = 'text', readOnly = false]) => (
  //                           <input
  //                             key={field}
  //                             type={type}
  //                             value={slab[field] || ''}
  //                             onChange={(e) => calculateSlabPrice(size.id, slab.id, field, e.target.value)}
  //                             className={`w-32 px-1 py-1 border rounded text-sm ${readOnly ? 'opacity-60 cursor-not-allowed' : ''} ${theme.input}`}
  //                             placeholder={label}
  //                             readOnly={readOnly}
  //                           />
  //                         ))}
  //                       </div>
  //                     ))}
  //                   </div>
  //                   <div className="flex flex-col justify-center">
  //                     {size.priceSlabs.length > 1 && (
  //                       <button
  //                         onClick={() => removePriceSlab(size.id, slab.id)}
  //                         className="text-red-500 hover:text-red-700"
  //                       >
  //                         <Trash2 className="w-4 h-4" />
  //                       </button>
  //                     )}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // ), [sizes, theme, addPriceSlab, removePriceSlab, calculateSlabPrice]);

  const BulkPricingStep = useMemo(() => (
    <div>
      <h3 className={`text-lg font-semibold mb-6 ${theme.text}`}>Bulk Pricing Slabs (Pack-wise)</h3>
      <div className="space-y-6">
        {sizes.map((size, sizeIndex) => (
          <div key={size.id} className={`rounded-xl p-6 ${theme.card} border ${theme.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-medium text-lg ${theme.text}`}>{size.size || `Size ${sizeIndex + 1}`} - Bulk Pricing</h4>
              <button
                onClick={() => addPriceSlab(size.id)}
                className="bg-[#c79e73] text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Slab
              </button>
            </div>
            <div className={`${theme.card} rounded-lg p-4 overflow-x-auto border ${theme.border}`}>
              <div className="space-y-3 min-w-[900px]">
                {size.priceSlabs.map((slab, index) => (
                  <div key={slab.id} className="flex gap-4 items-start border-b pb-4">
                    <div className={`text-sm ${theme.muted} w-6 shrink-0`}>#{index + 1}</div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      {[
                        {
                          title: 'Pack Details', fields: [
                            ['Pack Off', 'packOff', 'number'],
                            ['Qunatity of Pack', 'minPack', 'number']
                          ]
                        },
                        {
                          title: 'Cost & Markup', fields: [
                            ['Cost Price (₹)', 'costPrice', 'number'],
                            ['Markup (%)', 'markupPrice', 'number'],
                            ['Gross Profit (₹)', 'grossProfit', 'number', true]
                          ]
                        },
                        {
                          title: 'Selling Price', fields: [
                            ['Sell Price (₹)', 'sellPrice', 'number', true],
                            ['GST (%)', 'gst', 'number'],
                            ['GST Amount (₹)', 'gstAmount', 'number', true]
                          ]
                        },
                        {
                          title: 'Final Price', fields: [
                            ['With GST (₹)', 'priceWithGst', 'number', true]
                          ]
                        }
                      ].map((group) => (
                        <div key={group.title} className="flex flex-col gap-1">
                          <div className={`text-x font-semibold text-center ${theme.text}`}>{group.title}</div>
                          {group.fields.map(([label, field, type = 'text', readOnly = false]) => (
                            <Input
                              key={field}
                              label={label}
                              type={type}
                              value={slab[field] || ''}
                              onChange={(e) => calculateSlabPrice(size.id, slab.id, field, e.target.value)}
                              theme={theme}
                              readOnly={readOnly}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col justify-center">
                      {size.priceSlabs.length > 1 && (
                        <button
                          onClick={() => removePriceSlab(size.id, slab.id)}
                          className="text-red-500 hover:text-red-700"
                        >
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
  ), [sizes, theme, addPriceSlab, removePriceSlab, calculateSlabPrice]);

  const ReviewStep = useMemo(() => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold mb-6 ${theme.text}`}>Review Product Details</h3>
      
      <div className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}>
        <div className={`px-6 py-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b ${theme.border}`}>
          <h4 className={`font-semibold ${theme.text}`}>Basic Information</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-2 text-left font-medium ${theme.text}`}>Field</th>
                <th className={`px-4 py-2 text-left font-medium ${theme.text}`}>Value</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {[...basicFields, ['Category', 'category_id'], ['Material', 'material_id'], ['Specification', 'specs']].map(([field, key]) => (
                <tr key={field} className={theme.hover}>
                  <td className={`px-4 py-2 font-medium ${theme.text}`}>{field}</td>
                  <td className={`px-4 py-2 ${theme.text}`}>
                    {key === 'category_id' ? categories.find(c => c.id == formData[key])?.name || '-' :
                     key === 'material_id' ? materials.find(m => m.id == formData[key])?.name || '-' :
                     formData[key] || '-'}
                  </td>
                </tr>
              ))}
                <tr className={theme.hover}>
                <td className={`px-4 py-2 font-medium ${theme.text}`}>Images</td>
                <td className={`px-4 py-2 ${theme.text}`}>
                  <div className="flex gap-2">
                    {images.slice(0, 3).map(img => (
                      <img key={img.id} src={img.url} alt={img.name} className="w-12 h-12 object-cover rounded" />
                    ))}
                    {images.length > 3 && (
                      <div className={`w-12 h-12 rounded flex items-center justify-center text-xs ${isDark ? 'bg-gray-600' : 'bg-gray-200'} ${theme.text}`}>
                        +{images.length - 3}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}>
        <div className={`px-6 py-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b ${theme.border}`}>
          <h4 className={`font-semibold ${theme.text}`}>Sizes & Pricing</h4>
        </div>
        <div className="p-6 space-y-4">
          {sizes.map((size, index) => (
            <div key={size.id} className={`p-4 border rounded-lg ${theme.border}`}>
              <div className="flex justify-between items-center mb-2">
                <h5 className={`font-medium ${theme.text}`}>{size.size || `Size ${index + 1}`}</h5>
                <span className={`text-sm ${theme.muted}`}>Quantity: {size.quantity || 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${theme.muted}`}>Inventory Code:</span>
                  <span className={`ml-2 ${theme.text}`}>{size.inventory_code || '-'}</span>
                </div>
                <div>
                  <span className={`${theme.muted}`}>Base Cost Price:</span>
                  <span className={`ml-2 ${theme.text}`}>₹{size.costPrice || 0}</span>
                </div>
              </div>
              {size.priceSlabs.length > 0 && (
                <div className="mt-3">
                  <p className={`text-sm font-medium ${theme.text} mb-2`}>Price Slabs:</p>
                  <div className="space-y-2">
                    {size.priceSlabs.map((slab, slabIndex) => (
                      <div key={slab.id} className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-xs`}>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className={`${theme.muted}`}>Quantity of Pack:</span>
                            <span className={`ml-1 ${theme.text}`}>{slab.minPack || 0}- Pack Off:{slab.packOff || 0}</span>
                          </div>
                          <div>
                            <span className={`${theme.muted}`}>Selling Price:</span>
                            <span className={`ml-1 ${theme.text}`}>₹{slab.sellPrice || 0}</span>
                          </div>
                          <div>
                            <span className={`${theme.muted}`}>Final Price:</span>
                            <span className={`ml-1 ${theme.text}`}>₹{slab.priceWithGst || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  ), [theme, basicFields, categories, materials, formData, images, sizes, isDark]);

  // Main render function
  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className={`${theme.card} shadow-sm`}>
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/inventory-management')}
            className={`px-4 py-2 rounded-lg transition-colors ${theme.border} ${theme.hover} ${theme.text}`}
          >
            Cancel
          </button>
        </div>
        {StepProgress}
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {currentStep === 1 && BasicInfoStep}
            {currentStep === 2 && SizePricingStep}
            {currentStep === 3 && BulkPricingStep}
            {currentStep === 4 && ReviewStep}
          </div>
        </div>

        <div className={`px-6 py-4 border-t ${theme.border} flex justify-between items-center`}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : `${theme.text} hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''}`
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="bg-[#c79e73] hover:bg-[#b8915f] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Product'}
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}