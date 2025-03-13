import { app, setupApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    // Setup all plugins and routes
    await setupApp();

    // Start the server
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`API documentation available at http://${HOST}:${PORT}/documentation`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
