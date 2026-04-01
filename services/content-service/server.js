const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let logs = [{ action: "System Initialized", user: "System", timestamp: new Date() }];
let content = [{ title: "Welcome to CMS Pro", body: "Your live industrial dashboard is active.", author: "Admin" }];

app.get('/', (req, res) => {
    res.send("Industrial CMS Backend is Online 🚀");
});

app.get('/api/content', (req, res) => {
    res.json(content);
});

app.post('/api/content', (req, res) => {
    const entry = { ...req.body, timestamp: new Date() };
    content.push(entry);
    logs.push({ action: "Created Content", user: entry.author || "Admin", timestamp: new Date() });
    res.status(201).json(entry);
});

app.get('/api/audit/logs', (req, res) => {
    res.json(logs);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});