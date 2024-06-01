const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/collaboratori', (req, res) => {
    try {
        const collaboratori = db.getAllCollaboratori();
        res.json(collaboratori);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/collaboratori', (req, res) => {
    const { nome, colore, immagine } = req.body;
    try {
        const id = db.addCollaboratore(nome, colore, immagine);
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/collaboratori/:id', (req, res) => {
    const { id } = req.params;
    const { nome, colore, immagine } = req.body;
    try {
        db.updateCollaboratore(id, nome, colore, immagine);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/collaboratori/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.deleteCollaboratore(id);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/commesse', (req, res) => {
    try {
        const commesse = db.getAllCommesse();
        res.json(commesse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/commesse', (req, res) => {
    const { descrizione, colore } = req.body;
    try {
        const id = db.addCommessa(descrizione, colore);
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/commesse/:id', (req, res) => {
    const { id } = req.params;
    const { descrizione, colore } = req.body;
    try {
        db.updateCommessa(id, descrizione, colore);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/commesse/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.deleteCommessa(id);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/gantttasks', (req, res) => {
    try {
        const ganttTasks = db.getAllGanttTasks();
        res.json(ganttTasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/gantttasks', (req, res) => {
    try {
        const id = db.addGanttTask(req.body);
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route for updating Gantt tasks
app.put('/gantttasks/:id', (req, res) => {
    try {
        db.updateGanttTask(req.params.id, req.body);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
  

app.delete('/gantttasks/:id', (req, res) => {
    try {
        db.deleteGanttTask(req.params.id);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/schedulerevents', (req, res) => {
    try {
        const schedulerEvents = db.getAllSchedulerEvents();
        console.log('Loaded scheduler events from database:', schedulerEvents); // Log per debug
        res.json(schedulerEvents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/schedulerevents', (req, res) => {
    console.log('Received event data:', req.body); // Log per debug
    try {
        const id = db.addSchedulerEvent(req.body);
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/schedulerevents/:id', (req, res) => {
    try {
        db.updateSchedulerEvent(req.params.id, req.body);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/schedulerevents/:id', (req, res) => {
    console.log('Received delete request for EventID:', req.params.id); // Log per debug
    try {
        db.deleteSchedulerEvent(req.params.id);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
