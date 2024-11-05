import React, { useEffect, useState } from 'react';
import './App.css';
import { Day, WorkWeek, Month, ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, ResourceDetails,Week,Agenda, Inject, TimelineViews, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
import { extend } from '@syncfusion/ej2-base';
import Select from 'react-select';
import { TwitterPicker } from 'react-color';

const App = () => {
  const [events, setEvents] = useState([]);
  const [projectResources, setProjectResources] = useState([]);
  const [categoryResources, setCategoryResources] = useState([]);
  const [uniqueCollaborators, setUniqueCollaborators] = useState([]); // Collaboratori unici per il menu
  const [selectedCollaboratori, setSelectedCollaboratori] = useState([]); // Inizializza come array vuoto
  const [selectedCommesse, setSelectedCommesse] = useState([]);

 
  

// Funzione per gestire il cambio dei collaboratori selezionati
const handleCollaboratoreChange = selectedOptions => {
  const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
  setSelectedCollaboratori(selectedIds);
};


  // Funzione per gestire la selezione delle commesse
  const handleCommesseChange = selectedOptions => {
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
  
  
  // Funzione per cambiare il colore di una commessa selezionata
  const handleColorChange = (color, index) => {
    const updatedCommesse = [...selectedCommesse];
    updatedCommesse[index] = { ...updatedCommesse[index], color: color.hex };
    setSelectedCommesse(updatedCommesse);
  };

  // Funzione per rimuovere una commessa selezionata
  const removeCommessa = (index) => {
    const updatedCommesse = selectedCommesse.filter((_, i) => i !== index);
    setSelectedCommesse(updatedCommesse);
  };

// Funzione per caricare gli eventi dal database
const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/eventi');
    const data = await response.json();

    const mappedEvents = data.map(event => {
      const commessa = projectResources.find(p => p.id === event.ProjectId);
      return {
        ...event,
        ProjectId: parseInt(event.ProjectId),
        CollaboratoreId: Array.isArray(event.CollaboratoreId)
          ? event.CollaboratoreId.map(id => parseInt(id))
          : [],
        Color: commessa ? commessa.color : '#FF0000', // Associa il colore della commessa
      };
    });

    setEvents(mappedEvents);
  } catch (error) {
    console.error('Errore durante il caricamento degli eventi:', error);
  }
};





  
  // Funzione per salvare un nuovo evento nel database
// Funzione per salvare un nuovo evento nel database
const saveEvent = async (eventData) => {
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
  const deleteEvent = async (eventId) => {
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
  

  

// Funzione per caricare le commesse dal database
const fetchProjectResources = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/commesse');
    const data = await response.json();

    const formattedData = data.map(commessa => ({
      text: commessa.text,
      id: commessa.Id,
      color: commessa.color || '#FF0000' // Imposta colore rosso se non definito
    }));

    console.log("Commesse caricate con colore:", formattedData);
    setProjectResources(formattedData);
  } catch (error) {
    console.error('Errore durante il caricamento delle commesse:', error);
  }
};

// Funzione per caricare i collaboratori e duplicarli per il `Scheduler`
const fetchCategoryResources = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/collaboratori');
    const data = await response.json();

    const uniqueCollaborators = data.map(collaboratore => ({
      text: collaboratore.Nome,
      id: collaboratore.Id,
      groupIds: collaboratore.groupIds,
      color: collaboratore.Colore || '#FF0000' // Colore rosso di default se non specificato
    }));

    const duplicatedData = data.flatMap(collaboratore =>
      collaboratore.groupIds.map(groupId => ({
        text: collaboratore.Nome,
        id: collaboratore.Id,
        groupId: groupId,
        color: collaboratore.Colore || '#00D084',
        Immagine: collaboratore.Immagine  // Aggiungi il campo immagine qui
      }))
    );

    setUniqueCollaborators(uniqueCollaborators);
    setCategoryResources(duplicatedData);
    console.log("Duplicated Category Resources:", duplicatedData);
  } catch (error) {
    console.error('Errore durante il caricamento dei collaboratori:', error);
  }
};
// Funzione per visualizzare l’immagine e il nome del collaboratore
const resourceHeaderTemplate = (props) => {
  console.log("props.resourceData:", props.resourceData);

  // Verifica se l'elemento è una commessa o un collaboratore
  const isCommessa = props.resourceData && !props.resourceData.groupId; // Supponiamo che le commesse non abbiano `groupId`
  
  if (isCommessa) {
    // Se `props.resourceData` è una commessa, mostriamo solo il nome della commessa
    return (
      <div className="template-wrap">
        <div className="commessa-name">{props.resourceData.text}</div>
      </div>
    );
  } else {
    // Altrimenti, trattiamo `props.resourceData` come un collaboratore e cerchiamo l'immagine
    const collaborator = categoryResources.find(
      resource => resource.id === props.resourceData.id && resource.groupId === props.resourceData.groupId
    );

    console.log("collaborator trovato:", collaborator);
    return (
      <div className="template-wrap">
        {collaborator && collaborator.Immagine && (
          <img src={collaborator.Immagine} alt={collaborator.text} className="resource-image" />
        )}
        <div className="resource-details">
          <div className="resource-name">{collaborator ? collaborator.text : ''}</div>
        </div>
      </div>
    );
  }
};





