import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Gantt from './components/Gantt';
import Sidebar from './sidebar/Sidebar';
import Select from 'react-select';
import Swal from 'sweetalert2'; // Assicurati di installare SweetAlert2 per i popup
import {
  fetchProjectResources,
  fetchCategoryResources,
  fetchEvents,
  handleCollaboratoreChange,
} from './functions/Functions';

const App = () => {
  const [projectResources, setProjectResources] = useState([]); // Tutte le commesse
  const [filteredProjectResources, setFilteredProjectResources] = useState([]); // Commesse filtrate
  const [categoryResources, setCategoryResources] = useState([]); // Collaboratori
  const [selectedCollaboratori, setSelectedCollaboratori] = useState([]); // Collaboratori selezionati
  const [selectedCommesse, setSelectedCommesse] = useState([]); // Commesse selezionate
  const [events, setEvents] = useState([]); // Eventi originali
  const [filteredEventsForGantt, setFilteredEventsForGantt] = useState([]); // Eventi filtrati
  const ganttRef = useRef(null);
  
  
  
  const handleUpdateEvent = async (updatedEvent) => {
    try {
      console.log("Dati inviati per l'aggiornamento:", updatedEvent);
  
      const response = await fetch(`http://localhost:3001/api/eventi/${updatedEvent.Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!response.ok) {
        throw new Error(`Errore durante l'aggiornamento: ${response.statusText}`);
      }
  
      const updatedData = await response.json();
      console.log("Evento aggiornato ricevuto dal server:", updatedData);
  
      // Aggiorna lo stato locale
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.Id === updatedData.Id ? { ...event, ...updatedData } : event
        )
      );
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'evento:", error);
    }
  };
  


  const handleDeleteEvent = async (eventId) => {
    try {
      console.log(`Eliminazione evento con ID: ${eventId}`);

      // Chiamata alla rotta DELETE del backend
      const response = await fetch(`http://localhost:3001/api/eventi/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Errore durante l'eliminazione: ${response.statusText}`);
      }

      console.log(`Evento con ID ${eventId} eliminato con successo.`);

      // Aggiorna lo stato locale per riflettere la modifica
      setEvents((prevEvents) => prevEvents.filter((event) => event.Id !== eventId));
      setFilteredEventsForGantt((prevEvents) =>
        prevEvents.filter((event) => event.Id !== eventId)
      );
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'evento:", error);
    }
  };


  useEffect(() => {
    console.log('USE EFFECT 1',events)
    const enrichedEvents = events.map((event) => {
      const commessa = filteredProjectResources.find((res) => res.id === event.ProjectId);
      return {
        ...event,
        CommessaName: commessa ? commessa.text : "Non assegnata",
      };
    });

    setFilteredEventsForGantt(enrichedEvents);
    //console.log("Dati del Gantt (con CommessaName):", enrichedEvents);
  }, [events, filteredProjectResources]);

  useEffect(() => {
    console.log('USE EFFECT 2')
    const loadData = async () => {
      try {
        const projects = await fetchProjectResources(); // Carica le commesse
        setProjectResources(projects);

        const categories = await fetchCategoryResources(); // Carica i collaboratori
        console.log("Collaboratori caricati:", categories);
        setCategoryResources(categories);

        const enrichedEvents = await fetchEvents(projects); // Passa le commesse per mappare CommessaName
        setEvents(enrichedEvents);
        setFilteredEventsForGantt(enrichedEvents); // Inizialmente tutti gli eventi
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
      }
    };
    loadData();
  }, []);


  // Selezione collaboratori e aggiornamento delle commesse
  const handleCollaboratoreSelection = (selectedOptions) => {
    console.log("Opzioni selezionate nel menu Collaboratori:", selectedOptions);
    handleCollaboratoreChange(
      selectedOptions,
      setSelectedCollaboratori,
      categoryResources,
      setFilteredProjectResources,
      projectResources
    );
  };

  useEffect(() => {
    //console.log('USE EFFECT 3')
    if (selectedCollaboratori.length === 0) {
      setFilteredProjectResources([]); // Nessuna commessa mostrata
      setSelectedCommesse([]); // Nessuna commessa selezionata
      console.log("Nessun collaboratore selezionato, nessuna commessa mostrata.");
    } else {
      const associatedCommesse = projectResources.filter((commessa) =>
        selectedCollaboratori.some((collabId) => {
          const collaboratore = categoryResources.find((c) => c.id === collabId);
          return collaboratore?.groupIds.includes(commessa.id);
        })
      );
      setFilteredProjectResources(associatedCommesse);
      const selectedIds = associatedCommesse.map((res) => res.id);
      setSelectedCommesse(selectedIds);
      //console.log("Commesse selezionate automaticamente:", selectedIds);
    }
  }, [selectedCollaboratori, projectResources, categoryResources]);

  useEffect(() => {
    console.log('USE EFFECT 4',events)
    const filteredEvents = events.filter((event) => {
      const isCollaboratorMatch =
        selectedCollaboratori.length === 0 ||
        event.IncaricatoId.some((id) => selectedCollaboratori.includes(id));
      const isCommessaMatch =
        selectedCommesse.length === 0 || selectedCommesse.includes(event.ProjectId);
      return isCollaboratorMatch && isCommessaMatch;
    });
    setFilteredEventsForGantt(filteredEvents);
  }, [selectedCollaboratori, selectedCommesse, events]);

  const handleCommesseSelection = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setSelectedCommesse(selectedIds);
  };

  const handleSaveEvent = async (newEvent) => {
    try {
      console.log("Salvataggio del nuovo evento:", newEvent);
  
      const response = await fetch('http://localhost:3001/api/eventi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
  
      if (!response.ok) {
        throw new Error('Errore durante il salvataggio del nuovo evento.');
      }
  
      const savedEvent = await response.json();
      console.log("Nuovo evento salvato:", savedEvent);
  
      // Aggiungi il nuovo evento allo stato locale
      setEvents((prevEvents) => [...prevEvents, { ...newEvent, Id: savedEvent.Id }]);
    } catch (error) {
      console.error('Errore durante il salvataggio del nuovo evento:', error);
    }
  };
  

  const handleSaveAssociations = () => {
    if (selectedCollaboratori.length !== 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Attenzione!',
        text: 'Puoi memorizzare le commesse solo per un singolo collaboratore alla volta.',
      });
      return;
    }

    const collaboratoreId = selectedCollaboratori[0]; // Collaboratore selezionato
    const commesseIds = selectedCommesse; // Commesse selezionate

    console.log("Memorizzazione in corso per il collaboratore:", collaboratoreId, "con commesse:", commesseIds);

    fetch('http://localhost:3001/api/memorizza', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collaboratoreId, commesseIds }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Errore durante la memorizzazione.');
        }
        return response.json();
      })
      .then((data) => {
        Swal.fire({
          icon: 'success',
          title: 'Memorizzazione riuscita!',
          text: data.message || 'Le commesse sono state memorizzate con successo.',
        });
      })
      .catch((error) => {
        console.error('Errore durante la memorizzazione:', error);
        Swal.fire({
          icon: 'error',
          title: 'Errore!',
          text: 'Si è verificato un errore durante la memorizzazione. Riprova più tardi.',
        });
      });
  };

  const filteredCategoryResources = categoryResources.filter((collab) =>
    selectedCollaboratori.includes(collab.id)
  );

  return (
    <div className="App">
      {/* Menu di selezione Collaboratori */}
      <div>
        <label>Seleziona Collaboratore:</label>
        <Select
          options={categoryResources.map((collab) => ({
            value: collab.id,
            label: collab.text,
          }))}
          isMulti
          onChange={handleCollaboratoreSelection}
          placeholder="Seleziona Collaboratore"
        />
      </div>

      {/* Menu di selezione Commesse */}
      <div>
        <label>Seleziona Commesse:</label>
        <Select
          key={projectResources.map((res) => res.id).join(",")} // Forza il re-render quando le opzioni cambiano
          options={projectResources.map((project) => ({
            value: project.id,
            label: project.text,
          }))}
          isMulti
          value={projectResources
            .filter((project) => selectedCommesse.includes(project.id))
            .map((project) => ({
              value: project.id,
              label: project.text,
            }))} // Sincronizza le commesse selezionate
          onChange={handleCommesseSelection}
          placeholder="Seleziona Commesse"
        />
      </div>

      <div>
        <button onClick={handleSaveAssociations} className="btn btn-primary">
          Memorizza
        </button>
      </div>


      {/* Sidebar e Gantt */}
      <Sidebar
        setProjectResources={setProjectResources}
        filteredProjectResources={filteredProjectResources}
      />
<Gantt
  ganttData={filteredEventsForGantt}
  projectResources={projectResources} // Per il menu delle commesse
  selectedCommesse={selectedCommesse} // Per gli ID delle commesse selezionabili
  //categoryResources={categoryResources} // Per il menu collaboratori
  selectedCollaboratori={selectedCollaboratori}
  categoryResources={filteredCategoryResources}
  onSaveEvent={handleSaveEvent}
  onUpdateEvent={handleUpdateEvent}
  onDeleteEvent={handleDeleteEvent}
/>
      
    </div>
  );
};

export default App;
