


// Functions.js
// Functions.js
export const handleCollaboratoreChange = (selectedOptions, setSelectedCollaboratori, categoryResources, setFilteredProjectResources, projectResources) => {
  const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
  setSelectedCollaboratori(selectedIds);

  console.log("Collaboratori selezionati:", selectedIds);

  if (selectedIds.length > 0) {
    const filteredResources = projectResources.filter((commessa) =>
      selectedIds.some((collabId) => {
        const collaboratore = categoryResources.find((c) => c.id === collabId);
        //console.log(`Collaboratore ${collabId} -> Commesse associate:`, collaboratore?.groupIds);
        return collaboratore?.groupIds.includes(commessa.id);
      })
    );
    console.log("Commesse filtrate:", filteredResources);
    setFilteredProjectResources(filteredResources);
  } else {
    console.log("Nessun collaboratore selezionato, mostro tutte le commesse.");
    setFilteredProjectResources(projectResources);
  }
};





  export const handleColorChangeInSidebar = (color, commessaId, projectResources, setProjectResources) => {
    const updatedProjectResources = projectResources.map(commessa =>
        commessa.id === commessaId ? { ...commessa, color: color.hex } : commessa
    );
    setProjectResources(updatedProjectResources);
};

    // Funzione per gestire la selezione delle commesse
    export const handleCommesseChange = (selectedOptions, projectResources, setSelectedCommesse, setFilteredProjectResources) => {
      const updatedCommesse = selectedOptions.map(option => {
        const commessa = projectResources.find(p => p.id === option.value);
        return {
          value: option.value,
          label: option.label,
          color: commessa ? commessa.color : '#000000'
        };
      });
    
      setSelectedCommesse(updatedCommesse);
      
      // Aggiorna il filtro delle commesse
      const filteredResources = projectResources.filter(resource =>
        updatedCommesse.some(commessa => commessa.value === resource.id)
      );
    
      setFilteredProjectResources(filteredResources);
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
          parentID:eventData.parentID
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
    try {
      console.log("Collaboratori selezionati:", selectedCollaboratori);
      console.log("Commesse selezionate:", selectedCommesse);
  
      // Verifica che i collaboratori siano corretti
      if (!Array.isArray(selectedCollaboratori) || selectedCollaboratori.length !== 1) {
        throw new Error(
          'Devi selezionare un solo collaboratore per salvare le commesse associate.'
        );
      }
  
      const collaboratoreId = selectedCollaboratori[0]?.value || selectedCollaboratori[0];
      const groupIds = selectedCommesse.map((commessa) => commessa.value);
  
      if (!collaboratoreId || groupIds.length === 0) {
        throw new Error('Dati insufficienti per salvare le commesse.');
      }
  
      // Log del payload
      console.log('Payload inviato al server:', { collaboratoreId, groupIds });
  
      // Invio della richiesta al server
      const response = await fetch(
        `http://localhost:3001/api/collaboratori/${collaboratoreId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupIds }),
        }
      );
  
      if (!response.ok) {
        throw new Error(
          `Errore durante l'associazione delle commesse al collaboratore con ID ${collaboratoreId}: ${response.statusText}`
        );
      }
  
      console.log(
        'Le commesse selezionate sono state associate al collaboratore selezionato'
      );
    } catch (error) {
      console.error(
        "Errore durante l'associazione delle commesse al collaboratore:",
        error
      );
    }
  };
  
  


  
  // Funzione per aggiornare un evento

  export const updateEvent = async (eventData, fetchEvents) => {
    // Normalizza CollaboratoreId come stringa separata da virgole
    const collaboratorIds = Array.isArray(eventData.taskData?.CollaboratoreId)
      ? eventData.taskData.CollaboratoreId.join(',')
      : eventData.taskData?.CollaboratoreId || null;
  
    const updatedEvent = {
      ...eventData.taskData,
      CollaboratoreId: collaboratorIds,
      parentID: eventData.taskData?.parentID,
      Description: eventData.taskData?.Description,
    };
  
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${updatedEvent.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!response.ok) {
        throw new Error(`Errore durante l'aggiornamento dell'evento: ${response.statusText}`);
      }
  
      console.log("Evento aggiornato con successo:", updatedEvent);
      fetchEvents(); // Ricarica gli eventi per aggiornare il Gantt
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'evento:", error);
    }
  };
  

// Functions.js

// Funzione per caricare le commesse dal database
export const fetchProjectResources = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/commesse');
    const data = await response.json();
    return data.map((commessa) => ({
      text: commessa.text,
      id: commessa.Id,
      color: commessa.color || '#FF0000', // Imposta un colore rosso di default
    }));
  } catch (error) {
    console.error('Errore durante il caricamento delle commesse:', error);
    return [];
  }
};

// Funzione per caricare i collaboratori dal database
export const fetchCategoryResources = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/collaboratori');
    const data = await response.json();
    return data.map((collaboratore) => ({
      text: collaboratore.Nome,
      id: collaboratore.Id,
      groupIds: collaboratore.groupIds,
      color: collaboratore.Colore || '#00D084',
    }));
  } catch (error) {
    console.error('Errore durante il caricamento dei collaboratori:', error);
    return [];
  }
};

// Funzione per caricare gli eventi dal database
export const fetchEvents = async (projectResources, categoryResources) => {
  try {
    const response = await fetch('http://localhost:3001/api/eventi');
    const data = await response.json();
    console.log("DATA", data);

    if (!projectResources || projectResources.length === 0) {
      console.warn("[DEBUG] projectResources è vuoto o non pronto.");
      return data; // Ritorna i dati grezzi senza arricchirli
    }

    return data.map((event) => {
      const commessa = projectResources.find((res) => res.id === event.ProjectId);

      // Filtra solo i numeri in IncaricatoId
      const incaricatoIds = Array.isArray(event.IncaricatoId)
      ? event.IncaricatoId.filter((id) => typeof id === "number" && id > 0) // Filtra numeri validi
      : [];

      const incaricatoNames = incaricatoIds
        .map((id) => {
          const collaboratore = categoryResources.find((c) => c.id === id);
          return collaboratore ? collaboratore.text : null;
        })
        .filter(Boolean)
        .join(", ");
        
      return {
        ...event,
        ProjectId: parseInt(event.ProjectId, 10),
        IncaricatoId: incaricatoIds, // Include solo ID numerici
        IncaricatoName: incaricatoNames,
        Color: event.Colore || '#FF0000',
        CommessaName: commessa ? commessa.text : "Non assegnata",
      };
    });
  } catch (error) {
    console.error('Errore durante il caricamento degli eventi:', error);
    return [];
  }
};








