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
        console.log('Fetching collaborators and projects...');
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
        console.log('Fetching events...');
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
    const event = convertToStandardFormat(args.data[0]);
    console.log('Formatted Event for Scheduler:', event);

    switch (args.requestType) {
      case 'eventCreated':
        axios.post('http://localhost:3001/eventi', event)
          .then(response => {
            updateLocalData(response.data, 'add');
          })
          .catch(error => console.error('Failed to create event:', error));
        break;
      case 'eventChanged':
        axios.put(`http://localhost:3001/eventi/${event.Id}`, event)
          .then(response => {
            updateLocalData(event, 'update');
          })
          .catch(error => console.error('Failed to update event:', error));
        break;
      case 'eventRemoved':
        axios.delete(`http://localhost:3001/eventi/${event.Id}`)
          .then(response => {
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
    const task = convertToStandardFormat(args.data[0]);
    console.log('Formatted Task for Gantt:', task);
  
    switch (args.requestType) {
      case 'eventChanged':
        axios.put(`http://localhost:3001/eventi/${task.Id}`, task)
          .then(response => {
            updateLocalData(task, 'update');
          })
          .catch(error => console.error('Failed to update task:', error));
        break;
      case 'eventRemoved':
        axios.delete(`http://localhost:3001/eventi/${task.Id}`)
          .then(response => {
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
  };

  const convertToStandardFormat = (event) => {
    const startDate = event.StartTime || event.StartDate || new Date().toISOString();
    const endDate = event.EndTime || event.EndDate || new Date().toISOString();

    const incaricatoId = event.IncaricatoId && event.IncaricatoId !== '' 
                          ? event.IncaricatoId 
                          : (event.taskData ? event.taskData.IncaricatoId : '');

    const commessaId = Array.isArray(event.CommessaId) ? event.CommessaId[0] : event.CommessaId || 0;
    const commessa = commesse.find(c => c.Id === commessaId);
    const commessaName = commessa ? commessa.Descrizione : '';

    return {
      ...event,
      Inizio: startDate,
      Fine: endDate,
      Descrizione: event.Subject || event.TaskName,
      CommessaId: commessaId,
      IncaricatoId: Array.isArray(incaricatoId) ? incaricatoId.join(',') : incaricatoId || '',
      CommessaName: commessaName,
      Dipendenza: event.Predecessor || '' // Assicurati di passare la dipendenza
    };
};


const formatEventForScheduler = (event) => {
    return {
      Id: event.Id,
      Subject: event.Descrizione,
      StartTime: new Date(event.Inizio),
      EndTime: new Date(event.Fine),
      CommessaId: event.CommessaId,
      IncaricatoId: event.IncaricatoId ? event.IncaricatoId.split(',').map(id => parseInt(id, 10)) : [], // Convert comma-separated string to array of integers
      Color: event.Colore,
      Progress: event.Progresso,
      CommessaName: event.CommessaName,
      Dipendenza: event.Dipendenza // Assicurati che la dipendenza sia inclusa
    };
};

const formatGanttData = (task) => {
    return {
      Id: task.Id,
      TaskName: task.Descrizione || task.Subject,
      StartDate: task.StartTime ? new Date(task.StartTime) : new Date(),
      EndDate: task.EndTime ? new Date(task.EndTime) : new Date(),
      Predecessor: task.Dipendenza || '', // Usa Dipendenza per il campo Predecessor
      Progress: task.Progresso || 0,
      Color: task.Color,
      CommessaId: task.CommessaId || '',
      IncaricatoId: task.IncaricatoId || '', // Assicurati che IncaricatoId sia incluso
      CommessaName: task.CommessaName || ''
    };
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
