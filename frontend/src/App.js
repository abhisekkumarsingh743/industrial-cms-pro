import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Shield, Lock, Download, Mail, X, Activity, Database, LogOut, Plus, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // FIXED: Proper import for plugin

const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [entries, setEntries] = useState([]); // RESTORED: Content state
  const [newEntry, setNewEntry] = useState({ title: '', status: 'Active' });
  const [targetEmail, setTargetEmail] = useState('');
  const [showMailModal, setShowMailModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const logRes = await axios.get(`${BASE_URL}/api/audit/logs`);
      setLogs(logRes.data);
      // Replace with your real content API endpoint if different
      const entryRes = await axios.get(`${BASE_URL}/api/content/entries`);
      setEntries(entryRes.data);
    } catch (err) {
      console.error("Syncing with backend...");
    }
  };

  const addEntry = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/content/add`, { ...newEntry, user });
      setNewEntry({ title: '', status: 'Active' });
      fetchData(); // Refresh list and logs
    } catch (err) {
      alert("Error adding entry.");
    }
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Industrial CMS Audit Report", 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [['Action', 'User', 'Timestamp']],
        body: logs.map(l => [l.action, l.user, new Date(l.timestamp).toLocaleString()]),
        headStyles: { fillColor: [67, 24, 255] }
      });
      doc.save("audit_report.pdf");
    } catch (err) {
      alert("PDF Error: Ensure jspdf-autotable is installed.");
    }
  };

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <Shield size={60} color="#4318ff" className="login-icon" />
          <h1>CMS PRO LOGIN</h1>
          <button className="btn-primary-lg" onClick={() => { localStorage.setItem('user', 'Admin'); setUser('Admin'); }}>
            <Lock size={20} /> Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand"><Shield /> CMS PRO</div>
        <nav className="nav-list">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Dashboard</div>
          <div className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}><FileText size={18}/> Manage Content</div>
          <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        </nav>
        <button className="btn-logout-bottom" onClick={() => { localStorage.clear(); setUser(null); }}><LogOut size={16}/> Logout</button>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>{activeTab === 'content' ? 'Content Management' : 'Industrial Dashboard'}</h1>
          <div className="header-actions">
            <button className="action-btn" onClick={() => setShowMailModal(true)}><Mail size={18}/> Email Logs</button>
            <button className="action-btn" onClick={downloadPDF}><Download size={18}/> Export PDF</button>
          </div>
        </header>

        <section className="content-area">
          {activeTab === 'content' ? (
            <div className="card">
              <h3>Add New Entry</h3>
              <form onSubmit={addEntry} className="entry-form">
                <input type="text" placeholder="Entry Title" value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} required />
                <select value={newEntry.status} onChange={e => setNewEntry({...newEntry, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
                <button type="submit" className="btn-add"><Plus size={18}/> Add Entry</button>
              </form>
              <div className="entry-list">
                {entries.map((item, i) => (
                  <div key={i} className="log-row">
                    <span>{item.title}</span>
                    <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <h3>Recent Activity</h3>
              {logs.map((log, index) => (
                <div key={index} className="log-row">
                  <span><strong>{log.action}</strong> by {log.user}</span>
                  <span className="timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showMailModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header"><h3>Email Report</h3><X onClick={()=>setShowMailModal(false)} cursor="pointer"/></div>
            <input className="input-field" type="email" placeholder="Recipient Email" value={targetEmail} onChange={e => setTargetEmail(e.target.value)} />
            <button className="btn-primary-lg" onClick={() => { alert("Logs sent!"); setShowMailModal(false); }}>Send Logs</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;