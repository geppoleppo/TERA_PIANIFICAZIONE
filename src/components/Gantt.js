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
      const input = document.createElement('input');
      input.className = 'collaborator-multi-select';
      return input;
    },
    write: (args) => {
      console.log("[Collaboratori] Inizializzazione del MultiSelect.");
      console.log("[Collaboratori] Dati della riga:", args.rowData);
  
      const multiSelect = new MultiSelectComponent({
        dataSource: categoryResources.map((collab) => ({
          text: collab.text,
          value: collab.id,
        })), // Usa collaboratori già filtrati
        fields: { text: 'text', value: 'value' },
        value: args.rowData?.CollaboratoreId || [], // Valori selezionati
        mode: 'CheckBox', // Permette selezione multipla
        showDropDownIcon: true,
        placeholder: 'Seleziona Collaboratori',
        popupHeight: '250px',
        change: (e) => {
          console.log("[Collaboratori] Valori selezionati:", e.value);
          args.rowData.CollaboratoreId = e.value; // Aggiorna i dati della riga
        },
      });
  
      multiSelect.appendTo('.collaborator-multi-select');
    },
    destroy: () => {
      const multiSelect = document.querySelector('.collaborator-multi-select');
      if (multiSelect && multiSelect.ej2_instances) {
        multiSelect.ej2_instances[0].destroy();
      }
    },
  };
  
  
console.log('RRRRRRRRRRRRRRRRRRRRRR',selectedCollaboratori)
  return (
    <div key={refreshKey}>
      <GanttComponent
        resources={categoryResources} // Dati dei collaboratori
        resourceFields={{
          id: 'id',
          name: 'text',
        }}
        actionComplete={handleActionComplete}
        dataSource={ganttData}
        allowSelection={true}
        allowSorting={true}
        taskFields={{
          id: 'Id',
          name: 'Subject',
          startDate: 'StartTime',
          endDate: 'EndTime',
          parentID: 'parentID',
          progress: 'Progress',
          resourceInfo: 'CollaboratoreId', // Collegamento ai collaboratori
        }}
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          allowTaskbarEditing: true,
          showDeleteConfirmDialog: true,
        }}
        toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel']}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="Id"
            headerText="ID"
            width="100"
            visible={false}
            isPrimaryKey={true}
          />
          <ColumnDirective field="Subject" headerText="Titolo" width="150" />
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
                fields: { text: 'text', value: 'id' },
                placeholder: 'Seleziona Commessa',
              },
            }}
          />

<ColumnDirective
  field="parentID"
  headerText="Parent"
  width="150"
  editType="dropdownedit"
  edit={{
    params: {
      dataSource: parentOptions, // Dati dei parent passati da App.js
      fields: { text: "text", value: "value" },
      placeholder: "Seleziona Parent",
    },
  }}
/>
<ColumnDirective
  field="CollaboratoreId"
  headerText="Collaboratori"
  width="200"
  edit={{
    create: collaboratorEditTemplate.create,
    write: collaboratorEditTemplate.write,
    destroy: collaboratorEditTemplate.destroy,
  }}
/>
          <ColumnDirective
            field="StartTime"
            headerText="Data Inizio"
            editType="datepickeredit"
            format="dd/MM/yyyy"
            width="150"
          />
          <ColumnDirective
            field="EndTime"
            headerText="Data Fine"
            editType="datepickeredit"
            format="dd/MM/yyyy"
            width="150"
          />
          <ColumnDirective
            field="Progress"
            headerText="Avanzamento (%)"
            editType="numericedit"
            width="100"
          />
        </ColumnsDirective>
        <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
      </GanttComponent>
    </div>
  );
};

export default Gantt;
