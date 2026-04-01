import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Lock, Download, Mail, X, Activity, Database, LogOut, Plus, FileText, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';

const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', status: 'Active' });
  const [showMailModal, setShowMailModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const logRes = await axios.get(`${BASE_URL}/api/audit/logs`);
      setLogs(logRes.data);
      const entryRes = await axios.get(`${BASE_URL}/api/content/entries`);
      setEntries(entryRes.data);
    } catch (err) { console.log("Syncing..."); }
  };

  const addEntry = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/content/add`, { ...newEntry, user });
      setNewEntry({ title: '', status: 'Active' });
      fetchData();
    } catch (err) { alert("Add entry failed."); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("System Audit Report", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Action', 'User', 'Timestamp']],
      body: logs.map(l => [l.action, l.user, new Date(l.timestamp).toLocaleString()]),
      headStyles: { fillColor: [67, 24, 255] }
    });
    doc.save("audit_report.pdf");
  };

  const sendEmail = async () => {
    try {
      await axios.post(`${BASE_URL}/api/audit/email`, { email: targetEmail });
      alert("Logs sent!");
      setShowMailModal(false);
    } catch (err) { alert("Email failed."); }
  };

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="icon-badge"><Shield size={40} /></div>
          <h1>CMS PRO LOGIN</h1>
          <p>Secure Enterprise Portal</p>
          <button className="btn-login-grand" onClick={() => { localStorage.setItem('user', 'Admin'); setUser('Admin'); }}>
            <Lock size={18} /> Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <Shield className="brand-icon" size={28} />
          <span className="brand-text">CMS PRO</span>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Database size={20}/> Dashboard
          </button>
          <button className={`nav-link ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
            <FileText size={20}/> Manage Content
          </button>
          <button className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            <Activity size={20}/> Audit Logs
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar"><User size={16}/></div>
            <span>{user}</span>
          </div>
          <button className="btn-logout-minimal" onClick={() => { localStorage.clear(); setUser(null); }}>
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="app-main">
        <header className="main-header">
          <div className="header-titles">
            <p className="breadcrumb">Pages / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
            <h2>{activeTab === 'audit' ? 'Audit History' : activeTab === 'content' ? 'Content Manager' : 'Overview Dashboard'}</h2>
          </div>
          
          {activeTab === 'audit' && (
            <div className="header-actions">
              <button className="btn-glass" onClick={() => setShowMailModal(true)}><Mail size={18}/> Email Logs</button>
              <button className="btn-glass" onClick={downloadPDF}><Download size={18}/> Export PDF</button>
            </div>
          )}
        </header>

        <div className="content-container">
          {activeTab === 'content' ? (
            <div className="glass-panel">
              <div className="panel-header"><h3>Add New Entry</h3></div>
              <form onSubmit={addEntry} className="entry-form-grid">
                <input type="text" placeholder="Internal Entry Title..." value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} required />
                <select value={newEntry.status} onChange={e => setNewEntry({...newEntry, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
                <button type="submit" className="btn-submit"><Plus size={18}/> Save Entry</button>
              </form>
              
              <div className="entry-list-refined">
                <h4>Existing Records</h4>
                {entries.map((item, i) => (
                  <div key={i} className="refined-item">
                    <div className="item-info">
                      <span className="item-title">{item.title}</span>
                      <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'audit' ? (
            <div className="glass-panel">
              <div className="panel-header"><h3>Recent System Activity</h3></div>
              <div className="log-scroll">
                {logs.map((log, i) => (
                  <div key={i} className="refined-item">
                    <div className="item-info">
                      <span className="log-text"><strong>{log.action}</strong> by {log.user}</span>
                    </div>
                    <span className="log-time-stamp">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard-grid">
              <div className="stat-card">
                <p>Total Entries</p>
                <h3>{entries.length}</h3>
              </div>
              <div className="stat-card">
                <p>Audit Events</p>
                <h3>{logs.length}</h3>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showMailModal && (
        <div className="modal-backdrop">
          <div className="modal-content-glass">
            <div className="modal-header">
              <h3>Email Audit Report</h3>
              <X className="modal-close" onClick={() => setShowMailModal(false)} />
            </div>
            <div className="modal-body">
              <label>Recipient Address</label>
              <input type="email" placeholder="name@company.com" value={targetEmail} onChange={e => setTargetEmail(e.target.value)} />
              <button className="btn-primary-full" onClick={sendEmail}>Send Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;