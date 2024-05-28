import React from 'react';
import { ScheduleComponent, Day, WorkWeek, Month, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
import resources from './resources'; // Importa le risorse
import commesse from './commesse'; // Importa le commesse

const Scheduler = ({ data, onDataChange }) => {

  const getEmployeeName = (value) => {
    return ((value.resourceData) ? value.resourceData[value.resource.textField] : value.resourceName);
  };

  const getEmployeeImage = (value) => {
    const resource = resources.find(res => res.Id === value.resourceData.Id);
    return resource ? resource.Image : '';
  };

  const getEmployeeDesignation = (value) => {
    let resourceName = getEmployeeName(value);
    return (resourceName === 'Margaret') ? 'Sales Representative' : (resourceName === 'Robert') ? 'Vice President, Sales' : 'Inside Sales Coordinator';
  };

  const monthEventTemplate = (props) => {
    return (<div className="subject">{props.Subject}</div>);
  };

  const resourceHeaderTemplate = (props) => {
    return (<div className="template-wrap">
      <div className={"resource-image " + getEmployeeImage(props)}></div>
      <div className="resource-details">
        <div className="resource-name">{getEmployeeName(props)}</div>
        <div className="resource-designation">{getEmployeeDesignation(props)}</div>
      </div>
    </div>);
  };

  const onActionComplete = (args) => {
    console.log('Scheduler Event Data:', args.data);
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
      // Set color based on resource if not already set
      if (args.data && Array.isArray(args.data)) {
        args.data.forEach(event => {
          if (!event.Color) {
            const resource = resources.find(res => res.Id === event.ConferenceId);
            if (resource) {
              event.Color = resource.Color;
            }
          }
        });
      } else if (args.data && !args.data.Color) {
        const resource = resources.find(res => res.Id === args.data.ConferenceId);
        if (resource) {
          args.data.Color = resource.Color;
        }
      }
      console.log('Updated Scheduler Event Data:', args.data);
      onDataChange(args);
    }
  };

  return (
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
          subject: { title: 'Conference Name', name: 'Subject' },
          description: { title: 'Summary', name: 'Description' },
          startTime: { title: 'From', name: 'StartTime' },
          endTime: { title: 'To', name: 'EndTime' },
          color: { name: 'Color' },
          conferenceId: { title: 'Commessa', name: 'ConferenceId' } // Campo commessa
        }
      }}
      group={{ allowGroupEdit: true, resources: ['Conferences'] }} // Raggruppa solo per Conferences
      actionComplete={onActionComplete}
    >
      <ResourcesDirective>
        <ResourceDirective
          field='ConferenceId'
          title='Attendees'
          name='Conferences'
          allowMultiple={true}
          dataSource={resources}
          textField='Text'
          idField='Id'
          colorField='Color'
        />
        <ResourceDirective
          field='ConferenceId'
          title='Commessa'
          name='Commesse'
          allowMultiple={false}
          dataSource={commesse}
          textField='Text'
          idField='Id'
        />
      </ResourcesDirective>
      <ViewsDirective>
        <ViewDirective option='Day' />
        <ViewDirective option='WorkWeek' />
        <ViewDirective option='Month' eventTemplate={monthEventTemplate} />
        <ViewDirective option='TimelineWeek' />
      </ViewsDirective>
      <Inject services={[Day, WorkWeek, Month, TimelineViews, Resize, DragAndDrop]} />
    </ScheduleComponent>
  );
};

export default Scheduler;
