import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import axios from 'axios';

const App = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});
  const [commesse, setCommesse] = useState([]);
  const [filteredCommesse, setFilteredCommesse] = useState([]);
  const [savedData, setSavedData] = useState([]);


  const staticCommesse = [
    { Id: 1, Descrizione: 'Commessa 1', Colore: '#ff0000' },
    { Id: 2, Descrizione: 'Commessa 2', Colore: '#00ff00' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commesseResponse = await axios.get('http://localhost:3001/commesse');
        const colors = commesseResponse.data.reduce((acc, commessa) => {
          acc[commessa.Id] = commessa.Colore;
          return acc;
        }, {});
        setCommesse(commesseResponse.data);
        setCommessaColors(colors);

        // Fetch events from the server
        const scheduleEventsResponse = await axios.get('http://localhost:3001/schedulerevents');
        const ganttTasksResponse = await axios.get('http://localhost:3001/gantttasks');

        // Convert event data to correct format for Scheduler and Gantt
        const initialScheduleData = scheduleEventsResponse.data.map(event => ({
          ...event,
          Id: event.EventID,
          StartTime: new Date(event.StartTime),
          EndTime: new Date(event.EndTime),
          IsAllDay: !!event.IsAllDay,
          IncaricatoId: event.IncaricatiId ? event.IncaricatiId.split(',') : []
        }));

        const initialGanttData = ganttTasksResponse.data.map(task => ({
          ...task,
          TaskID: task.TaskID,
          StartDate: new Date(task.StartDate),
          EndDate: new Date(task.EndDate),
        }));
        // Set the fetched data into the state
        setScheduleData(initialScheduleData);
        setGanttData(initialGanttData); 
        setFilteredCommesse(commesseResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSchedulerDataChange = (args) => {
    console.log('Scheduler Data Change:', args);
    let updatedScheduleData = [...scheduleData];

    if (args.requestType === 'eventCreated') {
      const newEvents = Array.isArray(args.data) ? args.data : [args.data];
      newEvents.forEach(newEvent => {
        newEvent.Color = commessaColors[newEvent.CommessaId] || '#000000';
        updatedScheduleData = [...updatedScheduleData.filter(event => event.Id !== newEvent.Id), newEvent];
      });
    } else if (args.requestType === 'eventChanged') {
      const updatedEvents = Array.isArray(args.data) ? args.data : [args.data];
      updatedEvents.forEach(updatedEvent => {
        updatedEvent.Color = commessaColors[updatedEvent.CommessaId] || '#000000';
        updatedScheduleData = updatedScheduleData.map(event =>
          event.Id === updatedEvent.Id ? updatedEvent : event
        );
      });
    } else if (args.requestType === 'eventRemoved') {
      const removedEventIds = Array.isArray(args.data) ? args.data.map(event => event.Id) : [args.data.Id];
      updatedScheduleData = updatedScheduleData.filter(event => !removedEventIds.includes(event.Id));
    }

    console.log('Updated Schedule Data:', updatedScheduleData);
    setScheduleData(updatedScheduleData);

    const updatedGanttData = updatedScheduleData.map(event => {
      const commessa = commesse.find(c => c.Id === event.CommessaId);
      return {
        TaskID: event.Id,
        TaskName: event.Subject,
        StartDate: event.StartTime,
        EndDate: event.EndTime,
        Predecessor: event.Predecessor || '',
        CommessaId: event.CommessaId,
        CommessaName: commessa ? commessa.Descrizione : 'N/A',
        Color: event.Color,
        Progress: event.Progress || 0
      };
    });
    console.log('Updated Gantt Data:', updatedGanttData);
    setGanttData(updatedGanttData);

    const visibleCommesseIds = updatedScheduleData.map(event => event.CommessaId);
    const newFilteredCommesse = commesse.filter(commessa => visibleCommesseIds.includes(commessa.Id));
    setFilteredCommesse(newFilteredCommesse);

    // Simula il salvataggio dei dati
    saveData(updatedGanttData);
  };

  const handleGanttDataChange = (args) => {
    console.log('Gantt Data Change:', args);
    let updatedGanttData = [...ganttData];

    if (args.requestType === 'save' || args.requestType === 'delete') {
      const updatedTasks = Array.isArray(args.data) ? args.data : [args.data];
      updatedTasks.forEach(updatedTask => {
        if (args.requestType === 'save') {
          updatedTask.Color = commessaColors[updatedTask.CommessaId] || '#000000';
          console.log('Updated Task:', updatedTask);
          updatedGanttData = updatedGanttData.map(task =>
            task.TaskID === updatedTask.TaskID ? { ...task, ...updatedTask } : task
          );
        } else if (args.requestType === 'delete') {
          updatedGanttData = updatedGanttData.filter(task => task.TaskID !== updatedTask.TaskID);
        }
      });
    }

    console.log('Updated Gantt Data after change:', updatedGanttData);
    setGanttData(updatedGanttData);

    const updatedScheduleData = updatedGanttData.map(task => {
      const commessa = commesse.find(c => c.Id === task.CommessaId);
      return {
        Id: task.TaskID,
        Subject: task.TaskName,
        StartTime: task.StartDate,
        EndTime: task.EndDate,
        Predecessor: task.Predecessor,
        CommessaId: task.CommessaId,
        CommessaName: commessa ? commessa.Descrizione : 'N/A',
        Color: task.Color,
        Progress: task.Progress || 0
      };
    });

    console.log('Updated Schedule Data from Gantt:', updatedScheduleData);

    const finalScheduleData = scheduleData.map(event => {
      const ganttTask = updatedScheduleData.find(task => task.Id === event.Id);
      return ganttTask ? { ...event, ...ganttTask } : event;
    });

    updatedScheduleData.forEach(task => {
      if (!finalScheduleData.find(event => event.Id === task.Id)) {
        finalScheduleData.push(task);
      }
    });

    console.log('Final Schedule Data:', finalScheduleData);
    setScheduleData(finalScheduleData);

    const visibleCommesseIds = finalScheduleData.map(event => event.CommessaId);
    const newFilteredCommesse = commesse.filter(commessa => visibleCommesseIds.includes(commessa.Id));
    setFilteredCommesse(newFilteredCommesse);

    // Simula il salvataggio dei dati
    saveData(updatedGanttData);
  };

  const saveData = (data) => {
    console.log('Saving data:', data);
    setSavedData(data); // Aggiorna lo stato con i dati salvati

    // Simula una chiamata API per salvare i dati
    axios.post('https://httpbin.org/post', data)
      .then(response => {
        console.log('Data saved successfully:', response.data);
      })
      .catch(error => {
        console.error('Error saving data:', error);
      });
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={handleSchedulerDataChange} commessaColors={commessaColors} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} commessaColors={commessaColors} commesse={filteredCommesse} />
      <div className="saved-data-container">
        <h2>Saved Data</h2>
        <pre>{JSON.stringify(savedData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default App;
