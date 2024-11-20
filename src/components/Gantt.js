import React, { useRef, useState, useEffect } from 'react';
import { EventMarkersDirective, EventMarkerDirective } from '@syncfusion/ej2-react-gantt';
import { DataManager, Query } from '@syncfusion/ej2-data';
import {
  GanttComponent,
  Inject,
  Selection,
  Toolbar,
  DayMarkers,
  Edit,
  Filter,
  Sort,
  ColumnsDirective,
  ColumnDirective
} from '@syncfusion/ej2-react-gantt';

const Gantt = ({ ganttData, onSaveEvent, onUpdateEvent, onDeleteEvent, categoryResources,markers=[] }) => {
  const ganttRef = useRef(null);

  const [parentTaskDataSource, setParentTaskDataSource] = useState([]);

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
    console.log("Dati dell'azione completata nel Gantt:", args);
    console.log("TIPO DI AZIONE:", args.requestType);

    if (!args || !args.data) {
        console.warn("Dati incompleti per l'azione Gantt:", args);
        return;
    }

    if (args.requestType === 'save') {
        // Gestisce il salvataggio di dati tramite il dialogo
       // console.log("Salvataggio tramite dialogo con dati:", args.data);
        onUpdateEvent(args.data); // Passa i dati alla funzione di aggiornamento
    } else if (args.action === 'TaskbarEditing') {
        // Gestisce la modifica diretta della barra
       // console.log("Aggiornamento dal Gantt con dati:", args.data);
        onUpdateEvent(args.data);
    } else if (args.action === 'add') {
        // Gestisce l'aggiunta di nuovi eventi
        console.log("Aggiunta di un nuovo evento con dati:", args.data);
        onSaveEvent(args.data);
    } else if (args.requestType === 'delete') {
        // Gestisce l'eliminazione di eventi
        //console.log("Eliminazione di un evento con ID:", args.data[0].Id);
        onDeleteEvent(args.data[0].Id);
    } else {
       // console.log("Azione non gestita:", args.action || args.requestType);
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
      // Aggiunge l'opzione "Nessun genitore" come prima voce
      const newParentTaskDataSource = [
        { Id: null, Subject: 'Nessun genitore' }, // Opzione per impostare parentID a null
        ...ganttData.map((task) => ({
          Id: task.Id,
          Subject: task.Subject,
        })),
      ];
      setParentTaskDataSource(newParentTaskDataSource);
  
      // Forza il refresh del GanttComponent per aggiornare il menu a discesa
      if (ganttRef.current) {
        ganttRef.current.refresh();
      }
    }
  }, [ganttData]);
  console.log("Markers formattati:", markers);

  return (
    <div>

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
          expanded: true
        }}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          allowTaskbarEditing: true,
          showDeleteConfirmDialog: true
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
      dataSource: new DataManager(parentTaskDataSource), // Usa DataManager per Syncfusion
      query: new Query(), // Crea una query vuota per inizializzare
      fields: { text: 'Subject', value: 'Id' },
      placeholder: 'Seleziona Parent Task',
    },
    create: () => document.createElement('input'), // Crea l'elemento input del dropdown
    read: (args) => args.value || null, // Legge il valore e assegna null per "Nessun genitore"
    actionComplete: (args) => {
      // Filtra per escludere l'ID del task corrente
      const currentTaskId = ganttRef.current?.getSelectedRecord()?.Id;
      args.result = args.result.filter((task) => task.Id !== currentTaskId);
    },
  }}
/>



        </ColumnsDirective>
        <EventMarkersDirective>
  {markers.map((marker, index) => (
    <EventMarkerDirective
      key={index}
      day={marker.day}
      label={marker.Label}
      cssClass="custom-marker-label"
      style={{ color: marker.color || '#000' }} // Applica il colore dell'etichetta
    />
  ))}
</EventMarkersDirective>

        <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort,DayMarkers]} />
      </GanttComponent>
    </div>
  );
};

export default Gantt;