const onEventRendered = (args) => {
  const event = args.data;
  const commessa = projectResources.find(p => p.id === event.ProjectId);
  if (commessa && commessa.color) {
    args.element.style.backgroundColor = commessa.color;
  }
};

useEffect(() => {
  fetchProjectResources();
  fetchCategoryResources();
  fetchEvents();

}, []);

// Aggiorna projectResources filtrando in base alle commesse selezionate
const [filteredProjectResources, setFilteredProjectResources] = useState(projectResources);

// Aggiorna le commesse filtrate non appena `selectedCommesse` cambia
// Aggiorna le commesse filtrate non appena `selectedCommesse` cambia
useEffect(() => {
  const selectedCommesseIds = selectedCommesse.map(commessa => commessa.value);

  // Se non ci sono commesse selezionate, imposta filteredProjectResources su un array vuoto
  const filteredResources = selectedCommesseIds.length
    ? projectResources.filter(resource => selectedCommesseIds.includes(resource.id))
    : []; // Seleziona nessuna commessa se selectedCommesse è vuoto

  setFilteredProjectResources(filteredResources);
}, [selectedCommesse, projectResources]);


// Sincronizza lo Scheduler con il cambiamento di `filteredProjectResources`
useEffect(() => {
  // Reimposta lo stato `events` ogni volta che `filteredProjectResources` cambia
  fetchEvents();
}, [filteredProjectResources]);



// Effetto per aggiornare le commesse in base ai collaboratori selezionati
useEffect(() => {
  if (selectedCollaboratori && selectedCollaboratori.length > 0) {
    const commesseComuni = projectResources.filter(commessa =>
      selectedCollaboratori.every(collabId => {
        const collaboratore = uniqueCollaborators.find(c => c.id === collabId);
        return collaboratore?.groupIds.includes(commessa.id);
      })
    );

    setSelectedCommesse(
      commesseComuni.map(commessa => ({
        value: commessa.id,
        label: commessa.text,
        color: commessa.color // Assicura che il colore sia passato qui
      }))
    );
  } else {
    setSelectedCommesse([]);
  }
}, [selectedCollaboratori, projectResources]);

// Stato per risorse dei collaboratori filtrati in base ai collaboratori selezionati
const [filteredCategoryResources, setFilteredCategoryResources] = useState(categoryResources);

// Filtra le risorse dei collaboratori in base ai collaboratori selezionati
useEffect(() => {
  if (selectedCollaboratori.length > 0) {
    // Filtra `categoryResources` in base a `selectedCollaboratori`
    const filteredResources = categoryResources.filter(resource =>
      selectedCollaboratori.includes(resource.id)
    );
    setFilteredCategoryResources(filteredResources);
  } else {
    // Se nessun collaboratore è selezionato, mostra tutti i collaboratori
    setFilteredCategoryResources(categoryResources);
  }
}, [selectedCollaboratori, categoryResources]);

// Sincronizza `filteredCategoryResources` con lo Scheduler
useEffect(() => {
  fetchEvents();
}, [filteredCategoryResources]);



