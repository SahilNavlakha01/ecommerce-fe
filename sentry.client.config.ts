import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e7d21fd1c9d303dcd1b8f0d39ea1a16a@o4511582091608064.ingest.us.sentry.io/4511582092656640",

  // Adjust this value in production, or use tracesSampleRate: 1.0 in development
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
