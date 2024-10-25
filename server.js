const express = require('express');
const { getRecords, runQuery } = require('./database');
const cors = require('cors'); // Importa il pacchetto cors
const app = express();


app.use(cors({
  origin: 'http://localhost:3000', // Imposta l'origine del frontend
  methods: ['GET', 'POST', 'DELETE'], // Limita i metodi consentiti
  allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Middleware per leggere JSON dal body



app.get('/api/collaboratori', async (req, res) => {
  try {
    const query = 'SELECT * FROM Collaboratori';
    const collaboratori = await getRecords(query);
    res.json(collaboratori);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'acquisizione dei collaboratori.' });
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
    TaskId         // `TaskId` mappa a `IncaricatoId`
  } = req.body;

  // Mappa i campi ai nomi usati nella query SQL
  const Descrizione = Subject;
  const Inizio = StartTime;
  const Fine = EndTime;
  const CommessaName = ProjectId;
  const IncaricatoId = TaskId;
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
  
  
app.get('/api/eventi', (req, res) => {
  const query = 'SELECT * FROM Eventi';

  getRecords(query)
    .then(eventi => {
      console.log('Dati eventi dal database:', eventi); // Log per conferma dati
      const mappedEvents = eventi.map(evento => ({
        Id: evento.Id,
        Subject: evento.Descrizione,          // Mappa `Descrizione` a `Subject`
        Location: "Studio Collaboratori",     // Imposta un valore fisso per `Location`
        StartTime: evento.Inizio,             // Mappa `Inizio` a `StartTime`
        EndTime: evento.Fine,                 // Mappa `Fine` a `EndTime`
        CategoryColor: evento.Colore || '#1aaa55', // Usa `Colore` o un colore predefinito
      }));

      console.log('Eventi mappati per il frontend:', mappedEvents); // Log per conferma mappatura
      res.json(mappedEvents);
    })
    .catch(err => {
      console.error('Errore durante il caricamento degli eventi dal database:', err);
      res.status(500).json({ error: 'Errore durante il caricamento degli eventi.' });
    });
});


  
  const port = 3001; // Assicurati che questa sia la porta corretta e non in conflitto
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  