const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

function parseDateAndFormat(dateString) {
  if (!dateString) {
    console.error('Date string is undefined or empty');
    return null;
  }

  const [day, month, year] = dateString.split('/');

  if (!day || !month || !year) {
    console.error('Invalid date format:', dateString);
    return null;
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error('Invalid date components:', dateString);
    return null;
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function processCSV() {
  return new Promise((resolve, reject) => {
    console.log('Début du traitement CSV...');
    const results = [];

    try {
        fs.createReadStream(path.join(__dirname, 'datesAdditionnelles.csv'))
          .pipe(csv({ separator: ';', headers: false }))
          .on('data', (row) => {
            console.log('Ligne lue:', row);
            const fromDate = row[0];
            const toDate = row[1];
            const type = row[2];
      
            if (!fromDate || !toDate || !type) {
              console.error('Données manquantes dans la ligne:', row);
              return;
            }
      
            const parsedFromDate = parseDateAndFormat(fromDate);
            const parsedToDate = parseDateAndFormat(toDate);
            const parsedType = parseInt(type);
      
            if (parsedFromDate && parsedToDate && !isNaN(parsedType)) {
              const obj = {
                date: {
                  fromDate: parsedFromDate,
                  toDate: parsedToDate,
                  type: parsedType
                }
              };
              results.push(obj);
            } else {
              console.error('Données invalides dans la ligne:', row);
            }
          })
          .on('end', () => {
            console.log('Fin de la lecture du CSV');
            const jsonData = JSON.stringify(results, null, 2);
            // fs.writeFile('Dates.json', jsonData, (err) => {
            //   if (err) {
            //     console.error('Erreur lors de l\'écriture du fichier JSON:', err);
            //     reject(err);
            //   } else {
            //     console.log('Data saved to Dates.json');
            //     console.log('Total processed rows:', results.length);
                   resolve(results);
            //   }
            // });

          })
          .on('error', (error) => {
            console.error('Erreur lors de la lecture du CSV:', error);
            reject(error);
          });
      } catch (error) {
        console.error('Erreur dans le processus CSV:', error);
        reject(error);
      }
  });
}

module.exports = { processCSV };