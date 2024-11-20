import React, { useState } from "react";

const MarkerForm = ({ onSaveMarker, selectedEvent }) => { // Accetta selectedEvent come prop
  const [label, setLabel] = useState("");
  const [day, setDay] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const formattedDay = new Date(day).toISOString().split("T")[0];
      onSaveMarker({ label, day: formattedDay });
    } catch (err) {
      console.error("Errore nel form:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="marker-form">
      {selectedEvent && ( // Mostra l'evento selezionato solo se esiste
        <div>
          Evento Selezionato: {selectedEvent.Subject || `Evento ${selectedEvent.Id}`}
        </div>
      )}
      <label>
        Data Marker:
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          required
        />
      </label>
      <label>
        Etichetta:
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
      </label>
      <button type="submit">Salva Marker</button>
    </form>
  );
};

export default MarkerForm;
