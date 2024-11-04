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
          ? event.CollaboratoreId
          : event.CollaboratoreId.split(',').map(id => parseInt(id)),
        CategoryColor: commessa ? commessa.color : '#FF0000' // Fallback a rosso
      };
    });
    
    console.log("Eventi con colore assegnato:", mappedEvents);
    setEvents(mappedEvents);
    

    console.log("Eventi con colori assegnati:", mappedEvents); // Aggiungi questo log per verificare i colori
    setEvents(mappedEvents);
  } catch (error) {
    console.error('Errore durante il caricamento degli eventi:', error);
  }
};


  
  // Funzione per salvare un nuovo evento nel database
  const saveEvent = async (eventData) => {
    const collaboratorIds = Array.isArray(eventData.CollaboratoreId)
        ? eventData.CollaboratoreId.join(',')
        : eventData.CollaboratoreId;
  
    try {
        const response = await fetch('http://localhost:3001/api/eventi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...eventData,
              CollaboratoreId: collaboratorIds,
              CategoryColor: eventData.CategoryColor || '#FF0000' // Fallback a rosso
            })
        });
        const data = await response.json();
        console.log("Risposta dal server dopo il salvataggio:", data);
        fetchEvents(); // Ricarica gli eventi
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
      color: commessa.color // Assicura che il colore venga letto dal database
    }));

    console.log("Commesse caricate con colore:", formattedData); // Controllo log
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

    // Creiamo una lista di collaboratori unici per il menu
    const uniqueCollaborators = data.map(collaboratore => ({
      text: collaboratore.Nome,
      id: collaboratore.Id,
      groupIds: collaboratore.groupIds, // Manteniamo `groupIds` come array per il caricamento commesse
      color: collaboratore.Colore
    }));

    // Duplicare i collaboratori per ogni `groupId` solo per il Scheduler
    const duplicatedData = data.flatMap(collaboratore =>
      collaboratore.groupIds.map(groupId => ({
        text: collaboratore.Nome,
        id: collaboratore.Id,
        groupId: groupId, // Singolo `groupId` per ogni duplicato
        color: collaboratore.Colore
      }))
    );

    setUniqueCollaborators(uniqueCollaborators); // Collaboratori unici per il menu
    setCategoryResources(duplicatedData); // Collaboratori duplicati per il `Scheduler`
  } catch (error) {
    console.error('Errore durante il caricamento dei collaboratori:', error);
  }
};


  
  
useEffect(() => {
  fetchProjectResources();
  fetchCategoryResources();
  fetchEvents();

}, []);


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




// Funzione per salvare le commesse e aggiornare i collaboratori selezionati
const saveSelectedCommesse = async () => {
  try {
    await Promise.all(
      selectedCollaboratori.map(async collaboratoreId => {
        const commesseIds = selectedCommesse.map(commessa => ({
          id: commessa.value,
          color: commessa.color // Aggiungi il colore della commessa
        }));
        await fetch(`http://localhost:3001/api/collaboratori/${collaboratoreId}/aggiungi-commesse`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commesseIds }) // Passa anche il colore aggiornato
        });
      })
    );
    await fetchCategoryResources(); // Ricarica collaboratori per aggiornare le modifiche
    console.log('Commesse con colori aggiornati memorizzate per i collaboratori selezionati');
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
      args.addedRecords.forEach(event => {
        // Trova il colore corrispondente per la risorsa associata
        const commessa = projectResources.find(p => p.id === event.ProjectId);
        event.CategoryColor = commessa ? commessa.color : '#FF0000'; // Fallback a rosso
  
        console.log("Evento creato con colore assegnato:", event);
        saveEvent(event); // Salva l'evento con il colore
      });
    } else if (args.requestType === 'eventRemoved') {
      args.deletedRecords.forEach(event => {
        console.log("Evento rimosso:", event);
        deleteEvent(event.Id);
      });
    } else if (args.requestType === 'eventChanged') {
      args.changedRecords.forEach(event => {
        console.log("Evento aggiornato:", event);
        updateEvent(event);
      });
    }
  }
  
  
  
  // Funzione per aggiornare un evento
  const updateEvent = async (eventData) => {
    // Se CollaboratoreId è un array, lo convertiamo in una stringa separata da virgole
    const collaboratorId = Array.isArray(eventData.CollaboratoreId) ? eventData.CollaboratoreId.join(',') : eventData.CollaboratoreId;
  
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${eventData.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          CollaboratoreId: collaboratorId,  // Passiamo il CollaboratoreId come stringa corretta
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
      <button onClick={deleteSelectedCommesse}>Cancella</button>


      {/* Scheduler component */}
      <ScheduleComponent
actionComplete={onActionComplete}
width="100%"
height="650px"
selectedDate={new Date()}

eventSettings={{
  dataSource: events,
  fields: {
    subject: { title: 'Task', name: 'Subject' },
    startTime: { title: 'Start Time', name: 'StartTime' },
    endTime: { title: 'End Time', name: 'EndTime' },
    description: { title: 'Summary', name: 'Description' }
  },
  // Imposta il colore dell'evento usando CategoryColor
  cssClass: 'event-color'
}}

group={{ allowGroupEdit: true, resources: ['Projects', 'Categories'] }}
>
{/* Resource Definitions */}
<ResourcesDirective>
  <ResourceDirective
    field="ProjectId"
    title="Projects"
    name="Projects"
    dataSource={projectResources}
    textField="text"
    idField="id"
    colorField="color"
  />
  <ResourceDirective
    field="CollaboratoreId"
    title="Collaboratori"
    name="Categories"
    allowMultiple={true}
    dataSource={categoryResources}
    textField="text"
    idField="id"
    groupIDField="groupId"
    colorField="color"
  />
</ResourcesDirective>

{/* Views */}
<ViewsDirective>
<ViewDirective option="Day" />
  
  <ViewDirective option="WorkWeek" />
  <ViewDirective option="Month" />
  <ViewDirective option="TimelineWeek" />
  <ViewDirective option="TimelineMonth" />
</ViewsDirective>

<Inject services={[Day, WorkWeek, Month, Week,TimelineViews, DragAndDrop, Resize, Agenda]} />
</ScheduleComponent>

    </div>
  );
};

export default App;

