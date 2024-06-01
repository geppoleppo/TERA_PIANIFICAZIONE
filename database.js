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
            Id INTEGER PRIMARY KEY,
            Descrizione TEXT NOT NULL,
            Colore TEXT NOT NULL
        );
    `;

    const queryGanttTasks = `
        CREATE TABLE IF NOT EXISTS GanttTasks (
            TaskID INTEGER PRIMARY KEY,
            TaskName TEXT,
            StartDate TEXT,
            EndDate TEXT,
            Predecessor TEXT,
            Progress INTEGER,
            CommessaId INTEGER
        );
    `;

    const querySchedulerEvents = `
    CREATE TABLE IF NOT EXISTS SchedulerEvents (
        EventID INTEGER PRIMARY KEY,
        Subject TEXT,
        StartTime TEXT,
        EndTime TEXT,
        IsAllDay INTEGER,
        CommessaId INTEGER,
        IncaricatiId TEXT
    );
    `;

    db.prepare(queryCollaboratori).run();
    db.prepare(queryCommesse).run();
    db.prepare(queryGanttTasks).run();
    db.prepare(querySchedulerEvents).run();
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

const addGanttTask = (task) => {
    try {
        const query = `INSERT INTO GanttTasks (TaskID, TaskName, StartDate, EndDate, Predecessor, Progress, CommessaId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const stmt = db.prepare(query);
        const info = stmt.run(task.TaskID, task.TaskName, task.StartDate, task.EndDate, task.Predecessor, task.Progress, task.CommessaId);
        return info.lastInsertRowid;
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to add Gantt task.");
    }
};

const getAllGanttTasks = () => {
    try {
        const query = `SELECT * FROM GanttTasks`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve Gantt tasks.");
    }
};

const updateGanttTask = (id, task) => {
    try {
        const query = `UPDATE GanttTasks SET TaskName = ?, StartDate = ?, EndDate = ?, Predecessor = ?, Progress = ?, CommessaId = ? WHERE TaskID = ?`;
        const stmt = db.prepare(query);
        stmt.run(task.TaskName, task.StartDate, task.EndDate, task.Predecessor, task.Progress, task.CommessaId, id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to update Gantt task.");
    }
};

const deleteGanttTask = (id) => {
    try {
        const query = `DELETE FROM GanttTasks WHERE TaskID = ?`;
        const stmt = db.prepare(query);
        stmt.run(id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to delete Gantt task.");
    }
};

const addSchedulerEvent = (event) => {
    try {
        const IncaricatiId = event.IncaricatiId ? event.IncaricatiId.join(',') : null;
        const query = `INSERT INTO SchedulerEvents (Subject, StartTime, EndTime, IsAllDay, CommessaId, IncaricatiId) VALUES (?, ?, ?, ?, ?, ?)`;
        const stmt = db.prepare(query);
        const info = stmt.run(
            event.Subject, 
            event.StartTime, 
            event.EndTime, 
            event.IsAllDay ? 1 : 0,
            event.CommessaId,
            IncaricatiId
        );
        return info.lastInsertRowid;
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to add scheduler event.");
    }
};

const getAllSchedulerEvents = () => {
    try {
        const query = `SELECT * FROM SchedulerEvents`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve scheduler events.");
    }
};

const updateSchedulerEvent = (id, event) => {
    try {
        const IncaricatiId = event.IncaricatiId ? event.IncaricatiId.join(',') : null;
        const query = `UPDATE SchedulerEvents SET Subject = ?, StartTime = ?, EndTime = ?, IsAllDay = ?, CommessaId = ?, IncaricatiId = ? WHERE EventID = ?`;
        const stmt = db.prepare(query);
        stmt.run(
            event.Subject, 
            event.StartTime, 
            event.EndTime, 
            event.IsAllDay ? 1 : 0,
            event.CommessaId,
            IncaricatiId,
            id
        );
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to update scheduler event.");
    }
};

const deleteSchedulerEvent = (id) => {
    try {
        const query = `DELETE FROM SchedulerEvents WHERE EventID = ?`;
        const stmt = db.prepare(query);
        stmt.run(id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to delete scheduler event.");
    }
};

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

const getAllCollaboratori = () => {
    try {
        const query = `SELECT * FROM Collaboratori`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve collaborators.");
    }
};

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

const getAllCommesse = () => {
    try {
        const query = `SELECT * FROM Commesse`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve projects.");
    }
};

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
    deleteCommessa,
    addGanttTask,
    getAllGanttTasks,
    updateGanttTask,
    deleteGanttTask,
    addSchedulerEvent,
    getAllSchedulerEvents,
    updateSchedulerEvent,
    deleteSchedulerEvent
};
