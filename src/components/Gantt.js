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

const Gantt = ({ ganttData, selectedCommesse,selectedCollaboratori, onUpdateEvent,categoryResources,collaborators }) => {
  const ganttRef = useRef(null);

  useEffect(() => {
    if (ganttRef.current && ganttData.length > 0) {
      ganttRef.current.refresh(); // Forza l'aggiornamento dei dati
    }
  }, [ganttData]);

  // Calcola le risorse dai dati di Gantt
  const resources = categoryResources.map((resource) => ({
    resourceId: resource.id,
    resourceName: resource.text,
  }));

  // Trasforma i dati in formato gerarchico
  const structuredData = selectedCommesse
  .map((commessaId) => {
    const commessaEvents = ganttData.filter((event) => event.CommessaId === commessaId);

    if (commessaEvents.length === 0) return null;

    const commessaName = commessaEvents[0]?.CommessaName || `Commessa ${commessaId}`;

    return {
      Id: commessaId,
      CommessaName: commessaName,
      CommessaId:commessaId,
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
  .filter((commessa) => commessa !== null);


  console.log('Dati strutturati per il Gantt:', structuredData);
  console.log('Risorse calcolate:', collaborators);

  return (
    <div>
      {structuredData.length > 0 ? (
        <GanttComponent
          key={JSON.stringify(structuredData)} // Forza il render quando structuredData cambia
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
            {
              field: 'CommessaName',
              headerText: 'Commessa',
              width: 150,
              visible: true,
              template: (data) => {
                // Mostra il nome della commessa solo per il parent task
                return data.IncaricatoId ? '': data.CommessaName;
              },
            },
            {
              field: 'Subject',
              headerText: 'Evento',
              width: 200,
              visible: false,
              template: (data) => {
                // Mostra il nome dell'evento solo per le subtasks
                return data.subtasks ? '' : data.Subject;
              },
            },
            { field: 'StartTime', headerText: 'Start Date', width: 150 },
            { field: 'EndTime', headerText: 'End Date', width: 150 },
            { field: 'IncaricatoName', headerText: 'Collaboratori', width: 200,visible: false,},
            { field: 'IncaricatoId', headerText: 'IncaricatoId', width: 150,visible: false, },
            { field: 'Progress', headerText: 'Progress', width: 150 },
            { field: 'CommessaId', headerText: 'CommessaId', width: 150,visible: false, },
          ]}
          taskType="FixedWork"
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
            taskLabel: 'Subject',
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
