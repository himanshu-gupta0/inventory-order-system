import { useEffect, useState } from 'react';
import API from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [msg, setMsg] = useState(null);

  const load = () => API.get('/customers').then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

  const submit = async () => {
    try {
      await API.post('/customers', form);
      showMsg('Customer added!');
      setForm({ name: '', email: '', phone: '' });
      load();
    } catch (e) { showMsg(e.response?.data?.detail || 'Error', 'error'); }
  };

  const del = async (id) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/customers/${id}`);
    showMsg('Deleted!');
    load();
  };

  return (
    <div>
      <h2>Customers</h2>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <div className="card">
        <h3 style={{marginBottom:'1rem'}}>Add Customer</h3>
        <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <button className="btn btn-primary" onClick={submit}>Add Customer</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td>
                <td><button className="btn btn-danger" onClick={() => del(c.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}