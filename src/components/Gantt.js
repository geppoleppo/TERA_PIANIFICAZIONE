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

const Gantt = ({
  ganttData,
  projectResources,
  selectedCommesse,
  categoryResources,
  onSaveEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Forza il ri-rendering del componente quando i dati cambiano
  useEffect(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, [ganttData, projectResources, categoryResources, selectedCommesse]);

  const handleActionComplete = (args) => {
    if (args.requestType === 'save') {
      if (!args.data.Id) {
        onSaveEvent(args.data); // Nuovo evento
      } else {
        onUpdateEvent(args.data); // Aggiorna evento esistente
      }
    }

    if (args.requestType === 'delete') {
      if (onDeleteEvent) {
        args.data.forEach((event) => onDeleteEvent(event.Id));
      }
    }
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
            isPrimaryKey={true}
            visible={false}
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
      ), // Filtra commesse che matchano con selectedCommesse
      fields: { text: 'text', value: 'id' },
      placeholder: 'Seleziona Commessa',
    },
  }}
/>

          <ColumnDirective
            field="parentID"
            headerText="Parent"
            editType="dropdownedit"
            width="150"
            edit={{
              params: {
                dataSource: [
                  { text: 'Nessuno', value: null },
                  ...ganttData.map((event) => ({
                    text: event.Subject,
                    value: event.Id,
                  })),
                ],
                fields: { text: 'text', value: 'value' },
                placeholder: 'Seleziona Parent',
              },
            }}
          />
          <ColumnDirective
            field="CollaboratoreId"
            headerText="Collaboratori"
            editType="dropdownedit"
            width="150"
            edit={{
              params: {
                dataSource: categoryResources.map((collab) => ({
                  text: collab.text,
                  value: collab.id,
                })),
                fields: { text: 'text', value: 'value' },
                placeholder: 'Seleziona Collaboratori',
                mode: 'CheckBox', // Abilita multi-selezione
              },
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
