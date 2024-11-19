import React, { useState } from "react";

const MarkerForm = ({ onSaveMarker }) => {
  const [label, setLabel] = useState("");
  const [day, setDay] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveMarker({ label, day: new Date(day) });
    setLabel("");
    setDay("");
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
      <button type="submit">Salva Marker</button>
    </form>
  );
};

export default MarkerForm;
