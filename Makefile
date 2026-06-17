BASE_URL ?= http://127.0.0.1:8003

.PHONY: start test unit integration coverage perf-hey perf-jmeter

start:
	npm start

test:
	npm test

unit:
	npm run test:unit

integration:
	npm run test:integration

coverage:
	npm run test:coverage

perf-hey:
	BASE_URL=$(BASE_URL) npm run test:performance:hey

perf-jmeter:
	jmeter -n -t test/performance/jmeter/api-bancaire-test-plan.jmx -l test/performance/jmeter/results.jtl -e -o test/performance/jmeter/report
