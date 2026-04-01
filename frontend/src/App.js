import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Layout, Database, Activity, Shield, LogOut, Plus, X, Lock, Download, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // FIXED: Specific import for the plugin

const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ logs: [], content: [] });
  const [showModal, setShowModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [newEntry, setNewEntry] = useState({ title: '', body: '', author: user || 'Admin' });

  const refreshData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/content`),
        axios.get(`${BASE_URL}/api/audit/logs`)
      ]);
      setData({ content: cRes.data, logs: lRes.data });
    } catch (e) { console.error("Syncing with cloud..."); }
  };

  useEffect(() => { if (user) refreshData(); }, [user]);

  const handleLogout = () => { localStorage.clear(); setUser(null); };

  // FIXED PDF LOGIC: Uses autoTable(doc, ...) to avoid "not a function" error
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Industrial CMS Pro - Audit Logs", 14, 22);
      
      const tableRows = data.logs.map(log => [
        log.id, 
        log.action, 
        log.user, 
        new Date(log.timestamp).toLocaleString()
      ]);

      autoTable(doc, {
        startY: 30,
        head: [["ID", "Action", "User", "Timestamp"]],
        body: tableRows,
        headStyles: { fillColor: [67, 24, 255] },
        theme: 'striped'
      });

      doc.save(`Audit_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("PDF Error: Ensure jspdf-autotable is installed in package.json.");
    }
  };

  const handleEmailLogs = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/audit/email`, { email: targetEmail });
      alert("Logs successfully dispatched to: " + targetEmail);
      setShowMailModal(false);
      setTargetEmail('');
    } catch (err) {
      alert("Email Service Error. Check backend SMTP settings."); //
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/content`, newEntry);
      setShowModal(false);
      setNewEntry({ title: '', body: '', author: user });
      refreshData();
    } catch (err) { alert("Backend is waking up..."); }
  };

  if (!user) {
    return (
      <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>
        <div className="card" style={{textAlign: 'center', width: '350px'}}>
          <Shield size={48} color="#4318ff" style={{marginBottom: '15px'}} />
          <h2>CMS PRO LOGIN</h2>
          <button className="btn-primary" onClick={() => { localStorage.setItem('user', 'Admin'); setUser('Admin'); }}>
            <Lock size={18}/> Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <h2 style={{ color: '#4318ff' }}><Shield /> CMS PRO</h2>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Dashboard</div>
        <div className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}><Layout size={18}/> Content</div>
        <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        <button className="btn-logout" onClick={handleLogout}><LogOut size={16}/> Logout</button>
      </nav>

      <main className="main-content">
        <header className="header">
          <h1>Industrial Dashboard <span style={{fontSize: '12px', color: '#05cd99'}}>● LIVE</span></h1>
          <div style={{display: 'flex', gap: '10px'}}>
            {activeTab === 'audit' && (
              <>
                <button className="btn-secondary" onClick={() => setShowMailModal(true)}><Mail size={18}/> Email Logs</button>
                <button className="btn-secondary" onClick={downloadPDF}><Download size={18}/> Export PDF</button>
              </>
            )}
            {activeTab === 'content' && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18}/> Add Entry</button>}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="stats-grid">
            <div className="card"><h4>Entries</h4><h2>{data.content.length}</h2></div>
            <div className="card"><h4>Logs</h4><h2>{data.logs.length}</h2></div>
            <div className="card"><h4>Status</h4><h2 style={{color: '#05cd99'}}>HEALTHY</h2></div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-grid">
            {data.content.map((item) => (
              <div key={item.id} className="card"><h3>{item.title}</h3><p>{item.body}</p></div>
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

      {showMailModal && (
        <div className="modal-overlay">
          <div className="card" style={{width: '400px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}><h3>Email Report</h3><X onClick={()=>setShowMailModal(false)} cursor="pointer"/></div>
            <form onSubmit={handleEmailLogs}>
              <input className="input-field" type="email" placeholder="Recipient Email" required value={targetEmail} onChange={e => setTargetEmail(e.target.value)} />
              <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>Send Logs</button>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="card" style={{width: '450px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}><h3>Create Entry</h3><X onClick={()=>setShowModal(false)} cursor="pointer"/></div>
            <form onSubmit={handleAddContent}>
              <input className="input-field" placeholder="Title" required value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
              <textarea className="input-field" style={{height: '120px'}} placeholder="Description" required value={newEntry.body} onChange={e => setNewEntry({...newEntry, body: e.target.value})} />
              <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>Publish</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;