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



// Funzione per recuperare i collaboratori dal database con il modello di getRecords
app.get('/api/collaboratori', async (req, res) => {
  try {
    const query = 'SELECT * FROM Collaboratori';
    const collaboratori = await getRecords(query);
    
    const formattedCollaboratori = collaboratori.map(collaboratore => ({
      ...collaboratore,
      groupIds: typeof collaboratore.groupIds === 'string' 
        ? collaboratore.groupIds.split(',').map(id => parseInt(id, 10))
        : [parseInt(collaboratore.groupIds, 10)] // Converte in array se è un singolo numero
    }));
    
    console.log("MERDAAA",collaboratori,formattedCollaboratori)
    res.json(collaboratori);

  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero dei collaboratori" });
  }
});



app.use(cors()); // Abilita CORS per tutte le richieste
app.use(express.json());

// Aggiungi un nuovo evento
app.post('/api/eventi', (req, res) => {
  //console.log('Corpo della richiesta:', req.body);
  
  const {
    Subject,       // `Subject` sarà la descrizione
    StartTime,     // `StartTime` sarà l’inizio dell’evento
    EndTime,       // `EndTime` sarà la fine dell’evento
    ProjectId,     // `ProjectId` mappa a `CommessaName`
    CollaboratoreId         // `CollaboratoreId` mappa a `IncaricatoId`
  } = req.body;

  // Mappa i campi ai nomi usati nella query SQL
  const Descrizione = Subject;
  const Inizio = StartTime;
  const Fine = EndTime;
  const CommessaName = ProjectId;
  const IncaricatoId = CollaboratoreId;
  const Colore = '#000000'; // Imposta un colore di default o mappa come necessario
  const Progresso = 0; // Imposta un valore di default per il progresso
  const Dipendenza = ''; // Imposta un valore vuoto per la dipendenza

  const query = `
    INSERT INTO Eventi (Descrizione, Inizio, Fine, CommessaName, IncaricatoId, Colore, Progresso, Dipendenza)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  runQuery(query, [Descrizione, Inizio, Fine, CommessaName, IncaricatoId, Colore, Progresso, Dipendenza])
    .then(result => {
      console.log('Evento salvato con successo:', result);
      res.status(201).json({ message: 'Evento aggiunto con successo.', id: result.id });
    })
    .catch(err => {
      console.error('Errore durante il salvataggio dell\'evento:', err);
      res.status(500).json({ error: 'Errore durante il salvataggio dell\'evento.' });
    });
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
      Subject: evento.Descrizione,
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
      SET Descrizione = ?, Inizio = ?, Fine = ?, CommessaName = ?, IncaricatoId = ?, Colore = ?
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
    console.log("Commesse caricate dal database:", commesse);
  } catch (error) {
    console.error('Errore durante il caricamento delle commesse:', error);
    res.status(500).json({ error: 'Errore durante il caricamento delle commesse.' });
  }
});
  
  const port = 3001; // Assicurati che questa sia la porta corretta e non in conflitto
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  