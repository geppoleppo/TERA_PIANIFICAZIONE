const Database = require('better-sqlite3');
const db = new Database('TERA_GESTIONALE_DB.db', { verbose: console.log });

const createTables = () => {
    const queryCollaboratori = `
        CREATE TABLE IF NOT EXISTS Collaboratori (
            Id INTEGER PRIMARY KEY,
            Nome TEXT NOT NULL,
            Colore TEXT NOT NULL,
            Immagine TEXT
        );
    `;

    const queryCommesse = `
        CREATE TABLE IF NOT EXISTS Commesse (
            CommessaName TEXT PRIMARY KEY,
            Descrizione TEXT NOT NULL,
            Colore TEXT NOT NULL
        );
    `;

    const queryEventi = `
        CREATE TABLE IF NOT EXISTS Eventi (
            Id INTEGER PRIMARY KEY,
            Descrizione TEXT NOT NULL,
            Inizio TEXT NOT NULL,
            Fine TEXT NOT NULL,
            CommessaName TEXT,
            IncaricatoId TEXT,
            Colore TEXT,
            Progresso INTEGER,
            Dipendenza TEXT
        );
    `;

    // Nuova tabella per tracciare le commesse associate ai collaboratori
    const queryCommesseCollaboratori = `
        CREATE TABLE IF NOT EXISTS CommesseCollaboratori (
            CollaboratoreID INTEGER NOT NULL,
            CommessaName TEXT NOT NULL,
            PRIMARY KEY (CollaboratoreID, CommessaName),
            FOREIGN KEY (CollaboratoreID) REFERENCES Collaboratori(Id),
            FOREIGN KEY (CommessaName) REFERENCES Commesse(CommessaName)
        );
    `;

    // Esegui le query per creare le tabelle
    db.prepare(queryCollaboratori).run();
    db.prepare(queryCommesse).run();
    db.prepare(queryEventi).run();
    db.prepare(queryCommesseCollaboratori).run(); // Nuova tabella per associare commesse e collaboratori
};

createTables();


const verifyTables = () => {
    try {
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log("Tables in the database:", tables);
    } catch (error) {
        console.error("Error verifying tables:", error);
    }
};

verifyTables();


const getAllCollaboratori = () => {
    try {
        const query = `SELECT * FROM Collaboratori`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve collaborators.");
    }
};

const getAllCommesse = () => {
    try {
        const query = `SELECT * FROM Commesse`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve projects.");
    }
};

const getCommesseByCollaboratore = (collaboratoreId) => {
    try {
        const query = `
            SELECT C.CommessaName, C.Descrizione, C.Colore
            FROM Commesse C
            JOIN CommesseCollaboratori CC ON C.CommessaName = CC.CommessaName
            WHERE CC.CollaboratoreID = ?;
        `;
        return db.prepare(query).all(collaboratoreId);
    } catch (error) {
        console.error("Errore nel recupero delle commesse per il collaboratore:", error);
        throw new Error("Failed to retrieve projects for collaborator.");
    }
};


// Associa nuove commesse al collaboratore (già esistente)
const associateCommessaCollaboratore = (collaboratoreId, commessaName, colore) => {
    try {
        const query = `
            INSERT OR REPLACE INTO CommesseCollaboratori (CollaboratoreID, CommessaName, Colore)
            VALUES (?, ?, ?);
        `;
        db.prepare(query).run(collaboratoreId, commessaName, colore);
        console.log(`Commessa ${commessaName} associata al collaboratore ${collaboratoreId}`);
    } catch (error) {
        console.error("Errore nell'associare la commessa al collaboratore:", error);
        throw new Error("Failed to associate project to collaborator.");
    }
};
const getCommesseComuni = (collaboratoriIds) => {
    try {
        const placeholders = collaboratoriIds.map(() => '?').join(',');
        const query = `
            SELECT CommessaName
            FROM CommesseCollaboratori
            WHERE CollaboratoreID IN (${placeholders})
            GROUP BY CommessaName
            HAVING COUNT(DISTINCT CollaboratoreID) = ?;
        `;
        return db.prepare(query).all(...collaboratoriIds, collaboratoriIds.length);
    } catch (error) {
        console.error("Errore nel recupero delle commesse comuni:", error);
        throw new Error("Failed to retrieve common commesse.");
    }
};


