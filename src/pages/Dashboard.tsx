import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Profile } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Edit, Trash2, Plus, LogOut } from 'lucide-react';

export const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState<'mezcal' | 'cafe'>('mezcal');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, imageFile);
        
      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // 3. Insert Product
      const { error: insertError } = await supabase.from('products').insert([{
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        image_url: publicUrlData.publicUrl
      }]);

      if (insertError) throw insertError;

      setShowModal(false);
      resetForm();
      fetchProducts();
      alert('Producto agregado exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al agregar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar');
      } else {
        fetchProducts();
      }
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategory('mezcal');
    setImageFile(null);
    setImagePreview('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!profile) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando perfil...</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '0 25px', marginBottom: '30px' }}>
          <h3>Panel de Control</h3>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>Rol: {profile.role.toUpperCase()}</p>
        </div>
        <nav className="sidebar-menu">
          <a href="#" className="sidebar-link active">
            <Edit size={20} /> Inventario
          </a>
          <a href="#" className="sidebar-link" onClick={handleLogout}>
            <LogOut size={20} /> Cerrar Sesión
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2>Gestión de Inventario</h2>
          {(profile.role === 'admin' || profile.role === 'vendedor') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={20} style={{ marginRight: '8px' }} /> Nuevo Producto
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>No hay productos en inventario</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.image_url} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td>{p.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>
                      {(profile.role === 'admin' || profile.role === 'vendedor') && (
                        <div className="action-btns">
                          <button className="btn-icon btn-delete" onClick={() => handleDelete(p.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Agregar Producto</h3>
              <button className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre del Producto</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <select className="form-control" value={category} onChange={e => setCategory(e.target.value as any)}>
                      <option value="mezcal">Mezcal</option>
                      <option value="cafe">Café</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio ($)</label>
                    <input type="number" step="0.01" className="form-control" value={price} onChange={e => setPrice(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Inicial</label>
                  <input type="number" className="form-control" value={stock} onChange={e => setStock(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Imagen del Producto</label>
                  <label className="image-upload-wrapper" style={{ display: 'block' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <>
                        <UploadCloud className="upload-icon" />
                        <p>Haz clic para seleccionar una imagen</p>
                      </>
                    )}
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
