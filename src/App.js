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
  const [filteredCommesse, setFilteredCommesse] = useState([]);
  const [savedData, setSavedData] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [commesseRes, collaboratoriRes, eventiRes] = await Promise.all([
          axios.get('http://localhost:3001/commesse'),
          axios.get('http://localhost:3001/collaboratori'),
          axios.get('http://localhost:3001/eventi')
        ]);

        const commesseData = commesseRes.data;
        const collaboratoriData = collaboratoriRes.data;
        const eventiData = eventiRes.data;

        setCommesse(commesseData);
        setResources(collaboratoriData);
        setScheduleData(eventiData);
        setGanttData(eventiData.map(event => formatGanttData(event)));

        const colors = commesseData.reduce((acc, commessa) => {
          acc[commessa.Id] = commessa.Colore;
          return acc;
        }, {});
        setCommessaColors(colors);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleSchedulerDataChange = (args) => {
    console.log('Scheduler Data Change:', args);
    const event = formatEventData(args.data[0]);
    console.log('Formatted Event Data:', event);
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
    const task = formatGanttData(args.data);
    console.log('Formatted Gantt Data:', task);
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
        updatedScheduleData = [...updatedScheduleData, data];
        break;
      case 'update':
        updatedScheduleData = updatedScheduleData.map(item => item.Id === data.Id ? data : item);
        break;
      case 'delete':
        updatedScheduleData = updatedScheduleData.filter(item => item.Id !== data.Id);
        break;
      default:
        break;
    }
    setScheduleData(updatedScheduleData);
    setGanttData(updatedScheduleData.map(item => formatGanttData(item)));
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
      IncaricatoId: Array.isArray(event.IncaricatoId) ? event.IncaricatoId[0] : event.IncaricatoId || '',
      Colore: commessa ? commessa.Colore : '#000000',
      Progresso: event.Progress || 0
    };
    console.log('Formatted Event Data:', formattedEvent);
    return formattedEvent;
  };

  const formatGanttData = (task) => {
    const commessa = commesse.find(c => c.Id === task.CommessaId);
    const formattedTask = {
      TaskID: task.Id,
      TaskName: task.Descrizione || '',
      StartDate: task.Inizio ? new Date(task.Inizio) : new Date(),
      EndDate: task.Fine ? new Date(task.Fine) : new Date(),
      Predecessor: task.Predecessor || '',
      Duration: task.Duration || 1,  // Assuming duration of 1 if not provided
      Progress: task.Progresso || 0,
      Color: task.Colore || commessa ? commessa.Colore : '#000000',
      CommessaId: task.CommessaId || ''
    };
    console.log('Formatted Gantt Task:', formattedTask);
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
