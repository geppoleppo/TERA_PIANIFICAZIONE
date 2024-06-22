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
  const [ganttKey, setGanttKey] = useState(0); // Add key state for Gantt component

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collaboratoriResponse, commesseResponse] = await Promise.all([
          axios.get('http://localhost:3001/collaboratori'),
          axios.get('http://localhost:3001/commesse')
        ]);

        const staticCollaboratori = collaboratoriResponse.data;
        const staticCommesse = commesseResponse.data;

        setResources(staticCollaboratori);
        setCommesse(staticCommesse);

        const colors = staticCommesse.reduce((acc, commessa) => {
          acc[commessa.Id] = commessa.Colore;
          return acc;
        }, {});
        setCommessaColors(colors);

        const eventiResponse = await axios.get('http://localhost:3001/eventi');
        const staticSchedulerData = eventiResponse.data.map(event => formatEventForScheduler(event));

        setScheduleData(staticSchedulerData);
        setGanttData(staticSchedulerData.map(event => formatGanttData(event, staticCommesse)));
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, []);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSchedulerDataChange = debounce((args) => {
    const event = convertToStandardFormat(args.data[0]);

    switch (args.requestType) {
      case 'eventCreated':
        axios.post('http://localhost:3001/eventi', event)
          .then(response => {
            updateLocalData(response.data, 'add');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to create event:', error));
        break;
      case 'eventChanged':
        axios.put(`http://localhost:3001/eventi/${event.Id}`, event)
          .then(() => {
            updateLocalData(event, 'update');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to update event:', error));
        break;
      case 'eventRemoved':
        axios.delete(`http://localhost:3001/eventi/${event.Id}`)
          .then(() => {
            updateLocalData(event, 'delete');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to delete event:', error));
        break;
      default:
        break;
    }
  }, 300);

  const handleGanttDataChange = debounce((args) => {
    const task = convertToStandardFormat(args.data[0]);

    switch (args.requestType) {
      case 'eventChanged':
        axios.put(`http://localhost:3001/eventi/${task.Id}`, task)
          .then(() => {
            updateLocalData(task, 'update');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to update task:', error));
        break;
      case 'eventRemoved':
        axios.delete(`http://localhost:3001/eventi/${task.Id}`)
          .then(() => {
            updateLocalData(task, 'delete');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to delete task:', error));
        break;
      default:
        break;
    }
  }, 300);

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
    setGanttKey(prevKey => prevKey + 1); // Increment key to force re-render
  };

  const reloadSchedulerData = async () => {
    try {
      const eventiResponse = await axios.get('http://localhost:3001/eventi');
      const staticSchedulerData = eventiResponse.data.map(event => formatEventForScheduler(event));

      setScheduleData(staticSchedulerData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    }
  };

  const reloadGanttData = async () => {
    try {
      console.log('Ricarica dati Gantt iniziata');
      const eventiResponse = await axios.get('http://localhost:3001/eventi');
      const staticGanttData = eventiResponse.data.map(event => formatGanttData(event, commesse));
      setGanttData(staticGanttData);
      setGanttKey(prevKey => prevKey + 1); // Increment key to force re-render
      console.log('Dati Gantt ricaricati:', staticGanttData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati Gantt:', error);
    }
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
      Dipendenza: event.Predecessor || '',
      Colore: event.Color || commessaColors[commessaId] || '#000000' // Assicurarsi che il colore sia definito
    };
  };

  const formatEventForScheduler = (event) => {
    return {
      Id: event.Id,
      Subject: event.Descrizione,
      StartTime: new Date(event.Inizio),
      EndTime: new Date(event.Fine),
      CommessaId: event.CommessaId,
      IncaricatoId: event.IncaricatoId ? event.IncaricatoId.split(',').map(id => parseInt(id, 10)) : [],
      Color: event.Colore,
      Progress: event.Progresso,
      CommessaName: event.CommessaName,
      Dipendenza: event.Dipendenza
    };
  };

  const formatGanttData = (task) => {
    return {
      Id: task.Id,
      TaskName: task.Descrizione || task.Subject,
      StartDate: task.StartTime ? new Date(task.StartTime) : new Date(),
      EndDate: task.EndTime ? new Date(task.EndTime) : new Date(),
      Predecessor: task.Dipendenza || '',
      Progress: task.Progresso || 0,
      Color: task.Colore || commessaColors[task.CommessaId] || '#000000', // Assicurarsi che il colore sia definito
      CommessaId: task.CommessaId || '',
      IncaricatoId: task.IncaricatoId || '',
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
      <button onClick={reloadGanttData}>Ricarica Dati Gantt</button>
      <Gantt
        key={ganttKey} // Add key prop to force re-render
        data={ganttData}
        onDataChange={handleGanttDataChange}
        commessaColors={commessaColors}
        commesse={commesse}
        resources={resources}
      />
    </div>
  );
};

export default App;
