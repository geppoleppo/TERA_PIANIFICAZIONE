import React, { useRef } from 'react';
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

const Gantt = ({ ganttData, onSaveEvent, onUpdateEvent, onDeleteEvent,categoryResources, }) => {
  //console.log("categoryResources in Gantt component:", categoryResources);

  const ganttRef = useRef(null);

  const onActionComplete = (args) => {
    //console.log("Azione completata nel Gantt:", args);
  
    if (args.action === 'TaskbarEditing') {
      //console.log("Modifica evento:", args.data);
      onUpdateEvent(args.data);
    } else if (args.action === 'add') {
      //console.log("Aggiunta evento:", args.data);
      onSaveEvent(args.data);
    } else if (args.requestType === 'delete') {
      //console.log("Eliminazione evento:", args.data[0].Id);
      onDeleteEvent(args.data[0].Id);
    }
  }


  // Template per il colore della barra del task
  const taskbarTemplate = (taskData) => {

    const color = taskData.taskData.Color || '#000000';  // Imposta un colore di default
    return (
      <div style={{ backgroundColor: color, height: '100%', width: '100%' }}>
        {taskData.Subject}  {/* Mostra il titolo del task */}
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
        progress: 'Progress',
        Color: 'Color',  // Aggiungi il campo per il colore
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
        rightLabel: (props) => {
            const incaricatoIds = props.taskData?.IncaricatoId;
            //console.log("Props nel labelSettings - incaricatoIds:", incaricatoIds);
            return getCollaboratorNames(incaricatoIds, categoryResources);
        }
    }}
      toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Indent', 'Outdent']}
      height="500px"
    >
      <ColumnsDirective>

        <ColumnDirective field="Subject" headerText="Titolo"  isPrimaryKey={true} width="150" />
        <ColumnDirective field="CommessaName" headerText="Commessa" isPrimaryKey={true} width="150" />
        <ColumnDirective field="Id" headerText="ID" isPrimaryKey={true} width="150" />

      </ColumnsDirective>
      <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
    </GanttComponent>
  </div>
);
};

export default Gantt;