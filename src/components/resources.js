const resources = [
  { Text: 'Francesco Arena', Id: 1, Color: '#1aa55', Image: '/images/francesco.png' },
  { Text: 'Alessandro Arnoldi', Id: 2, Color: '#1aaa55', Image: '/images/alessandro.png' },
  { Text: 'Ivan Bolognani', Id: 3, Color: '#357cd2', Image: '/images/ivan.png' },
  { Text: 'Paolo Buzzi', Id: 4, Color: '#7fa900', Image: '/images/paolob.png' },
  { Text: 'Giulia Cattani', Id: 5, Color: '#357cd2', Image: '/images/giulia.png' },
  { Text: 'Giovanni Demozzi', Id: 6, Color: '#357cd2', Image: '/images/giovanni.png' },
  { Text: 'Paolo Grisenti', Id: 7, Color: '#357cd2', Image: '/images/paolog.png' },
  { Text: 'Enrico Lora', Id: 8, Color: '#357cd2', Image: '/images/enrico.png' },
  { Text: 'Giacomo Lorenzi', Id: 9, Color: '#357cd2', Image: '/images/giacomo.png' },
  { Text: 'Silvano Pisoni', Id: 10, Color: '#357cd2', Image: '/images/silvano.png' },
  { Text: 'Patrick Rizzolli', Id: 11, Color: '#357cd2', Image: '/images/patrick.png' },
  { Text: 'Ilaria Spagna', Id: 12, Color: '#357cd2', Image: '/images/ilaria.png' },
  { Text: 'Anna Tapparelli', Id: 13, Color: '#1aaa55', Image: '/images/anna.png' },
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
  return (resourceName === 'Margaret') ? 'Sales Representative' : (resourceName === 'Robert') ? 'Vice President, Sales' : '';
};

export const getResourceColor = (resourceId) => {
  const resource = resources.find(res => res.Id === resourceId);
  return resource ? resource.Color : '#000000';
};

export default resources;
