import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import { extend } from '@syncfusion/ej2-base';
import commesse, { getCommessaColor } from './components/commesse';

const initialData = []; // Rimuovi le attività predefinite

const App = () => {
  const [scheduleData, setScheduleData] = useState(extend([], initialData, null, true));
  const [ganttData, setGanttData] = useState(initialData);

  useEffect(() => {
    console.log('Initial Gantt Data:', ganttData);
  }, []);

  const handleSchedulerDataChange = (args) => {
    console.log('Scheduler Data Change:', args);
    let updatedScheduleData = [...scheduleData];

    if (args.requestType === 'eventCreated') {
      const newEvents = Array.isArray(args.data) ? args.data : [args.data];
      newEvents.forEach(newEvent => {
        newEvent.Color = getCommessaColor(newEvent.CommessaId);
        console.log('New Event:', newEvent);
        updatedScheduleData = [...updatedScheduleData.filter(event => event.Id !== newEvent.Id), newEvent];
      });
    } else if (args.requestType === 'eventChanged') {
      const updatedEvents = Array.isArray(args.data) ? args.data : [args.data];
      updatedEvents.forEach(updatedEvent => {
        updatedEvent.Color = getCommessaColor(updatedEvent.CommessaId);
        console.log('Updated Event:', updatedEvent);
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
      Color: getCommessaColor(event.CommessaId)
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
          updatedTask.Color = getCommessaColor(updatedTask.CommessaId);
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
      Color: getCommessaColor(task.CommessaId)
    }));

    console.log('Updated Schedule Data from Gantt:', updatedScheduleData);

    // Sync the updated data with the existing schedule data
    const finalScheduleData = scheduleData.map(event => {
      const ganttTask = updatedScheduleData.find(task => task.Id === event.Id);
      return ganttTask ? { ...event, ...ganttTask } : event;
    });

    // Add any new tasks from Gantt to the Scheduler data
    updatedScheduleData.forEach(task => {
      if (!finalScheduleData.find(event => event.Id === task.Id)) {
        finalScheduleData.push(task);
      }
    });

    console.log('Final Schedule Data:', finalScheduleData);
    setScheduleData(finalScheduleData);
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={handleSchedulerDataChange} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} />
    </div>
  );
};

export default App;
