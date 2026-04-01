import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Shield, Lock, Download, Mail, X, Activity, Database, LogOut } from 'lucide-react';
import jsPDF from 'jspdf';
// --- FIXED PDF IMPORT ---
import autoTable from 'jspdf-autotable'; 

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
        .catch(err => console.error("Server waking up..."));
    }
  }, [user]);

  // --- FIXED PDF EXPORT LOGIC ---
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Industrial CMS Audit Report", 14, 15);
      
      const body = logs.map(l => [l.id, l.action, l.user, new Date(l.timestamp).toLocaleString()]);
      
      autoTable(doc, {
        startY: 20,
        head: [['ID', 'Action', 'User', 'Timestamp']],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [67, 24, 255] }
      });

      doc.save("audit_report.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error: Ensure jspdf-autotable is installed."); //
    }
  };

  const handleEmailLogs = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/audit/email`, { email: targetEmail });
      alert("Email sent successfully!");
      setShowMailModal(false);
    } catch (err) {
      alert("Email Service Error. Check backend SMTP settings."); //
    }
  };

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <Shield size={48} color="#4318ff" />
          <h2>CMS PRO LOGIN</h2>
          <button className="btn-primary" onClick={() => { localStorage.setItem('user', 'Admin'); setUser('Admin'); }}>
            <Lock size={18} /> Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="brand"><Shield /> CMS PRO</div>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Dashboard</div>
        <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        <button className="btn-logout" onClick={() => { localStorage.clear(); setUser(null); }}><LogOut size={16}/> Logout</button>
      </nav>

      <main className="main-content">
        <header className="header">
          <h1>Industrial Dashboard</h1>
          {activeTab === 'audit' && (
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => setShowMailModal(true)}><Mail size={18}/> Email Logs</button>
              <button className="btn-secondary" onClick={downloadPDF}><Download size={18}/> Export PDF</button>
            </div>
          )}
        </header>

        <div className="card">
          <h3>Recent Activity</h3>
          {logs.map(log => (
            <div key={log.id} className="log-row">
              <span><strong>{log.action}</strong> by {log.user}</span>
              <span className="timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </main>

      {showMailModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header"><h3>Email Report</h3><X onClick={()=>setShowMailModal(false)} cursor="pointer"/></div>
            <form onSubmit={handleEmailLogs}>
              <input className="input-field" type="email" placeholder="Recipient Email" required value={targetEmail} onChange={e => setTargetEmail(e.target.value)} />
              <button type="submit" className="btn-primary">Send Logs</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;