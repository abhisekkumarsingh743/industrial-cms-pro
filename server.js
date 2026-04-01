const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data
let logs = [{ id: 1, action: "System Live", user: "System", timestamp: new Date() }];
let content = [{ id: 1, title: "Initial Post", body: "Welcome to the industrial dashboard.", author: "Admin" }];

// --- EMAIL CONFIGURATION ---
// IMPORTANT: Use a Google "App Password", not your regular password.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', 
        pass: 'your-app-password'     
    }
});

app.get('/', (req, res) => res.send("Industrial CMS API is Online"));

app.get('/api/content', (req, res) => res.json(content));
app.get('/api/audit/logs', (req, res) => res.json(logs));

app.post('/api/content', (req, res) => {
    const { title, body, author } = req.body;
    const newEntry = { 
        id: content.length + 1, 
        title, 
        body, 
        author: author || "Admin", 
        timestamp: new Date() 
    };
    content.push(newEntry);
    logs.push({ 
        id: logs.length + 1, 
        action: `Created: ${title}`, 
        user: author || "Admin", 
        timestamp: new Date() 
    });
    res.status(201).json(newEntry);
});

// --- EMAIL LOGS ENDPOINT ---
app.post('/api/audit/email', async (req, res) => {
    const { email } = req.body;
    
    const logTable = logs.map(l => 
        `[${new Date(l.timestamp).toLocaleString()}] ${l.action} by ${l.user}`
    ).join('\n');

    const mailOptions = {
        from: '"Industrial CMS Pro" <your-email@gmail.com>',
        to: email,
        subject: 'Industrial CMS - System Audit Logs Report',
        text: `Attached below are the system audit logs:\n\n${logTable}\n\nGenerated at: ${new Date().toLocaleString()}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Mail Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));