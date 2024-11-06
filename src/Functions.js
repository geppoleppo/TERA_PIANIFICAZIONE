// Functions.js
export const handleCollaboratoreChange = (selectedOptions, setSelectedCollaboratori) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedCollaboratori(selectedIds);
  };

    // Funzione per gestire la selezione delle commesse

export const handleCommesseChange = (selectedOptions, projectResources, setSelectedCommesse) => {
    const updatedCommesse = selectedOptions.map(option => {
      // Trova la commessa corrispondente nel projectResources per ottenere il colore corretto
      const commessa = projectResources.find(p => p.id === option.value);
      return {
        value: option.value,
        label: option.label,
        color: commessa ? commessa.color : '#000000' // Usa il colore corretto o #000000 come fallback
      };
    });
    setSelectedCommesse(updatedCommesse);
  };
  // Functions.js

export const handleColorChange = (color, index, selectedCommesse, setSelectedCommesse) => {
    const updatedCommesse = [...selectedCommesse];
    updatedCommesse[index] = { ...updatedCommesse[index], color: color.hex };
    setSelectedCommesse(updatedCommesse);
  };
  
export const removeCommessa = (index, selectedCommesse, setSelectedCommesse) => {
    const updatedCommesse = selectedCommesse.filter((_, i) => i !== index);
    setSelectedCommesse(updatedCommesse);
  };
  

    // Funzione per salvare un nuovo evento nel database


export const saveEvent = async (eventData, projectResources, fetchEvents) => {
    const collaboratorIds = Array.isArray(eventData.CollaboratoreId)
      ? eventData.CollaboratoreId.join(',')
      : eventData.CollaboratoreId;
  
    // Ottieni il colore della commessa associata
    const commessa = projectResources.find(p => p.id === eventData.ProjectId);
    const eventColor = commessa ? commessa.color : '#FF0000'; // Colore della commessa o default
  
    try {
      const response = await fetch('http://localhost:3001/api/eventi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          CollaboratoreId: collaboratorIds,
          Color: eventColor, // Salva il colore della commessa
          Description: eventData.Description, // Invia il summary come Descrizione
        }),
      });
      const data = await response.json();
      console.log(data.message);
      fetchEvents(); // Ricarica gli eventi con il colore aggiornato
    } catch (error) {
      console.error("Errore durante il salvataggio dell'evento:", error);
    }
  };
  

    // Funzione per eliminare un evento dal database
    export const deleteEvent = async (eventId,fetchEvents) => {
        try {
          const response = await fetch(`http://localhost:3001/api/eventi/${eventId}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          console.log(data.message);
          fetchEvents(); // Ricarica gli eventi dopo l'eliminazione
        } catch (error) {
          console.error("Errore durante l'eliminazione dell'evento:", error);
        }
      };