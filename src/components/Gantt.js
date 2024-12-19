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
      // Estrarre e formattare i collaboratori selezionati
      const collaboratorIds = Array.isArray(args.data.taskData.IncaricatoId)
        ? args.data.taskData.IncaricatoId
        : typeof args.data.taskData.IncaricatoId === 'string'
        ? args.data.taskData.IncaricatoId.split(',').map(Number)
        : [];
  
      // Aggiorna taskData con i collaboratori selezionati
      args.data.taskData.IncaricatoId = collaboratorIds;
      args.data.taskData.IncaricatoName = collaboratorIds
        .map((id) => categoryResources.find((collab) => collab.id === id)?.text)
        .filter(Boolean)
        .join(', ');
  
      console.log('Collaboratori aggiornati nel taskData:', args.data.taskData);
  
      // Invia i dati aggiornati al backend
      if (!args.data.Id) {
        onSaveEvent(args.data.taskData);
      } else {
        onUpdateEvent(args.data.taskData);
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

  console.log("[DEBUG] Dati del Gantttttttttttttttt:", ganttData);

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
          resourceInfo: "IncaricatoId", // Deve corrispondere
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
  field="IncaricatoId"
  headerText="Collaboratori"
  width="300"
  editTemplate={(props) => {
    const multiSelect = new MultiSelectComponent({
      dataSource: categoryResources.map((collab) => ({
        text: collab.text,
        value: collab.id,
      })),
      value: props.IncaricatoId?.filter((id) => typeof id === "number") || [],
      change: (e) => {
        props.IncaricatoId = e.value.filter((id) => typeof id === "number");
        console.log("[DEBUG - MultiSelect] Valori aggiornati filtrati:", props.IncaricatoId);
      },
    });
  
    return <MultiSelectComponent {...multiSelect} />;
  }}
/>




        </ColumnsDirective>
        <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
      </GanttComponent>


    </div>
  );
};

export default Gantt;
