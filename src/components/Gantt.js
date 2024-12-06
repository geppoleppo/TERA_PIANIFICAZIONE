import React, { useRef, useState, useEffect } from 'react';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
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

const Gantt = ({ ganttData, onSaveEvent, onUpdateEvent, onDeleteEvent, categoryResources, projectResources }) => {
  const ganttRef = useRef(null);
  const [dropdownData, setDropdownData] = useState([  ]); // Valore iniziale

    // Log iniziale per verificare ganttData
    console.log('GanttData al render iniziale:', ganttData);


  // Aggiorna dropdownData quando ganttData cambia
  useEffect(() => {
    if (ganttData && ganttData.length > 0) {
      const uniqueData = ganttData
        .map((item) => ({
          text: item.CommessaName || "Non specificata",
          id: item.ProjectId,
        }))
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
        );
      setDropdownData(uniqueData);
      console.log("Dropdown data aggiornato:", uniqueData);
    }
  }, [ganttData]);
  
  const handleActionComplete = (args) => {
    console.log('sono quiiiiii', args);
  
    if (
      args.requestType === 'openAddDialog' || 
      args.requestType === 'beforeOpenAddDialog' || 
      args.requestType === 'beforeOpenEditDialog'
    ) {
      console.log('Apertura Dialog completata:', args);
  
      setTimeout(() => {
        const dialogElement = args.element; // Elemento del dialogo
        const dropdownElement = dialogElement.querySelector('.e-dropdownlist'); // Cerca il dropdown nel dialogo
        console.log('Dropdown trovato nel dialogo:', dropdownElement);
  
        if (dropdownElement) {
          const dropdownInstance = dropdownElement.ej2_instances?.[0];
          if (dropdownInstance) {
            dropdownInstance.dataSource = dropdownData; // Imposta i dati aggiornati
            dropdownInstance.refresh(); // Ricarica il contenuto
            console.log("Dropdown aggiornato manualmente.");
          } else {
            console.error("Nessuna istanza di DropDownList trovata.");
          }
        } else {
          console.error("Elemento DropDownList non trovato.");
        }
      }, 500); // Ritarda di 100ms
    }
  };
  
  


  const onActionComplete = (args) => {
    console.log("Dati dell'azione completata nel Gantt:", merda);
    console.log("merdona:", merdona);
    

    if (args.requestType === 'save' && args.data) {
      const updatedEvent = args.data;

      // Cerca i dati originali per preservare campi mancanti
      const originalEvent = ganttData.find((event) => event.Id === updatedEvent.Id) || {};

      const payload = {
        ...originalEvent, // Mantieni i dati originali
        ...updatedEvent,  // Sovrascrivi con i nuovi dati
        CommessaName: originalEvent.CommessaName, // Evita di sovrascrivere CommessaName
        CommessaId: updatedEvent.ProjectId || originalEvent.ProjectId || null,
        IncaricatoId: Array.isArray(updatedEvent.CollaboratoreId)
          ? updatedEvent.CollaboratoreId
          : originalEvent.IncaricatoId || [],
      };

      console.log("Payload aggiornato per l'evento:", payload);

      // Invia il payload aggiornato ad App.js
      onUpdateEvent(payload);
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

  console.log("GanttData passato al componente:", ganttData);
  console.log("DropdownData corrente:", dropdownData);
  useEffect(() => {
    if (dropdownData.length > 0) {
      console.log("DropdownData disponibile prima dell'apertura del dialogo:", dropdownData);
    }
  }, [dropdownData]);
  

return (
  <div>
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
        <ColumnDirective field="Subject" headerText="Titolo" width="150" />
        <ColumnDirective
  field="CommessaName"
  headerText="Commessa"
  editType="dropdownedit"
  width="150"
  edit={{
    params: {
      dataSource: dropdownData, // Usa lo stato aggiornato
      query: new Query(),
      fields: { text: 'text', value: 'id' },
      placeholder: 'Seleziona Commessa',
      created: () => {
        const dropdownElement = document.querySelector('.e-dropdownlist');
        if (dropdownElement) {
          const dropdownInstance = dropdownElement.ej2_instances?.[0];
          if (dropdownInstance) {
            dropdownInstance.dataSource = dropdownData;
            dropdownInstance.refresh();
            console.log("Dropdown aggiornato durante 'created'.");
          }
        }
      },
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