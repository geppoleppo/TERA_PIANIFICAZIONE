import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import axios from 'axios';

const App = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});

  useEffect(() => {
    const fetchCommesse = async () => {
      try {
        const response = await axios.get('http://localhost:3001/commesse');
        const colors = response.data.reduce((acc, commessa) => {
          acc[commessa.Id] = commessa.Colore;
          return acc;
        }, {});
        setCommessaColors(colors);
        console.log('commessaColors:', colors); // Log the commessaColors object
      } catch (error) {
        console.error('Error fetching commesse:', error);
      }
    };

    fetchCommesse();
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

    const updatedGanttData = updatedScheduleData.map(event => ({
      TaskID: event.Id,
      TaskName: event.Subject,
      StartDate: event.StartTime,
      EndDate: event.EndTime,
      Predecessor: event.Predecessor || '',
      CommessaId: event.CommessaId,
      Color: commessaColors[event.CommessaId] || '#000000'
    }));
    console.log('Updated Gantt Data:', updatedGanttData);
    setGanttData(updatedGanttData);
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

    const updatedScheduleData = updatedGanttData.map(task => ({
      Id: task.TaskID,
      Subject: task.TaskName,
      StartTime: task.StartDate,
      EndTime: task.EndDate,
      Predecessor: task.Predecessor,
      CommessaId: task.CommessaId,
      Color: commessaColors[task.CommessaId] || '#000000'
    }));

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
  };

  const onDataChange = (args) => {
    console.log('Data Change:', args);
    if (args.requestType === 'eventChanged') {
      if (Array.isArray(args.data)) {
        args.data.forEach(event => {
          if (!event.CommessaId && event.PreviousData) {
            event.CommessaId = event.PreviousData.CommessaId;
            console.log(`Reassigned CommessaId for Event: ${JSON.stringify(event)}`);
          }
        });
      } else {
        if (!args.data.CommessaId && args.data.PreviousData) {
          args.data.CommessaId = args.data.PreviousData.CommessaId;
          console.log(`Reassigned CommessaId for Event: ${JSON.stringify(args.data)}`);
        }
      }
    }
    handleSchedulerDataChange(args);
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={onDataChange} commessaColors={commessaColors} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} commessaColors={commessaColors} />
    </div>
  );
};

export default App;
