import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import axios from 'axios';

const App = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [resources, setResources] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});
  const [commesse, setCommesse] = useState([]);
  const [savedData, setSavedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //console.log('Fetching collaborators and projects...');
        const [collaboratoriResponse, commesseResponse] = await Promise.all([
          axios.get('http://localhost:3001/collaboratori'),
          axios.get('http://localhost:3001/commesse')
        ]);

        const staticCollaboratori = collaboratoriResponse.data;
        const staticCommesse = commesseResponse.data;
        console.log('Collaborators:', staticCollaboratori);
        console.log('Projects:', staticCommesse);

        setResources(staticCollaboratori);
        setCommesse(staticCommesse);

        const colors = staticCommesse.reduce((acc, commessa) => {
          acc[commessa.Id] = commessa.Colore;
          return acc;
        }, {});
        setCommessaColors(colors);
        console.log('Commessa Colors:', colors);

        // Carica gli eventi dal server solo dopo che le commesse sono state impostate
        //console.log('Fetching events...');
        const eventiResponse = await axios.get('http://localhost:3001/eventi');
        const staticSchedulerData = eventiResponse.data.map(event => formatEventForScheduler(event));
        console.log('Events:', staticSchedulerData);

        // Aggiorna lo stato con gli eventi caricati
        setScheduleData(staticSchedulerData);
        setGanttData(staticSchedulerData.map(event => formatGanttData(event, staticCommesse)));
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, []);

  const handleSchedulerDataChange = (args) => {
    console.log('Scheduler Data Change:', args);
    const event = formatEventData(args.data[0]);
    //console.log('Formatted Event Data:', event);
    switch (args.requestType) {
      case 'eventCreated':
        axios.post('http://localhost:3001/eventi', event)
          .then(response => {
            console.log('Event created:', response.data);
            updateLocalData(response.data, 'add');
          })
          .catch(error => console.error('Failed to create event:', error));
        break;
      case 'eventChanged':
        axios.put(`http://localhost:3001/eventi/${event.Id}`, event)
          .then(response => {
            console.log('Event updated:', response.data);
            updateLocalData(event, 'update');
          })
          .catch(error => console.error('Failed to update event:', error));
        break;
      case 'eventRemoved':
        axios.delete(`http://localhost:3001/eventi/${event.Id}`)
          .then(response => {
            console.log('Event deleted:', response.data);
            updateLocalData(event, 'delete');
          })
          .catch(error => console.error('Failed to delete event:', error));
        break;
      default:
        break;
    }
  };

  const handleGanttDataChange = (args) => {
    console.log('Gantt Data Change:', args);
    const task = formatGanttData(args.data, commesse);
    //console.log('Formatted Gantt Data:', task);
    switch (args.requestType) {
      case 'save':
        axios.put(`http://localhost:3001/eventi/${task.Id}`, task)
          .then(response => {
            console.log('Task updated:', response.data);
            updateLocalData(task, 'update');
          })
          .catch(error => console.error('Failed to update task:', error));
        break;
      case 'delete':
        axios.delete(`http://localhost:3001/eventi/${task.Id}`)
          .then(response => {
            console.log('Task deleted:', response.data);
            updateLocalData(task, 'delete');
          })
          .catch(error => console.error('Failed to delete task:', error));
        break;
      default:
        break;
    }
  };

  const updateLocalData = (data, type) => {
    let updatedScheduleData = [...scheduleData];
    switch (type) {
      case 'add':
        updatedScheduleData = [...updatedScheduleData, formatEventForScheduler(data)];
        break;
      case 'update':
        updatedScheduleData = updatedScheduleData.map(item => item.Id === data.Id ? formatEventForScheduler(data) : item);
        break;
      case 'delete':
        updatedScheduleData = updatedScheduleData.filter(item => item.Id !== data.Id);
        break;
      default:
        break;
    }
    setScheduleData(updatedScheduleData);
    setGanttData(updatedScheduleData.map(item => formatGanttData(item, commesse)));
    console.log('Updated Schedule Data:', updatedScheduleData);
    console.log('Updated Gantt Data:', updatedScheduleData);
  };

  const formatEventData = (event) => {
    const commessa = commesse.find(c => c.Id === event.CommessaId);
    const formattedEvent = {
      Id: event.Id,
      Descrizione: event.Subject || '',
      Inizio: event.StartTime ? new Date(event.StartTime).toISOString() : '',
      Fine: event.EndTime ? new Date(event.EndTime).toISOString() : '',
      CommessaId: event.CommessaId || '',
      IncaricatoId: event.IncaricatoId.join(','), // Convert array to comma-separated string
      Colore: commessa ? commessa.Colore : '#000000',
      Progresso: event.Progress || 0
    };
    console.log('Formatted Event Data:', formattedEvent);
    return formattedEvent;
  };

  const formatEventForScheduler = (event) => {
    return {
      Id: event.Id,
      Subject: event.Descrizione,
      StartTime: new Date(event.Inizio),
      EndTime: new Date(event.Fine),
      CommessaId: event.CommessaId,
      IncaricatoId: event.IncaricatoId.split(','), // Convert comma-separated string to array
      Color: event.Colore,
      Progress: event.Progresso
    };
  };

  const formatGanttData = (task, commesse) => {
    const commessa = commesse.find(c => c.Id === task.CommessaId);
    const formattedTask = {
      Id: task.Id,
      TaskName: task.Descrizione || '',
      StartTime: task.Inizio ? new Date(task.Inizio) : new Date(),
      EndTime: task.Fine ? new Date(task.Fine) : new Date(),
      Predecessor: task.Predecessor || '',
      Duration: task.Duration || 1,
      Progress: task.Progresso || 0,
      Color: (commessa && commessa.Colore) || '#000000',
      CommessaId: task.CommessaId || ''
    };
    //console.log('Formatted Gantt Task:', formattedTask);
    return formattedTask;
  };

  return (
    <div className="app-container">
      <Scheduler
        data={scheduleData}
        resources={resources}
        onDataChange={handleSchedulerDataChange}
        commessaColors={commessaColors}
        commesse={commesse}
      />
      <Gantt
        data={ganttData}
        onDataChange={handleGanttDataChange}
        commessaColors={commessaColors}
        commesse={commesse}
      />
      <div className="saved-data-container">
        <h2>Saved Data</h2>
        <pre>{JSON.stringify(savedData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default App;
