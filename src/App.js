import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import axios from 'axios';
import Select from 'react-select';
import { TwitterPicker } from 'react-color';

const App = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [resources, setResources] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});
  const [commesse, setCommesse] = useState([]);
  const [mysqlCommesse, setMysqlCommesse] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [ganttKey, setGanttKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collaboratoriResponse, commesseResponse, mysqlCommesseResponse] = await Promise.all([
          axios.get('http://localhost:3001/collaboratori'),
          axios.get('http://localhost:3001/commesse'),
          axios.get('http://localhost:3001/commesse-mysql')
        ]);

        const staticCollaboratori = collaboratoriResponse.data;
        const staticCommesse = commesseResponse.data;
        const mysqlCommesse = mysqlCommesseResponse.data.map(commessa => ({
          value: commessa.NOME.substring(0, 5),
          label: commessa.NOME
        }));

        setResources(staticCollaboratori);
        setCommesse(staticCommesse);
        setMysqlCommesse(mysqlCommesse);

        const colors = staticCommesse.reduce((acc, commessa) => {
          acc[commessa.CommessaName] = commessa.Colore;
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

  const handleCommesseChange = (selectedOptions) => {
    setSelectedCommesse(selectedOptions);
  };

  const handleColorChange = (color, index) => {
    const updatedSelectedCommesse = [...selectedCommesse];
    updatedSelectedCommesse[index].color = color.hex;
    setSelectedCommesse(updatedSelectedCommesse);
  };

  const saveSelectedCommesse = async () => {
    try {
      const commesseToSave = selectedCommesse.map(option => ({
        descrizione: option.label,
        colore: option.color || '#000000'
      }));
      await axios.post('http://localhost:3001/update-sqlite', { commesse: commesseToSave });
      // Optionally, fetch updated data and update state
    } catch (error) {
      console.error('Failed to update SQLite:', error);
    }
  };

  const removeCommessa = (index) => {
    const updatedSelectedCommesse = [...selectedCommesse];
    updatedSelectedCommesse.splice(index, 1);
    setSelectedCommesse(updatedSelectedCommesse);
  };

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

  const convertToStandardFormat = (event) => {
    const startDate = event.StartTime || event.StartDate || new Date().toISOString();
    const endDate = event.EndTime || event.EndDate || new Date().toISOString();

    const incaricatoId = event.IncaricatoId && event.IncaricatoId !== '' 
                          ? event.IncaricatoId 
                          : (event.taskData ? event.taskData.IncaricatoId : '');

    const commessaName = event.CommessaId ? commesse.find(c => c.Id === event.CommessaId).CommessaName : '';

    return {
      ...event,
      Inizio: startDate,
      Fine: endDate,
      Descrizione: event.Subject || event.TaskName,
      CommessaName: commessaName,
      IncaricatoId: Array.isArray(incaricatoId) ? incaricatoId.join(',') : incaricatoId || '',
      Dipendenza: event.Predecessor || '',
      Colore: event.Color || commessaColors[commessaName] || '#000000'
    };
  };

  const formatEventForScheduler = (event) => {
    return {
      Id: event.Id,
      Subject: event.Descrizione,
      StartTime: new Date(event.Inizio),
      EndTime: new Date(event.Fine),
      CommessaName: event.CommessaName,
      IncaricatoId: event.IncaricatoId ? event.IncaricatoId.split(',').map(id => parseInt(id, 10)) : [],
      Color: event.Colore,
      Progress: event.Progresso,
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
      Color: task.Colore || commessaColors[task.CommessaName] || '#000000',
      CommessaName: task.CommessaName || '',
      IncaricatoId: task.IncaricatoId || ''
    };
  };

  return (
    <div className="app-container">
      <div className="menu-container">
        <Select
          isMulti
          options={mysqlCommesse}
          onChange={handleCommesseChange}
          placeholder="Seleziona commesse da monitorare"
        />
        {selectedCommesse.map((commessa, index) => (
          <div key={index} style={{ marginTop: '10px' }}>
            <span>{commessa.label}</span>
            <TwitterPicker
              color={commessa.color || '#000000'}
              onChangeComplete={(color) => handleColorChange(color, index)}
            />
            <button onClick={() => removeCommessa(index)}>Rimuovi</button>
          </div>
        ))}
        <button onClick={saveSelectedCommesse}>Memorizza</button>
      </div>
      <Scheduler
        data={scheduleData}
        resources={resources}
        onDataChange={handleSchedulerDataChange}
        commessaColors={commessaColors}
        commesse={commesse}
      />
      <Gantt
        key={ganttKey}
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
