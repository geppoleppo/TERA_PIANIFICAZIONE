const resources = [
  { Text: 'Francesco Arena', Id: 1, Color: '#1aa55', Image: '../../public/images/francesco.png' },
  { Text: 'Alessandro Arnoldi', Id: 2, Color: '#1aaa55', Image: '../../public/images/alessandro.png' },
  { Text: 'Ivan Bolognani', Id: 3, Color: '#357cd2', Image: '../../public/images/francesco.png'},
  { Text: 'Paolo Buzzi', Id: 4, Color: '#7fa900', Image: '/images/laura.png' },
  { Text: 'Giulia Cattani', Id: 5, Color: '#357cd2', Image: '/images/robert.png' },
  { Text: 'Giovanni Demozzi', Id: 6, Color: '#357cd2', Image: '/images/robert.png' },
  { Text: 'Paolo Grisenti', Id: 7, Color: '#357cd2', Image: '/images/robert.png' },
  { Text: 'Enrico Lora', Id: 8, Color: '#357cd2', Image: '/images/robert.png' },
  { Text: 'Giacomo Lorenzi', Id: 9, Color: '#357cd2', Image: '/images/robert.png' },
  { Text: 'Silvano pisoni', Id: 10, Color: '#357cd2', Image: '/images/robert.png' },
  { Text: 'Patrick Rizzolli', Id: 11, Color: '#357cd2', Image: '/images/robert.png' },
  { Text: 'Ilaria Spagna', Id: 12, Color: '#357cd2', Image: '/images/robert.png' },
  { Text: 'Anna Tapparelli', Id: 13, Color: '#1aaa55', Image: '/images/margaret.png' },
];

export const getEmployeeName = (value) => {
  return ((value.resourceData) ? value.resourceData[value.resource.textField] : value.resourceName);
};

export const getEmployeeImage = (value) => {
  if (value.resourceData) {
    const resource = resources.find(res => res.Id === value.resourceData.Id);
    return resource ? resource.Image : '';
  }
  return '';
};

export const getEmployeeDesignation = (value) => {
  let resourceName = getEmployeeName(value);
  return (resourceName === 'Margaret') ? 'Sales Representative' : (resourceName === 'Robert') ? 'Vice President, Sales' : 'Inside Sales Coordinator';
};

export const getResourceColor = (resourceId) => {
  const resource = resources.find(res => res.Id === resourceId);
  return resource ? resource.Color : '#000000';
};

export default resources;
