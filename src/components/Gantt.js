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
      const multiSelect = new MultiSelectComponent({
        dataSource: categoryResources.map((collab) => ({
          text: collab.text,
          value: collab.id,
        })),
        fields: { text: 'text', value: 'value' },
        value: args.rowData?.CollaboratoreId || [],
        mode: 'CheckBox',
        showDropDownIcon: true,
        placeholder: 'Seleziona Collaboratori',
        popupHeight: '250px',
        change: (e) => {
          args.rowData.CollaboratoreId = e.value;
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

  return (
    <div key={refreshKey}>
      <GanttComponent
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
            field="CollaboratoreId"
            headerText="Collaboratori"
            width="200"
            edit={collaboratorEditTemplate} // Configurazione per selezione multipla
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
