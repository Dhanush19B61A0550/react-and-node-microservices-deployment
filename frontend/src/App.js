import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [highlightOrderId, setHighlightOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Define ClusterIP service URLs
  const USER_SERVICE_URL = 'http://52.238.31.54/users';
  const PRODUCT_SERVICE_URL = 'http://52.238.31.54/products';
  const ORDER_SERVICE_URL = 'http://52.238.31.54/orders';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(USER_SERVICE_URL),
      axios.get(PRODUCT_SERVICE_URL),
      axios.get(ORDER_SERVICE_URL)
    ])
      .then(([uRes, pRes, oRes]) => {
        setUsers(uRes.data);
        setProducts(pRes.data);
        setOrders(oRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  const placeOrder = (productId) => {
    if (users.length === 0) {
      alert('Please add at least one user first!');
      return;
    }
    const userId = users[0].id;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    axios.post(ORDER_SERVICE_URL, {
      userId,
      productId,
      productName: product.name,
      price: product.price
    })
      .then(res => {
        setOrders(prev => [res.data, ...prev]);
        setHighlightOrderId(res.data.id);
        setTimeout(() => setHighlightOrderId(null), 2000);
      })
      .catch(err => console.error('Error placing order', err));
  };

  const addUser = () => {
    if (!newUser) return;
    axios.post(USER_SERVICE_URL, { name: newUser })
      .then(res => {
        setUsers([...users, res.data]);
        setNewUser('');
      })
      .catch(err => console.error('Error adding user', err));
  };

  const addProduct = () => {
    if (!newProductName || !newProductPrice) return;
    axios.post(PRODUCT_SERVICE_URL, {
      name: newProductName,
      price: parseFloat(newProductPrice)
    })
      .then(res => {
        setProducts([...products, res.data]);
        setNewProductName('');
        setNewProductPrice('');
      })
      .catch(err => console.error('Error adding product', err));
  };

  const getColor = (id) => {
    const colors = ['#FFCDD2','#F8BBD0','#E1BEE7','#D1C4E9','#C5CAE9','#BBDEFB','#B3E5FC','#B2EBF2','#B2DFDB','#C8E6C9','#DCEDC8','#F0F4C3','#FFF9C4','#FFECB3','#FFE0B2','#FFCCBC'];
    return colors[id % colors.length];
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>🛒 Micros Admin Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Left Column: Products & Users */}
        <div style={{ flex: '2 1 700px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Users */}
          <section>
            <h2 style={{ color: '#4b79a1' }}>👥 Users</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <input
                type="text"
                value={newUser}
                placeholder="Enter user name"
                onChange={(e) => setNewUser(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }}
              />
              <button onClick={addUser} style={{ padding: '10px 20px', borderRadius: '6px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Add User</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {users.map(u => (
                <div key={u.id} style={{ flex: '1 0 150px', background: '#e3f2fd', padding: '12px 15px', borderRadius: '10px', boxShadow: '0 3px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  <strong>{u.name}</strong>
                </div>
              ))}
            </div>
          </section>

          {/* Products */}
          <section>
            <h2 style={{ color: '#ff6f61' }}>📦 Products</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <input
                type="text"
                value={newProductName}
                placeholder="Product name"
                onChange={(e) => setNewProductName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: 2 }}
              />
              <input
                type="number"
                value={newProductPrice}
                placeholder="Price"
                onChange={(e) => setNewProductPrice(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }}
              />
              <button onClick={addProduct} style={{ padding: '10px 20px', borderRadius: '6px', background: '#ff6f61', color: '#fff', border: 'none', cursor: 'pointer' }}>Add Product</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: getColor(p.id), borderRadius: '10px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div>
                    <h4 style={{ margin: 0 }}>{p.name}</h4>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>${p.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => placeOrder(p.id)} style={{ marginTop: '10px', padding: '8px 0', borderRadius: '6px', border: 'none', background: '#007bff', color: '#fff', cursor: 'pointer' }}>Buy</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Live Orders Feed */}
        <div style={{ flex: '1 1 400px', maxHeight: '800px', overflowY: 'auto', position: 'sticky', top: '20px' }}>
          <h2 style={{ color: '#6a1b9a' }}>🧾 Live Orders Feed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {orders.map(o => {
              const user = users.find(u => u.id === o.userId);
              return (
                <div key={o.id} style={{
                  background: highlightOrderId === o.id ? '#fff9c4' : '#f3e5f5',
                  borderRadius: '10px',
                  padding: '12px',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                  transition: 'background 0.5s',
                  animation: highlightOrderId === o.id ? 'fadeIn 0.5s' : 'none'
                }}>
                  <h4 style={{ margin: 0 }}>Order #{o.id}</h4>
                  <p style={{ margin: '5px 0' }}>{o.productName}</p>
                  <span style={{ fontSize: '12px', color: '#555' }}>User: {user ? user.name : o.userId} | ${o.price.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
