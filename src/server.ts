import { app } from '@/app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
