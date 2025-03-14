import { createLogger, format, transports } from 'winston';
import { FastifyRequest } from 'fastify';

// Definindo níveis de log personalizados (opcional)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definindo cores para os níveis de log (opcional)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Adicionando cores ao Winston
format.colorize().addColors(colors);

// Definindo o formato do log
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Formato para console (desenvolvimento)
const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

// Determinar o nível de log com base no ambiente
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Criar o logger
const logger = createLogger({
  level,
  levels,
  format: logFormat,
  defaultMeta: { service: 'api' },
  transports: [
    // Log para console em todos os ambientes
    new transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
    // Log para arquivo em produção
    ...(process.env.NODE_ENV === 'production'
      ? [
          new transports.File({ filename: 'logs/error.log', level: 'error' }),
          new transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
  exitOnError: false,
});

// Função auxiliar para extrair informações da requisição
export const logRequest = (req: FastifyRequest): Record<string, any> => {
  return {
    requestId: req.id,
    method: req.method,
    url: req.url,
    path: req.url,
    parameters: req.params,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
    },
    ip: req.ip,
  };
};

export default logger;
