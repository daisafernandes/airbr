/* eslint-disable no-console -- single JSON sink for structured logs */

type LogLevel = 'info' | 'warn' | 'error'

function line(level: LogLevel, msg: string, fields?: Record<string, unknown>): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  }
  const out = JSON.stringify(payload)
  if (level === 'error') console.error(out)
  else if (level === 'warn') console.warn(out)
  else console.info(out)
}

export const logger = {
  info(msg: string, fields?: Record<string, unknown>): void {
    line('info', msg, fields)
  },
  warn(msg: string, fields?: Record<string, unknown>): void {
    line('warn', msg, fields)
  },
  error(msg: string, fields?: Record<string, unknown>): void {
    line('error', msg, fields)
  },
}
