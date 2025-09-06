export const TZ = import.meta.env.VITE_TIMEZONE || 'Europe/Amsterdam';
export function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit' })
    .format(new Date()).replaceAll('/', '-');
}
export function cls(...a){return a.filter(Boolean).join(' ')}
export function brierScore(p, y){const d=p-y; return d*d}
