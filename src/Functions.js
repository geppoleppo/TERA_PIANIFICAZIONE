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
      setProjectResources(updatedProjectResources); // Aggiorna lo stato di `projectResources`
  
      // Per ogni collaboratore selezionato, aggiorna le commesse nel backend
      await Promise.all(
        selectedCollaboratori.map(async collaboratoreId => {
          const response = await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}`);
          const collaboratoreData = await response.json();
          const currentCommesseIds = collaboratoreData.groupIds || [];
          const selectedCommesseIds = selectedCommesse.map(commessa => commessa.value);
  
          const commesseToAdd = selectedCommesseIds.filter(id => !currentCommesseIds.includes(id));
          const commesseToRemove = currentCommesseIds.filter(id => !selectedCommesseIds.includes(id));
  
          await Promise.all(commesseToAdd.map(async id => {
            const commessa = selectedCommesse.find(c => c.value === id);
            await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}/aggiungi-commesse`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ commesseIds: [{ id: commessa.value, color: commessa.color }] })
            });
          }));
  
          await Promise.all(commesseToRemove.map(async id => {
            await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}/rimuovi-commesse`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ commesseIds: [id] })
            });
          }));
        })
      );
  
      await fetchCategoryResources(); // Ricarica i collaboratori per aggiornare le modifiche
      fetchEvents(); // Aggiorna lo Scheduler con le ultime modifiche di colore
      console.log('Le commesse selezionate sono state aggiornate per i collaboratori selezionati');
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
      console.log(data.message);
      fetchEvents(); // Ricarica gli eventi
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'evento:", error);
    }
  };
  