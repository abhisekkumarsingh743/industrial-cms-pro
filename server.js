const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage for demonstration
let logs = [{ id: 1, action: "System Live", user: "System", timestamp: new Date() }];

// --- 1. BACKEND TEST MESSAGE ---
app.get('/', (req, res) => {
    res.status(200).send("🚀 Industrial CMS Pro Backend is running successfully!");
});

// --- 2. ROBUST SMTP CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'abhisekkumarsingh743@gmail.com', 
        pass: 'xxxx xxxx xxxx xxxx'
    }
});

app.get('/api/audit/logs', (req, res) => res.json(logs));

app.post('/api/audit/email', async (req, res) => {
    const { email } = req.body;
    const logSummary = logs.map(l => `[${new Date(l.timestamp).toLocaleString()}] ${l.action}`).join('\n');

    try {
        await transporter.sendMail({
            from: '"Industrial CMS Pro" <your-email@gmail.com>',
            to: email,
            subject: 'System Audit Logs',
            text: `Detailed logs attached below:\n\n${logSummary}`
        });
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Mail Error:", error);
        res.status(500).json({ error: "SMTP Authentication Failed" }); //
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));