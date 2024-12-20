import React, { useEffect } from 'react';
import {
  GanttComponent,
  Selection,
  DayMarkers,
  Toolbar,
  Edit,
  Resize,
  RowDD,
  Inject,
} from '@syncfusion/ej2-react-gantt';

const Gantt = ({ ganttData }) => {
  // Trasforma i dati per il Gantt
  let structuredData = [];
  try {
    structuredData = ganttData.reduce((acc, event) => {
      const existingProject = acc.find((proj) => proj.CommessaName === event.CommessaName);

      if (existingProject) {
        existingProject.subtasks.push({
          Id: event.Id,
          Subject: event.Subject,
          StartTime: event.StartTime,
          EndTime: event.EndTime,
          Duration: event.Duration, // Valore di default per Duration
          Progress: event.Progress, // Valore di default per Progress
          IncaricatoName: event.IncaricatoName,
          CommessaName: event.CommessaName,
        });
      } else {
        acc.push({
          Id: event.ProjectId,
          CommessaName: event.CommessaName,
          StartTime: event.StartTime,
          EndTime: event.EndTime,
          Duration: event.Duration, // Valore di default per Duration
          Progress: event.Progress, // Valore di default per Progress
          subtasks: [
            {
              Id: event.Id,
              Subject: event.Subject,
              StartTime: event.StartTime,
              EndTime: event.EndTime,
              Duration: event.Duration || 1, // Valore di default per Duration
              Progress: event.Progress || 0, // Valore di default per Progress
              IncaricatoName: event.IncaricatoName,
              
            },
          ],
        });
      }
      return acc;
    }, []);
  } catch (error) {
    console.error("Errore nella trasformazione dei dati:", error);
  }

  useEffect(() => {
    console.log("Dati strutturati per Gantt:", structuredData);
  }, [structuredData]);

  return (
    <div>
<GanttComponent
  dataSource={structuredData}
  viewType="ProjectView"
  taskFields={{
    id: 'Id',
    name: 'CommessaName',
    startDate: 'StartTime',
    endDate: 'EndTime',
    duration: 'Duration',
    progress: 'Progress',
    child: 'subtasks',
  }}
  columns={[
    { field: 'Id', headerText: 'ID', visible: false, isPrimaryKey: true }, // Chiave primaria
    { field: 'CommessaName', headerText: 'Commessa', width: 250 },
    { field: 'Subject', headerText: 'Evento', width: 200 },
    { field: 'StartTime', headerText: 'Start Date' },
    { field: 'EndTime', headerText: 'End Date' },
    { field: 'IncaricatoName', headerText: 'Collaboratori', width: 200 },
    { field: 'Progress', headerText: 'Progress' },
  ]}
  editSettings={{
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true,
    allowTaskbarEditing: true,
    showDeleteConfirmDialog: true,
  }}
  toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll']}
  labelSettings={{
    taskLabel: 'CommessaName',
  }}
  splitterSettings={{
    columnIndex: 1,
  }}
  height="450px"
  projectStartDate={new Date('12/20/2024')}
  projectEndDate={new Date('12/31/2028')}
>
  <Inject services={[Selection, DayMarkers, Toolbar, Edit, Resize, RowDD]} />
</GanttComponent>

    </div>
  );
};

export default Gantt;
