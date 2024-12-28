import React, { useEffect, useRef } from 'react';
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
import { ClickEventArgs } from '@syncfusion/ej2-navigations';

const Gantt = ({ ganttData, selectedCollaboratori, selectedCommesse,onUpdateEvent }) => {
  const ganttRef = useRef(null);

  useEffect(() => {
    if (ganttRef.current && ganttData.length > 0) {
      ganttRef.current.refresh(); // Forza l'aggiornamento dei dati
    }
  }, [ganttData]); // Trigger quando `ganttData` cambia

  // Trasforma i dati in formato gerarchico
  const resources = selectedCollaboratori.map((collabId) => ({
    resourceId: collabId,
    resourceName: `Collaboratore ${collabId}`,
  }));

  const structuredData = selectedCommesse
    .map((commessaId) => {
      // Filtra gli eventi associati alla commessa
      const commessaEvents = ganttData.filter((event) => event.CommessaId === commessaId);

      // Se non ci sono eventi associati, non includere questa commessa
      if (commessaEvents.length === 0) {
        return null;
      }

      const commessaName = commessaEvents[0]?.CommessaName || `Commessa ${commessaId}`;

      return {
        Id: commessaId,

        StartTime: commessaEvents[0]?.StartTime || new Date(),
        EndTime: commessaEvents[commessaEvents.length - 1]?.EndTime || new Date(),
        subtasks: commessaEvents.map((event) => ({
          Id: event.Id,
          Subject: event.Subject,
          StartTime: event.StartTime,
          EndTime: event.EndTime,
          Duration: event.Duration,
          Progress: event.Progress,
          IncaricatoName: event.IncaricatoName,
          IncaricatoId: event.IncaricatoId,
          CommessaId: commessaId,
          CommessaName: commessaName,
        })),
      };
    })
    .filter((commessa) => commessa !== null); // Rimuove le commesse senza eventi

  console.log('Dati strutturati per il Gantt:', structuredData);

  return (
    <div>
      {structuredData.length > 0 ? (
        <GanttComponent
          key={JSON.stringify(structuredData)} // Forza un nuovo render quando structuredData cambia
          ref={ganttRef}
          dataSource={structuredData}
          resources={resources}
          resourceFields={{
          id: 'resourceId',
          name: 'resourceName',
        }} 
          viewType="ProjectView"
          taskFields={{
            id: 'Id',
            CommessaName: 'CommessaName',
            CommessaId: 'CommessaId',
            startDate: 'StartTime',
            endDate: 'EndTime',
            duration: 'Duration',
            progress: 'Progress',
            child: 'subtasks',
            resourceInfo: 'resources',
          }}
          columns={[
            { field: 'Id', headerText: 'ID', visible: false, isPrimaryKey: true },
            { field: 'CommessaName', headerText: 'Commessa', width: 100 },
            { field: 'CommessaId', headerText: 'CommessaId', width: 100 },
            { field: 'Subject', headerText: 'Evento', width: 200 },
            { field: 'StartTime', headerText: 'Start Date' },
            { field: 'EndTime', headerText: 'End Date' },
            { field: 'IncaricatoName', headerText: 'Collaboratori', width: 200 },
            { field: 'IncaricatoId', headerText: 'IncaricatoId', width: 200 },
            { field: 'Progress', headerText: 'Progress' },
          ]}
          taskType='FixedWork'
          editSettings={{
            allowAdding: true,
            allowEditing: true,
            allowDeleting: true,
            allowTaskbarEditing: true,
            showDeleteConfirmDialog: true,
          }}
          toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll']}
          toolbarClick={(args: ClickEventArgs) => {
            if (args.item.id === 'showhidebar') {
              ganttRef.current.showOverAllocation = ganttRef.current.showOverAllocation ? false : true;
            }
          }}
          actionBegin={(args) => {
            if (args.requestType === 'save' || args.requestType === 'beforeSave') {
              console.log('Dati modificati:', args.data);
              onUpdateEvent(args.data);
            }
          }}
          labelSettings={{
            taskLabel: 'CommessaName',
            rightLabel: 'IncaricatoName',
          }}
          splitterSettings={{
            columnIndex: 1,
          }}
          height="450px"
          projectStartDate={new Date('12/15/2024')}
          projectEndDate={new Date('12/31/2025')}
        >
          <Inject services={[Selection, DayMarkers, Toolbar, Edit, Resize, RowDD]} />
        </GanttComponent>
      ) : (
        <p>Caricamento dati...</p>
      )}
    </div>
  );
};

export default Gantt;