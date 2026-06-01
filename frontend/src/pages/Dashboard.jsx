import { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/dashboard').then(r => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card"><h2>{data.total_products}</h2><p>Total Products</p></div>
        <div className="stat-card"><h2>{data.total_customers}</h2><p>Total Customers</p></div>
        <div className="stat-card"><h2>{data.total_orders}</h2><p>Total Orders</p></div>
        <div className="stat-card"><h2>{data.low_stock_products.length}</h2><p>Low Stock Items</p></div>
      </div>
      {data.low_stock_products.length > 0 && (
        <div className="card">
          <h2>⚠️ Low Stock Products</h2>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Quantity</th></tr></thead>
            <tbody>
              {data.low_stock_products.map(p => (
                <tr key={p.id}><td>{p.id}</td><td>{p.name}</td><td><span className="badge badge-red">{p.quantity}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}