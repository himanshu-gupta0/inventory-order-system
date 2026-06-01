import { useEffect, useState } from 'react';
import API from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [msg, setMsg] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = () => API.get('/orders').then(r => setOrders(r.data));
  useEffect(() => {
    load();
    API.get('/customers').then(r => setCustomers(r.data));
    API.get('/products').then(r => setProducts(r.data));
  }, []);

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const updateItem = (i, field, val) => { const updated = [...items]; updated[i][field] = val; setItems(updated); };
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const submit = async () => {
    try {
      await API.post('/orders', { customer_id: parseInt(customerId), items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })) });
      showMsg('Order created!');
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1 }]);
      load();
    } catch (e) { showMsg(e.response?.data?.detail || 'Error', 'error'); }
  };

  const del = async (id) => {
    if (!confirm('Cancel order?')) return;
    await API.delete(`/orders/${id}`);
    showMsg('Order cancelled!');
    load();
  };

  const viewDetail = async (id) => {
    const r = await API.get(`/orders/${id}`);
    setDetail(r.data);
  };

  return (
    <div>
      <h2>Orders</h2>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="card">
        <h3 style={{marginBottom:'1rem'}}>Create Order</h3>
        <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
          <option value="">Select Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {items.map((item, i) => (
          <div key={i} className="form-row" style={{alignItems:'center'}}>
            <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
            {items.length > 1 && <button className="btn btn-danger" onClick={() => removeItem(i)}>✕</button>}
          </div>
        ))}
        <button className="btn" style={{marginRight:'0.5rem', background:'#eee'}} onClick={addItem}>+ Add Item</button>
        <button className="btn btn-primary" onClick={submit}>Place Order</button>
      </div>

      {detail && (
        <div className="card" style={{border:'2px solid #1a1a2e'}}>
          <div className="section-header">
            <h3>Order #{detail.id} Details</h3>
            <button className="btn" onClick={() => setDetail(null)}>Close</button>
          </div>
          <p><strong>Customer ID:</strong> {detail.customer_id}</p>
          <p><strong>Total:</strong> ${detail.total_amount.toFixed(2)}</p>
          <p><strong>Date:</strong> {new Date(detail.created_at).toLocaleString()}</p>
          <table style={{marginTop:'1rem'}}>
            <thead><tr><th>Product ID</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
            <tbody>
              {detail.items.map(it => (
                <tr key={it.id}><td>{it.product_id}</td><td>{it.quantity}</td><td>${it.unit_price}</td><td>${(it.quantity * it.unit_price).toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <table>
          <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td><td>{o.customer_id}</td><td>${o.total_amount.toFixed(2)}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-success" style={{marginRight:'0.5rem'}} onClick={() => viewDetail(o.id)}>View</button>
                  <button className="btn btn-danger" onClick={() => del(o.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}