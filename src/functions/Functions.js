


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
    const collaboratorId = Array.isArray(eventData.CollaboratoreId)
      ? eventData.CollaboratoreId.join(',')
      : eventData.CollaboratoreId;
  
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${eventData.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          CollaboratoreId: collaboratorId,  // Stringa corretta per CollaboratoreId
          parentID: eventData.parentID,     // Includi `parentID` per l'aggiornamento
          Description: eventData.Description 
        })
      });
      const data = await response.json();
      fetchEvents(); // Ricarica gli eventi
    } catch (error) {
      console.error("ErrorRONE durante l'aggiornamento dell'evento:", error);
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
export const fetchEvents = async (projectResources) => {
  try {
    const response = await fetch('http://localhost:3001/api/eventi');
    const data = await response.json();
    return data.map(event => ({
      ...event,
      IncaricatoId: Array.isArray(event.IncaricatoId)
        ? event.IncaricatoId
        : (event.IncaricatoId || '').split(',').map(Number), // Converte in array
      IncaricatoName: event.IncaricatoName || 'Nessuno',
    }));
  } catch (error) {
    console.error('Errore durante il caricamento degli eventi:', error);
    return [];
  }
};


export let editingResources: Object[] = [
  { resourceId: 1, resourceName: 'Martin Tamer' },
  { resourceId: 2, resourceName: 'Rose Fuller' },
  { resourceId: 3, resourceName: 'Margaret Buchanan' },
  { resourceId: 4, resourceName: 'Fuller King' },
  { resourceId: 5, resourceName: 'Davolio Fuller' },
  { resourceId: 6, resourceName: 'Van Jack' },
  { resourceId: 7, resourceName: 'Fuller Buchanan' },
  { resourceId: 8, resourceName: 'Jack Davolio' },
  { resourceId: 9, resourceName: 'Tamer Vinet' },
  { resourceId: 10, resourceName: 'Vinet Fuller' },
  { resourceId: 11, resourceName: 'Bergs Anton' },
  { resourceId: 12, resourceName: 'Construction Supervisor' }
];

export let editingData: Object[] = [
  {
      TaskID: 1,
      TaskName: 'Project initiation',
      StartDate: new Date('04/02/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 2, TaskName: 'Identify site location', StartDate: new Date('04/02/2024'), Duration: 0,
              Progress: 30, resources: [1], info: 'Measure the total property area alloted for construction'
          },
          {
              TaskID: 3, TaskName: 'Perform soil test', StartDate: new Date('04/02/2024'), Duration: 4, Predecessor: '2',
              resources: [2, 3, 5], info: 'Obtain an engineered soil test of lot where construction is planned.' +
                  'From an engineer or company specializing in soil testing'
          },
          { TaskID: 4, TaskName: 'Soil test approval', StartDate: new Date('04/02/2024'), Duration: 0, Predecessor: '3', Progress: 30 },
      ]
  },
  {
      TaskID: 5,
      TaskName: 'Project estimation',
      StartDate: new Date('04/02/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 6, TaskName: 'Develop floor plan for estimation', StartDate: new Date('04/04/2024'),
              Duration: 3, Predecessor: '4', Progress: 30, resources: 4,
              info: 'Develop floor plans and obtain a materials list for estimations'
          },
          {
              TaskID: 7, TaskName: 'List materials', StartDate: new Date('04/04/2024'),
              Duration: 3, Predecessor: '6', resources: [4, 8], info: ''
          },
          {
              TaskID: 8, TaskName: 'Estimation approval', StartDate: new Date('04/04/2024'),
              Duration: 0, Predecessor: '7', resources: [12, 5], info: ''
          }
      ]
  },
  {
      TaskID: 9, TaskName: 'Sign contract', StartDate: new Date('04/04/2024'), Duration: 1,
      Predecessor: '8', Progress: 30, resources: [12],
      info: 'If required obtain approval from HOA (homeowners association) or ARC (architectural review committee)'
  },
  {
      TaskID: 10,
      TaskName: 'Project approval and kick off',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      Duration: 0,
      Predecessor: '9'
  },
  {
      TaskID: 11,
      TaskName: 'Site work',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 12, TaskName: 'Clear the building site', StartDate: new Date('04/04/2024'),
              Duration: 2, Progress: 30, Predecessor: '9', resources: [6, 7],
              info: 'Clear the building site (demolition of existing home if necessary)'
          },
          {
              TaskID: 13, TaskName: 'Install temporary power service', StartDate: new Date('04/04/2024'),
              Duration: 2, Predecessor: '12', resources: [6, 7], info: ''
          },
      ]
  },
  {
      TaskID: 14,
      TaskName: 'Foundation',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 15, TaskName: 'Excavate for foundations', StartDate: new Date('04/04/2024'),
              Duration: 3, Progress: 30, Predecessor: '13', resources: [2, 8],
              info: 'Excavate the foundation and dig footers (Scope of work is dependent of foundation designed by engineer)'
          },
          {
              TaskID: 16, TaskName: 'Dig footer', StartDate: new Date('04/04/2024'),
              Duration: 2, Predecessor: '15FF', resources: [8], info: ''
          },
          {
              TaskID: 17, TaskName: 'Install plumbing grounds', StartDate: new Date('04/04/2024'), Duration: 4,
              Progress: 30, Predecessor: '15', resources: [9], info: ''
          },
          {
              TaskID: 18, TaskName: 'Pour a foundation and footer with concrete', StartDate: new Date('04/04/2024'),
              Duration: 1, Predecessor: '17', resources: [8, 9, 10], info: ''
          },
          {
              TaskID: 19, TaskName: 'Cure basement walls', StartDate: new Date('04/04/2024'), Duration: 4,
              Progress: 30, Predecessor: '18', resources: [10], info: ''
          },
      ]
  },
  {
      TaskID: 20,
      TaskName: 'Framing',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 21, TaskName: 'Add load-bearing structure', StartDate: new Date('04/04/2024'),
              Duration: 3, Progress: 30, Predecessor: '19', resources: [4, 5],
              info: 'Build the main load-bearing structure out of thick pieces of wood and' +
                  'possibly metal I-beams for large spans with few supports'
          },
          {
              TaskID: 22, TaskName: 'Install floor joists', StartDate: new Date('04/04/2024'),
              Duration: 3, Predecessor: '21', resources: [2, 3], info: 'Add floor and ceiling joists and install subfloor panels'
          },
          {
              TaskID: 23, TaskName: 'Add ceiling joists', StartDate: new Date('04/04/2024'),
              Duration: 3, Progress: 30, Predecessor: '22SS', resources: [5], info: ''
          },
          {
              TaskID: 24, TaskName: 'Install subfloor panels', StartDate: new Date('04/04/2024'),
              Duration: 3, Predecessor: '23', resources: [8, 9]
          },
          {
              TaskID: 25, TaskName: 'Frame floor walls', StartDate: new Date('04/04/2024'), Duration: 3,
              Progress: 30, Predecessor: '24', resources: [10], info: ''
          },
          {
              TaskID: 26, TaskName: 'Frame floor decking', StartDate: new Date('04/04/2024'), Duration: 3,
              Progress: 30, Predecessor: '25SS', resources: [4, 8], info: ''
          },
      ]
  },
  {
      TaskID: 27,
      TaskName: 'Exterior finishing',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 28, TaskName: 'Cover outer walls and roof in OSB', StartDate: new Date('04/04/2024'),
              Duration: 3, Progress: 30, Predecessor: '26', resources: [2, 8],
              info: 'Cover outer walls and roof in OSB or plywood and a water-resistive barrier'
          },
          {
              TaskID: 29, TaskName: 'Add water resistive barrier', StartDate: new Date('04/04/2024'),
              Duration: 3, Predecessor: '28', resources: [1, 10],
              info: 'Cover the walls with siding, typically vinyl, wood, or brick veneer but possibly stone or other materials'
          },
          {
              TaskID: 30, TaskName: 'Install roof shingles', StartDate: new Date('04/04/2024'), Duration: 3,
              Progress: 30, Predecessor: '29', resources: [8, 9], info: 'Install roof shingles or other covering for flat roof'
          },
          { TaskID: 31, TaskName: 'Install windows', StartDate: new Date('04/04/2024'), Duration: 3, Predecessor: '29', resources: 7 },
      ]
  },
  {
      TaskID: 32,
      TaskName: 'Utilities',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 33, TaskName: 'Install internal plumbing', StartDate: new Date('04/04/2024'), Duration: 3,
              Progress: 30, Predecessor: '26', resources: [1, 10]
          },
          {
              TaskID: 34, TaskName: 'Install HVAC', StartDate: new Date('04/04/2024'), Duration: 3, Predecessor: '33',
              resources: [4, 9], info: 'Add internal plumbing, HVAC, electrical, and natural gas utilities'
          },
          {
              TaskID: 35, TaskName: 'Electrical utilities', StartDate: new Date('04/04/2024'), Duration: 3,
              Progress: 30, Predecessor: '34'
          },
          {
              TaskID: 36, TaskName: 'Natural gas utilities', StartDate: new Date('04/04/2024'), Duration: 3,
              Predecessor: '35', resources: 11
          },
          {
              TaskID: 37, TaskName: 'Install bathroom fixtures', StartDate: new Date('04/04/2024'), Duration: 3,
              Progress: 30, Predecessor: '35', resources: [3, 7]
          },
      ],
      info: 'Building inspector visits if necessary to approve utilities and framing'
  },
  {
      TaskID: 38,
      TaskName: 'Interior finsihing',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 39, TaskName: 'Install insulation', StartDate: new Date('04/04/2024'),
              Duration: 3, Progress: 30, Predecessor: '37', resources: [1, 8], info: 'Frame interior walls with wooden 2×4s'
          },
          {
              TaskID: 40, TaskName: 'Install  drywall panels', StartDate: new Date('04/04/2024'), Duration: 3,
              Predecessor: '39', resources: 5,
              info: 'Install insulation and interior drywall panels (cementboard for wet areas) and to complete walls and ceilings'
          },
          {
              TaskID: 41, TaskName: 'Spackle', StartDate: new Date('04/04/2024'), Duration: 3,
              Progress: 30, Predecessor: '40', resources: 10
          },
          {
              TaskID: 42, TaskName: 'Apply primer', StartDate: new Date('04/04/2024'), Duration: 3,
              Predecessor: '41', resources: [10, 11]
          },
          {
              TaskID: 43, TaskName: 'Paint wall and ceilings', StartDate: new Date('04/04/2024'),
              Duration: 3, Progress: 30, Predecessor: '42', resources: [2, 9]
          },
          {
              TaskID: 44, TaskName: 'Install modular kitchen', StartDate: new Date('04/04/2024'),
              Duration: 3, Progress: 30, Predecessor: '43', resources: [5, 7]
          },
      ]
  },
  {
      TaskID: 45,
      TaskName: 'Flooring',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 46, TaskName: 'Tile kitchen, bathroom and entry walls', StartDate: new Date('04/04/2024'),
              Duration: 3, Progress: 30, Predecessor: '44', resources: [4, 9, 3],
              info: 'Additional tiling on top of cementboard for wet areas, such as the bathroom and kitchen backsplash'
          },
          {
              TaskID: 47, TaskName: 'Tile floor', StartDate: new Date('04/04/2024'), Duration: 3, Predecessor: '46SS',
              resources: [2, 8], info: 'Installation of final floor covering, such as floor tile, carpet, or wood flooring'
          },
      ]
  },
  {
      TaskID: 48,
      TaskName: 'Final Acceptance',
      StartDate: new Date('04/04/2024'),
      EndDate: new Date('04/21/2024'),
      subtasks: [
          {
              TaskID: 49, TaskName: 'Final inspection', StartDate: new Date('04/04/2024'), Duration: 2,
              Progress: 30, Predecessor: '47', resources: 12, info: 'Ensure the contracted items'
          },
          {
              TaskID: 50, TaskName: 'Cleanup for occupancy', StartDate: new Date('04/04/2024'), Duration: 2,
              Predecessor: '49', resources: [1, 5], info: 'Installation of major appliances'
          },
          {
              TaskID: 51, TaskName: 'Property handover', StartDate: new Date('04/04/2024'), Duration: 0,
              Predecessor: '50', info: 'Ending the contract'
          },
      ]
  },
];




