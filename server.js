const express = require('express');
const { getRecords, runQuery } = require('./database');
const cors = require('cors'); // Importa il pacchetto cors
const app = express();


app.use(cors({
  origin: 'http://localhost:3000', // Imposta l'origine del frontend
  methods: ['GET', 'POST', 'DELETE','PUT'], // Limita i metodi consentiti
  allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Middleware per leggere JSON dal body




// Funzione per ottenere i collaboratori duplicati in base ai loro groupIds
app.get('/api/collaboratori', async (req, res) => {
  try {
    const query = 'SELECT * FROM Collaboratori';
    const collaboratori = await getRecords(query);

    const formattedCollaboratori = collaboratori.map(collaboratore => ({
      Id: collaboratore.Id,
      Nome: collaboratore.Nome,
      Colore: collaboratore.Colore,
      Immagine: collaboratore.Immagine,
      groupIds: collaboratore.groupIds ? collaboratore.groupIds.split(',').map(id => parseInt(id, 10)) : []
    }));

    res.json(formattedCollaboratori);
  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero dei collaboratori" });
  }
});


app.use(cors()); // Abilita CORS per tutte le richieste
app.use(express.json());


// Aggiungi un nuovo evento
app.post('/api/eventi', (req, res) => {
  const {
    Subject,       // Titolo dell'evento
    StartTime,     // Inizio dell'evento
    EndTime,       // Fine dell'evento
    ProjectId,     // ID della commessa
    CollaboratoreId, // ID del collaboratore
    Description    // Aggiungi Descrizione per il summary
  } = req.body;

  // Log per verificare i dati ricevuti dal client
  //console.log("Dati ricevuti per l'inserimento dell'evento:", req.body);

  // Mappa i campi ai nomi usati nella query SQL
  const Titolo = Subject;
  const Inizio = StartTime;
  const Fine = EndTime;
  const CommessaName = ProjectId;
  const IncaricatoId = CollaboratoreId;
  const Colore = '#000000'; // Colore di default o mappa come necessario
  const Progresso = 0; // Valore di default per il progresso
  const Dipendenza = ''; // Valore vuoto per la dipendenza
  const Descrizione = Description; // Mappa il summary nel campo Descrizione

  //console.log("Titolo:", Titolo);
  //console.log("Inizio:", Inizio);
  //console.log("Fine:", Fine);
  //console.log("CommessaName:", CommessaName);
  //console.log("IncaricatoId:", IncaricatoId);
  //console.log("Colore:", Colore);
  //console.log("Descrizione:", Descrizione);

  const query = `
    INSERT INTO Eventi (Titolo, Inizio, Fine, CommessaName, IncaricatoId, Colore, Progresso, Dipendenza, Descrizione)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  runQuery(query, [Titolo, Inizio, Fine, CommessaName, IncaricatoId, Colore, Progresso, Dipendenza, Descrizione])
    .then(result => {
      console.log('Evento salvato con successo:', result);
      res.status(201).json({ message: 'Evento aggiunto con successo.', id: result.id });
    })
    .catch(err => {
      console.error('Errore durante il salvataggio dell\'evento:', err);
      res.status(500).json({ error: 'Errore durante il salvataggio dell\'evento.' });
    });
});



// Aggiorna commesse e colori nel database quando vengono aggiunti ai collaboratori
app.put('/api/collaboratori/:id/aggiungi-commesse', async (req, res) => {
  const { id } = req.params;
  const { commesseIds } = req.body;

  try {
    const collaboratore = await getRecords('SELECT * FROM Collaboratori WHERE Id = ?', [id]);
    if (collaboratore.length === 0) return res.status(404).json({ error: 'Collaboratore non trovato' });

    const groupIds = collaboratore[0].groupIds ? collaboratore[0].groupIds.split(',').map(Number) : [];
    const updatedGroupIds = Array.from(new Set([...groupIds, ...commesseIds.map(commessa => commessa.id)])); // Evita duplicati

    // Aggiorna solo il campo `groupIds` nei collaboratori
    await runQuery('UPDATE Collaboratori SET groupIds = ? WHERE Id = ?', [updatedGroupIds.join(','), id]);

    // Aggiorna il colore della commessa solo nella tabella Commesse
    for (const commessa of commesseIds) {
      await runQuery('UPDATE Commesse SET Colore = ? WHERE Id = ?', [commessa.color, commessa.id]);
    }

    res.json({ message: 'Commesse e colori aggiunti con successo.' });
  } catch (error) {
    console.error("Errore durante l'aggiornamento delle commesse del collaboratore:", error);
    res.status(500).json({ error: "Errore durante l'aggiornamento delle commesse del collaboratore." });
  }
});



app.put('/api/eventi/:id', async (req, res) => {
  const { id } = req.params;
  const { Subject, StartTime, EndTime, ProjectId, CollaboratoreId, CategoryColor, Description } = req.body;

  try {
    const query = `
      UPDATE Eventi
      SET Titolo = ?, Inizio = ?, Fine = ?, CommessaName = ?, IncaricatoId = ?, Colore = ?, Descrizione = ?
      WHERE Id = ?
    `;
    await runQuery(query, [
      Subject,
      StartTime,
      EndTime,
      ProjectId.toString(),
      CollaboratoreId,  // Passiamo il CollaboratoreId come stringa corretta
      CategoryColor,
      Description,  // Aggiungi il campo Descrizione
      id
    ]);
    res.json({ message: 'Evento aggiornato con successo!' });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dell\'evento:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'evento.' });
  }
});





// Modifica l’endpoint di DELETE
app.delete('/api/eventi/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM Eventi WHERE Id = ?`;

  runQuery(query, [id])
    .then(() => {
      res.status(200).json({ message: 'Evento eliminato con successo.' });
    })
    .catch(err => {
      res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'evento.' });
    });
});
;
  
  
app.get('/api/eventi', async (req, res) => {
  try {
    const query = 'SELECT * FROM Eventi';
    const eventi = await getRecords(query);

    const mappedEventi = eventi.map(evento => ({
      Id: evento.Id,
      Subject: evento.Titolo,
      StartTime: evento.Inizio,
      EndTime: evento.Fine,
      ProjectId: parseInt(evento.CommessaName, 10), // Converti ProjectId in numero
      CollaboratoreId: evento.IncaricatoId.split(',').map(id => parseInt(id, 10)), // Converti CollaboratoreId in array di numeri
      CategoryColor: evento.Colore || "#000000"
    }));

    //console.log('Dati eventi dal database (formattati):', mappedEventi); // Verifica i dati nel formato corretto
    res.json(mappedEventi);
  } catch (error) {
    console.error('Errore durante il recupero degli eventi:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli eventi.' });
  }
});