// Funzione per salvare le commesse e aggiornare i collaboratori selezionati
const saveSelectedCommesse = async () => {
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



// Funzione per cancellare le commesse dai collaboratori selezionati
const deleteSelectedCommesse = async () => {
  try {
    await Promise.all(
      selectedCollaboratori.map(async collaboratoreId => {
        const commesseIds = selectedCommesse.map(commessa => commessa.value);
        await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}/rimuovi-commesse`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commesseIds })
        });
      })
    );
    await fetchCategoryResources(); // Ricarica collaboratori
    console.log('Commesse rimosse dai collaboratori selezionati');
  } catch (error) {
    console.error("Errore durante la rimozione delle commesse dai collaboratori:", error);
  }
};


  // Gestisce il completamento delle azioni di creazione e rimozione eventi
  function onActionComplete(args) {
    if (args.requestType === 'eventCreated') {
      args.addedRecords.forEach(event => saveEvent(event));
    } else if (args.requestType === 'eventRemoved') {
      args.deletedRecords.forEach(event => deleteEvent(event.Id));
    } else if (args.requestType === 'eventChanged') {
      args.changedRecords.forEach(event => updateEvent(event)); // Aggiungi gestione aggiornamento
    }
  }
  
  // Funzione per aggiornare un evento
  const updateEvent = async (eventData) => {
    const collaboratorId = Array.isArray(eventData.CollaboratoreId) ? eventData.CollaboratoreId.join(',') : eventData.CollaboratoreId;
  
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${eventData.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          CollaboratoreId: collaboratorId,  // Passiamo il CollaboratoreId come stringa corretta
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
  

  return (
    <div className="App">
      {/* Menu a discesa per selezionare i collaboratori */}
      <div>
        <label>Seleziona Collaboratore:</label>
        <Select
        
          options={uniqueCollaborators.map(collaboratore => ({
            value: collaboratore.id,
            label: collaboratore.text
          }))}
          onChange={handleCollaboratoreChange}
          isMulti
          isClearable
          placeholder="Seleziona Collaboratore"
        />
      </div>

      {/* Menu a discesa multi-selezione per selezionare le commesse */}
      <div>
        <label>Seleziona Commesse:</label>
        <Select
          options={projectResources.map(commessa => ({
            value: commessa.id,
            label: commessa.text
          }))}
          value={selectedCommesse}
          isMulti
          onChange={handleCommesseChange}
          placeholder="Seleziona Commesse"
        />
      </div>

{/* Contenitore delle commesse selezionate */}
<div className="commesse-container">
  {selectedCommesse.map((commessa, index) => (
    <div key={index} className="commessa-card">
      <span>{commessa.label}</span>
      <TwitterPicker
        color={commessa.color || '#000000'} // Carica il colore corretto o imposta un default
        onChangeComplete={(color) => handleColorChange(color, index)}
      />
      <button onClick={() => removeCommessa(index)}>Rimuovi</button>
    </div>
  ))}
</div>

      <button onClick={saveSelectedCommesse}>Memorizza</button>
    


      {/* Scheduler component */}
      <ScheduleComponent
actionComplete={onActionComplete}
width="100%"
height="650px"
selectedDate={new Date()}
rowAutoHeight= 'true'
resourceHeaderTemplate={resourceHeaderTemplate}  // Aggiungi il template qui

eventSettings={{
  dataSource: events,
  allowEventOverlap: true, // Consenti eventi sovrapposti
  
  fields: {
    subject: { title: 'Task', name: 'Subject' },
    startTime: { title: 'Start Time', name: 'StartTime' },
    endTime: { title: 'End Time', name: 'EndTime' },
    description: { title: 'Summary', name: 'Description' }
  },
}}

group={{ allowGroupEdit: true, resources: ['Projects', 'Categories'] }}
        eventRendered={onEventRendered} // Aggiungi qui l'evento per gestire i colori
      >
{/* Resource Definitions */}
<ResourcesDirective>
  <ResourceDirective
    field="ProjectId"
    title="Projects"
    name="Projects"
    dataSource={filteredProjectResources} // Usa le risorse filtrate
    textField="text"
    idField="id"
    colorField="color"
  />
  <ResourceDirective
    field="CollaboratoreId"
    title="Collaboratori"
    name="Categories"
    allowMultiple={true}
    dataSource={filteredCategoryResources}
    textField="text"
    idField="id"
    groupIDField="groupId"
  />
</ResourcesDirective>



{/* Views */}
<ViewsDirective>
    <ViewDirective displayName="3 Days" option="Day" interval={3} />
    <ViewDirective displayName="2 Weeks" option="Week" interval={2} isSelected={true} />
    <ViewDirective displayName="4 Months" option="Month" interval={4} />
    <ViewDirective option="TimelineWeek" />
    <ViewDirective option="TimelineMonth" />
    <ViewDirective option="Agenda" />
  </ViewsDirective>>

<Inject services={[Day, WorkWeek, Month, Week,TimelineViews, DragAndDrop, Resize, Agenda]} />
</ScheduleComponent>

    </div>
  );
};

export default App;

