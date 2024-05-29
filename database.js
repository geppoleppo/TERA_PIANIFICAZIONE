const Database = require('better-sqlite3');
const db = new Database('TERA_GESTIONALE_DB.db', { verbose: console.log });

// Creazione delle tabelle se non esistono
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
            Id INTEGER PRIMARY KEY,
            Descrizione TEXT NOT NULL,
            Colore TEXT NOT NULL
        );
    `;

    db.prepare(queryCollaboratori).run();
    db.prepare(queryCommesse).run();
};

createTables();

// Funzione per aggiungere un nuovo collaboratore
const addCollaboratore = (nome, colore, immagine) => {
    try {
        const query = `INSERT INTO Collaboratori (Nome, Colore, Immagine) VALUES (?, ?, ?)`;
        const stmt = db.prepare(query);
        const info = stmt.run(nome, colore, immagine);
        return info.lastInsertRowid;
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to add collaborator.");
    }
};

// Funzione per aggiungere una nuova commessa
const addCommessa = (descrizione, colore) => {
    try {
        const query = `INSERT INTO Commesse (Descrizione, Colore) VALUES (?, ?)`;
        const stmt = db.prepare(query);
        const info = stmt.run(descrizione, colore);
        return info.lastInsertRowid;
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to add project.");
    }
};

// Funzione per ottenere tutti i collaboratori
const getAllCollaboratori = () => {
    try {
        const query = `SELECT * FROM Collaboratori`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve collaborators.");
    }
};

// Funzione per ottenere tutte le commesse
const getAllCommesse = () => {
    try {
        const query = `SELECT * FROM Commesse`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve projects.");
    }
};

// Funzione per aggiornare un collaboratore
const updateCollaboratore = (id, nome, colore, immagine) => {
    try {
        const query = `UPDATE Collaboratori SET Nome = ?, Colore = ?, Immagine = ? WHERE Id = ?`;
        const stmt = db.prepare(query);
        stmt.run(nome, colore, immagine, id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to update collaborator.");
    }
};

// Funzione per aggiornare una commessa
const updateCommessa = (id, descrizione, colore) => {
    try {
        const query = `UPDATE Commesse SET Descrizione = ?, Colore = ? WHERE Id = ?`;
        const stmt = db.prepare(query);
        stmt.run(descrizione, colore, id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to update project.");
    }
};

// Funzione per eliminare un collaboratore
const deleteCollaboratore = (id) => {
    try {
        const query = `DELETE FROM Collaboratori WHERE Id = ?`;
        const stmt = db.prepare(query);
        stmt.run(id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to delete collaborator.");
    }
};

// Funzione per eliminare una commessa
const deleteCommessa = (id) => {
    try {
        const query = `DELETE FROM Commesse WHERE Id = ?`;
        const stmt = db.prepare(query);
        stmt.run(id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to delete project.");
    }
};

module.exports = {
    addCollaboratore,
    addCommessa,
    getAllCollaboratori,
    getAllCommesse,
    updateCollaboratore,
    updateCommessa,
    deleteCollaboratore,
    deleteCommessa
};
