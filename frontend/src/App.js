import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Layout, Database, Activity, Shield, LogOut, Plus, X, Lock, Download, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ logs: [], content: [] });
  const [showModal, setShowModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false); // NEW
  const [targetEmail, setTargetEmail] = useState(''); // NEW
  const [newEntry, setNewEntry] = useState({ title: '', body: '', author: user || 'Admin' });

  const refreshData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/content`),
        axios.get(`${BASE_URL}/api/audit/logs`)
      ]);
      setData({ content: cRes.data, logs: lRes.data });
    } catch (e) { console.error("Syncing..."); }
  };

  useEffect(() => { if (user) refreshData(); }, [user]);

  const handleLogout = () => { localStorage.clear(); setUser(null); };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Industrial CMS Pro - Audit Logs", 14, 15);
    const tableRows = data.logs.map(log => [log.id, log.action, log.user, new Date(log.timestamp).toLocaleString()]);
    doc.autoTable(["ID", "Action", "User", "Timestamp"], tableRows, { startY: 20 });
    doc.save(`Logs_${Date.now()}.pdf`);
  };

  // --- NEW: EMAIL LOGS LOGIC ---
  const handleEmailLogs = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/audit/email`, { email: targetEmail });
      alert("Logs have been dispatched to: " + targetEmail);
      setShowMailModal(false);
      setTargetEmail('');
    } catch (err) {
      alert("Email service error. Check backend configuration.");
    }
  };

  if (!user) { /* ... keep login screen code same ... */ return null; }

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
          <h1>Industrial Hub <span style={{fontSize: '12px', color: '#05cd99'}}>● LIVE</span></h1>
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

        {/* --- Render Tabs (Dashboard, Content, Audit) as before --- */}
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

      {/* --- EMAIL MODAL --- */}
      {showMailModal && (
        <div className="modal-overlay">
          <div className="card" style={{width: '400px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h3>Email Audit Report</h3>
              <X onClick={()=>setShowMailModal(false)} cursor="pointer"/>
            </div>
            <form onSubmit={handleEmailLogs}>
              <input className="input-field" type="email" placeholder="Recipient Email" required value={targetEmail} onChange={e => setTargetEmail(e.target.value)} />
              <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>Send Logs</button>
            </form>
          </div>
        </div>
      )}

      {/* ... keep showModal code same ... */}
    </div>
  );
};

export default App;