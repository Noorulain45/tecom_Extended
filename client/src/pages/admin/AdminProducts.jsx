import React, { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../../services/api';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';

const EMPTY_PRODUCT = {
  name: '',
  shortDescription: '',
  description: '',
  basePrice: '',
  category: 'green-tea',
  origin: '',
  thumbnail: '',
  isFeatured: false,
  // Badges & Variants
  badges: '',        // comma-separated e.g. "Organic, Vegan, Origin tea"
  variants: '',      // comma-separated e.g. "50g bag, 100g bag, 250g bag"
  // Steeping Instructions
  servingSize: '',   // e.g. "2 tsp per cup / 1 tsp per pot"
  temperature: '',   // e.g. "90°C"
  brewingTime: '',   // e.g. "1 min"
  coolAfter: '',     // e.g. "5 minutes"
  // About this tea
  flavor: '',        // e.g. "Spicy, Floral"
  quality: '',       // e.g. "Smooth"
  caffeineLevel: 'medium',
  allergens: '',     // e.g. "Nut-Free"
  ingredients: '',   // e.g. "Black tea, Cinnamon, Ginger..."
  tags: '',          // comma-separated
};

const CATEGORIES = ['green-tea','black-tea','herbal-tea','oolong-tea','white-tea','chai','matcha'];
const CAFFEINE   = ['none','low','medium','high'];

/* ── Cloudinary loader ── */
let _cloudinaryReady = null;
function loadCloudinary() {
  if (_cloudinaryReady) return _cloudinaryReady;
  _cloudinaryReady = new Promise((resolve) => {
    if (window.cloudinary) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => { console.warn('Cloudinary failed'); resolve(); };
    document.head.appendChild(script);
  });
  return _cloudinaryReady;
}

/* ── Section header inside form ── */
const FormSection = ({ title }) => (
  <div className="col-span-2 pt-2">
    <p className="text-xs font-semibold text-tea-700 uppercase tracking-widest border-b border-tea-100 pb-1.5 mb-1">
      {title}
    </p>
  </div>
);

/* ── Product Form Modal ── */
const ProductFormModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(
    product
      ? {
          ...EMPTY_PRODUCT,
          ...product,
          flavor:     Array.isArray(product.flavor)    ? product.flavor.join(', ')    : product.flavor    || '',
          tags:       Array.isArray(product.tags)      ? product.tags.join(', ')      : product.tags      || '',
          badges:     Array.isArray(product.badges)    ? product.badges.join(', ')    : product.badges    || '',
          variants:   Array.isArray(product.variants)
                        ? product.variants.map(v => v.label || v).join(', ')
                        : product.variants || '',
        }
      : EMPTY_PRODUCT
  );

  const [saving, setSaving]               = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [urlMode, setUrlMode]             = useState(false);
  const [cloudinaryReady, setCloudinaryReady] = useState(!!window.cloudinary);

  useEffect(() => {
    loadCloudinary().then(() => setCloudinaryReady(!!window.cloudinary));
  }, []);

  const openWidget = () => {
    if (!window.cloudinary) { toast.error('Uploader unavailable — paste a URL'); setUrlMode(true); return; }
    const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'my_app_preset';
    if (!cloudName) { toast.error('VITE_CLOUDINARY_CLOUD_NAME not set'); setUrlMode(true); return; }

    setUploading(true);
    window.cloudinary.openUploadWidget(
      { cloudName, uploadPreset, multiple: false, resourceType: 'image', sources: ['local','url','camera'], maxFileSize: 5_000_000, cropping: false },
      (error, result) => {
        setUploading(false);
        if (error) { toast.error('Upload failed — paste a URL'); setUrlMode(true); return; }
        if (result?.event === 'success') {
          setForm(p => ({ ...p, thumbnail: result.info.secure_url }));
          toast.success('Image uploaded!');
        }
      }
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())        { toast.error('Product name is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required');  return; }
    if (!form.basePrice || parseFloat(form.basePrice) <= 0) { toast.error('Enter a valid price'); return; }

    setSaving(true);

    const splitTrim = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      ...form,
      basePrice:  parseFloat(form.basePrice),
      flavor:     splitTrim(form.flavor),
      tags:       splitTrim(form.tags),
      badges:     splitTrim(form.badges),
      variants:   splitTrim(form.variants).map(label => ({ label })),
    };

    Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });

    try {
      if (product?._id) {
        await productAPI.update(product._id, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.create(payload);
        toast.success('Product created!');
      }
      onSave();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, hint, children }) => (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
        {label}
        {hint && <span className="text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 p-6 my-4">
        <h2 className="font-display text-xl text-tea-900 mb-5">
          {product ? 'Edit Product' : 'New Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">

            {/* ── Basic Info ── */}
            <FormSection title="Basic Info" />

            <div className="col-span-2">
              <Field label="Product Name *">
                <input name="name" value={form.name} onChange={handleChange} required className="input w-full" placeholder="e.g. Ceylon Ginger Cinnamon Chai" />
              </Field>
            </div>

            <Field label="Category *">
              <select name="category" value={form.category} onChange={handleChange} className="input w-full">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </Field>

            <Field label="Base Price ($) *">
              <input name="basePrice" type="number" step="0.01" min="0.01" value={form.basePrice} onChange={handleChange} required className="input w-full" placeholder="12.99" />
            </Field>

            <div className="col-span-2">
              <Field label="Short Description" hint="(shown as tagline on product page)">
                <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className="input w-full" placeholder="A lightly warming chai with ginger cinnamon flavours." />
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Description *">
                <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="input w-full resize-none" placeholder="Detailed product description shown in 'About this tea' section..." />
              </Field>
            </div>

            <Field label="Origin">
              <input name="origin" value={form.origin} onChange={handleChange} className="input w-full" placeholder="Darjeeling, India" />
            </Field>

            <Field label="Tags" hint="(comma separated)">
              <input name="tags" value={form.tags} onChange={handleChange} className="input w-full" placeholder="premium, bestseller" />
            </Field>

            {/* ── Badges & Variants ── */}
            <FormSection title="Badges & Variants" />

            <div className="col-span-2">
              <Field label="Badges" hint="(comma separated — shown as pills near product name)">
                <input name="badges" value={form.badges} onChange={handleChange} className="input w-full" placeholder="Organic, Vegan, Origin tea" />
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Variants" hint="(comma separated — shown as selectable buttons)">
                <input name="variants" value={form.variants} onChange={handleChange} className="input w-full" placeholder="50g bag, 100g bag, 250g bag, Tin & bag, Sampler" />
              </Field>
            </div>

            {/* ── Thumbnail ── */}
            <FormSection title="Product Image" />

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Thumbnail Image</label>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setUrlMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${!urlMode ? 'bg-tea-600 text-white border-tea-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                  <CloudUploadIcon fontSize="inherit" /> Upload
                </button>
                <button type="button" onClick={() => setUrlMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${urlMode ? 'bg-tea-600 text-white border-tea-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                  <LinkIcon fontSize="inherit" /> Paste URL
                </button>
              </div>

              {urlMode ? (
                <input name="thumbnail" value={form.thumbnail} onChange={handleChange} className="input w-full" placeholder="https://example.com/tea-image.jpg" />
              ) : (
                <button type="button" onClick={openWidget} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-tea-400 hover:text-tea-600 transition-colors disabled:opacity-50">
                  <CloudUploadIcon fontSize="small" />
                  {uploading ? 'Opening uploader…' : cloudinaryReady ? 'Choose / drag image' : 'Loading uploader…'}
                </button>
              )}

              {form.thumbnail && (
                <div className="flex items-center gap-3 mt-2">
                  <img src={form.thumbnail} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-gray-200" onError={e => { e.target.style.display='none'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">{form.thumbnail}</p>
                    <button type="button" onClick={() => setForm(p => ({ ...p, thumbnail: '' }))} className="text-xs text-red-400 hover:text-red-600 mt-0.5">Remove</button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Steeping Instructions ── */}
            <FormSection title="Steeping Instructions" />

            <Field label="Serving Size">
              <input name="servingSize" value={form.servingSize} onChange={handleChange} className="input w-full" placeholder="2 tsp per cup / 1 tsp per pot" />
            </Field>

            <Field label="Water Temperature">
              <input name="temperature" value={form.temperature} onChange={handleChange} className="input w-full" placeholder="90°C" />
            </Field>

            <Field label="Steeping Time">
              <input name="brewingTime" value={form.brewingTime} onChange={handleChange} className="input w-full" placeholder="1 min" />
            </Field>

            <Field label="Cool After">
              <input name="coolAfter" value={form.coolAfter} onChange={handleChange} className="input w-full" placeholder="5 minutes" />
            </Field>

            {/* ── About This Tea ── */}
            <FormSection title="About This Tea" />

            <Field label="Flavor Notes" hint="(comma separated)">
              <input name="flavor" value={form.flavor} onChange={handleChange} className="input w-full" placeholder="Spicy, Floral, Sweet" />
            </Field>

            <Field label="Quality">
              <input name="quality" value={form.quality} onChange={handleChange} className="input w-full" placeholder="Smooth" />
            </Field>

            <Field label="Caffeine Level">
              <select name="caffeineLevel" value={form.caffeineLevel} onChange={handleChange} className="input w-full">
                {CAFFEINE.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </Field>

            <Field label="Allergens">
              <input name="allergens" value={form.allergens} onChange={handleChange} className="input w-full" placeholder="Nut-Free" />
            </Field>

            <div className="col-span-2">
              <Field label="Ingredients">
                <textarea name="ingredients" value={form.ingredients} onChange={handleChange} rows={2} className="input w-full resize-none" placeholder="Black tea, Cinnamon, Ginger, Cardamom, Cloves, Black pepper, Rose petals." />
              </Field>
            </div>

            {/* ── Other ── */}
            <FormSection title="Other" />

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-tea-600" />
                <span className="text-sm text-gray-700">Mark as Featured product</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[110px]">
              {saving ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── AdminProducts page ── */
const AdminProducts = () => {
  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [deleting, setDeleting]     = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...(search && { search }) };
      const { data } = await productAPI.getAll(params);
      setProducts(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    setDeleting(id);
    try {
      await productAPI.delete(id);
      toast.success(`"${name}" deactivated`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = () => { setModal(null); fetchProducts(); };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-tea-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pagination ? `${pagination.total} total` : ''}</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2 text-sm">
          <AddIcon fontSize="small" /> Add Product
        </button>
      </div>

      <div className="mb-5">
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search by name…" className="input w-72" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-tea-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-tea-50 border-b border-tea-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Variants</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tea-50">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=40'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-tea-100"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=40'; }}
                          />
                          <div>
                            <p className="font-medium text-gray-800">{p.name}</p>
                            {p.isFeatured && (
                              <span className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 bg-tea-100 text-tea-700 rounded">Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{p.category?.replace(/-/g,' ')}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">${p.basePrice?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500">{p.variants?.length || 0} variant{p.variants?.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${p.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {p.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-amber-500 font-medium">{p.rating > 0 ? `★ ${p.rating}` : '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModal(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <EditIcon fontSize="small" />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Deactivate">
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="text-center py-14 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">🍵</p>
                  No products found.{' '}
                  <button onClick={() => setModal('create')} className="text-tea-600 underline">Add one?</button>
                </div>
              )}
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      {modal && (
        <ProductFormModal
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminProducts;