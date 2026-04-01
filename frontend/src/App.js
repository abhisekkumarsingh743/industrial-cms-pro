import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Shield, Lock, Download, Mail, X, Activity, Database, LogOut, Plus } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // FIXED: Proper import for plugin

const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [targetEmail, setTargetEmail] = useState('');
  const [showMailModal, setShowMailModal] = useState(false);

  useEffect(() => {
    if (user) {
      axios.get(`${BASE_URL}/api/audit/logs`)
        .then(res => setLogs(res.data))
        .catch(err => console.error("Syncing with backend..."));
    }
  }, [user]);

  // FIXED PDF LOGIC: Uses autoTable(doc, ...) directly
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Industrial CMS Audit Report", 14, 20);
      
      const tableRows = logs.map(l => [l.id, l.action, l.user, new Date(l.timestamp).toLocaleString()]);

      autoTable(doc, {
        startY: 25,
        head: [['ID', 'Action', 'User', 'Timestamp']],
        body: tableRows,
        headStyles: { fillColor: [67, 24, 255] },
        theme: 'striped'
      });

      doc.save(`Audit_Log_${Date.now()}.pdf`);
    } catch (err) {
      alert("PDF Error: Ensure jspdf-autotable is installed correctly.");
    }
  };

  const handleEmailLogs = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/audit/email`, { email: targetEmail });
      alert("Logs dispatched to " + targetEmail);
      setShowMailModal(false);
    } catch (err) {
      alert("Email Service Error. Check backend SMTP settings.");
    }
  };

  // ELITE LOGIN DESIGN
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="icon-badge"><Shield size={40} color="#4318ff" /></div>
          <h1>CMS PRO LOGIN</h1>
          <button className="login-btn" onClick={() => { localStorage.setItem('user', 'Admin'); setUser('Admin'); }}>
            <Lock size={18} /> Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand"><Shield /> CMS PRO</div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Overview</div>
          <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        </nav>
        <button className="logout-link" onClick={() => { localStorage.clear(); setUser(null); }}><LogOut size={16}/> Sign Out</button>
      </aside>

      <main className="main-stage">
        <header className="main-header">
          <h1>Industrial Dashboard <span className="live-indicator">● LIVE</span></h1>
          {activeTab === 'audit' && (
            <div className="action-bar">
              <button className="action-btn" onClick={() => setShowMailModal(true)}><Mail size={18}/> Email Logs</button>
              <button className="action-btn" onClick={downloadPDF}><Download size={18}/> Export PDF</button>
            </div>
          )}
        </header>

        <section className="content-area">
          <div className="glass-card">
            <h3>Recent Audit Activity</h3>
            <div className="log-list">
              {logs.map(log => (
                <div key={log.id} className="log-entry">
                  <span><strong>{log.action}</strong> by {log.user}</span>
                  <span className="timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {showMailModal && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-head"><h3>Email Audit Report</h3><X onClick={()=>setShowMailModal(false)} cursor="pointer"/></div>
            <form onSubmit={handleEmailLogs}>
              <input className="modal-input" type="email" placeholder="Recipient Gmail" required value={targetEmail} onChange={e => setTargetEmail(e.target.value)} />
              <button type="submit" className="login-btn">Send Logs</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;