import React, { useRef, useState, useEffect } from 'react';
import { GanttComponent, Inject, Selection, Toolbar, DayMarkers, Edit, Filter, Sort, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-gantt';
import { DataManager, Query } from '@syncfusion/ej2-data';
const Gantt = ({ ganttData, onSaveEvent, onUpdateEvent, onDeleteEvent, categoryResources, markers = [] }) => {
  const ganttRef = useRef(null);

  const [parentTaskDataSource, setParentTaskDataSource] = useState([]);
  
  let eventMarkers = [];

  if (markers && markers.length > 0) {
    console.log("Markers disponibili:", markers);
    eventMarkers = markers.map((marker, index) => {
      // Imposta la data come new Date() per assicurarci che `day` sia un oggetto `Date`
      const day = marker.day ? new Date(marker.day) : new Date('11/25/2024'); // Usa una data di fallback se `marker.day` non esiste
      const label = marker.Label ; // Usa il label o un valore di default
      
      return {
        day,
        label,
        cssClass: 'e-custom-event-marker', // Usa una classe CSS predefinita per la personalizzazione
      };
    });
  } else {
    // Se markers è vuoto, usa un array vuoto
    console.log("Markers non disponibili");
    eventMarkers = [
      { day: new Date('12/01/2024'), label: 'Default Label', cssClass: 'e-custom-event-marker' },
    ];
  }
  
  // Log per controllare i valori di `eventMarkers`
  console.log("Event Markers Array:", eventMarkers);

  useEffect(() => {
    if (ganttRef.current) {
      ganttRef.current.refresh(); // Forza il refresh del componente Syncfusion
    }
  }, [markers]);

  // Aggiorniamo parentTaskDataSource quando ganttData cambia
  useEffect(() => {
    if (ganttData && ganttData.length > 0) {
      const newParentTaskDataSource = [
        { Id: null, Subject: 'Nessun genitore' }, // Opzione per impostare parentID a null
        ...ganttData.map((task) => ({
          Id: task.Id,
          Subject: task.Subject,
        })),
      ];
      setParentTaskDataSource(newParentTaskDataSource);
    }
  }, [ganttData]);

  const onActionComplete = (args) => {
    if (!args || !args.data) {
      console.warn("Dati incompleti per l'azione Gantt:", args);
      return;
    }

    if (args.requestType === 'save') {
      onUpdateEvent(args.data);
    } else if (args.action === 'TaskbarEditing') {
      onUpdateEvent(args.data);
    } else if (args.action === 'add') {
      onSaveEvent(args.data);
    } else if (args.requestType === 'delete') {
      onDeleteEvent(args.data[0].Id);
    }
  };

  const taskbarTemplate = (taskData) => {
    const color = taskData?.taskData?.Color || '#000000';
    return (
      <div style={{ backgroundColor: color, height: '100%', width: '100%' }}>
        {taskData?.Subject || 'Task senza titolo'}
      </div>
    );
  };

  const getCollaboratorNames = (incaricatoIds, categoryResources) => {
    if (!Array.isArray(incaricatoIds) || incaricatoIds.length === 0) {
      return "Incaricato sconosciuto";
    }
    const names = incaricatoIds.map(id => {
      const collaborator = categoryResources.find(c => c.id === id);
      return collaborator ? collaborator.text : "Incaricato sconosciuto";
    });
    return names.join(", ");
  };

  useEffect(() => {
    if (ganttData && ganttData.length > 0) {
      const newParentTaskDataSource = [
        { Id: null, Subject: 'Nessun genitore' },
        ...ganttData.map((task) => ({
          Id: task.Id,
          Subject: task.Subject,
        })),
      ];
      setParentTaskDataSource(newParentTaskDataSource);

      if (ganttRef.current) {
        ganttRef.current.refresh();
      }
    }
  }, [ganttData]);

  if (ganttRef.current) {
    ganttRef.current.refresh();
  }
  
console.log('MMMM',markers)



  return (
    <div>
      
        {markers ? (
      <GanttComponent
        ref={ganttRef}
        dataSource={ganttData}
        allowSelection={true}
        allowSorting={true}
        actionComplete={onActionComplete}
        taskbarTemplate={taskbarTemplate}
        taskFields={{
          id: 'Id',
          name: 'Subject',
          startDate: 'StartTime',
          endDate: 'EndTime',
          parentID: 'parentID',
          progress: 'Progress',
          expanded: true,
        }}

        eventMarkers={eventMarkers} // Passa i marker come array alla proprietà eventMarkers
        
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          allowTaskbarEditing: true,
          showDeleteConfirmDialog: true,
        }}
        filterSettings={{ type: 'Menu', hierarchyMode: 'Parent' }}
        labelSettings={{
          rightLabel: (props) => getCollaboratorNames(props.taskData?.IncaricatoId, categoryResources),
        }}
        toolbar={['Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Indent', 'Outdent']}
        height="500px"
      >
        <ColumnsDirective>
          <ColumnDirective field="Subject" headerText="Titolo" isPrimaryKey={true} width="150" />
          <ColumnDirective field="CommessaName" headerText="Commessa" width="150" />
          <ColumnDirective field="Id" headerText="ID" width="150" />
          <ColumnDirective
            field="parentID"
            headerText="Parent Task"
            editType="dropdownedit"
            width="150"
            edit={{
              params: {
                dataSource: new DataManager(parentTaskDataSource),
                query: new Query(),
                fields: { text: 'Subject', value: 'Id' },
                placeholder: 'Seleziona Parent Task',
              },
              create: () => document.createElement('input'),
              read: (args) => args.value || null,
              actionComplete: (args) => {
                const currentTaskId = ganttRef.current?.getSelectedRecord()?.Id;
                args.result = args.result.filter((task) => task.Id !== currentTaskId);
              },
            }}
          />
        </ColumnsDirective>
        <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
      </GanttComponent>
       ) : (
        <div>Caricamento in corso...</div>
      )}
    </div>
  );
};

export default Gantt;
