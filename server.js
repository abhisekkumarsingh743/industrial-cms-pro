const express = require('express');
const cors = require('cors');
const app = express();

// Use dynamic port for Render or 5000 for local
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Essential for processing POST requests

// In-memory data (resets on server restart)
let logs = [{ id: 1, action: "System Live", user: "System", timestamp: new Date() }];
let content = [{ id: 1, title: "Initial Post", body: "Welcome to the live dashboard.", author: "Admin" }];

// Routes
app.get('/', (req, res) => res.send("Industrial CMS Backend is Online 🚀"));

app.get('/api/content', (req, res) => res.json(content));

app.get('/api/audit/logs', (req, res) => res.json(logs));

app.post('/api/content', (req, res) => {
    const { title, body, author } = req.body;
    
    if (!title || !body) {
        return res.status(400).json({ error: "Title and Body are required" });
    }

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

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));