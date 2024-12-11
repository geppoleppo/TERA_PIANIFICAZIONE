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
      console.log("[DEBUG] Apertura scheda evento:", args.rowData);

      // Recupera i dati dall'evento selezionato
      const { rowData } = args;

      // Configura la commessa selezionata
      rowData.CommessaName =  args.rowData.taskData?.CommessaName || 'non specificataaa';

      // Configura i collaboratori associati
      rowData.CollaboratoreId = args.rowData.taskData?.IncaricatoId || [];

      // Configura il parent associato
      rowData.parentID = args.rowData.taskData?.parentID || null;

      console.log("[DEBUG] Dati configurati per la scheda:", rowData);
    }
  }}
  resources={categoryResources} // Dati dei collaboratori
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
    resourceInfo: "CollaboratoreId", // Collegamento ai collaboratori
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
    {/* Menu Commessa */}
    <ColumnDirective
      field="CommessaName"
      headerText="Commessa"
      editType="dropdownedit"
      width="150"
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
    {/* Menu Parent */}
    <ColumnDirective
      field="parentID"
      headerText="Parent Evento"
      editType="dropdownedit"
      width="150"
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
  </ColumnsDirective>

    {/* Menu Collaboratori */}
    <ColumnDirective
      field="CollaboratoreId"
      headerText="Collaboratori"
      width="200"
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


  <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
</GanttComponent>;

    </div>
  );
};

export default Gantt;
