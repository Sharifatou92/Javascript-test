# Tests de performance

Ce dossier contient deux approches de test de performance pour l'API bancaire :

- `jmeter/api-bancaire-test-plan.jmx` : plan Apache JMeter
- `hey/run-hey.sh` : script de charge avec `hey`

## Prerequis

- Node.js 20+
- serveur demarre sur `http://127.0.0.1:8003`
- `jmeter` installe pour le plan JMeter
- `hey` installe pour le script `hey`

## Demarrage du serveur

```bash
npm start
```

## Lancer les tests JMeter

```bash
jmeter -n \
  -t test/performance/jmeter/api-bancaire-test-plan.jmx \
  -l test/performance/jmeter/results.jtl \
  -e -o test/performance/jmeter/report
```

## Lancer les tests hey

```bash
chmod +x test/performance/hey/run-hey.sh
./test/performance/hey/run-hey.sh
```

## Raccourcis

Un `Makefile` est fourni pour lancer rapidement :

```bash
make unit
make integration
make coverage
make perf-hey
make perf-jmeter
```

Le script effectue :

- un test sur `GET /accounts`
- un test sur `POST /accounts`

Les sorties sont ecrites dans `test/performance/hey/results/`.
