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
      // Assicurati che `CollaboratoreId` sia un array
      const collaboratorIds = Array.isArray(args.data.CollaboratoreId)
        ? args.data.CollaboratoreId
        : typeof args.data.CollaboratoreId === 'string'
          ? args.data.CollaboratoreId.split(',').map((id) => parseInt(id, 10)) // Converte una stringa separata da virgole in array
          : [];

      // Mappare CollaboratoreId a resourceNames
      const collaboratorNames = collaboratorIds
        .map((id) => {
          const collaborator = categoryResources.find((collab) => collab.id === id);
          return collaborator ? collaborator.text : null;
        })
        .filter(Boolean)
        .join(', '); // Concatena i nomi separati da virgole

      // Aggiungi i nomi al dato salvato
      args.data.resourceNames = collaboratorNames;
      args.data.CollaboratoreId = collaboratorIds; // Assicura che rimanga un array

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
          console.log("[DEBUG] Intera struttura args:", args);

          if (args.requestType === "beforeOpenEditDialog") {
            console.log("[DEBUG] Dati rowData prima della modifica:", args.rowData);

            const { rowData } = args;

            // Assicurati che CollaboratoreId sia un array valido
            if (!Array.isArray(rowData.CollaboratoreId)) {
              console.log("[DEBUG] Correzione CollaboratoreId, valore originale:", rowData.CollaboratoreId);
              rowData.CollaboratoreId = rowData.CollaboratoreId
                ? rowData.CollaboratoreId.split(',').map(Number)
                : [];
            }

            console.log("[DEBUG] Dati rowData dopo la correzione:", rowData);
          }

          if (args.requestType === "save") {
            console.log("[DEBUG] Salvataggio in corso. Dati inviati:", args.data);
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
            field="Id"
            headerText="ID"
            visible={false} // Nascondi la colonna
            isPrimaryKey={true} // Identifica questa colonna come la chiave primaria
          />
          <ColumnDirective
            field="Subject" // Campo del nome del task
            headerText="Task"
            width="200"
          />
<ColumnDirective
  field="ProjectId" // Usa il campo che contiene l'ID della commessa
  headerText="Commessa"
  width="200"
  template={(props) => {
    const commessa = projectResources.find((res) => res.id === props.ProjectId);
    return <span>{commessa ? commessa.text : "Non assegnata"}</span>;
  }}
  editType="dropdownedit"
  edit={{
    params: {
      dataSource: projectResources.map((commessa) => ({
        text: commessa.text,
        value: commessa.id,
      })),
      fields: { text: "text", value: "value" },
      placeholder: "Seleziona Commessa",
    },
  }}
/>
<ColumnDirective
  field="CollaboratoreId" // Usa sempre CollaboratoreId per i collaboratori associati
  headerText="Collaboratori"
  width="300"
  template={(props) => {
    // Leggi direttamente da taskData per mostrare i collaboratori assegnati
    const collaboratorNames = props.taskData?.IncaricatoName || "Nessuno";
    return <span>{collaboratorNames}</span>;
  }}
  edit={{
    create: () => {
      const input = document.createElement("input");
      input.className = "collaborator-multi-select";
      return input;
    },
    write: (args) => {
      console.log("[DEBUG] Collaboratori associati per modifica:", args.rowData);

      const defaultValues = Array.isArray(args.rowData?.taskData?.IncaricatoId)
        ? args.rowData.taskData.IncaricatoId
        : [];

      const multiSelect = new MultiSelectComponent({
        dataSource: categoryResources.map((collab) => ({
          text: collab.text,
          value: collab.id,
        })),
        fields: { text: "text", value: "value" },
        value: defaultValues, // Pre-seleziona i collaboratori associati
        mode: "CheckBox",
        showDropDownIcon: true,
        placeholder: "Seleziona Collaboratori",
        popupHeight: "250px",
        change: (e) => {
          args.rowData.taskData.IncaricatoId = e.value;
          args.rowData.taskData.IncaricatoName = e.value
            .map((id) => categoryResources.find((collab) => collab.id === id)?.text)
            .filter(Boolean)
            .join(", ");
          console.log("[DEBUG] Collaboratori aggiornati:", e.value);
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
