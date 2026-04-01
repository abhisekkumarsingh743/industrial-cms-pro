import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layout, Database, Activity, Shield, LogOut, Plus, 
  FileText, X, Lock 
} from 'lucide-react';

// PASTE YOUR RENDER LINK HERE
const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ logs: [], content: [] });
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', body: '', author: user || 'Admin' });

  // Login View
  if (!user) {
    return (
      <div style={loginOverlay}>
        <div style={loginBox}>
          <Shield size={48} color="#4318ff" />
          <h2 style={{ color: '#1b2559', margin: '20px 0' }}>CMS PRO LOGIN</h2>
          <button 
            onClick={() => {
              localStorage.setItem('user', 'Admin');
              setUser('Admin');
            }} 
            style={{...primaryBtn, width: '100%', justifyContent: 'center'}}
          >
            <Lock size={18}/> Login as Admin
          </button>
        </div>
      </div>
    );
  }

  const refreshData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/content`),
        axios.get(`${BASE_URL}/api/audit/logs`)
      ]);
      setData({ content: cRes.data, logs: lRes.data });
    } catch (e) { console.error("Waiting for backend..."); }
  };

  useEffect(() => { refreshData(); }, []);

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/content`, newEntry);
      setShowModal(false);
      setNewEntry({ title: '', body: '', author: user });
      refreshData();
    } catch (err) { alert("Backend is waking up, please wait..."); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div style={{ display: 'flex', background: '#f4f7fe', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={sidebarStyle}>
        <h2 style={{ color: '#4318ff', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield /> CMS PRO</h2>
        <div style={navItem(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Dashboard</div>
        <div style={navItem(activeTab === 'content')} onClick={() => setActiveTab('content')}><Layout size={18}/> Content</div>
        <div style={navItem(activeTab === 'audit')} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        <button onClick={handleLogout} style={logoutBtn}><LogOut size={16}/> Logout</button>
      </nav>

      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h1 style={{ color: '#1b2559' }}>Industrial Dashboard <span style={{fontSize: '12px', color: '#05cd99'}}>● LIVE</span></h1>
          {activeTab === 'content' && <button onClick={() => setShowModal(true)} style={primaryBtn}><Plus size={18}/> Add Entry</button>}
        </header>
        {activeTab === 'dashboard' && <DashboardStats data={data} />}
        {activeTab === 'content' && <ContentGrid content={data.content} />}
        {activeTab === 'audit' && <AuditList logs={data.logs} />}
      </main>

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}><h3>New Entry</h3><X onClick={()=>setShowModal(false)} cursor="pointer"/></div>
            <form onSubmit={handleAddContent}>
              <input style={inputStyle} placeholder="Title" required value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
              <textarea style={{...inputStyle, height: '100px'}} placeholder="Description" required value={newEntry.body} onChange={e => setNewEntry({...newEntry, body: e.target.value})} />
              <button style={{...primaryBtn, width: '100%', justifyContent: 'center'}}>Publish</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardStats = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
    <div style={cardStyle}><h4>Entries</h4><h2>{data.content.length}</h2></div>
    <div style={cardStyle}><h4>Events</h4><h2>{data.logs.length}</h2></div>
    <div style={cardStyle}><h4>Status</h4><h2 style={{color: '#05cd99'}}>ONLINE</h2></div>
  </div>
);

const ContentGrid = ({ content }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
    {content.map((item, i) => (
      <div key={i} style={cardStyle}><h3>{item.title}</h3><p>{item.body}</p></div>
    ))}
  </div>
);

const AuditList = ({ logs }) => (
  <div style={cardStyle}>
    {logs.map((l, i) => (
      <div key={i} style={{padding: '10px 0', borderBottom: '1px solid #f4f7fe'}}>{l.action} by {l.user}</div>
    ))}
  </div>
);

const sidebarStyle = { width: '250px', background: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e5f2' };
const navItem = (active) => ({ padding: '15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px', background: active ? '#4318ff' : 'transparent', color: active ? '#fff' : '#a3aed0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' });
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #e0e5f2', boxSizing: 'border-box' };
const primaryBtn = { background: '#4318ff', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const logoutBtn = { marginTop: 'auto', border: '1px solid #ee5d50', color: '#ee5d50', background: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox = { background: '#fff', padding: '30px', borderRadius: '20px', width: '400px' };
const loginOverlay = { height: '100vh', background: '#f4f7fe', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const loginBox = { background: '#fff', padding: '50px', borderRadius: '30px', textAlign: 'center', width: '350px' };

export default App;