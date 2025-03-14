import { app, setupApp } from './app';
import logger from './utils/logger';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    // Setup all plugins and routes
    await setupApp();

    // Start the server
    await app.listen({ port: PORT, host: HOST });

    logger.info(`Servidor iniciado com sucesso`, {
      url: `http://${HOST}:${PORT}`,
      documentation: `http://${HOST}:${PORT}/documentation`,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    logger.error('Erro ao iniciar o servidor', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    process.exit(1);
  }
};

start();
