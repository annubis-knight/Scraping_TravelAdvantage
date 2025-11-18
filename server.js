const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { processExcelData } = require('./src/assets/js/getHotelsXslx');
const { execSync } = require('child_process');

const mapLeafletPath = path.join(__dirname, 'src', 'MapLeaflet');

console.log('Changement de répertoire vers MapLeaflet...');
console.log(`Chemin du répertoire MapLeaflet : ${mapLeafletPath}`);

// Exécuter index1.js
console.log('Exécution de index1.js...');
try {
    execSync('node index1_generateResume.js', { 
        cwd: mapLeafletPath,
        stdio: 'inherit'
    });
    console.log('index1.js exécuté avec succès.');
} catch (error) {
    console.error('Erreur lors de l\'exécution de index1.js:', error.message);
}

// Exécuter generateMap.js
console.log('Exécution de generateMap.js...');
try {
    execSync('node generateMap.js', { 
        cwd: mapLeafletPath,
        stdio: 'inherit'
    });
    console.log('generateMap.js exécuté avec succès.');
} catch (error) {
    console.error('Erreur lors de l\'exécution de generateMap.js:', error.message);
}

console.log('Retour au répertoire racine...');


// Vérification de l'importation
console.log("processExcelData importé :", typeof processExcelData);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'src')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Variable globale pour stocker les données sélectionnées
let selectedCitiesData = null;

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'MapLeaflet', 'index2.html'));
});

// Route pour recevoir les données des villes sélectionnées
app.post('/saveSelectedCities', (req, res) => {
    selectedCitiesData = req.body;
    console.log("Données reçues par le serveur:", JSON.stringify(selectedCitiesData, null, 2));
    res.json({ success: true });
});

// Route pour obtenir les données Excel
app.get('/getHotelsData', async (req, res) => {
    if (!selectedCitiesData) {
        return res.status(404).json({ error: 'Aucune donnée sélectionnée' });
    }

    try {
        console.log("/getHotelsData - Traitement des données Excel...");
        const results = await processExcelData(selectedCitiesData);
        console.log("Résultats obtenus:", results);
        res.json(results);
    } catch (error) {
        console.error('Erreur lors du traitement des données Excel:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour obtenir les données des villes
app.get('/getCitiesData', (req, res) => {
    const citiesDataPath = path.join(__dirname, 'src', 'assets', 'js', 'villesDeDestinations.json');
    fs.readFile(citiesDataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON des villes:', err);
            return res.status(500).json({ error: 'Erreur lors de la lecture des données des villes' });
        }
        try {
            const citiesData = JSON.parse(data);
            res.json(citiesData);
        } catch (parseError) {
            console.error('Erreur lors du parsing du JSON des villes:', parseError);
            res.status(500).json({ error: 'Erreur lors du traitement des données des villes' });
        }
    });
});

// Servir templateBrevo.html
app.get('/templateBrevo', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'MapLeaflet', 'templateBrevo.html'));
});


// Gestion des erreurs 404
app.use((req, res, next) => {
    res.status(404).send("Désolé, cette page n'existe pas !");
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Quelque chose s\'est mal passé !');
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});