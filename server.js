const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./TERA_GESTIONALE_DB.db');

app.use(cors());
app.use(bodyParser.json());

// Rotte per i Collaboratori
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

// Rotte per le Commesse
app.get('/commesse', (req, res) => {
    try {
        const commesse = db.getAllCommesse();
        res.json(commesse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/commesse/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM Commesse WHERE Id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
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

app.get('/collaboratori', (req, res) => {
  db.all('SELECT * FROM Collaboratori', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});
app.get('/commessa-colors', (req, res) => {
  db.all('SELECT Id, Colore FROM Commesse', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});