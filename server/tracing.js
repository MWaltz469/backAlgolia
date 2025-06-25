// Basic Honeycomb/OpenTelemetry setup used by the server
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Configure the OTLP exporter to send traces to Honeycomb
const exporter = new OTLPTraceExporter({
  url: 'https://api.honeycomb.io/v1/traces',
  headers: {
    'x-honeycomb-team': process.env.HONEYCOMB_API_KEY,
    'x-honeycomb-dataset': process.env.HONEYCOMB_DATASET,
  },
});

// The SDK wires up instrumentations and the exporter
const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'backAlgolia',
  }),
});

// Begin collecting and exporting traces
sdk.start();

