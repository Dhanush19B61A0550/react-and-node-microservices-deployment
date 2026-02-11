// 'use strict';

// const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
// const { registerInstrumentations } = require('@opentelemetry/instrumentation');
// const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
// const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
// const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
// const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

// // Jaeger Exporter (Collector = receiver)
// const exporter = new JaegerExporter({
//   endpoint: 'http://jaeger.monitoring.svc.cluster.local:14268/api/traces',
// });

// // ✅ SpanProcessor is passed in constructor (NEW API)
// const provider = new NodeTracerProvider({
//   spanProcessors: [
//     new BatchSpanProcessor(exporter),
//   ],
// });

// // Register provider
// provider.register();

// // Auto-instrumentations
// registerInstrumentations({
//   instrumentations: [
//     new HttpInstrumentation(),
//     new ExpressInstrumentation(),
//   ],
// });

// console.log('OpenTelemetry tracing initialized');
// 'use strict';

// const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
// const { registerInstrumentations } = require('@opentelemetry/instrumentation');
// const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
// const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
// const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
// const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

// // ✅ Set service name for this microservice
// const serviceName = 'user-service';

// // Jaeger Exporter
// const exporter = new JaegerExporter({
//   endpoint: 'http://jaeger.monitoring.svc.cluster.local:14268/api/traces',
//   serviceName, // <-- important!
// });

// // Span Processor
// const provider = new NodeTracerProvider({
//   spanProcessors: [
//     new BatchSpanProcessor(exporter),
//   ],
// });

// // Register provider
// provider.register();

// // Auto-instrumentations
// registerInstrumentations({
//   instrumentations: [
//     new HttpInstrumentation(),
//     new ExpressInstrumentation(),
//   ],
// });

// console.log(`OpenTelemetry tracing initialized for ${serviceName}`);
'use strict';

const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

/* ---------------- Configuration ---------------- */

const serviceName = process.env.SERVICE_NAME || 'unknown_service';
const jaegerEndpoint =
  process.env.OTEL_EXPORTER_JAEGER_ENDPOINT ||
  'http://jaeger.monitoring.svc.cluster.local:14268/api/traces';

/* ---------------- Resource (CORRECT WAY) ---------------- */

const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
});

/* ---------------- Exporter ---------------- */

const exporter = new JaegerExporter({
  endpoint: jaegerEndpoint,
});

/* ---------------- Provider ---------------- */

const provider = new NodeTracerProvider({
  resource,
  spanProcessors: [
    new BatchSpanProcessor(exporter),
  ],
});

provider.register();

/* ---------------- Instrumentations ---------------- */

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

console.log(`[OpenTelemetry] Tracing started for service="${serviceName}"`);
