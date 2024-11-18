import { extend } from '@syncfusion/ej2-base';
import Select from 'react-select';
import { TwitterPicker } from 'react-color';

import React from 'react';
import {
  ScheduleComponent,
  ResourcesDirective,
  ResourceDirective,
  ViewsDirective,
  ViewDirective,
  Inject,
  Day,
  Week,
  WorkWeek,
  Month,
  TimelineViews,
  Agenda,
  Resize,
  DragAndDrop
} from '@syncfusion/ej2-react-schedule';

const Scheduler = ({
    events,
    onEventRendered,
    resourceHeaderTemplate,
    onActionComplete,
    filteredProjectResources,
    filteredCategoryResources,
    uniqueCollaborators,
    selectedCollaboratori,
    setSelectedCommesse,
    setSelectedCollaboratori,
    selectedCommesse,
    projectResources,
    handleCollaboratoreChange,
    handleCommesseChange,
    handleColorChange,
    removeCommessa,
    handleSaveSelectedCommesse
  }) => {


// Definisci la funzione `onPopupOpen` per aggiungere il campo `parentID` al form di creazione evento
const onPopupOpen = (args) => {
  if (args.type === 'Editor') {
      const formElement = args.element.querySelector('.e-schedule-form');
      if (formElement && !formElement.querySelector('.e-parent-field')) {
          const container = document.createElement('div');
          container.classList.add('e-parent-field');
          container.style.marginTop = '10px';

          const label = document.createElement('label');
          label.innerHTML = 'Seleziona Parent Task:';
          container.appendChild(label);

          const select = document.createElement('select');
          select.name = 'parentID';
          select.classList.add('e-field'); // Aggiungi classe 'e-field' per permettere il binding
          const defaultOption = document.createElement('option');
          defaultOption.value = "";
          defaultOption.text = "Nessun genitore";
          select.appendChild(defaultOption);

          // Aggiunge gli eventi esistenti come opzioni nel campo a discesa
          events.forEach((event) => {
              const option = document.createElement('option');
              option.value = event.Id;
              option.text = event.Subject;
              select.appendChild(option);
          });

          container.appendChild(select);
          formElement.appendChild(container);
      }
  }
};

// Usa `actionBegin` per assicurarti che `parentID` venga aggiunto ai dati dell'evento
const actionBegin = (args) => {
  if (args.requestType === 'eventCreate' || args.requestType === 'eventChange') {
      const formElement = document.querySelector('.e-schedule-form');
      if (formElement) {
          const parentID = formElement.querySelector('select[name="parentID"]').value;

          // Controlla se `args.data` è un array o un singolo oggetto
          if (Array.isArray(args.data)) {
              // Creazione: `args.data` è un array di eventi
              args.data[0].parentID = parentID || null;
              console.log("parentID aggiunto ai dati del nuovo evento:", parentID);
          } else {
              // Modifica: `args.data` è un singolo oggetto evento
              args.data.parentID = parentID || null;
              console.log("parentID aggiunto ai dati dell'evento modificato:", parentID);
          }
      }
  }
};



    return (
        <div className="App">
          {/* Menu a discesa per selezionare i collaboratori */}
          <div>
            <label> SELEZIONA COLLABORATORE:</label>
    
<Select
  options={[
    
    ...uniqueCollaborators.map(collaboratore => ({
      value: collaboratore.id,
      label: collaboratore.text
    })),
    { value: 'all', label: 'Select All' }
  ]}
  onChange={(selectedOptions) => {
    if (selectedOptions.some(option => option.value === 'all')) {
      // Select all collaborators
      handleCollaboratoreChange(
        uniqueCollaborators.map(collaboratore => ({
          value: collaboratore.id,
          label: collaboratore.text
        })),
        setSelectedCollaboratori
      );
    } else {
      handleCollaboratoreChange(selectedOptions, setSelectedCollaboratori);
    }
  }}
  isMulti
  isClearable
  placeholder="Seleziona Collaboratore"
/>

          </div>
    
    
    
    
          {/* Menu a discesa multi-selezione per selezionare le commesse */}
          <div>
            <label>SLEZIONA COMMESSE:</label>
            <Select
              options={projectResources.map(commessa => ({
                value: commessa.id,
                label: commessa.text
              }))}
              value={selectedCommesse}
              isMulti
              onChange={selectedOptions => handleCommesseChange(selectedOptions, projectResources, setSelectedCommesse)}
              placeholder="Seleziona Commesse"
            />
          </div>
    
 
          <button 
    onClick={handleSaveSelectedCommesse}
    disabled={selectedCollaboratori.length !== 1}
>
    Memorizza
</button>
    
          {/* Scheduler component */}
          <ScheduleComponent
          popupOpen={onPopupOpen}  // Associa `onPopupOpen` al popup
          actionBegin={actionBegin} // Passa `actionBegin` qui
            actionComplete={onActionComplete}
            width="100%"
            height="650px"
            selectedDate={new Date()}
            rowAutoHeight='true'
            resourceHeaderTemplate={resourceHeaderTemplate}  // Aggiungi il template qui
    
            eventSettings={{
              dataSource: events,
              allowEventOverlap: true, // Consenti eventi sovrapposti
    
              fields: {
                subject: { title: 'Task', name: 'Subject' },
                startTime: { title: 'Start Time', name: 'StartTime' },
                endTime: { title: 'End Time', name: 'EndTime' },
                description: { title: 'Summary', name: 'Description' },
                parentID: { title: 'Parent Task', name: 'parentID' },  // Campo aggiunto
          
              },
            }}
    
            group={{ allowGroupEdit: true, resources: ['Projects', 'Categories'] }}
            eventRendered={onEventRendered} // Aggiungi qui l'evento per gestire i colori
          >
            {/* Resource Definitions */}
            <ResourcesDirective>
              <ResourceDirective
                field="ProjectId"
                title="Projects"
                name="Projects"
                dataSource={filteredProjectResources} // Usa le risorse filtrate
                textField="text"
                idField="id"
                colorField="color"
              />
              <ResourceDirective
                field="CollaboratoreId"
                title="Collaboratori"
                name="Categories"
                allowMultiple={true}
                dataSource={filteredCategoryResources}
                textField="text"
                idField="id"
                groupIDField="groupId"
              />
            </ResourcesDirective>
    
    
    
            {/* Views */}
            <ViewsDirective>
              <ViewDirective displayName="3 Days" option="Day" interval={3} />
              <ViewDirective displayName="2 Weeks" option="Week" interval={2} />
              <ViewDirective displayName="4 Months" option="Month" interval={4} isSelected={true} />
              <ViewDirective option="TimelineWeek" />
              <ViewDirective option="TimelineMonth" />
              <ViewDirective option="Agenda" />
            </ViewsDirective>
    
            <Inject services={[Day, WorkWeek, Month, Week, TimelineViews, DragAndDrop, Resize, Agenda]} />
          </ScheduleComponent>
    
        </div>
      );
    };
    
    export default Scheduler;
    
    