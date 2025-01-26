# Plan de restructuration des services de données

## 1. Création du nouveau service `DatasourceService`
- Créer le fichier `datasource.service.ts` dans le dossier `@datasource-configuration`
- Implémenter la gestion d'état avec BehaviorSubject pour la configuration
- Implémenter les méthodes d'accès aux données (CRUD + procédures stockées)
- Ajouter la gestion des paramètres de procédures stockées

## 2. Mise à jour de `CardDatabaseService`
- Supprimer les méthodes qui seront déplacées vers `DatasourceService`
- Nettoyer les imports et interfaces non utilisées
- Mettre à jour la documentation

## 3. Mise à jour du composant `DatasourceConfigurationComponent`
- Injecter le nouveau `DatasourceService`
- Remplacer les appels directs à `CardDatabaseService` par `DatasourceService`
- Mettre à jour la gestion des paramètres de procédures stockées

## 4. Mise à jour des cartes existantes
### DataTableCardService
- Injecter `DatasourceService`
- Remplacer les appels à `CardDatabaseService.fetchData`
- Adapter la gestion des paramètres

### LineChartCardService
- Injecter `DatasourceService`
- Remplacer les appels à `CardDatabaseService.fetchData`
- Adapter la gestion des paramètres

## 5. Tests et validation
- Tester la configuration des sources de données
- Tester les appels CRUD
- Tester les appels aux procédures stockées
- Vérifier la gestion des paramètres 