


// Functions.js
export const handleCollaboratoreChange = (selectedOptions, setSelectedCollaboratori) => {
  console.log("Collaboratori selezionati:", selectedOptions);
  const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
  setSelectedCollaboratori(selectedIds);
};


  export const handleColorChangeInSidebar = (color, commessaId, projectResources, setProjectResources) => {
    const updatedProjectResources = projectResources.map(commessa =>
        commessa.id === commessaId ? { ...commessa, color: color.hex } : commessa
    );
    setProjectResources(updatedProjectResources);
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
      //console.log('Dati evento in saveEvent:', eventData);
  
      // Normalizza `CollaboratoreId` per essere una stringa di ID separati da virgole
      const collaboratorIds = Array.isArray(eventData.CollaboratoreId)
          ? eventData.CollaboratoreId.join(',')
          : eventData.CollaboratoreId;
  
      // Gestisce i dati differenti tra Scheduler e Gantt
      const normalizedEvent = {
          Subject: eventData.Subject || eventData.taskData?.Subject || "Titolo non specificato",
          StartTime: eventData.StartTime || eventData.taskData?.StartTime || null,
          EndTime: eventData.EndTime || eventData.taskData?.EndTime || null,
          ProjectId: eventData.ProjectId || eventData.taskData?.ProjectId || null,
          CollaboratoreId: collaboratorIds,
          Color: eventData.Color || '#FF0000',
          Description: eventData.Description || "",
          // Aggiungi altri campi con la logica corretta, se necessario
      };
  
      //console.log('Dati evento normalizzati per il salvataggio:', normalizedEvent);
  
      try {
          const response = await fetch('http://localhost:3001/api/eventi', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(normalizedEvent),
          });
  
          if (!response.ok) {
              throw new Error('Errore nella risposta del server');
          }
  
          const data = await response.json();
          //console.log('Risposta del server dopo salvataggio:', data);
          fetchEvents(); // Ricarica gli eventi
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
          //console.log(data.message);
          fetchEvents(); // Ricarica gli eventi dopo l'eliminazione
        } catch (error) {
          console.error("Errore durante l'eliminazione dell'evento:", error);
        }
      };

   // Funzione per salvare le commesse e aggiornare i collaboratori selezionati

   export const saveSelectedCommesse = async (
    selectedCollaboratori,
    selectedCommesse
  ) => {
    console.error("popolini:", selectedCollaboratori);
    console.error("popolini2:", selectedCommesse);
    try {
      if (!Array.isArray(selectedCollaboratori) || selectedCollaboratori.length !== 1) {
        throw new Error('Devi selezionare un solo collaboratore per salvare le commesse associate.');
      }
  
      const collaboratoreId = selectedCollaboratori[0];
      const groupIds = selectedCommesse.map(commessa => commessa.value);
  
      // Aggiorna il campo groupIds del collaboratore nel backend
      const response = await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupIds })
      });
  
      if (!response.ok) {
        throw new Error(`Errore durante l'associazione delle commesse al collaboratore con ID ${collaboratoreId}: ${response.statusText}`);
      }
  
      console.log('Le commesse selezionate sono state associate al collaboratore selezionato');
    } catch (error) {
      console.error("Errore durante l'associazione delle commesse al collaboratore:", error);
    }
  };
  
  


  
  // Funzione per aggiornare un evento

export const updateEvent = async (eventData, fetchEvents) => {
    const collaboratorId = Array.isArray(eventData.CollaboratoreId)
      ? eventData.CollaboratoreId.join(',')
      : eventData.CollaboratoreId;
  
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${eventData.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          CollaboratoreId: collaboratorId, // Passiamo il CollaboratoreId come stringa corretta
          Description: eventData.Description // Invia la descrizione per l'aggiornamento
        })
      });
      const data = await response.json();
      //console.log(data);
      fetchEvents(); // Ricarica gli eventi
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'evento:", error);
    }
  };
  