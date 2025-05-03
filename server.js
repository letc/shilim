const express = require('express');
const fs = require('fs/promises');
const xml2js = require('xml2js');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('.'));

const xmlFile = './data/projects.xml';
const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder();

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const data = await fs.readFile(xmlFile, 'utf8');
        const result = await parser.parseStringPromise(data);
        const projects = Array.isArray(result.projects.project) ? result.projects.project : [result.projects.project];
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update or add project
app.post('/api/projects', async (req, res) => {
    try {
        const data = await fs.readFile(xmlFile, 'utf8');
        const result = await parser.parseStringPromise(data);
        const projects = Array.isArray(result.projects.project) ? result.projects.project : [result.projects.project];
        
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

        const xml = builder.buildObject({ projects: { project: projects } });
        await fs.writeFile(xmlFile, xml);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete project
app.delete('/api/projects/:index', async (req, res) => {
    try {
        const data = await fs.readFile(xmlFile, 'utf8');
        const result = await parser.parseStringPromise(data);
        const projects = Array.isArray(result.projects.project) ? result.projects.project : [result.projects.project];
        
        const index = parseInt(req.params.index);
        if (index >= 0 && index < projects.length) {
            projects.splice(index, 1);
            const xml = builder.buildObject({ projects: { project: projects } });
            await fs.writeFile(xmlFile, xml);
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
