# Cahier des Charges - Outil de Veille Tarifaire Hôtelière

**Version:** 1.0
**Date:** Janvier 2026
**Statut:** Validé
**Projet:** Scraping TravelAdvantage

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Contexte et enjeux](#2-contexte-et-enjeux)
3. [Périmètre du projet](#3-périmètre-du-projet)
4. [Utilisateurs cibles](#4-utilisateurs-cibles)
5. [Exigences fonctionnelles](#5-exigences-fonctionnelles)
6. [Exigences non-fonctionnelles](#6-exigences-non-fonctionnelles)
7. [Données manipulées](#7-données-manipulées)
8. [Interfaces utilisateur](#8-interfaces-utilisateur)
9. [Contraintes et limitations](#9-contraintes-et-limitations)
10. [Critères d'acceptation](#10-critères-dacceptation)
11. [Évolutions futures](#11-évolutions-futures)
12. [Glossaire](#12-glossaire)

---

## 1. Présentation du projet

### 1.1 Objet

Ce cahier des charges définit les besoins et exigences pour un outil de veille tarifaire automatisé permettant de collecter, analyser et visualiser les prix et réductions hôteliers proposés par la plateforme TravelAdvantage.com.

### 1.2 Objectifs principaux

| ID | Objectif | Mesure de succès |
|----|----------|------------------|
| O1 | Automatiser la collecte des prix hôteliers sur plusieurs destinations | 100% des villes configurées sont traitées |
| O2 | Identifier les meilleures opportunités de réduction | Les réductions supérieures à 40% sont mises en évidence |
| O3 | Fournir une visualisation géographique intuitive | Carte interactive avec filtres opérationnels |
| O4 | Faciliter la communication commerciale | Génération de contenus formatés pour emailing |
| O5 | Réduire le temps de recherche manuel | Gain de temps estimé à 90% |

### 1.3 Bénéfices attendus

- **Gain de productivité** : Automatisation d'une tâche répétitive et chronophage
- **Centralisation** : Vue consolidée des offres sur toutes les destinations
- **Réactivité** : Identification rapide des meilleures opportunités
- **Aide à la décision** : Données structurées et facilement exploitables

---

## 2. Contexte et enjeux

### 2.1 Problématique actuelle

Les professionnels du tourisme font face à plusieurs difficultés :

1. **Temps de recherche excessif** : La comparaison manuelle des prix sur plusieurs destinations est fastidieuse
2. **Volatilité des tarifs** : Les prix varient selon les périodes et les types de séjours
3. **Dispersion de l'information** : Absence d'outil centralisant les données de réduction
4. **Communication client** : Difficulté à exploiter rapidement les données pour des campagnes marketing

### 2.2 Solution attendue

Un système automatisé capable de :
- Collecter les données tarifaires depuis TravelAdvantage.com
- Calculer et comparer les pourcentages de réduction par destination
- Présenter les résultats sur une carte géographique interactive
- Exporter les données dans un format exploitable pour l'emailing

### 2.3 Parties prenantes

| Partie prenante | Rôle | Intérêt |
|-----------------|------|---------|
| Agents de voyage | Utilisateurs principaux | Consultation quotidienne des offres |
| Équipe marketing | Utilisateurs secondaires | Création de campagnes email |
| Administrateur | Gestion du système | Configuration et maintenance |

---

## 3. Périmètre du projet

### 3.1 Dans le périmètre

- Collecte automatisée des données hôtelières depuis TravelAdvantage.com
- Gestion d'une liste configurable de destinations (villes mondiales)
- Prise en charge de trois types de séjours : weekend, semaine, 2 semaines
- Traitement et déduplication des données collectées
- Calcul de statistiques (moyennes, plages de réduction)
- Visualisation cartographique interactive
- Système de filtrage par type de séjour et pourcentage de réduction
- Génération de contenus pour templates email
- Historisation des données par mois

### 3.2 Hors périmètre

- Réservation directe d'hôtels
- Intégration avec d'autres sites de comparaison (Booking, Expedia, etc.)
- Application mobile
- Gestion des paiements
- Authentification multi-utilisateurs
- Envoi automatique d'emails (uniquement génération de templates)

---

## 4. Utilisateurs cibles

### 4.1 Persona principal : Agent de voyage

**Profil** :
- Professionnel du secteur touristique
- Utilisation quotidienne ou hebdomadaire
- Recherche des meilleures offres pour ses clients

**Besoins** :
- Vue consolidée de toutes les destinations
- Filtrage par type de séjour et niveau de réduction
- Accès rapide aux détails des hôtels
- Export facile des données sélectionnées

**Critères de satisfaction** :
- Temps de chargement de la carte inférieur à 3 secondes
- Navigation intuitive entre les mois
- Visualisation claire des réductions par code couleur

### 4.2 Persona secondaire : Responsable marketing

**Profil** :
- Création de newsletters et campagnes email
- Utilisation hebdomadaire ou mensuelle

**Besoins** :
- Sélection visuelle des destinations à promouvoir
- Export des données au format exploitable (JSON)
- Génération de contenus pré-formatés pour Brevo

**Critères de satisfaction** :
- Sélection multiple de destinations en quelques clics
- Génération instantanée du template email
- Données complètes (images, prix, réductions)

### 4.3 Persona technique : Administrateur

**Profil** :
- Gestion et maintenance du système
- Utilisation ponctuelle

**Besoins** :
- Ajout/suppression de destinations
- Configuration des périodes de dates
- Lancement manuel du processus de collecte
- Accès aux logs et diagnostics

---

## 5. Exigences fonctionnelles

### 5.1 Module de collecte de données

#### EF-01 : Configuration des destinations
- Le système doit permettre de définir une liste de villes avec leurs coordonnées géographiques
- Chaque ville doit être associée à un pays et un code pays
- L'ajout d'une nouvelle destination doit être possible sans modification du code

#### EF-02 : Configuration des périodes
- Le système doit permettre de définir des plages de dates à surveiller
- Trois types de séjours doivent être supportés :
  - **Weekend** : 2 nuits (vendredi au dimanche)
  - **Semaine** : 7 nuits
  - **2 Semaines** : 14 nuits
- Les dates passées doivent être automatiquement exclues
- Des dates personnalisées doivent pouvoir être ajoutées manuellement

#### EF-03 : Collecte automatisée
- Le système doit collecter pour chaque combinaison ville/date/type de séjour :
  - Nom de l'hôtel
  - Localisation
  - Nombre d'étoiles (0 à 5)
  - Note de l'établissement
  - Pourcentage de réduction
  - Prix TravelAdvantage
  - Prix concurrent de référence
  - Économies membres
  - Image de l'hôtel
- La date et l'heure de collecte doivent être enregistrées

#### EF-04 : Gestion des erreurs de collecte
- En cas d'échec de chargement d'une page, le système doit :
  - Effectuer jusqu'à 3 tentatives
  - Capturer une image et des logs de diagnostic
  - Passer à la destination suivante si l'échec persiste
- Les erreurs doivent être tracées dans un journal

### 5.2 Module de traitement des données

#### EF-05 : Déduplication
- Les hôtels en doublon (même nom + même type de séjour) doivent être fusionnés
- En cas de doublon, la meilleure offre doit être conservée selon les critères :
  1. Meilleur pourcentage de réduction
  2. À réduction égale : prix le plus bas

#### EF-06 : Filtrage des valeurs aberrantes
- Les hôtels dont le prix dépasse 2 fois la moyenne de la page doivent être exclus
- Ce filtrage vise à éliminer les offres anormalement chères ou trop haut de gamme

#### EF-07 : Calcul de statistiques
- Pour chaque ville/mois/type de séjour, le système doit calculer :
  - Plage des réductions (min-max)
  - Moyenne des réductions
  - Plage des prix (min-max)
  - Moyenne des prix
  - Nombre d'échantillons
- Les statistiques doivent également être calculées pour le Top 5 des hôtels

#### EF-08 : Tri et classement
- Les hôtels doivent être triés par pourcentage de réduction décroissant
- Les 10 meilleurs hôtels par type de séjour doivent être identifiés

### 5.3 Module de stockage

#### EF-09 : Persistance des données par ville
- Les données de chaque ville doivent être stockées dans un fichier dédié
- L'organisation doit être par mois (un onglet/section par mois)
- Les nouvelles données doivent fusionner avec les données existantes (pas d'écrasement)

#### EF-10 : Génération d'un résumé consolidé
- Un fichier récapitulatif doit être généré avec :
  - Un onglet par mois
  - Pour chaque ville : pourcentage moyen de réduction par type de séjour
- Les pourcentages supérieurs à 40% doivent être mis en évidence visuellement

### 5.4 Module de visualisation

#### EF-11 : Carte interactive
- Les destinations doivent être affichées sur une carte géographique mondiale
- Chaque destination doit être représentée par un marqueur cliquable
- Les marqueurs doivent être regroupés (clustering) aux faibles niveaux de zoom

#### EF-12 : Code couleur des marqueurs
- Les marqueurs doivent être colorés selon le niveau de réduction :
  - **Rouge** : ≥ 40% de réduction
  - **Orange** : 30-39% de réduction
  - **Jaune** : 20-29% de réduction
  - **Vert** : < 20% de réduction

#### EF-13 : Navigation temporelle
- L'utilisateur doit pouvoir naviguer entre les différents mois disponibles
- Le changement de mois doit mettre à jour tous les marqueurs

#### EF-14 : Filtres
- L'utilisateur doit pouvoir filtrer par :
  - Type de séjour (weekend, semaine, 2 semaines) via des cases à cocher
  - Pourcentage de réduction minimum et maximum
- Les filtres doivent s'appliquer en temps réel

#### EF-15 : Popup d'information
- Le clic sur un marqueur doit afficher :
  - Nom de la ville et du pays
  - Pourcentage de réduction pour chaque type de séjour
  - Cases à cocher pour sélectionner les types souhaités

### 5.5 Module de sélection et export

#### EF-16 : Sélection multiple
- L'utilisateur doit pouvoir sélectionner plusieurs villes et types de séjour
- La liste des sélections doit être visible dans une barre latérale
- Chaque sélection doit pouvoir être retirée individuellement

#### EF-17 : Génération de template email
- Un bouton doit permettre de générer un template à partir des sélections
- Le template doit inclure pour chaque sélection :
  - Informations de la ville
  - Données des hôtels (images, prix, réductions)
  - Données formatées pour intégration dans Brevo
- Les données doivent être exportables au format JSON

---

## 6. Exigences non-fonctionnelles

### 6.1 Performance

| Exigence | Critère | Valeur cible |
|----------|---------|--------------|
| ENF-01 | Temps de chargement de la carte | < 3 secondes |
| ENF-02 | Temps de collecte moyen par ville | < 60 secondes |
| ENF-03 | Taux de réussite de la collecte | > 95% |

### 6.2 Disponibilité

| Exigence | Critère | Valeur cible |
|----------|---------|--------------|
| ENF-04 | Disponibilité du serveur web | > 99% |
| ENF-05 | Fraîcheur maximale des données | < 24 heures |

### 6.3 Capacité

| Exigence | Critère | Valeur cible |
|----------|---------|--------------|
| ENF-06 | Nombre de villes supportées | > 50 |
| ENF-07 | Espace disque requis | < 500 Mo |

### 6.4 Maintenabilité

| Exigence | Description |
|----------|-------------|
| ENF-08 | Le code doit être modulaire et documenté |
| ENF-09 | Les paramètres de configuration doivent être externalisés |
| ENF-10 | Les logs doivent permettre le diagnostic des erreurs |

### 6.5 Évolutivité

| Exigence | Description |
|----------|-------------|
| ENF-11 | L'ajout de nouvelles destinations ne doit pas nécessiter de modification du code |
| ENF-12 | L'architecture doit permettre l'ajout de nouvelles sources de données |

---

## 7. Données manipulées

### 7.1 Données d'entrée

#### Configuration des villes
| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| Ville | Texte | Nom de la ville | Oui |
| Pays | Texte | Nom du pays | Oui |
| Latitude | Décimal | Coordonnée GPS | Oui |
| Longitude | Décimal | Coordonnée GPS | Oui |
| Code pays | Texte | Code ISO du pays (FR, GB, etc.) | Oui |

#### Configuration des dates
| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| Date début | Date | Date d'arrivée | Oui |
| Date fin | Date | Date de départ | Oui |
| Type de séjour | Entier | 1=Weekend, 2=Semaine, 3=2 Semaines | Oui |

### 7.2 Données collectées (par hôtel)

| Champ | Type | Description |
|-------|------|-------------|
| Nom de l'hôtel | Texte | Nom complet |
| Localisation | Texte | Adresse ou quartier |
| Étoiles | Entier | Classement 0-5 |
| Note | Décimal | Note client |
| Réduction | Pourcentage | Économie vs prix concurrent |
| Prix TravelAdvantage | Décimal | Prix proposé |
| Prix concurrent | Décimal | Prix de référence |
| Économies membres | Décimal | Réduction additionnelle |
| URL image | Texte | Lien vers la photo |
| Date début séjour | Date | - |
| Date fin séjour | Date | - |
| Type de séjour | Entier | 1/2/3 |
| Date de collecte | Horodatage | Date et heure de récupération |

### 7.3 Données de sortie

#### Résumé par ville/mois
| Champ | Type | Description |
|-------|------|-------------|
| Ville | Texte | Nom de la destination |
| Pays | Texte | Pays |
| % Weekend | Pourcentage | Moyenne réduction weekend |
| % Semaine | Pourcentage | Moyenne réduction semaine |
| % 2 Semaines | Pourcentage | Moyenne réduction 2 semaines |
| Coordonnées | Décimal | Latitude et longitude |

---

## 8. Interfaces utilisateur

### 8.1 Interface principale : Carte interactive

**Description** : Page web affichant une carte mondiale avec les destinations marquées.

**Composants** :
- Zone de carte (occupant la majorité de l'écran)
- Légende des couleurs (coin inférieur droit)
- Boutons de navigation mensuelle (partie supérieure)
- Zone de filtres (type de séjour + pourcentage)
- Barre latérale des sélections (côté droit)
- Bouton "Créer Template"

**Interactions** :
- Zoom/dézoom sur la carte
- Clic sur marqueur = affichage popup
- Cocher type dans popup = ajout à la sélection
- Clic sur × dans sélection = retrait
- Clic "Créer Template" = ouverture page template

### 8.2 Interface secondaire : Template email

**Description** : Page web affichant les données formatées pour export.

**Composants** :
- Liste des villes sélectionnées avec leurs hôtels
- Données au format JSON pour copie
- Aperçu visuel du rendu

---

## 9. Contraintes et limitations

### 9.1 Contraintes techniques

| Contrainte | Description | Impact |
|------------|-------------|--------|
| Dépendance source | Le système dépend de TravelAdvantage.com | Toute modification du site source peut nécessiter une adaptation |
| Limitation de débit | Le site source peut limiter le nombre de requêtes | Délais obligatoires entre les requêtes |
| Navigation automatisée | Certains sites détectent et bloquent les robots | Possibilité de blocage temporaire |
| Pagination | Seule la première page de résultats est collectée | Limitation du nombre d'hôtels par recherche |

### 9.2 Contraintes de données

| Contrainte | Description |
|------------|-------------|
| Langue | Les données sont collectées en français uniquement |
| Monnaie | Les prix sont en euros |
| Mise à jour | Les données reflètent l'état au moment de la collecte |

### 9.3 Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Modification du site source | Élevée | Élevé | Tests réguliers, alertes |
| Blocage par le site | Moyenne | Élevé | Délais entre requêtes, rotation |
| Données incomplètes | Moyenne | Moyen | Validation, logs détaillés |

---

## 10. Critères d'acceptation

### 10.1 Critères fonctionnels

| ID | Critère | Validation |
|----|---------|------------|
| CA-01 | La collecte s'exécute sur toutes les villes configurées | Vérification des fichiers générés |
| CA-02 | Les 3 types de séjours sont correctement traités | Présence des données par type |
| CA-03 | La carte affiche toutes les destinations | Comptage des marqueurs |
| CA-04 | Les filtres fonctionnent correctement | Tests manuels |
| CA-05 | Le template email contient les données sélectionnées | Vérification JSON |

### 10.2 Critères de performance

| ID | Critère | Méthode de test |
|----|---------|-----------------|
| CA-06 | Carte chargée en moins de 3 secondes | Chronométrage |
| CA-07 | Taux de réussite collecte > 95% | Analyse des logs |
| CA-08 | Plus de 50 villes affichées | Comptage |

### 10.3 Critères de qualité

| ID | Critère |
|----|---------|
| CA-09 | Aucune erreur bloquante lors de l'utilisation normale |
| CA-10 | Messages d'erreur explicites en cas de problème |
| CA-11 | Documentation utilisateur disponible |

---

## 11. Évolutions futures

### 11.1 Court terme (v1.x)

| Évolution | Priorité | Description |
|-----------|----------|-------------|
| Planification | P1 | Automatiser l'exécution périodique |
| Alertes | P2 | Notification si réduction > seuil configurable |

### 11.2 Moyen terme (v2.0)

| Évolution | Description |
|-----------|-------------|
| Historique des prix | Graphiques d'évolution des tarifs |
| Interface d'administration | Gestion web des destinations et paramètres |
| Export PDF | Génération de rapports formatés |


---

## 12. Glossaire

| Terme | Définition |
|-------|------------|
| **TravelAdvantage** | Site web source des données hôtelières |
| **Scraping** | Technique d'extraction automatisée de données depuis un site web |
| **Type de séjour** | Catégorie de durée : Weekend (2 nuits), Semaine (7 nuits), 2 Semaines (14 nuits) |
| **Réduction** | Pourcentage d'économie par rapport au prix concurrent de référence |
| **Clustering** | Regroupement visuel des marqueurs proches sur la carte |
| **Brevo** | Plateforme d'email marketing (anciennement Sendinblue) |
| **Template** | Modèle pré-formaté pour la création d'emails |
| **Top 5 / Top 10** | Classement des meilleurs hôtels par réduction |
| **Déduplication** | Processus d'élimination des entrées en double |
| **Valeur aberrante** | Donnée anormalement éloignée de la moyenne |

---

## Annexes

### A. Workflow utilisateur type

1. **Consultation des offres**
   - Accès à l'application web
   - Sélection du mois souhaité
   - Application des filtres (type de séjour, % minimum)
   - Exploration de la carte

2. **Sélection des destinations**
   - Clic sur les marqueurs d'intérêt
   - Consultation des pourcentages dans le popup
   - Cocher les types de séjour pertinents
   - Vérification de la liste des sélections

3. **Export pour communication**
   - Clic sur "Créer Template"
   - Consultation des données formatées
   - Export JSON pour intégration CRM/emailing

### B. Processus de mise à jour des données

1. **Quotidien (recommandé)** : Exécution de la collecte sur toutes les destinations
2. **Hebdomadaire** : Vérification de la qualité des données collectées
3. **Mensuel** : Nettoyage des données obsolètes, mise à jour de la liste des destinations

### C. Règles de gestion

| Règle | Description |
|-------|-------------|
| RG-01 | Un hôtel est identifié de manière unique par son nom + type de séjour |
| RG-02 | En cas de doublon, la meilleure réduction est conservée |
| RG-03 | Les prix supérieurs à 2× la moyenne sont considérés aberrants |
| RG-04 | Les dates passées sont automatiquement exclues |
| RG-05 | Les pourcentages ≥ 40% sont mis en évidence (rouge) |

---

*Document établi le 23 janvier 2026*
*Version 1.0*
