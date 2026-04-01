import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layout, Database, Activity, Shield, LogOut, Plus, 
  FileText, X 
} from 'lucide-react';

// POINTING TO THE LIVE SERVER (Step 3)
const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
 const [user] = useState(localStorage.getItem('user') || 'Admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ logs: [], content: [] });
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', body: '', author: 'Admin' });

  // 1. Fetch data from Live Server
  const refreshData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/content`),
        axios.get(`${BASE_URL}/api/audit/logs`)
      ]);
      setData({ content: cRes.data, logs: lRes.data });
    } catch (e) { 
      console.error("Connection to Live Server failed. Make sure 'node server.js' is running.", e); 
    }
  };

  useEffect(() => { refreshData(); }, []);

  // 2. Add New Content via Live Server
  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/content`, newEntry);
      setShowModal(false);
      setNewEntry({ title: '', body: '', author: user });
      refreshData(); // Refresh list immediately
    } catch (err) { 
      alert("Failed to add entry. Check if backend server is running on port 5000."); 
    }
  };

  // 3. Download CSV (Frontend Logic)
  const downloadLogs = () => {
    const headers = "Action,User,Date\n";
    const rows = data.logs.map(l => `${l.action},${l.user},${new Date(l.timestamp).toLocaleString()}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Activity_Log.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', background: '#f4f7fe', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <nav style={sidebarStyle}>
        <h2 style={{ color: '#4318ff', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield /> CMS PRO</h2>
        <div style={navItem(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Dashboard</div>
        <div style={navItem(activeTab === 'content')} onClick={() => setActiveTab('content')}><Layout size={18}/> Content</div>
        <div style={navItem(activeTab === 'audit')} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        <button onClick={() => {localStorage.clear(); window.location.reload();}} style={logoutBtn}><LogOut size={16}/> Logout</button>
      </nav>

      {/* Main Area */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h1 style={{ color: '#1b2559' }}>System Control (Live Mode)</h1>
          {activeTab === 'content' && (
            <button onClick={() => setShowModal(true)} style={primaryBtn}><Plus size={18}/> Add Entry</button>
          )}
          {activeTab === 'audit' && (
            <button onClick={downloadLogs} style={{...primaryBtn, background: '#111'}}><FileText size={18}/> Download CSV</button>
          )}
        </header>

        {activeTab === 'dashboard' && <DashboardStats data={data} />}
        {activeTab === 'content' && <ContentGrid content={data.content} />}
        {activeTab === 'audit' && <AuditList logs={data.logs} />}
      </main>

      {/* Entry Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}><h3>New Entry</h3> <X onClick={()=>setShowModal(false)} cursor="pointer"/></div>
            <form onSubmit={handleAddContent}>
              <input style={inputStyle} placeholder="Title" required value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
              <textarea style={{...inputStyle, height: '100px'}} placeholder="Body" required value={newEntry.body} onChange={e => setNewEntry({...newEntry, body: e.target.value})} />
              <button style={primaryBtn}>Publish Entry</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- UI STYLES & COMPONENTS --- */
const DashboardStats = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
    <div style={cardStyle}><h4>Total Entries</h4><h2>{data.content.length}</h2></div>
    <div style={cardStyle}><h4>Activity Count</h4><h2>{data.logs.length}</h2></div>
    <div style={cardStyle}><h4>Server Status</h4><h2 style={{color: '#05cd99'}}>ONLINE</h2></div>
  </div>
);

const ContentGrid = ({ content }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
    {content.map((item, i) => (
      <div key={i} style={cardStyle}>
        <h3 style={{color: '#1b2559'}}>{item.title}</h3>
        <p style={{color: '#a3aed0', fontSize: '14px'}}>{item.body}</p>
        <div style={{fontSize: '11px', color: '#4318ff'}}>By {item.author}</div>
      </div>
    ))}
  </div>
);

const AuditList = ({ logs }) => (
  <div style={cardStyle}>
    {logs.map((l, i) => (
      <div key={i} style={{padding: '10px 0', borderBottom: '1px solid #f4f7fe', display: 'flex', justifyContent: 'space-between'}}>
        <span><strong>{l.action}</strong> by {l.user}</span>
        <span style={{color: '#a3aed0'}}>{new Date(l.timestamp).toLocaleTimeString()}</span>
      </div>
    ))}
  </div>
);

const sidebarStyle = { width: '260px', background: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e5f2' };
const navItem = (active) => ({ padding: '15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px', background: active ? '#4318ff' : 'transparent', color: active ? '#fff' : '#a3aed0', fontWeight: 'bold' });
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #e0e5f2', boxSizing: 'border-box' };
const primaryBtn = { background: '#4318ff', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const logoutBtn = { marginTop: 'auto', border: '1px solid #ee5d50', color: '#ee5d50', background: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox = { background: '#fff', padding: '30px', borderRadius: '20px', width: '400px' };

export default App;