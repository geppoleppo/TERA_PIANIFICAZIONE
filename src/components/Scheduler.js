import React from 'react';
import { ScheduleComponent, Day, WorkWeek, Month, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';

const Scheduler = ({ data, onDataChange }) => {
  const resourceData = [
    { Text: 'Margaret', Id: 1, Color: '#1aaa55' },
    { Text: 'Robert', Id: 2, Color: '#357cd2' },
    { Text: 'Laura', Id: 3, Color: '#7fa900' }
  ];

  const getEmployeeName = (value) => {
    return ((value.resourceData) ? value.resourceData[value.resource.textField] : value.resourceName);
  };

  const getEmployeeImage = (value) => {
    return getEmployeeName(value).replace(' ', '-').toLowerCase();
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
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
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
          color: { name: 'Color' }
        }
      }}
      group={{ allowGroupEdit: true, resources: ['Conferences'] }}
      actionComplete={onActionComplete}
    >
      <ResourcesDirective>
        <ResourceDirective
          field='ConferenceId'
          title='Attendees'
          name='Conferences'
          allowMultiple={true}
          dataSource={resourceData}
          textField='Text'
          idField='Id'
          colorField='Color'
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
