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
        setGanttData(eventiData);

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
    switch (args.requestType) {
      case 'eventCreated':
        axios.post('http://localhost:3001/eventi', args.data)
          .then(response => {
            console.log('Event created:', response.data);
            updateLocalData(response.data, 'add');
          })
          .catch(error => console.error('Failed to create event:', error));
        break;
      case 'eventChanged':
        axios.put(`http://localhost:3001/eventi/${args.data.Id}`, args.data)
          .then(response => {
            console.log('Event updated:', response.data);
            updateLocalData(args.data, 'update');
          })
          .catch(error => console.error('Failed to update event:', error));
        break;
      case 'eventRemoved':
        axios.delete(`http://localhost:3001/eventi/${args.data.Id}`)
          .then(response => {
            console.log('Event deleted:', response.data);
            updateLocalData(args.data, 'delete');
          })
          .catch(error => console.error('Failed to delete event:', error));
        break;
      default:
        break;
    }
  };

  const handleGanttDataChange = (args) => {
    console.log('Gantt Data Change:', args);
    switch (args.requestType) {
      case 'save':
        axios.put(`http://localhost:3001/eventi/${args.data.Id}`, args.data)
          .then(response => {
            console.log('Task updated:', response.data);
            updateLocalData(args.data, 'update');
          })
          .catch(error => console.error('Failed to update task:', error));
        break;
      case 'delete':
        axios.delete(`http://localhost:3001/eventi/${args.data.Id}`)
          .then(response => {
            console.log('Task deleted:', response.data);
            updateLocalData(args.data, 'delete');
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
    setGanttData(updatedScheduleData.map(item => ({
      ...item,
      TaskID: item.Id,
      TaskName: item.Descrizione,
      StartDate: item.Inizio,
      EndDate: item.Fine,
      CommessaId: item.CommessaId,
      CommessaName: commesse.find(c => c.Id === item.CommessaId)?.Descrizione,
      Color: item.Colore,
      Progress: item.Progresso
    })));
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
