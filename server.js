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

// Log di controllo
app.post('/eventi', (req, res) => {
    console.log('Dati ricevuti per l\'inserimento:', req.body);
  
    const { Id, Descrizione, Inizio, Fine, CommessaId, IncaricatoId, Colore, Progresso } = req.body;
  
    // Log dei singoli campi
    console.log('Id:', Id);
    console.log('Descrizione:', Descrizione);
    console.log('Inizio:', Inizio);
    console.log('Fine:', Fine);
    console.log('CommessaId:', CommessaId);
    console.log('IncaricatoId:', IncaricatoId);
    console.log('Colore:', Colore);
    console.log('Progresso:', Progresso);
  
    const query = `INSERT INTO Eventi (Descrizione, Inizio, Fine, CommessaId, IncaricatoId, Colore, Progresso) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [Descrizione, Inizio, Fine, CommessaId, IncaricatoId, Colore, Progresso], function (err) {
      if (err) {
        console.error('Errore durante l\'inserimento nel database:', err);
        return res.status(500).json({ error: 'Errore durante l\'inserimento nel database' });
      }
      res.status(201).json({ id: this.lastID, ...req.body });
    });
  });
  
  app.put('/eventi/:id', (req, res) => {
    console.log('Dati ricevuti per l\'aggiornamento:', req.body);
  
    const { id } = req.params;
    const { Descrizione, Inizio, Fine, CommessaId, IncaricatoId, Colore, Progresso } = req.body;
  
    const query = `UPDATE Eventi SET Descrizione = ?, Inizio = ?, Fine = ?, CommessaId = ?, IncaricatoId = ?, Colore = ?, Progresso = ? WHERE Id = ?`;
    db.run(query, [Descrizione, Inizio, Fine, CommessaId, IncaricatoId, Colore, Progresso, id], function (err) {
      if (err) {
        console.error('Errore durante l\'aggiornamento nel database:', err);
        return res.status(500).json({ error: 'Errore durante l\'aggiornamento nel database' });
      }
      res.status(200).json({ id, ...req.body });
    });
  });
  
  app.delete('/eventi/:id', (req, res) => {
    console.log('Richiesta di cancellazione per l\'ID:', req.params.id);
  
    const { id } = req.params;
    const query = `DELETE FROM Eventi WHERE Id = ?`;
    db.run(query, id, function (err) {
      if (err) {
        console.error('Errore durante la cancellazione nel database:', err);
        return res.status(500).json({ error: 'Errore durante la cancellazione nel database' });
      }
      res.status(200).json({ id });
    });
  });



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
