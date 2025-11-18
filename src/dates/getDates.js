const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function getPeriods(moisDansFutur = 1) {
  return new Promise((resolve) => {
    const today = new Date();
    let moisCible = today.getMonth() + moisDansFutur;
    let anneeCible = today.getFullYear();
    anneeCible += Math.floor(moisCible / 12);
    moisCible = moisCible % 12;
    const premierJour = new Date(anneeCible, moisCible, 1);
    const dernierJour = new Date(anneeCible, moisCible + 1, 0);
    
    function createDateObject(fromDate, toDate, type) {
      return {
        date: {
          fromDate: formatDate(fromDate),
          toDate: formatDate(toDate),
          type
        }
      };
    }

    const objects = [];

    for (let jour = new Date(premierJour); jour <= dernierJour; jour.setDate(jour.getDate() + 1)) {
      if (jour.getDay() === 5) { // Vendredi
        const vendrediDebut = new Date(jour);
        
        // Weekend , type =1
        let dimancheFin = new Date(jour);
        dimancheFin.setDate(dimancheFin.getDate() + 2);
        objects.push(createDateObject(vendrediDebut, dimancheFin, 1));

        // Semaine , type =2
        let vendrediFinSemaine = new Date(jour);
        vendrediFinSemaine.setDate(vendrediFinSemaine.getDate() + 7);
        objects.push(createDateObject(vendrediDebut, vendrediFinSemaine, 2));

        // Deux semaines , type =3
        let vendrediFinDeuxSemaines = new Date(jour);
        vendrediFinDeuxSemaines.setDate(vendrediFinDeuxSemaines.getDate() + 14);
        objects.push(createDateObject(vendrediDebut, vendrediFinDeuxSemaines, 3));
      }
    }
    
    resolve(objects);
  });
}

function formatDate(date) {
  return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
}

async function afficherPeriodes(mois) {
  const periodes = await getPeriods(mois);
  console.log(`Périodes dans ${mois} mois :`);

  periodes.forEach((obj, index) => {
    console.log(`\nPériode ${index + 1}:`);
    console.log(`  Du: ${obj.date.fromDate}`);
    console.log(`  Au: ${obj.date.toDate}`);
    console.log(`  Type: ${obj.date.type}`);
  });

  // Enregistrer dans un fichier JSON
  // fs.writeFile('Dates2.json', JSON.stringify(periodes, null, 2), (err) => {
  //   if (err) {
  //     console.error('Erreur lors de l\'enregistrement du fichier:', err);
  //   } else {
  //     console.log('\nLes dates ont été enregistrées dans Dates2.json');
  //   }
  // });

  return periodes;
}

let objectsPromise;

function demanderMois() {
  objectsPromise = new Promise((resolve) => {
    readline.question('Dans combien de mois voulez-vous voir les périodes ? ', async (mois) => {
      try {
        const objects = await afficherPeriodes(parseInt(mois));
        console.log('Traitement terminé.');
        resolve(objects);
      } catch (error) {
        console.error('Une erreur est survenue:', error);
        resolve([]);
      } finally {
        readline.close();
      }
    });
  });
}

demanderMois();

module.exports = {
  getObjects: () => objectsPromise
};