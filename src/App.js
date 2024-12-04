import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Gantt from './components/Gantt';
import Sidebar from './sidebar/Sidebar';
import Select from 'react-select';
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

  useEffect(() => {
    console.log("Dati del Gantt:", filteredEventsForGantt);
  }, [filteredEventsForGantt]);
  
  useEffect(() => {
    console.log('EVENTONE',events)
    const enrichedEvents = events.map((event) => {
      const commessa = filteredProjectResources.find((res) => res.id === event.ProjectId);
      return {
        ...event,
        CommessaName: commessa ? commessa.text : "Non assegnata",
      };
    });
  
    setFilteredEventsForGantt(enrichedEvents);
    console.log("Dati del Gantt (con CommessaName):", enrichedEvents);
  }, [events, filteredProjectResources]);
  
  useEffect(() => {
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
    const filteredEvents = events.filter((event) => {
      const isCollaboratorMatch =
        selectedCollaboratori.length === 0 ||
        event.CollaboratoreId.some((id) => selectedCollaboratori.includes(id));
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
          key={filteredProjectResources.map((res) => res.id).join(",")}
          options={filteredProjectResources.map((project) => ({
            value: project.id,
            label: project.text,
          }))}
          isMulti
          value={filteredProjectResources
            .filter((project) => selectedCommesse.includes(project.id))
            .map((project) => ({
              value: project.id,
              label: project.text,
            }))}
          onChange={handleCommesseSelection}
          placeholder="Seleziona Commesse"
          isDisabled={filteredProjectResources.length === 0} // Disabilita il menu se non ci sono commesse
        />
      </div>

      {/* Sidebar e Gantt */}
      <Sidebar
        setProjectResources={setProjectResources}
        filteredProjectResources={filteredProjectResources}
      />
      <Gantt
        ref={ganttRef}
        ganttData={filteredEventsForGantt}
        onSaveEvent={(eventData) => console.log("Evento salvato:", eventData)}
        onUpdateEvent={(eventData) => console.log("Evento aggiornato:", eventData)}
        onDeleteEvent={(eventId) => console.log("Evento eliminato:", eventId)}
      />
    </div>
  );
};

export default App;
