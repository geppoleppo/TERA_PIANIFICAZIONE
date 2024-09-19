import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { TwitterPicker } from 'react-color';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, TimelineViews, Inject } from '@syncfusion/ej2-react-schedule';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar } from '@syncfusion/ej2-react-gantt'; // Importa il Gantt
import './App.css';

const App = () => {
  const [resources, setResources] = useState([]); // Collaboratori
  const [commesse, setCommesse] = useState([]);   // Commesse dal DB
  const [selectedCollaboratore, setSelectedCollaboratore] = useState(null);
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});
  const [scheduleData, setScheduleData] = useState([]);  // Dati per lo scheduler
  const [ganttData, setGanttData] = useState([]);        // Dati per il Gantt
  



  // Carica collaboratori e commesse dal DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const collaboratoriResponse = await axios.get('http://localhost:4443/api/collaboratori');
        setResources(collaboratoriResponse.data);

        const commesseResponse = await axios.get('http://localhost:4443/api/commesse');
        setCommesse(commesseResponse.data);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, []);

  // Gestisce il cambio di collaboratore
  const handleCollaboratoreChange = async (selectedOptions) => {
    setSelectedCollaboratore(selectedOptions);
  
    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedCommesse([]);  // Nessun collaboratore selezionato, nessuna commessa
      return;
    }
  
    try {
      // Array di Promises per ottenere le commesse di ciascun collaboratore
      const requests = selectedOptions.map(option => axios.get(`http://localhost:4443/api/commesse/collaboratore/${option.value}`));
  
      // Risolviamo tutte le promesse
      const responses = await Promise.all(requests);
  
      // Uniamo tutte le commesse e troviamo quelle comuni
      const commesseAssociate = responses
        .map(response => response.data.map(commessa => commessa.CommessaName))
        .reduce((commune, commessaList) => {
          return commune.filter(commessa => commessaList.includes(commessa));  // Filtra le commesse comuni a tutti i collaboratori
        });
  
      const commesseVisualizzabili = commesseAssociate.map(commessaName => ({
        value: commessaName,
        label: commessaName
      }));
  
      setSelectedCommesse(commesseVisualizzabili);
  
    } catch (error) {
      console.error('Errore nel caricamento delle commesse per i collaboratori selezionati:', error);
    }
  };
  
  // Gestisce il cambio di colore
  const handleColorChange = (color, commessaName) => {
    setCommessaColors(prevColors => ({
      ...prevColors,
      [commessaName]: color.hex
    }));
  };

  // Salva le commesse e i colori per il collaboratore selezionato
  const saveSelectedCommesse = async () => {
    try {
      const commesseToSave = selectedCommesse.map(option => ({
        commessaName: option.value,
        colore: commessaColors[option.value] || '#000000'
      }));
  
      await Promise.all(selectedCollaboratore.map(collaboratore => 
        axios.post('http://localhost:4443/api/associate-commesse-collaboratore', {
          collaboratoreId: collaboratore.value,
          commesse: commesseToSave
        })
      ));
  
      alert('Commesse associate e salvate con successo!');
    } catch (error) {
      console.error('Errore nel salvataggio delle commesse:', error);
      alert('Errore nel salvataggio delle commesse');
    }
  };
  
  const handleSchedulerDataChange = (updatedData) => {
    console.log('Dati dello scheduler aggiornati:', updatedData);
  
    // Controlla se updatedData è un array, altrimenti imposta un array vuoto
    if (Array.isArray(updatedData)) {
      setScheduleData(updatedData);  // Aggiorna lo stato con i nuovi dati dello scheduler
    } else {
      setScheduleData([]);  // Assicurati che scheduleData sia sempre un array
    }
  };
  
  const handleSchedulerActionComplete = async (args) => {
    if (args.requestType === 'eventCreated') {
      const newEvent = args.data[0]; // Se è un singolo evento
      try {
        // Salva l'evento nel database
        const response = await axios.post('http://localhost:4443/api/eventi', {
          Descrizione: newEvent.Subject || 'No description',
          Inizio: newEvent.StartTime,
          Fine: newEvent.EndTime,
          CommessaName: newEvent.CommessaName,
          IncaricatoId: Array.isArray(newEvent.IncaricatoId) ? newEvent.IncaricatoId.join(',') : newEvent.IncaricatoId,
          Colore: newEvent.Color || '#000000',
          Progresso: newEvent.Progress || 0,
          Dipendenza: newEvent.Predecessor || ''
        });
        console.log('Evento salvato:', response.data);
      } catch (error) {
        console.error('Errore nel salvataggio dell\'evento:', error);
      }
    } else if (args.requestType === 'eventChanged') {
      // Logica per l'aggiornamento dell'evento esistente
    }
  };
  
  

  const handleGanttDataChange = (updatedData) => {
    console.log('Dati del Gantt aggiornati:', updatedData);
    // Logica per gestire i dati aggiornati
    setGanttData(updatedData);  // Aggiorna lo stato con i nuovi dati del Gantt
  };

  return (
    <div className="app-container">
      {/* Prima sezione: Associazione commesse ai collaboratori */}
      <div className="menu-container">
        <h3>Associa commesse ai collaboratori</h3>

        {/* Seleziona il collaboratore */}
        <Select
          isMulti
          options={resources.map(collaboratore => ({
            value: collaboratore.Id,
            label: collaboratore.Nome
          }))}
          value={selectedCollaboratore}
          onChange={handleCollaboratoreChange}
          placeholder="Seleziona collaboratori"
        />

        {/* Seleziona le commesse per il collaboratore */}
        <Select
          isMulti
          options={commesse.map(commessa => ({
            value: commessa.CommessaName,
            label: commessa.CommessaName
          }))}
          value={selectedCommesse}
          onChange={setSelectedCommesse}
          placeholder="Seleziona commesse"
        />

        {/* Seleziona il colore per ogni commessa */}
        {selectedCommesse.map((commessa, index) => (
          <div key={index}>
            <span>{commessa.label}</span>
            <TwitterPicker
              color={commessaColors[commessa.value] || '#000000'}
              onChangeComplete={(color) => handleColorChange(color, commessa.value)}
            />
          </div>
        ))}

        {/* Salva le commesse e i colori */}
        <button onClick={saveSelectedCommesse}>Salva</button>




        <ScheduleComponent
  group={{ resources: ['Collaboratori'] }} // Definisci il gruppo di risorse
  resources={[{
    field: 'IncaricatoId', // Campo associato alla risorsa nel tuo evento
    title: 'Collaboratore',
    name: 'Collaboratori',
    allowMultiple: true, // Permette di selezionare più collaboratori
    dataSource: resources.map(collaboratore => ({
      Id: collaboratore.Id,
      Nome: collaboratore.Nome,
      Colore: commessaColors[collaboratore.Id] || '#000000' // Usa il colore se definito
    })),
    textField: 'Nome',
    idField: 'Id',
    colorField: 'Colore'
  }]} 
  eventSettings={{ dataSource: scheduleData }} 
  currentView="TimelineWeek"
  selectedDate={new Date()}
  actionComplete={handleSchedulerActionComplete} // Richiama la funzione di salvataggio
>
  <Inject services={[TimelineViews, Day, Week, WorkWeek, Month, Agenda]} />
</ScheduleComponent>




        {/* Gantt Syncfusion */}
        <GanttComponent
  dataSource={Array.isArray(ganttData) ? ganttData.filter(task => selectedCommesse.some(commessa => commessa.value === task.CommessaName)) : []}
  resources={resources.map(collaboratore => ({
    Id: collaboratore.Id,
    Nome: collaboratore.Nome,
    Colore: commessaColors[collaboratore.Id] || '#000000'
  }))}
  taskFields={{
    id: 'Id',
    name: 'Subject',
    startDate: 'StartTime',
    endDate: 'EndTime',
    dependency: 'Predecessor'
  }}
  actionComplete={handleGanttDataChange}
>
  <ColumnsDirective>
    <ColumnDirective field="Id" headerText="ID" width="100" />
    <ColumnDirective field="Subject" headerText="Task Name" width="250" />
    <ColumnDirective field="StartTime" headerText="Start Date" width="150" />
    <ColumnDirective field="EndTime" headerText="End Date" width="150" />
  </ColumnsDirective>
  <GanttInject services={[Edit, Selection, Toolbar]} />
</GanttComponent>


      </div>
    </div>
  );
};

export default App;
