import React, { useState } from 'react';
import { Upload, Plus, Trash2, Package, X, Image, DollarSign, Layers, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ProductForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    productName: '', category: '', material: '', hsnCode: '', shape: '', color: '',
    specification: '', quality: '', inventoryCode: '', inStock: 'Yes'
  });
  const [sizes, setSizes] = useState([{
    id: 1, size: '', costPrice: '', markupPrice: '', sellPrice: '', grossProfit: '',
    gst: '', gstAmount: '', priceWithGst: '', payableGst: '', netProfit: '', packOff: '',
    priceSlabs: [{ id: 1, quantity: '', price: '', gst: '', finalPrice: '' }]
  }]);

  const steps = [
    { id: 1, title: 'Basic Info', icon: Package, desc: 'Product details and images' },
    { id: 2, title: 'Sizes & Pricing', icon: DollarSign, desc: 'Individual size pricing' },
    { id: 3, title: 'Bulk Pricing', icon: Layers, desc: 'Price slabs for bulk orders' },
    { id: 4, title: 'Review', icon: CheckCircle, desc: 'Final review and save' }
  ];

  const basicFields = [
    ['Product Name', 'productName'], ['Category', 'category'], ['Material', 'material'],
    ['HSN Code', 'hsnCode'], ['Shape', 'shape'], ['Color', 'color'],
    ['Quality', 'quality'], ['Inventory Code', 'inventoryCode']
  ];

  const Input = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false, className = "" }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} value={value || ''} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${readOnly ? 'bg-gray-100' : ''}`}
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
      reader.onload = (e) => setImages(prev => [...prev, { id: Date.now() + Math.random(), url: e.target.result, name: file.name }]);
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
  const handleSubmit = () => {
    const productData = { ...formData, images, sizes };
    console.log('Product Data:', productData);
    alert('Product saved successfully! Check console for details.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7" />
            Product Management System
          </h1>
          <p className="text-blue-100 mt-1">Professional multi-step product creation</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 px-6 py-4">
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
                    'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`font-medium text-sm ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                  {index < steps.length - 1 && <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" />Product Images
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors mb-4">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Upload Images</p>
                    <p className="text-sm text-gray-400">Multiple files supported</p>
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
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  {basicFields.map(([label, field]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        type="text" value={formData[field] || ''} onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specification</label>
                  <textarea
                    value={formData.specification} onChange={(e) => handleInputChange('specification', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={2}
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">In Stock</label>
                  <select value={formData.inStock} onChange={(e) => handleInputChange('inStock', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Sizes & Pricing */}
          {currentStep === 2 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Product Sizes & Individual Pricing</h3>
                <button onClick={addSize} className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />Add Size
                </button>
              </div>
              <div className="space-y-6">
                {sizes.map((size, index) => (
                  <div key={size.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-lg">Size #{index + 1}</h4>
                      {sizes.length > 1 && (
                        <button onClick={() => removeSize(size.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                          <Trash2 className="w-4 h-4" />Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-3">
                        <h5 className="font-medium text-center bg-blue-100 py-2 rounded-lg text-sm">Size Details</h5>
                        <Input label="Size" value={size.size} onChange={(e) => calculateSizePrice(size.id, 'size', e.target.value)} placeholder="e.g., Small, Large" />
                        <Input label="Pack Off" value={size.packOff} onChange={(e) => calculateSizePrice(size.id, 'packOff', e.target.value)} />
                      </div>
                      <div className="space-y-3">
                        <h5 className="font-medium text-center bg-orange-100 py-2 rounded-lg text-sm">Cost & Markup</h5>
                        <Input label="Cost Price (₹)" type="number" value={size.costPrice} onChange={(e) => calculateSizePrice(size.id, 'costPrice', e.target.value)} />
                        <Input label="Markup Price (₹)" type="number" value={size.markupPrice} onChange={(e) => calculateSizePrice(size.id, 'markupPrice', e.target.value)} />
                        <Input label="Gross Profit (₹)" type="number" value={size.grossProfit} readOnly />
                      </div>
                      <div className="space-y-3">
                        <h5 className="font-medium text-center bg-green-100 py-2 rounded-lg text-sm">Selling Price</h5>
                        <Input label="Sell Price (₹)" type="number" value={size.sellPrice} readOnly />
                        <Input label="GST (%)" type="number" value={size.gst} onChange={(e) => calculateSizePrice(size.id, 'gst', e.target.value)} />
                        <Input label="GST Amount (₹)" type="number" value={size.gstAmount} readOnly />
                      </div>
                      <div className="space-y-3">
                        <h5 className="font-medium text-center bg-purple-100 py-2 rounded-lg text-sm">Final Price</h5>
                        <Input label="Price with GST (₹)" type="number" value={size.priceWithGst} readOnly />
                        <Input label="Payable GST (₹)" type="number" value={size.payableGst} readOnly />
                        <Input label="Net Profit (₹)" type="number" value={size.netProfit} readOnly />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Bulk Pricing */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Bulk Pricing Slabs (Pack-wise)</h3>
              <div className="space-y-6">
                {sizes.map((size, sizeIndex) => (
                  <div key={size.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-lg">{size.size || `Size ${sizeIndex + 1}`} - Bulk Pricing</h4>
                      <button onClick={() => addPriceSlab(size.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" />Add Slab
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-4 overflow-x-auto">
                      <div className="grid grid-cols-12 gap-2 mb-3 text-sm font-medium text-gray-700 min-w-[600px]">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Min Quantity</div>
                        <div className="col-span-3">Price/Pack (₹)</div>
                        <div className="col-span-2">GST (%)</div>
                        <div className="col-span-2">Final Price (₹)</div>
                        <div className="col-span-1">Action</div>
                      </div>
                      <div className="space-y-2 min-w-[600px]">
                        {size.priceSlabs.map((slab, index) => (
                          <div key={slab.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-1 text-sm text-gray-500">#{index + 1}</div>
                            <div className="col-span-3">
                              <input type="number" value={slab.quantity} onChange={(e) => calculateSlabPrice(size.id, slab.id, 'quantity', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Min packs" />
                            </div>
                            <div className="col-span-3">
                              <input type="number" value={slab.price} onChange={(e) => calculateSlabPrice(size.id, slab.id, 'price', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" step="0.01" placeholder="Price" />
                            </div>
                            <div className="col-span-2">
                              <input type="number" value={slab.gst} onChange={(e) => calculateSlabPrice(size.id, slab.id, 'gst', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" step="0.01" placeholder="GST%" />
                            </div>
                            <div className="col-span-2">
                              <input type="number" value={slab.finalPrice} className="w-full p-2 border border-gray-300 rounded bg-gray-100" readOnly />
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
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-6">Review Product Details</h3>
              
              {/* Basic Info Review */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3">
                  <h4 className="font-semibold">Basic Information</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Field</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        ['Product Name', formData.productName], ['Category', formData.category], ['Material', formData.material],
                        ['HSN Code', formData.hsnCode], ['Shape', formData.shape], ['Color', formData.color],
                        ['Quality', formData.quality], ['Inventory Code', formData.inventoryCode], ['In Stock', formData.inStock],
                        ['Specification', formData.specification], ['Images', `${images.length} uploaded`]
                      ].map(([field, value]) => (
                        <tr key={field}>
                          <td className="px-4 py-2 font-medium">{field}</td>
                          <td className="px-4 py-2">{value || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3">
                  <h4 className="font-semibold">Sizes & Pricing Summary</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Size', 'Pack Off', 'Cost (₹)', 'Markup (₹)', 'Sell (₹)', 'GST (%)', 'GST Amt (₹)', 'Final (₹)', 'Profit (₹)', 'Slabs'].map(header => (
                          <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sizes.map((size, index) => (
                        <tr key={size.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium">{size.size || `Size ${index + 1}`}</td>
                          <td className="px-3 py-2">{size.packOff || '-'}</td>
                          <td className="px-3 py-2">₹{size.costPrice || '0.00'}</td>
                          <td className="px-3 py-2">₹{size.markupPrice || '0.00'}</td>
                          <td className="px-3 py-2 font-medium">₹{size.sellPrice || '0.00'}</td>
                          <td className="px-3 py-2">{size.gst || '0'}%</td>
                          <td className="px-3 py-2">₹{size.gstAmount || '0.00'}</td>
                          <td className="px-3 py-2 font-bold text-green-600">₹{size.priceWithGst || '0.00'}</td>
                          <td className="px-3 py-2 font-medium text-blue-600">₹{size.netProfit || '0.00'}</td>
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

              {/* Bulk Pricing Review */}
              {sizes.some(size => size.priceSlabs.some(slab => slab.quantity || slab.price)) && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3">
                    <h4 className="font-semibold">Bulk Pricing Details</h4>
                  </div>
                  <div className="p-6 space-y-4">
                    {sizes.map((size, sizeIndex) => {
                      const validSlabs = size.priceSlabs.filter(slab => slab.quantity || slab.price);
                      if (!validSlabs.length) return null;
                      return (
                        <div key={size.id}>
                          <h5 className="font-medium text-gray-800 mb-2">
                            <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                              {size.size || `Size ${sizeIndex + 1}`}
                            </span>
                          </h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-gray-200 rounded-lg">
                              <thead className="bg-gray-50">
                                <tr>
                                  {['Slab', 'Min Qty', 'Price/Pack (₹)', 'GST (%)', 'Final (₹)'].map(header => (
                                    <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">{header}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {validSlabs.map((slab, slabIndex) => (
                                  <tr key={slab.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">#{slabIndex + 1}</td>
                                    <td className="px-4 py-2">{slab.quantity || '-'}</td>
                                    <td className="px-4 py-2">₹{slab.price || '0.00'}</td>
                                    <td className="px-4 py-2">{slab.gst || '0'}%</td>
                                    <td className="px-4 py-2 font-bold text-green-600">₹{slab.finalPrice || '0.00'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between border-t">
          <button onClick={prevStep} disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
              currentStep === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}>
            <ArrowLeft className="w-4 h-4" />Previous
          </button>
          {currentStep < 4 ? (
            <button onClick={nextStep}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              Next<ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold">
              Save Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}