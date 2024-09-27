const Database = require('better-sqlite3');
const db = new Database('TERA_GESTIONALE_DB.db', { verbose: console.log });
const mysql = require('mysql');

// Creazione delle tabelle
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
            Colore TEXT NOT NULL,
            Collaboratori TEXT
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

    db.prepare(queryCollaboratori).run();
    db.prepare(queryCommesse).run();
    db.prepare(queryEventi).run();
};

createTables();

// Verifica tabelle
const verifyTables = () => {
    try {
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log("Tables in the database:", tables);
    } catch (error) {
        console.error("Error verifying tables:", error);
    }
};

verifyTables();

// Popola il database SQLite con commesse da MySQL
// Popola il database SQLite con commesse da MySQL
const populateCommesseFromMySQL = (mysqlConnection) => {
    mysqlConnection.query('SELECT NOME, DESCRIZIONE FROM COMMESSE', (err, results) => {
        if (err) {
            console.error('Errore durante il fetch delle commesse da MySQL:', err);
        } else {
            const insertOrUpdate = db.prepare(`
                INSERT INTO Commesse (CommessaName, Descrizione, Colore, Collaboratori)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(CommessaName) DO UPDATE SET
                    Descrizione = excluded.Descrizione,
                    Colore = excluded.Colore;
            `);

            const insertMany = db.transaction((commesse) => {
                for (const commessa of commesse) {
                    insertOrUpdate.run(
                        commessa.NOME,
                        commessa.NOME,
                        '#000000', // Colore di default
                        '' // Collaboratori inizialmente vuoto
                    );
                }
            });
            insertMany(results);
            console.log('Database SQLite popolato con commesse da MySQL.');
        }
    });
};


// Funzione per aggiornare i collaboratori selezionati
const updateCollaboratoriSelezionati = (commesseSelezionate) => {
    try {
        const insertOrUpdate = db.prepare(`
            INSERT INTO Commesse (CommessaName, Descrizione, Colore, Collaboratori)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(CommessaName)
            DO UPDATE SET
                Collaboratori = excluded.Collaboratori;
        `);

        const updateCollaboratori = db.transaction((commesseSelezionate) => {
            for (const commessa of commesseSelezionate) {
                // Recupera i collaboratori esistenti per la commessa dal database SQLite
                const commessaDb = db.prepare(`SELECT Collaboratori FROM Commesse WHERE CommessaName = ?`).get(commessa.descrizione);

                // Inizializza il campo Collaboratori esistente, se non esiste sarà un array vuoto
                let existingCollaboratori = commessaDb && commessaDb.Collaboratori 
                    ? commessaDb.Collaboratori.split(',').map(c => c.trim()) 
                    : [];

   // Collaboratori selezionati nel menu
console.log(`collaboratori selezionati: ${commessa.collaboratori}`);

// Assicurati che collaboratori sia un array
const nuoviCollaboratori = Array.isArray(commessa.collaboratori)
    ? commessa.collaboratori.map(c => c.trim())
    : (typeof commessa.collaboratori === 'string' ? commessa.collaboratori.split(',').map(c => c.trim()) : []);

console.log(`nuovi collaboratori: ${nuoviCollaboratori}`);
                // Unione di collaboratori esistenti e nuovi, evitando duplicati
                const allCollaboratori = [...new Set([...existingCollaboratori, ...nuoviCollaboratori])];

                // Controllo se ci sono collaboratori da aggiornare
                if (allCollaboratori.length > 0) {
                    // Aggiorna la commessa con i collaboratori uniti
                    insertOrUpdate.run(
                        commessa.descrizione,
                        commessa.descrizione,
                        commessa.colore,
                        allCollaboratori.join(',')  // Unisce i collaboratori in una stringa separata da virgole
                    );
                } else {
                    console.log(`Nessun collaboratore da aggiornare per la commessa ${commessa.descrizione}`);
                }
            }
        });

        updateCollaboratori(commesseSelezionate);
        console.log('Collaboratori aggiornati correttamente.');
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dei collaboratori:', error);
    }
};



// Mantengo tutte le funzioni esistenti
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
            evento.IncaricatoId,
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

module.exports = {
    populateCommesseFromMySQL,
    updateCollaboratoriSelezionati,
    getAllCollaboratori,
    getAllCommesse,
    getAllEventi,
    createEvento,
    updateEvento,
    deleteEvento,
    verifyTables,
    createTables
};
