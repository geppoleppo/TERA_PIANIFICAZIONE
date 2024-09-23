const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const mysql = require('mysql');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const mysqlConnection = mysql.createConnection({
    host: '93.49.98.201',
    port: 8085,
    user: 'geppolo',
    password: 'geppolo',
    database: 'gestionale'
});

mysqlConnection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

app.get('/api/commesse-mysql', (req, res) => {
    mysqlConnection.query('SELECT NOME FROM COMMESSE', (err, results) => {
        if (err) {
            console.error('Error fetching commesse:', err);
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

app.get('/api/collaboratori', (req, res) => {
    try {
        const collaboratori = db.getAllCollaboratori();
        res.json(collaboratori);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/commesse', (req, res) => {
    try {
        const commesse = db.getSelectedCommesse();
        res.json(commesse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/eventi', (req, res) => {
    try {
        const eventi = db.getAllEventi();
        res.json(eventi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/eventi', (req, res) => {
    try {
        const newEvento = db.createEvento(req.body);
        res.json(newEvento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/eventi/:id', (req, res) => {
    try {
        const updatedEvento = db.updateEvento(req.params.id, req.body);
        res.json(updatedEvento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/eventi/:id', (req, res) => {
    try {
        db.deleteEvento(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/update-sqlite', (req, res) => {
    try {
        const { commesse } = req.body;
        db.updateCommesse(commesse);
        res.json({ message: 'Commesse updated in SQLite' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
