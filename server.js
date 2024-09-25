const sqlite3 = require('sqlite3').verbose(); // Importa il modulo sqlite3
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

// Aggiorna o inserisce le commesse nel database SQLite
// Endpoint per aggiornare le commesse in SQLite
app.post('/api/update-sqlite', (req, res) => {
    const { commesse } = req.body;
  
    try {
      const db = new sqlite3.Database('database.sqlite'); // Assicurati che il percorso sia corretto
  
      // Log dei dati ricevuti
      console.log('Dati ricevuti per aggiornamento commesse:', commesse);
  
      // Inizia una transazione
      db.serialize(() => {
        db.run("BEGIN TRANSACTION", (err) => {
          if (err) {
            console.error('Errore durante l\'inizio della transazione:', err.message);
            return res.status(500).json({ success: false, message: 'Errore durante l\'inizio della transazione', error: err.message });
          }
  
          commesse.forEach(commessa => {
            console.log('Elaborazione commessa:', commessa);
  
            db.run(`
              INSERT INTO Commesse (CommessaName, Descrizione, Colore, Collaboratori)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(CommessaName) 
              DO UPDATE SET Collaboratori = excluded.Collaboratori, Colore = excluded.Colore;
            `, [commessa.descrizione, commessa.descrizione, commessa.colore, commessa.collaboratori], function (err) {
              if (err) {
                console.error('Errore durante l\'inserimento o aggiornamento della commessa:', err.message);
              }
            });
          });
  
          db.run("COMMIT", (err) => {
            if (err) {
              console.error('Errore durante il commit della transazione:', err.message);
              return res.status(500).json({ success: false, message: 'Commit failed', error: err.message });
            }
            res.json({ success: true, message: 'Commesse updated successfully' });
          });
        });
      });
  
    } catch (error) {
      console.error('Errore generale durante l\'aggiornamento delle commesse:', error.message);
      res.status(500).json({ success: false, message: 'Error updating commesse', error: error.message });
    }
  });
  
  
  

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
