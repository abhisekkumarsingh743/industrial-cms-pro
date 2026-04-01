const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let logs = [{ id: 1, action: "System Live", user: "System", timestamp: new Date() }];
let content = [{ id: 1, title: "Initial Post", body: "Welcome.", author: "Admin" }];

// --- FIXED EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'your-email@gmail.com', 
        pass: 'xxxx xxxx xxxx xxxx' // FIXED: Use 16-character App Password
    }
});

app.get('/api/content', (req, res) => res.json(content));
app.get('/api/audit/logs', (req, res) => res.json(logs));

app.post('/api/content', (req, res) => {
    const { title, body, author } = req.body;
    const newEntry = { id: content.length + 1, title, body, author: author || "Admin", timestamp: new Date() };
    content.push(newEntry);
    logs.push({ id: logs.length + 1, action: `Created: ${title}`, user: author || "Admin", timestamp: new Date() });
    res.status(201).json(newEntry);
});

app.post('/api/audit/email', async (req, res) => {
    const { email } = req.body;
    const logTable = logs.map(l => `[${new Date(l.timestamp).toLocaleString()}] ${l.action} by ${l.user}`).join('\n');

    const mailOptions = {
        from: '"Industrial CMS Pro" <your-email@gmail.com>',
        to: email,
        subject: 'Industrial CMS - System Audit Logs',
        text: `Requested logs:\n\n${logTable}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent" });
    } catch (error) {
        console.error("Mail Error:", error);
        res.status(500).json({ error: "SMTP Failed" }); // Triggers the frontend error popup
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));