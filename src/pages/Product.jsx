import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, Package, X, Image, ArrowRight, ArrowLeft, CheckCircle, IndianRupee, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import AdminService from '../Firebase/services/adminApiService';
import { message, Select } from 'antd';

export default function ProductForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '', category_id: '', material_id: '', hsn_code: '', shape: '', colour: '',
    specs: '', quality: '', inventory_code: '', in_stock: 'Yes'
  });
  const [sizes, setSizes] = useState([{
    id: 1, size: '', costPrice: '', markupPrice: '', sellPrice: '', grossProfit: '',
    gst: '', gstAmount: '', priceWithGst: '', payableGst: '', netProfit: '', packOff: '',
    priceSlabs: [{ id: 1, quantity: '', price: '', gst: '', finalPrice: '' }]
  }]);

  const { isDark } = useTheme();
  const theme = isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white',
    muted: 'text-gray-300', border: 'border-gray-700',
    input: 'bg-gray-700 border-gray-600 text-white', hover: 'hover:bg-gray-700'
  } : {
    bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900',
    muted: 'text-gray-600', border: 'border-gray-200',
    input: 'bg-white border-gray-300', hover: 'hover:bg-gray-50'
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: Package, desc: 'Product details and images' },
    { id: 2, title: 'Sizes & Pricing', icon: IndianRupee, desc: 'Individual size pricing' },
    { id: 3, title: 'Bulk Pricing', icon: Layers, desc: 'Price slabs for bulk orders' },
    { id: 4, title: 'Review', icon: CheckCircle, desc: 'Final review and save' }
  ];

  const basicFields = [
    ['Product Name', 'name'], ['HSN Code', 'hsn_code'], ['Shape', 'shape'], 
    ['Color', 'colour'], ['Quality', 'quality'], ['Inventory Code', 'inventory_code']
  ];

    useEffect(() => {
      const loadData = async () => {
        try {
          const [categoriesRes, materialsRes] = await Promise.all([
            AdminService.getCategories(),
            AdminService.getMaterials()
          ]);
          
          // Extract the actual array from the nested data structure
          const categoriesData = categoriesRes?.success ? categoriesRes.data.data || [] : [];
          const materialsData = materialsRes?.success ? materialsRes.data.data || [] : [];

          console.log('Categories loaded:', categoriesData);
          console.log('Materials loaded:', materialsData);
          
          setCategories(categoriesData);
          setMaterials(materialsData);
        } catch (error) {
          console.error('Failed to load data:', error);
          message.error('Failed to load categories and materials');
          setCategories([]);
          setMaterials([]);
        }
      };
      loadData();
    }, []);

  const Input = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false, className = "" }) => (
    <div className={className}>
      <label className={`block text-sm font-medium ${theme.text} mb-1`}>{label}</label>
      <input
        type={type} value={value || ''} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input} ${readOnly ? 'opacity-60' : ''}`}
        step={type === 'number' ? '0.01' : undefined}
      />
    </div>
  );

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const calculateSizePrice = (sizeId, field, value) => {
    setSizes(prev => prev.map(size => {
      if (size.id !== sizeId) return size;
      const updated = { ...size, [field]: value };
      
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
        originFileObj: file 
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
  
  const validateForm = () => {
    if (!formData.name?.trim()) {
      message.error('Product name is required');
      return false;
    }
    // if (!formData.category) {
    //   message.error('Category is required');
    //   return false;
    // }
    if (sizes.length === 0 || !sizes[0].size?.trim()) {
      message.error('At least one size is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        category_id: formData.category_id,
        material_id: formData.material_id,
        hsn_code: formData.hsn_code,
        shape: formData.shape,
        colour: formData.colour,
        specs: formData.specs,
        quality: formData.quality,
        inventory_code: formData.inventory_code,
        in_stock: formData.in_stock,
        size: sizes.map(size => ({
          size: size.size,
          costPrice: parseFloat(size.costPrice) || 0,
          markupPrice: parseFloat(size.markupPrice) || 0,
          sellPrice: parseFloat(size.sellPrice) || 0,
          gst: parseFloat(size.gst) || 0,
          packOff: size.packOff,
          priceSlabs: size.priceSlabs.filter(slab => slab.quantity && slab.price).map(slab => ({
            quantity: parseInt(slab.quantity),
            price: parseFloat(slab.price),
            gst: parseFloat(slab.gst) || 0,
            finalPrice: parseFloat(slab.finalPrice) || 0
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
          {basicFields.map(([label, field]) => (
            <div key={field}>
              <label className={`block text-sm font-medium ${theme.text} mb-1`}>{label}</label>
              <input
                type="text" value={formData[field]} onChange={(e) => handleInputChange(field, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}
              />
            </div>
          ))}
          
          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-1`}>Category</label>
            <select 
              value={formData.category_id} 
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}
            >
              <option value="">Select Category</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {(!categories || categories.length === 0) && (
              <p className="text-xs text-red-500 mt-1">No categories available</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-1`}>Material</label>
            <select 
              value={formData.material_id} 
              onChange={(e) => handleInputChange('material_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}
            >
              <option value="">Select Material</option>
              {Array.isArray(materials) && materials.map((mat) => (
                <option key={mat.id} value={mat.id}>{mat.name}</option>
              ))}
            </select>
            {(!materials || materials.length === 0) && (
              <p className="text-xs text-red-500 mt-1">No materials available</p>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <label className={`block text-sm font-medium ${theme.text} mb-1`}>Description</label>
          <textarea
            value={formData.specs} onChange={(e) => handleInputChange('specs', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`} rows={2}
          />
        </div>
        
        <div className="mt-3">
          <label className={`block text-sm font-medium ${theme.text} mb-1`}>In Stock</label>
          <select value={formData.in_stock} onChange={(e) => handleInputChange('in_stock', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.input}`}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>
    </div>
  );

  const SizePricingStep = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-semibold ${theme.text}`}>Product Sizes & Individual Pricing</h3>
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
              {[
                { title: 'Size Details', color: 'blue', fields: [['Size', 'size'], ['Pack Off', 'packOff']] },
                { title: 'Cost & Markup', color: 'orange', fields: [['Cost Price (₹)', 'costPrice', 'number'], ['Markup Price (₹)', 'markupPrice', 'number'], ['Gross Profit (₹)', 'grossProfit', 'number', true]] },
                { title: 'Selling Price', color: 'green', fields: [['Sell Price (₹)', 'sellPrice', 'number', true], ['GST (%)', 'gst', 'number'], ['GST Amount (₹)', 'gstAmount', 'number', true]] },
                { title: 'Final Price', color: 'purple', fields: [['Price with GST (₹)', 'priceWithGst', 'number', true], ['Payable GST (₹)', 'payableGst', 'number', true], ['Net Profit (₹)', 'netProfit', 'number', true]] }
              ].map(section => (
                <div key={section.title} className="space-y-3">
                  <h5 className={`font-medium text-center py-2 rounded-lg text-sm ${isDark ? 'bg-gray-600 text-gray-200' : `bg-${section.color}-100 text-${section.color}-800`}`}>{section.title}</h5>
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
                className="bg-[#c79e73] text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1">
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
      
      <div className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}>
        <div className={`px-6 py-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b ${theme.border}`}>
          <h4 className={`font-semibold ${theme.text}`}>Basic Information</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr><th className={`px-4 py-2 text-left font-medium ${theme.text}`}>Field</th><th className={`px-4 py-2 text-left font-medium ${theme.text}`}>Value</th></tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {[...basicFields, ['Category', 'category_id'], ['Material', 'material_id'], ['In Stock', 'in_stock'], ['Specification', 'specs']].map(([field, key]) => (
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
                <td className={`px-4 py-2 ${theme.text}`}>{images.length} uploaded</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}>
        <div className={`px-6 py-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b ${theme.border}`}>
          <h4 className={`font-semibold ${theme.text}`}>Sizes & Pricing Summary</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>{['Size', 'Pack Off', 'Cost (₹)', 'Markup (₹)', 'Sell (₹)', 'GST (%)', 'GST Amt (₹)', 'Final (₹)', 'Profit (₹)', 'Slabs'].map(h => <th key={h} className={`px-3 py-2 text-left font-medium ${theme.text}`}>{h}</th>)}</tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {sizes.map((size, i) => (
                <tr key={size.id} className={theme.hover}>
                  <td className={`px-3 py-2 font-medium ${theme.text}`}>{size.size || `Size ${i + 1}`}</td>
                  {['packOff', 'costPrice', 'markupPrice', 'sellPrice', 'gst', 'gstAmount', 'priceWithGst', 'netProfit'].map(field => (
                    <td key={field} className={`px-3 py-2 ${theme.text} ${field === 'priceWithGst' ? 'font-bold text-green-600' : field === 'netProfit' ? 'font-medium text-blue-600' : ''}`}>
                      {field === 'gst' ? `${size[field] || '0'}%` : field === 'packOff' ? size[field] || '-' : `₹${size[field] || '0.00'}`}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{size.priceSlabs.length}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto p-6 min-h-screen ${theme.bg}`}>
      <div className={`max-w-7xl mx-auto ${theme.card} rounded-2xl shadow-xl overflow-hidden border ${theme.border}`}>
        <div className={`${theme.card} rounded-lg shadow-sm p-6 mb-6 border-b ${theme.border}`}>
          <h1 className={`text-2xl font-bold ${theme.text} flex items-center gap-3`}>
            <Package className="w-7 h-7" />Product Management System
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