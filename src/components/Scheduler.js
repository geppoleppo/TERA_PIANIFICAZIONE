import React, { useState } from 'react';
import Select from 'react-select';
import { ScheduleComponent, Day, WorkWeek, Month, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
import resources, { getEmployeeName, getEmployeeImage, getEmployeeDesignation, getResourceColor } from './resources';
import commesse, { getCommessaColor } from './commesse';

const Scheduler = ({ data, onDataChange }) => {
  const [selectedResources, setSelectedResources] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);

  const handleResourceChange = (selectedOptions) => {
    setSelectedResources(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleCommessaChange = (selectedOptions) => {
    setSelectedCommesse(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const getFilteredResources = () => {
    if (selectedResources.length === 0) return [];
    return resources.filter(resource => selectedResources.includes(resource.Id));
  };

  const getFilteredCommesse = () => {
    if (selectedCommesse.length === 0) return [];
    return commesse.filter(commessa => selectedCommesse.includes(commessa.Id));
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
        <img src={getEmployeeImage(props)} alt={getEmployeeName(props)} className="resource-image" />
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
              const resourceColor = getResourceColor(event.ConferenceId);
              event.Color = resourceColor;
            }
          });
        } else if (!args.data.Color) {
          const resourceColor = getResourceColor(args.data.ConferenceId);
          args.data.Color = resourceColor;
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
          placeholder="Select Resources"
          className="filter-dropdown"
        />
        <Select
          isMulti
          options={commessaOptions}
          onChange={handleCommessaChange}
          placeholder="Select Commesse"
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
            dataSource={getFilteredResources()}
            textField='Text'
            idField='Id'
            colorField='Color'
          />
          <ResourceDirective
            field='CommessaId'
            title='Commessa'
            name='Commesse'
            allowMultiple={false}
            dataSource={getFilteredCommesse()}
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
