const commesse = [
    { Text: 'Commessa 1', Id: 1, Color: '#ff0000' },
    { Text: 'Commessa 2', Id: 2, Color: '#00ff00' },
    { Text: 'Commessa 3', Id: 3, Color: '#00ff00' },
    { Text: 'Commessa 4', Id: 4, Color: '#00ff00' },
    { Text: 'Commessa 5', Id: 5, Color: '#00ff00' },
    { Text: 'Commessa 6', Id: 6, Color: '#00ff00' },
    { Text: 'Commessa 7', Id: 7, Color: '#00ff00' },
    { Text: 'Commessa 8', Id: 8, Color: '#00ff00' },
    { Text: 'Commessa 9', Id: 9, Color: '#00ff00' },
    { Text: 'Commessa 10', Id: 10, Color: '#00ff00' },
    { Text: 'Commessa 11', Id: 11, Color: '#00ff00' },
    { Text: 'Commessa 12', Id: 12, Color: '#00ff00' },
    { Text: 'Commessa 13', Id: 13, Color: '#00ff00' },
    { Text: 'Commessa 14', Id: 14, Color: '#00ff00' },
    { Text: 'Commessa 15', Id: 15, Color: '#00ff00' },
    { Text: 'Commessa 16', Id: 16, Color: '#00ff00' },
    { Text: 'Commessa 17', Id: 17, Color: '#00ff00' },
    { Text: 'Commessa 17', Id: 18, Color: '#00ff00' },
    { Text: 'Commessa 18', Id: 19, Color: '#00ff00' },
    { Text: 'Commessa 19', Id: 20, Color: '#00ff00' },
    { Text: 'Commessa 20', Id: 21, Color: '#0000ff' }
  ];
  
  export const getCommessaColor = (commessaId) => {
    const commessa = commesse.find(com => com.Id === commessaId);
    return commessa ? commessa.Color : '#000000';
  };
  
  export default commesse;
  