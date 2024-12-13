import React, { useState, useEffect } from 'react';
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
  ColumnDirective,

} from '@syncfusion/ej2-react-gantt';
import { MultiSelectComponent } from '@syncfusion/ej2-react-dropdowns';

const Gantt = ({
  ganttData,
  onSaveEvent,
  onUpdateEvent,
  onDeleteEvent,
  projectResources,
  selectedCommesse,
  categoryResources,
  selectedCollaboratori,
  parentOptions, // Nuovo parametro
}) => {
  const [refreshKey, setRefreshKey] = useState(0); // Chiave per forzare il ri-rendering

  useEffect(() => {
    setRefreshKey((prevKey) => prevKey + 1); // Forza il ri-rendering quando cambia ganttData
  }, [ganttData]);

  const handleActionComplete = (args) => {
    if (args.requestType === 'save') {
      if (!args.data.Id) {
        onSaveEvent(args.data);
      } else {
        onUpdateEvent(args.data);
      }
    }

    if (args.requestType === 'delete') {
      if (onDeleteEvent) {
        args.data.forEach((event) => onDeleteEvent(event.Id));
      }
    }
  };

  const collaboratorEditTemplate = {
    create: () => {
      const input = document.createElement("input");
      input.className = "collaborator-multi-select";
      return input;
    },

    write: (args) => {
      console.log("[Collaboratori] Dati dell'evento:", args.rowData);

      const multiSelect = new MultiSelectComponent({
        dataSource: categoryResources.map((collab) => ({
          text: collab.text,
          value: collab.id,
        })),
        fields: { text: "text", value: "value" },
        value: args.rowData?.CollaboratoreId || [], // Precarica i collaboratori associati
        mode: "CheckBox",
        showDropDownIcon: true,
        placeholder: "Seleziona Collaboratori",
        popupHeight: "250px",
        change: (e) => {
          args.rowData.CollaboratoreId = e.value; // Aggiorna i dati dell'evento
          console.log("[Collaboratori] Valori selezionati:", e.value);
        },
      });

      multiSelect.appendTo(".collaborator-multi-select");
    },

    destroy: () => {
      const multiSelect = document.querySelector(".collaborator-multi-select");
      if (multiSelect && multiSelect.ej2_instances) {
        multiSelect.ej2_instances[0].destroy();
      }
    },
  };

  console.log("[DEBUG] Configurazione del menu Commessa:", {
    dataSource: projectResources.filter((commessa) =>
      selectedCommesse.includes(commessa.id)
    ),
    fields: { text: "text", value: "id" },
  });


  return (
    <div key={refreshKey}>
<GanttComponent
  actionBegin={(args) => {
    if (
      args.requestType === "beforeOpenEditDialog" ||
      args.requestType === "beforeOpenAddDialog"
    ) {
      const { rowData } = args;

      // Configura i valori predefiniti
      rowData.ProjectId = rowData.taskData?.ProjectId || null;
      rowData.CollaboratoreId = rowData.taskData?.IncaricatoId || [];
      rowData.parentID = rowData.taskData?.parentID || null;
    }
  }}
  resources={categoryResources}
  resourceFields={{
    id: "id",
    name: "text",
  }}
  actionComplete={handleActionComplete}
  dataSource={ganttData}
  allowSelection={true}
  allowSorting={true}
  taskFields={{
    id: "Id",
    name: "Subject",
    startDate: "StartTime",
    endDate: "EndTime",
    parentID: "parentID",
    progress: "Progress",
    resourceInfo: "CollaboratoreId",
  }}
  editSettings={{
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true,
    allowTaskbarEditing: true,
    showDeleteConfirmDialog: true,
  }}
  toolbar={["Add", "Edit", "Update", "Delete", "Cancel"]}
>
  <ColumnsDirective>
    <ColumnDirective
      field="ProjectId"
      headerText="Commessa"
      width="200"
      template={(props) => {
        const commessa = projectResources.find((item) => item.id === props.ProjectId);
        return <span>{commessa ? commessa.text : 'Non assegnata'}</span>;
      }}
      editType="dropdownedit"
      edit={{
        params: {
          dataSource: projectResources.filter((commessa) =>
            selectedCommesse.includes(commessa.id)
          ),
          fields: { text: "text", value: "id" },
          placeholder: "Seleziona Commessa",
        },
      }}
    />
    <ColumnDirective
      field="parentID"
      headerText="Parent Evento"
      width="200"
      template={(props) => {
        const parentTask = ganttData.find((task) => task.Id === props.parentID);
        return <span>{parentTask ? parentTask.Subject : 'Nessuno'}</span>;
      }}
      editType="dropdownedit"
      edit={{
        params: {
          dataSource: [
            { text: "Nessuno", value: null },
            ...ganttData.map((event) => ({
              text: event.Subject,
              value: event.Id,
            })),
          ],
          fields: { text: "text", value: "value" },
          placeholder: "Seleziona Parent",
        },
      }}
    />
<ColumnDirective
  field="CollaboratoreId"
  headerText="Collaboratori"
  width="300"
  template={(props) => {
    // Mappa gli ID dei collaboratori nei rispettivi nomi
    const collaboratorNames = props.CollaboratoreId
      ? props.CollaboratoreId.map((id) => {
          const collaborator = categoryResources.find((item) => item.id === id);
          return collaborator ? collaborator.text : null;
        }).filter(Boolean) // Filtra eventuali valori null
      : [];
    return <span>{collaboratorNames.length > 0 ? collaboratorNames.join(', ') : 'Nessuno'}</span>;
  }}
  edit={{
    create: () => {
      const input = document.createElement("input");
      input.className = "collaborator-multi-select";
      return input;
    },
    write: (args) => {
      console.log("[DEBUG] Collaboratori associati:", args.rowData.CollaboratoreId);
      const multiSelect = new MultiSelectComponent({
        dataSource: categoryResources.map((collab) => ({
          text: collab.text,
          value: collab.id,
        })),
        fields: { text: "text", value: "value" },
        value: args.rowData?.CollaboratoreId || [],
        mode: "CheckBox",
        showDropDownIcon: true,
        placeholder: "Seleziona Collaboratori",
        popupHeight: "250px",
        change: (e) => {
          args.rowData.CollaboratoreId = e.value;
          console.log("[DEBUG] Nuovi collaboratori selezionati:", e.value);
        },
      });
      multiSelect.appendTo(".collaborator-multi-select");
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
