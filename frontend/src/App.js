import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Shield, Lock, Download, Mail, X, Activity, Database, LogOut } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; //

const BASE_URL = "https://industrial-cms-pro.onrender.com";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`${BASE_URL}/api/audit/logs`)
        .then(res => setLogs(res.data))
        .catch(() => console.log("Connecting to server..."));
    }
  }, [user]);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Industrial Audit Report", 14, 15);
  
      autoTable(doc, {
        startY: 20,
        head: [['Action', 'User', 'Timestamp']],
        body: logs.map(l => [l.action, l.user, new Date(l.timestamp).toLocaleString()]),
        headStyles: { fillColor: [67, 24, 255] }
      });

      doc.save("audit_report.pdf");
    } catch (err) {
      alert("PDF Error: Please check console.");
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
        <div className="sidebar-brand" style={{fontSize: '24px', fontWeight: '800', color: '#4318ff', marginBottom: '40px'}}><Shield /> CMS PRO</div>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Database size={18}/> Dashboard</div>
        <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><Activity size={18}/> Audit Logs</div>
        <div style={{marginTop: 'auto'}}>
            <button className="btn-logout" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#a3aed0'}} onClick={() => { localStorage.clear(); setUser(null); }}><LogOut size={16}/> Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1 style={{fontSize: '34px', fontWeight: '700'}}>Industrial Dashboard</h1>
          <div className="header-actions" style={{display: 'flex', gap: '10px'}}>
            <button className="btn-secondary" style={{padding: '10px 20px', borderRadius: '10px', border: '1px solid #e0e5f2', background: 'white', cursor: 'pointer'}}><Mail size={18}/> Email Logs</button>
            <button className="btn-secondary" style={{padding: '10px 20px', borderRadius: '10px', border: '1px solid #e0e5f2', background: 'white', cursor: 'pointer'}} onClick={downloadPDF}><Download size={18}/> Export PDF</button>
          </div>
        </header>

        <div className="card">
          <h3 style={{marginBottom: '20px'}}>Recent Activity</h3>
          {logs.map((log, index) => (
            <div key={index} className="log-row">
              <span><strong>{log.action}</strong> by {log.user}</span>
              <span style={{color: '#a3aed0'}}>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;