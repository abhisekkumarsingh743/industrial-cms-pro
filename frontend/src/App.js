import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importing our new CSS
import { Layout, Database, Activity, Shield, LogOut, Plus, X, Lock } from 'lucide-react';

const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ logs: [], content: [] });
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', body: '', author: user || 'Admin' });

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  const refreshData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/content`),
        axios.get(`${BASE_URL}/api/audit/logs`)
      ]);
      setData({ content: cRes.data, logs: lRes.data });
    } catch (e) { console.error("Connecting to cloud..."); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="card" style={{textAlign: 'center', width: '350px'}}>
          <Shield size={48} color="#4318ff" />
          <h2>CMS PRO</h2>
          <button className="btn-primary" style={{width: '100%', justifyContent: 'center'}} onClick={() => { localStorage.setItem('user', 'Admin'); setUser('Admin'); }}>
            <Lock size={18}/> Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <nav className="sidebar">
        <h2 style={{ color: '#4318ff', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield /> CMS PRO</h2>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Dashboard</div>
        <div className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}><Layout size={18}/> Content</div>
        <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        <button className="btn-logout" onClick={handleLogout}><LogOut size={16}/> Logout</button>
      </nav>

      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h1>Industrial Hub <span style={{fontSize: '12px', color: '#05cd99'}}>● LIVE</span></h1>
          {activeTab === 'content' && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18}/> Add Entry</button>}
        </header>

        {activeTab === 'dashboard' && (
          <div className="stats-grid">
            <div className="card"><h4>Content</h4><h2>{data.content.length}</h2></div>
            <div className="card"><h4>Events</h4><h2>{data.logs.length}</h2></div>
            <div className="card"><h4>Cloud</h4><h2 style={{color: '#05cd99'}}>CONNECTED</h2></div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-grid">
            {data.content.map((item, i) => (
              <div key={i} className="card"><h3>{item.title}</h3><p>{item.body}</p></div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="card">
            {data.logs.map((l, i) => (
              <div key={i} style={{padding: '10px 0', borderBottom: '1px solid #f4f7fe'}}>{l.action} - {new Date(l.timestamp).toLocaleTimeString()}</div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="card" style={{width: '400px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}><h3>New Entry</h3><X onClick={()=>setShowModal(false)} cursor="pointer"/></div>
            <input className="input-field" placeholder="Title" value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
            <textarea className="input-field" style={{height: '100px'}} placeholder="Body" value={newEntry.body} onChange={e => setNewEntry({...newEntry, body: e.target.value})} />
            <button className="btn-primary" style={{width: '100%', justifyContent: 'center'}} onClick={async () => { await axios.post(`${BASE_URL}/api/content`, newEntry); setShowModal(false); refreshData(); }}>Publish</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;