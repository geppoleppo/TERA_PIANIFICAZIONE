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

const Gantt = ({ ganttData, onSaveEvent, onUpdateEvent, onDeleteEvent }) => {
  //console.log("Dati Gantt con CommessaName e IncaricatoId:", ganttData);

  const ganttRef = useRef(null);

  const onActionComplete = (args) => {
    //console.log("Azione completata nel Gantt:", args);
  
    if (args.action === 'TaskbarEditing') {
      console.log("Modifica evento:", args.data);
      onUpdateEvent(args.data);
    } else if (args.action === 'add') {
      console.log("Aggiunta evento:", args.data);
      onSaveEvent(args.data);
    } else if (args.requestType === 'delete') {
      console.log("Eliminazione evento:", args.data[0].Id);
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
      toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Indent', 'Outdent']}
      height="500px"
    >
      <ColumnsDirective>
      <ColumnDirective field="Id" headerText="ID" isPrimaryKey={true} width="150" />
        <ColumnDirective field="Subject" headerText="Titolo" width="150" />
        <ColumnDirective field="CommessaName" headerText="Commessa" width="150" />
        <ColumnDirective field="IncaricatoId" headerText="Incaricato ID" width="150" />
        <ColumnDirective field="StartTime" headerText="Data Inizio" width="150" format="dd/MM/yyyy hh:mm" />
        <ColumnDirective field="EndTime" headerText="Data Fine" width="150" format="dd/MM/yyyy hh:mm" />
      </ColumnsDirective>
      <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
    </GanttComponent>
  </div>
);
};

export default Gantt;