


// Functions.js
export const handleCollaboratoreChange = (selectedOptions, setSelectedCollaboratori) => {
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
  projectResources,
  setProjectResources,
  selectedCollaboratori,
  selectedCommesse,
  fetchCategoryResources,
  fetchEvents
) => {
  try {
    // Aggiorna `projectResources` con i colori delle commesse selezionate
    const updatedProjectResources = projectResources.map(commessa => {
      const selectedCommessa = selectedCommesse.find(selected => selected.value === commessa.id);
      return selectedCommessa ? { ...commessa, color: selectedCommessa.color } : commessa;
    });

    // Aggiorna `projectResources` sia localmente che nel backend
    setProjectResources(updatedProjectResources);
    await Promise.all(
      updatedProjectResources.map(async commessa => {
        await fetch(`http://localhost:3001/api/commesse/${commessa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ color: commessa.color })
        });
      })
    );

    // Per ogni collaboratore selezionato, aggiorna le commesse nel backend
    await Promise.all(
      selectedCollaboratori.map(async collaboratoreId => {
        const response = await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}`);
        const collaboratoreData = await response.json();
        const currentCommesseIds = collaboratoreData.groupIds || [];
        const selectedCommesseIds = selectedCommesse.map(commessa => commessa.value);

        const commesseToAdd = selectedCommesseIds.filter(id => !currentCommesseIds.includes(id));
        const commesseToRemove = currentCommesseIds.filter(id => !selectedCommesseIds.includes(id));

        // Aggiungi commesse per il collaboratore
        await Promise.all(commesseToAdd.map(async id => {
          const commessa = selectedCommesse.find(c => c.value === id);
          await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}/aggiungi-commesse`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commesseIds: [{ id: commessa.value, color: commessa.color }] })
          });
        }));

        // Rimuovi commesse per il collaboratore
        await Promise.all(commesseToRemove.map(async id => {
          await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}/rimuovi-commesse`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commesseIds: [id] })
          });
        }));
      })
    );

    // Aggiorna i dati locali dopo aver salvato nel backend
    await fetchCategoryResources(); // Ricarica i collaboratori per aggiornare le modifiche
    fetchEvents(); // Aggiorna lo Scheduler con le ultime modifiche di colore
    console.log('Le commesse selezionate e i colori sono stati aggiornati per i collaboratori selezionati');
  } catch (error) {
    console.error("Errore durante l'aggiornamento delle commesse per i collaboratori:", error);
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
  