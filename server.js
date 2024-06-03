const express = require('express');
const app = express();
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

app.use(cors());
app.use(express.json());

app.get('/commesse', (req, res) => {
  db.all('SELECT * FROM Commesse', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});


app.get('/commesse/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM Commesse WHERE Id = ?', [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Add endpoints for other resources as needed

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
