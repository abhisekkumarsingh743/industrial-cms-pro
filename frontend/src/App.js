import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Layout, Database, Activity, Shield, LogOut, Plus, X, Lock } from 'lucide-react';

// Replace with your actual Render URL
const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ logs: [], content: [] });
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', body: '', author: user || 'Admin' });

  // Fetch data from Render
  const refreshData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/content`),
        axios.get(`${BASE_URL}/api/audit/logs`)
      ]);
      setData({ content: cRes.data, logs: lRes.data });
    } catch (e) {
      console.error("Backend waking up...");
    }
  };

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null); // Triggers the login view
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/content`, newEntry);
      setShowModal(false);
      setNewEntry({ title: '', body: '', author: user });
      refreshData(); // Updates UI immediately after successful post
    } catch (err) {
      alert("Server is still waking up. Please wait 10 seconds.");
    }
  };

  if (!user) {
    return (
      <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div className="card" style={{textAlign: 'center', width: '350px'}}>
          <Shield size={48} color="#4318ff" style={{marginBottom: '15px'}} />
          <h2>CMS PRO LOGIN</h2>
          <button className="btn-primary" style={{width: '100%', justifyContent: 'center'}} onClick={() => { localStorage.setItem('user', 'Admin'); setUser('Admin'); }}>
            <Lock size={18}/> Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <h2 style={{ color: '#4318ff', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield /> CMS PRO</h2>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Dashboard</div>
        <div className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}><Layout size={18}/> Content</div>
        <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        <button className="btn-logout" onClick={handleLogout}><LogOut size={16}/> Logout</button>
      </nav>

      <main className="main-content">
        <header className="header">
          <h1>Industrial Dashboard <span style={{fontSize: '12px', color: '#05cd99'}}>● LIVE</span></h1>
          {activeTab === 'content' && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18}/> Add Entry</button>}
        </header>

        {activeTab === 'dashboard' && (
          <div className="stats-grid">
            <div className="card"><h4>Total Entries</h4><h2>{data.content.length}</h2></div>
            <div className="card"><h4>System Logs</h4><h2>{data.logs.length}</h2></div>
            <div className="card"><h4>Cloud Status</h4><h2 style={{color: '#05cd99'}}>HEALTHY</h2></div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-grid">
            {data.content.map((item) => (
              <div key={item.id} className="card">
                <h3>{item.title}</h3>
                <p style={{color: '#a3aed0'}}>{item.body}</p>
                <div style={{fontSize: '11px', color: '#4318ff', marginTop: '10px'}}>BY: {item.author.toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="card">
            <h3>Recent Activity</h3>
            {data.logs.map((log) => (
              <div key={log.id} style={{padding: '12px 0', borderBottom: '1px solid #f4f7fe', display: 'flex', justifyContent: 'space-between'}}>
                <span><strong>{log.action}</strong> by {log.user}</span>
                <span style={{color: '#a3aed0'}}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="card" style={{width: '450px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h3>Create Entry</h3>
              <X onClick={()=>setShowModal(false)} cursor="pointer"/>
            </div>
            <form onSubmit={handleAddContent}>
              <input className="input-field" placeholder="Title" required value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
              <textarea className="input-field" style={{height: '120px'}} placeholder="Description" required value={newEntry.body} onChange={e => setNewEntry({...newEntry, body: e.target.value})} />
              <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>Publish to Cloud</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;