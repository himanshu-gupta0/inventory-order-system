import { useEffect, useState } from 'react';
import API from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () => API.get('/products').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

  const submit = async () => {
    try {
      if (editing) {
        await API.put(`/products/${editing}`, form);
        showMsg('Product updated!');
        setEditing(null);
      } else {
        await API.post('/products', form);
        showMsg('Product created!');
      }
      setForm({ name: '', sku: '', price: '', quantity: '' });
      load();
    } catch (e) { showMsg(e.response?.data?.detail || 'Error', 'error'); }
  };

  const del = async (id) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/products/${id}`);
    showMsg('Deleted!');
    load();
  };

  const edit = (p) => { setEditing(p.id); setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity }); };

  return (
    <div>
      <div className="section-header"><h2>Products</h2></div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="card">
        <h3 style={{marginBottom:'1rem'}}>{editing ? 'Edit Product' : 'Add Product'}</h3>
        <div className="form-row">
          <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
        </div>
        <div className="form-row">
          <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
        </div>
        <button className="btn btn-primary" onClick={submit}>{editing ? 'Update' : 'Add Product'}</button>
        {editing && <button className="btn" style={{marginLeft:'0.5rem'}} onClick={() => { setEditing(null); setForm({ name:'',sku:'',price:'',quantity:'' }); }}>Cancel</button>}
      </div>
      <div className="card">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td><td>{p.name}</td><td>{p.sku}</td><td>${p.price}</td>
                <td><span className={`badge ${p.quantity <= 5 ? 'badge-red' : ''}`}>{p.quantity}</span></td>
                <td>
                  <button className="btn btn-success" style={{marginRight:'0.5rem'}} onClick={() => edit(p)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => del(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}