type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getEffectiveLevel(): LogLevel {
  const envLevel = (import.meta as any).env?.VITE_LOG_LEVEL as string | undefined;
  if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
    return envLevel as LogLevel;
  }
  const env = (import.meta as any).env;
  const isDev = env?.DEV === true || (typeof import.meta.hot !== 'undefined');
  return isDev ? 'debug' : 'warn';
}

const effectiveLevel = getEffectiveLevel();

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[effectiveLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): unknown[] {
  const prefix = `[CineNoir][${level}]`;
  if (meta && Object.keys(meta).length > 0) {
    return [prefix, message, meta];
  }
  return [prefix, message];
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const args = formatMessage(level, message, meta);
  switch (level) {
    case 'debug':
      console.debug(...args);
      break;
    case 'info':
      console.info(...args);
      break;
    case 'warn':
      console.warn(...args);
      break;
    case 'error':
      console.error(...args);
      break;
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
};
