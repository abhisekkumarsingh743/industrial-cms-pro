const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory data (Restarts on Render sleep)
let logs = [{ id: 1, action: "System Live", user: "System", timestamp: new Date() }];
let contentEntries = []; // NEW: Stores the entries for your Content tab

// Root check
app.get('/', (req, res) => {
    res.status(200).send("🚀 Industrial CMS Pro Backend is active!");
});

// --- SMTP CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'abhisekkumarsingh743@gmail.com', 
        pass: 'xxxx xxxx xxxx xxxx' // MUST BE 16-DIGIT APP PASSWORD
    }
});

// --- LOG ROUTES ---
app.get('/api/audit/logs', (req, res) => res.json(logs));

// --- CONTENT ROUTES (RESTORING YOUR MISSING TAB) ---
app.get('/api/content/entries', (req, res) => {
    res.json(contentEntries);
});

app.post('/api/content/add', (req, res) => {
    const { title, status, user } = req.body;
    const newEntry = { title, status, id: Date.now() };
    
    contentEntries.push(newEntry);
    
    // Automatically log this action
    logs.unshift({
        id: logs.length + 1,
        action: `Added Entry: ${title}`,
        user: user || "Admin",
        timestamp: new Date()
    });

    res.status(201).json(newEntry);
});

// --- EMAIL LOGIC ---
app.post('/api/audit/email', async (req, res) => {
    const { email } = req.body;
    const logSummary = logs.map(l => `[${new Date(l.timestamp).toLocaleString()}] ${l.action}`).join('\n');

    try {
        await transporter.sendMail({
            from: '"Industrial CMS Pro" <abhisekkumarsingh743@gmail.com>', // MUST MATCH AUTH USER
            to: email,
            subject: 'System Audit Logs',
            text: `Detailed logs attached below:\n\n${logSummary}`
        });
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Mail Error:", error);
        res.status(500).json({ error: "SMTP Authentication Failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));