app.put('/api/eventi/:id', async (req, res) => {
  const { id } = req.params;
  const { Subject, StartTime, EndTime, ProjectId, CollaboratoreId, CategoryColor } = req.body;

  try {
    const query = `
      UPDATE Eventi
      SET Titolo = ?, Inizio = ?, Fine = ?, CommessaName = ?, IncaricatoId = ?, Colore = ?
      WHERE Id = ?
    `;
    await runQuery(query, [
      Subject,
      StartTime,
      EndTime,
      ProjectId.toString(),
      CollaboratoreId,  // Ora dovrebbe essere una stringa nel formato corretto
      CategoryColor,
      id
    ]);
    res.json({ message: 'Evento aggiornato con successo!' });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dell\'evento:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'evento.' });
  }
});
  

app.get('/api/commesse', async (req, res) => {
  try {
    const query = 'SELECT Id, CommessaName AS text, Colore AS color FROM Commesse';
    const commesse = await getRecords(query);
    res.json(commesse);
    //console.log("Commesse caricate dal database:", commesse);
  } catch (error) {
    console.error('Errore durante il caricamento delle commesse:', error);
    res.status(500).json({ error: 'Errore durante il caricamento delle commesse.' });
  }
});

// Endpoint per ottenere i dettagli di un singolo collaboratore
app.get('/api/collaboratori/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM Collaboratori WHERE Id = ?';
    const result = await getRecords(query, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Collaboratore non trovato' });
    }

    // Formatta il risultato come il resto dei collaboratori
    const collaboratore = result[0];
    const formattedCollaboratore = {
      Id: collaboratore.Id,
      Nome: collaboratore.Nome,
      Colore: collaboratore.Colore,
      Immagine: collaboratore.Immagine,
      groupIds: collaboratore.groupIds ? collaboratore.groupIds.split(',').map(id => parseInt(id, 10)) : []
    };

    res.json(formattedCollaboratore);
  } catch (error) {
    console.error("Errore nel recupero del collaboratore:", error);
    res.status(500).json({ error: "Errore nel recupero del collaboratore." });
  }
});


// Endpoint per rimuovere commesse da un collaboratore
app.put('/api/collaboratori/:id/rimuovi-commesse', async (req, res) => {
  const { id } = req.params;
  const { commesseIds } = req.body;

  try {
    const collaboratore = await getRecords('SELECT * FROM Collaboratori WHERE Id = ?', [id]);
    if (collaboratore.length === 0) return res.status(404).json({ error: 'Collaboratore non trovato' });

    // Recupera gli attuali groupIds e rimuove quelli specificati
    const groupIds = collaboratore[0].groupIds ? collaboratore[0].groupIds.split(',').map(Number) : [];
    const updatedGroupIds = groupIds.filter(gId => !commesseIds.includes(gId));

    // Aggiorna il campo groupIds del collaboratore con i nuovi valori
    await runQuery('UPDATE Collaboratori SET groupIds = ? WHERE Id = ?', [updatedGroupIds.join(','), id]);

    res.json({ message: 'Commesse rimosse dal collaboratore con successo.' });
  } catch (error) {
    console.error("Errore durante la rimozione delle commesse:", error);
    res.status(500).json({ error: "Errore durante la rimozione delle commesse dal collaboratore." });
  }
});


  
  const port = 3001; // Assicurati che questa sia la porta corretta e non in conflitto
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  