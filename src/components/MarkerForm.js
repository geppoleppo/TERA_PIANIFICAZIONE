import React, { useState } from "react";

const MarkerForm = ({ onSaveMarker, events }) => {
  const [label, setLabel] = useState("");
  const [day, setDay] = useState("");
  const [severity, setSeverity] = useState("Low"); // Default a "Low"
  const [eventId, setEventId] = useState(""); // Per selezionare l'evento
  
  const handleSubmit = (e) => {

    e.preventDefault();
console.log("Dati inviati per il marker:", { label, day, severity, eventId });
    if (!label || !day || !eventId) {
        alert("Compila tutti i campi richiesti!");
        return;
    }

    try {
        const formattedDay = new Date(day).toISOString().split("T")[0];
        onSaveMarker({ label, day: formattedDay, severity, eventId }); // Qui viene invocata onSaveMarker
    } catch (err) {
        console.error("Errore nel form:", err);
    }
};



  return (
    <form onSubmit={handleSubmit} className="marker-form">
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
      <label>
        Gravità:
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          required
        >
          <option value="Low">Verde</option>
          <option value="Medium">Arancione</option>
          <option value="High">Rosso</option>
        </select>
      </label>
      <label>
        Evento Associato:
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          required
        >
          <option value="">Seleziona Evento</option>
          {events.map((event) => (
            <option key={event.Id} value={event.Id}>
              {event.Subject}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Salva Marker</button>
    </form>
  );
};

export default MarkerForm;
