# Explication du projet Sharifatou Malai

## Identité du projet

- Étudiante : **SHARIFATOU MALAI**
- Matricule : **25I2263**
- Projet : **API bancaire JavaScript avec interfaces web, tests automatiques et mesures de performance**

## Contenu du projet

Ce projet contient une API bancaire développée en JavaScript avec le module natif `http` de Node.js.  
L'application permet de :

- créer un compte bancaire
- lister les comptes existants
- consulter le détail d'un compte
- effectuer un dépôt
- effectuer un retrait
- consulter l'historique des transactions

## Interfaces fournies

Le projet contient trois modules d'interface distincts :

1. **Operations Console**  
   Interface de pilotage dense orientée opérations courantes.

2. **Treasury Workbench**  
   Interface sombre de supervision avec watchlist, dossier surveillé et desk d'exécution.

3. **Client Portfolio**  
   Interface éditoriale de suivi client, pensée comme un dossier relationnel.

## Authentification locale

Chaque module dispose d'une page de connexion locale de démonstration.

- `/bootstrap/login`
- `/workbench/login`
- `/portfolio/login`

Identifiants :

- `sharifatou.console` / `Sharifa304`
- `sharifatou.workbench` / `SharifaWorkbench304`
- `sharifatou.portfolio` / `SharifaPortfolio304`

## Tests et qualité

Le projet inclut :

- des tests unitaires
- des tests d'intégration
- un rapport de couverture de code
- des scripts de performance avec `hey`
- un plan de test `JMeter`

## Commandes utiles

```bash
npm test
npm run test:coverage
npm start
./test/performance/hey/run-hey.sh
```

## Accès local

- application : `http://127.0.0.1:8007/`
- swagger : `http://127.0.0.1:8007/docs`
- coverage HTML : `coverage/index.html`
