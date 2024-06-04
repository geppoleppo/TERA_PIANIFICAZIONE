const Database = require('better-sqlite3');
const db = new Database('TERA_GESTIONALE_DB.db', { verbose: console.log });

// Creazione delle tabelle se non esistono
const createTables = () => {
    // Query esistenti
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
    // Aggiungi la tua nuova query qui
    const queryEventi = `
        CREATE TABLE IF NOT EXISTS Eventi (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Subject TEXT,
            StartTime TEXT,
            EndTime TEXT,
            IsAllDay BOOLEAN,
            CommessaId INTEGER,
            Color TEXT
        );
    `;

    // Esegui tutte le query
    db.prepare(queryCollaboratori).run();
    db.prepare(queryCommesse).run();
    db.prepare(queryEventi).run(); // Assicurati di includere questa riga
};

createTables(); // Questa chiamata esegue la funzione all'avvio


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
const addEvento = (subject, startTime, endTime, isAllDay, commessaId, color) => {
    if (color === undefined) {
        color = '#ff33a6'; // Sostituisci 'defaultColor' con un valore valido
    }
    console.log("Parameter types:", {
        subject: typeof subject,
        startTime: typeof startTime,
        endTime: typeof endTime,
        isAllDay: typeof isAllDay,
        commessaId: typeof commessaId,
        color: typeof color
    });

    const query = `INSERT INTO Eventi (Subject, StartTime, EndTime, IsAllDay, CommessaId, Color) VALUES (?, ?, ?, ?, ?, ?)`;
    const stmt = db.prepare(query);
    try {
        const result = stmt.run(subject, startTime, endTime, isAllDay, commessaId, color);
        console.log("New event added with ID:", result.lastInsertRowid);
        return result.lastInsertRowid;
    } catch (error) {
        console.error("Failed to add event:", error);
        throw error;
    }
};

const updateEvento = (id, subject, startTime, endTime, isAllDay, commessaId, color) => {
    console.log("Updating event:", {id, subject, startTime, endTime, isAllDay, commessaId, color});
    const query = `UPDATE Eventi SET Subject = ?, StartTime = ?, EndTime = ?, IsAllDay = ?, CommessaId = ?, Color = ? WHERE Id = ?`;
    const stmt = db.prepare(query);
    stmt.run(subject, startTime, endTime, isAllDay, commessaId, color, id);
    console.log("Event updated:", id);
};

const deleteEvento = (id) => {
    console.log("Deleting event with ID:", id);
    const query = `DELETE FROM Eventi WHERE Id = ?`;
    const stmt = db.prepare(query);
    stmt.run(id);
    console.log("Event deleted:", id);
};

const getAllEvents = () => {
    try {
        const query = `SELECT * FROM Eventi`;  // Assicurati che il nome della tabella sia corretto
        console.log("Executing query to fetch all events...");
        const result = db.prepare(query).all();
        console.log("Events fetched:", result);
        return result;
    } catch (error) {
        console.error("Database error while fetching events:", error);
        throw new Error("Failed to retrieve events.");
    }
};

module.exports = {
    getAllEvents,
    addEvento,
    updateEvento,
    deleteEvento,
    addCollaboratore,
    addCommessa,
    getAllCollaboratori,
    getAllCommesse,
    updateCollaboratore,
    updateCommessa,
    deleteCollaboratore,
    deleteCommessa
};
