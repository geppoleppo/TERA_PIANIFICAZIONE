import React from 'react';
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
    structuredData = ganttData.map((event) => ({
      ...event,
      IncaricatoId: event.IncaricatoId || [], // Gestione esplicita di IncaricatoId
      IncaricatoName: event.IncaricatoName || 'Nessuno', // Gestione esplicita di IncaricatoName
    }));
  } catch (error) {
    console.error('Errore nella trasformazione dei dati:', error);
  }

  const updateEventOnDB = async (updatedEvent) => {
    console.log('AAAAAAAAAAAAAAAAAAAAAA',updatedEvent)
    try {
      const payload = {
        ...updatedEvent.taskData,
        IncaricatoId: Array.isArray(updatedEvent.taskData.IncaricatoId)
          ? updatedEvent.taskData.IncaricatoId.join(',')
          : updatedEvent.taskData.IncaricatoId,
      };

      console.log('Invio al server:', payload);

      const response = await fetch(`http://localhost:3001/api/eventi/${updatedEvent.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Errore durante l'aggiornamento: ${response.statusText}`);
      }

      const updatedData = await response.json();
      console.log('Risposta del server:', updatedData);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'evento:', error);
    }
  };

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
          { field: 'Id', headerText: 'ID', visible: false, isPrimaryKey: true },
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
        actionBegin={(args) => {
          console.log('TIPO DI EVENTO',args.requestType)
          if (args.requestType === 'save' || 'beforeSave'  || 'refresh') {
            console.log('Dati modificati:', args.data);
            updateEventOnDB(args.data);
          }
        }}
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
