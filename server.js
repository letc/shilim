const express = require('express');
const fs = require('fs/promises');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());
app.use(express.static('.'));

const jsonFile = './data/projects.json';

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const data = await fs.readFile(jsonFile, 'utf8');
        const jsonData = JSON.parse(data);
        const projects = jsonData.projects || [];
        res.json(Array.isArray(projects) ? projects : [projects]);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, return empty array
            res.json([]);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Update or add project
app.post('/api/projects', async (req, res) => {
    try {
        let projects = [];
        try {
            const data = await fs.readFile(jsonFile, 'utf8');
            const jsonData = JSON.parse(data);
            projects = jsonData.projects || [];
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }

        if (!Array.isArray(projects)) projects = [];
        
        const index = parseInt(req.body.projectIndex);
        const projectData = {
            title: req.body.title,
            author: req.body.author,
            date: req.body.date,
            primarycategory: req.body.primarycategory,
            secondarycategory: req.body.secondarycategory,
            link: req.body.link,
            details: req.body.details
        };

        if (index >= 0 && index < projects.length) {
            projects[index] = projectData;
        } else {
            projects.push(projectData);
        }

        await fs.writeFile(jsonFile, JSON.stringify({ projects }, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete project
app.delete('/api/projects/:index', async (req, res) => {
    try {
        const data = await fs.readFile(jsonFile, 'utf8');
        const projects = JSON.parse(data);
        
        const index = parseInt(req.params.index);
        if (index >= 0 && index < projects.length) {
            projects.splice(index, 1);
            await fs.writeFile(jsonFile, JSON.stringify({ projects }, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