const getAllEventi = () => {
    try {
        const query = `SELECT * FROM Eventi`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve events.");
    }
};

const createEvento = (evento) => {
    try {
      const query = `
        INSERT INTO Eventi (Descrizione, Inizio, Fine, CommessaName, IncaricatoId, Colore, Progresso, Dipendenza)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        evento.Descrizione,
        evento.Inizio,
        evento.Fine,
        evento.CommessaName,
        evento.IncaricatoId,  // Questo campo può contenere più collaboratori separati da virgola
        evento.Colore || '',
        evento.Progresso || 0,
        evento.Dipendenza || ''
      ];
      console.log('Create Event Params:', params);
      const result = db.prepare(query).run(params);
      return { ...evento, Id: result.lastInsertRowid };
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create event.");
    }
  };
  

const updateEvento = (id, evento) => {
    try {
        const query = `
            UPDATE Eventi
            SET Descrizione = ?, Inizio = ?, Fine = ?, CommessaName = ?, Colore = ?, Progresso = ?, IncaricatoId = ?, Dipendenza = ?
            WHERE Id = ?
        `;
        const params = [
            evento.Descrizione || evento.Subject || 'No Description',
            evento.Inizio || new Date().toISOString(),
            evento.Fine || new Date().toISOString(),
            evento.CommessaName,
            evento.Colore || '',
            evento.Progresso || 0,
            evento.IncaricatoId,
            evento.Dipendenza || '',
            id
        ];
        console.log('Update Event Params:', params);
        const result = db.prepare(query).run(params);
        return { ...evento, Id: id };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to update event.");
    }
};

const deleteEvento = (id) => {
    try {
        const query = `DELETE FROM Eventi WHERE Id = ?`;
        db.prepare(query).run(id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to delete event.");
    }
};

const updateCommesse = (commesse) => {
    try {
        const insert = db.prepare(`
            INSERT OR REPLACE INTO Commesse (CommessaName, Descrizione, Colore)
            VALUES (?, ?, ?)
        `);
        const insertMany = db.transaction((commesse) => {
            for (const commessa of commesse) {
                insert.run(commessa.NOME, commessa.Descrizione || 'Descrizione non disponibile', commessa.Colore || '#FFFFFF');
            }
        });
        insertMany(commesse);
        console.log('Commesse aggiornate con successo in SQLite');
    } catch (error) {
        console.error("Errore nell'aggiornamento delle commesse in SQLite:", error);
        throw new Error("Failed to update commesse.");
    }
};


// Rimuovi tutte le commesse associate a un collaboratore
const removeAllCommesseFromCollaboratore = (collaboratoreId) => {
    try {
        const query = `
            DELETE FROM CommesseCollaboratori
            WHERE CollaboratoreID = ?;
        `;
        db.prepare(query).run(collaboratoreId);
        console.log(`Tutte le commesse rimosse per il collaboratore ${collaboratoreId}`);
    } catch (error) {
        console.error("Errore nella rimozione delle commesse dal collaboratore:", error);
        throw new Error("Failed to remove all projects from collaborator.");
    }
};






const getSelectedCommesse = () => {
    try {
        const query = `SELECT * FROM Commesse`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve selected commesse.");
    }
};


module.exports = {
    getCommesseComuni,
    getAllCollaboratori,
    getAllCommesse,
    getCommesseByCollaboratore,
    associateCommessaCollaboratore,
    getAllEventi,
    createEvento,
    updateEvento,
    deleteEvento,
    updateCommesse,
    getSelectedCommesse,
    removeAllCommesseFromCollaboratore
};
