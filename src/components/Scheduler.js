import React, { useState } from 'react';
import Select from 'react-select';
import { ScheduleComponent, Day, WorkWeek, Month, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
import resources from './resources'; // Importa le risorse
import commesse from './commesse'; // Importa le commesse

const Scheduler = ({ data, onDataChange }) => {
  const [filteredResources, setFilteredResources] = useState(resources);
  const [filteredCommesse, setFilteredCommesse] = useState(commesse);

  const handleResourceChange = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setFilteredResources(resources);
    } else {
      const selectedIds = selectedOptions.map(option => option.value);
      setFilteredResources(resources.filter(resource => selectedIds.includes(resource.Id)));
    }
  };

  const handleCommessaChange = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setFilteredCommesse(commesse);
    } else {
      const selectedIds = selectedOptions.map(option => option.value);
      setFilteredCommesse(commesse.filter(commessa => selectedIds.includes(commessa.Id)));
    }
  };

  const getEmployeeName = (value) => {
    return ((value.resourceData) ? value.resourceData[value.resource.textField] : value.resourceName);
  };

  const getEmployeeImage = (value) => {
    if (value.resourceData) {
      const resource = resources.find(res => res.Id === value.resourceData.Id);
      return resource ? resource.Image : '';
    }
    return '';
  };

  const getEmployeeDesignation = (value) => {
    let resourceName = getEmployeeName(value);
    return (resourceName === 'Margaret') ? 'Sales Representative' : (resourceName === 'Robert') ? 'Vice President, Sales' : 'Inside Sales Coordinator';
  };

  const monthEventTemplate = (props) => {
    const commessa = commesse.find(commessa => commessa.Id === props.CommessaId);
    const commessaText = commessa ? commessa.Text : 'No Commessa';
    const subjectText = props.Subject ? props.Subject : '';
    return (
      <div className="template-wrap">
        <div className="subject">{`${commessaText} - ${subjectText}`}</div>
      </div>
    );
  };

  const resourceHeaderTemplate = (props) => {
    return (
      <div className="template-wrap">
        <div className={"resource-image " + getEmployeeImage(props)}></div>
        <div className="resource-details">
          <div className="resource-name">{getEmployeeName(props)}</div>
          <div className="resource-designation">{getEmployeeDesignation(props)}</div>
        </div>
      </div>
    );
  };

  const onActionComplete = (args) => {
    console.log('Scheduler Event Data:', args.data);
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
      if (args.data) {
        if (Array.isArray(args.data)) {
          args.data.forEach(event => {
            if (!event.Color) {
              const resource = resources.find(res => res.Id === event.ConferenceId);
              if (resource) {
                event.Color = resource.Color;
              }
            }
          });
        } else if (!args.data.Color) {
          const resource = resources.find(res => res.Id === args.data.ConferenceId);
          if (resource) {
            args.data.Color = resource.Color;
          }
        }
      }
      console.log('Updated Scheduler Event Data:', args.data);
      onDataChange(args);
    }
  };

  const group = { byGroupID: false, resources: ['Conferences', 'Commesse'] };

  const resourceOptions = resources.map(resource => ({
    value: resource.Id,
    label: resource.Text
  }));

  const commessaOptions = commesse.map(commessa => ({
    value: commessa.Id,
    label: commessa.Text
  }));

  return (
    <div>
      <div className="filter-selectors">
        <Select
          isMulti
          options={resourceOptions}
          onChange={handleResourceChange}
          placeholder="Filter by Resources"
          className="filter-dropdown"
        />
        <Select
          isMulti
          options={commessaOptions}
          onChange={handleCommessaChange}
          placeholder="Filter by Commesse"
          className="filter-dropdown"
        />
      </div>
      <ScheduleComponent
        cssClass='group-editing'
        width='100%'
        height='650px'
        selectedDate={new Date()}
        currentView='WorkWeek'
        resourceHeaderTemplate={resourceHeaderTemplate}
        eventSettings={{
          dataSource: data,
          fields: {
            subject: { title: 'Task', name: 'Subject', default: '' },
            description: { title: 'Summary', name: 'Description' },
            startTime: { title: 'From', name: 'StartTime' },
            endTime: { title: 'To', name: 'EndTime' },
            color: { name: 'Color' },
            conferenceId: { title: 'Attendees', name: 'ConferenceId', validation: { required: true } },
            commessaId: { title: 'Commessa', name: 'CommessaId', validation: { required: true } }
          },
          template: monthEventTemplate
        }}
        group={group}
        actionComplete={onActionComplete}
      >
        <ViewsDirective>
          <ViewDirective option='Day' />
          <ViewDirective option='WorkWeek' />
          <ViewDirective option='Month' eventTemplate={monthEventTemplate} />
          <ViewDirective option='TimelineWeek' />
        </ViewsDirective>
        <ResourcesDirective>
          <ResourceDirective
            field='ConferenceId'
            title='Attendees'
            name='Conferences'
            allowMultiple={true}
            dataSource={filteredResources}
            textField='Text'
            idField='Id'
            colorField='Color'
          />
          <ResourceDirective
            field='CommessaId'
            title='Commessa'
            name='Commesse'
            allowMultiple={false}
            dataSource={filteredCommesse}
            textField='Text'
            idField='Id'
            colorField='Color'
          />
        </ResourcesDirective>
        <Inject services={[Day, WorkWeek, Month, TimelineViews, Resize, DragAndDrop]} />
      </ScheduleComponent>
    </div>
  );
};

export default Scheduler;
