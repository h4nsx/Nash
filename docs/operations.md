# Operations

Serilog structured logs: timestamp, level, request/trace ID, module, operation and user ID where appropriate. Never log secrets.

OpenTelemetry: HTTP/DB/background traces. Sentry: application errors.

Track API latency/error rate, match generation duration, candidate counts, invitation acceptance/counter rates, contract completion, skill-test pass rate and background-job failures.

Incident flow: identify impact → inspect logs/traces/deployments/dependencies → mitigate → preserve evidence → fix → regression test → document.
