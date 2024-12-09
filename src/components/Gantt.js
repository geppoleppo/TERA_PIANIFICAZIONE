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

const Gantt = ({ ganttData }) => {
  const [dropdownData, setDropdownData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Chiave per forzare il ri-rendering

  // Aggiorna `dropdownData` quando `ganttData` cambia
  useEffect(() => {
    if (ganttData && ganttData.length > 0) {
      const uniqueData = ganttData
        .map((item) => ({
          text: item.CommessaName || 'Non specificata',
          id: item.ProjectId,
        }))
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
        );

      setDropdownData(uniqueData);
      setRefreshKey((prevKey) => prevKey + 1); // Forza il ri-rendering del componente
      console.log('[Dropdown] Dati aggiornati con ganttData:', uniqueData);
    }
  }, [ganttData]);

  return (
    <div key={refreshKey}>
      <GanttComponent
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
          {/* Definisci la colonna ID con isPrimaryKey: true */}
          <ColumnDirective
            field="Id"
            headerText="ID"
            width="100"
            visible={false} // Puoi nascondere la colonna se non vuoi mostrarla
            isPrimaryKey={true} // Imposta questa colonna come chiave primaria
          />
          <ColumnDirective
            field="Subject"
            headerText="Titolo"
            width="150"
          />
          <ColumnDirective
            field="CommessaName"
            headerText="Commessa"
            editType="dropdownedit"
            width="150"
            edit={{
              params: {
                dataSource: dropdownData,
                fields: { text: 'text', value: 'id' },
                placeholder: 'Seleziona Commessa',
              },
            }}
          />
          {/* Puoi aggiungere altre colonne se necessario */}
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
