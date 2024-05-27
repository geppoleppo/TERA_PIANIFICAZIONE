import React, { useState } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import { extend } from '@syncfusion/ej2-base';

const initialData = [
  // Inserisci qui i dati iniziali se necessario
];

const initialGanttData = initialData.map(event => ({
  TaskID: event.Id,
  TaskName: event.Subject,
  StartDate: event.StartTime,
  EndDate: event.EndTime,
  Predecessor: event.Predecessor || '',
  Color: event.Color || '#357cd2'
}));

const App = () => {
  const [scheduleData, setScheduleData] = useState(extend([], initialData, null, true));
  const [ganttData, setGanttData] = useState(initialGanttData);

  const handleSchedulerDataChange = (args) => {
    let updatedScheduleData = [...scheduleData];

    if (args.requestType === 'eventCreated') {
      const newEvents = Array.isArray(args.data) ? args.data : [args.data];
      newEvents.forEach(newEvent => {
        updatedScheduleData = [...updatedScheduleData.filter(event => event.Id !== newEvent.Id), newEvent];
      });
    } else if (args.requestType === 'eventChanged') {
      const updatedEvents = Array.isArray(args.data) ? args.data : [args.data];
      updatedEvents.forEach(updatedEvent => {
        updatedScheduleData = updatedScheduleData.map(event =>
          event.Id === updatedEvent.Id ? updatedEvent : event
        );
      });
    } else if (args.requestType === 'eventRemoved') {
      const removedEventIds = Array.isArray(args.data) ? args.data.map(event => event.Id) : [args.data.Id];
      updatedScheduleData = updatedScheduleData.filter(event => !removedEventIds.includes(event.Id));
    }

    setScheduleData(updatedScheduleData);

    const updatedGanttData = updatedScheduleData.map(event => ({
      TaskID: event.Id,
      TaskName: event.Subject,
      StartDate: event.StartTime,
      EndDate: event.EndTime,
      Predecessor: event.Predecessor || '',
      Color: event.Color || '#357cd2'
    }));
    setGanttData(updatedGanttData);
  };

  const handleGanttDataChange = (args) => {
    let updatedGanttData = [...ganttData];

    if (args.requestType === 'save') {
      const updatedTask = Array.isArray(args.data) ? args.data[0] : args.data;
      updatedGanttData = updatedGanttData.map(task =>
        task.TaskID === updatedTask.TaskID ? { ...task, ...updatedTask } : task
      );
    } else if (args.requestType === 'delete') {
      const removedTaskID = Array.isArray(args.data) ? args.data[0].TaskID : args.data.TaskID;
      updatedGanttData = updatedGanttData.filter(task => task.TaskID !== removedTaskID);
    }

    setGanttData(updatedGanttData);

    const updatedScheduleData = updatedGanttData.map(task => ({
      Id: task.TaskID,
      Subject: task.TaskName,
      StartTime: task.StartDate,
      EndTime: task.EndDate,
      Predecessor: task.Predecessor,
      Color: task.Color
    }));
    setScheduleData(updatedScheduleData);
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={handleSchedulerDataChange} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} />
    </div>
  );
};

export default App;
