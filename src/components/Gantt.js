import React, { useRef, useState, useEffect } from 'react';
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

const Gantt = ({ ganttData, onSaveEvent, onUpdateEvent, onDeleteEvent, categoryResources,projectResources  }) => {
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

    if (args.requestType === 'save' && args.data) {
        const updatedEvent = args.data;

        if (!updatedEvent.Id) {
            // Nuovo evento creato
            const newEvent = {
                ...updatedEvent,
                CommessaName: projectResources.find((proj) => proj.id === updatedEvent.CommessaId)?.text || "Non assegnata",
                IncaricatoId: Array.isArray(updatedEvent.IncaricatoId) ? updatedEvent.IncaricatoId : [],
            };
            console.log("Nuovo evento da salvare:", newEvent);
            onSaveEvent(newEvent);
        } else {
            // Aggiorna evento esistente
            const originalEvent = ganttData.find((event) => event.Id === updatedEvent.Id) || {};

            const payload = {
                ...originalEvent,
                ...updatedEvent,
                CommessaName: originalEvent.CommessaName,
                CommessaId: updatedEvent.ProjectId || originalEvent.ProjectId || null,
                IncaricatoId: Array.isArray(updatedEvent.CollaboratoreId)
                    ? updatedEvent.CollaboratoreId
                    : originalEvent.IncaricatoId || [],
            };

            console.log("Payload aggiornato per l'evento:", payload);
            onUpdateEvent(payload);
        }
    }

    if (args.requestType === 'toolbarClick' && args.item.id === 'Add') {
        console.log("Creazione di un nuovo evento avviata.");
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
    }
  }, [ganttData]);

  

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
    allowAdding: true, // Abilita l'aggiunta
    allowEditing: true,
    allowDeleting: true,
    allowTaskbarEditing: true,
    showDeleteConfirmDialog: true
  }}
  filterSettings={{ type: 'Menu', hierarchyMode: 'Parent' }}
  labelSettings={{
    rightLabel: (props) => getCollaboratorNames(props.taskData?.IncaricatoId, categoryResources),
  }}
  toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Indent', 'Outdent']}
>
<ColumnsDirective>
  <ColumnDirective field="Subject" headerText="Titolo" width="150" />
  <ColumnDirective field="StartTime" headerText="Data Inizio" editType="datepickeredit" width="150" />
  <ColumnDirective field="EndTime" headerText="Data Fine" editType="datepickeredit" width="150" />
  <ColumnDirective
  field="CommessaName"
  headerText="Commessa"
  editType="dropdownedit"
  width="150"
  edit={{
    params: {
      dataSource: new DataManager(projectResources), // Commesse attuali
      query: new Query(),
      fields: { text: 'text', value: 'id' },
      placeholder: 'Seleziona Commessa',
    },
  }}
/>
<ColumnDirective
  field="IncaricatoId"
  headerText="Collaboratore"
  editType="dropdownedit"
  width="150"
  edit={{
    params: {
      dataSource: new DataManager(categoryResources), // Collaboratori
      query: new Query(),
      fields: { text: 'text', value: 'id' },
      placeholder: 'Seleziona Collaboratore',
    },
  }}
/>
<ColumnDirective
  field="parentID"
  headerText="Parent Task"
  editType="dropdownedit"
  width="150"
  edit={{
    params: {
      dataSource: new DataManager(ganttData), // Tutti gli eventi
      query: new Query(),
      fields: { text: 'Subject', value: 'Id' },
      placeholder: 'Seleziona Parent Task',
    },
  }}
/>

</ColumnsDirective>



  <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
</GanttComponent>

    </div>
  );
};

export default Gantt;
