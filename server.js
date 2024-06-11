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

app.get('/commesse', (req, res) => {
    try {
        const commesse = db.getAllCommesse();
        res.json(commesse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/eventi', (req, res) => {
    try {
        const eventi = db.getAllEventi();
        res.json(eventi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/eventi', (req, res) => {
    try {
        db.addEvento(req.body);
        res.status(201).send("Evento created");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/eventi/:id', (req, res) => {
    try {
        db.updateEvento({...req.body, Id: req.params.id});
        res.send("Evento updated");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/eventi/:id', (req, res) => {
    try {
        db.deleteEvento(req.params.id);
        res.send("Evento deleted");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
