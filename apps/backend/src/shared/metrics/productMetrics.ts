/**
 * Lightweight in-process counters for product/ops visibility (reset on deploy).
 */
const counters = {
  userRegistrations: 0,
  logins: 0,
  alertsCreated: 0,
  alertDispatchesEmail: 0,
  alertDispatchesPush: 0,
  jobRuns: {
    alertChecker: 0,
    aqiCollection: 0,
    fireCollection: 0,
  },
  jobErrors: {
    alertChecker: 0,
  },
}

export const productMetrics = {
  incUserRegistration(): void {
    counters.userRegistrations += 1
  },
  incLogin(): void {
    counters.logins += 1
  },
  incAlertCreated(): void {
    counters.alertsCreated += 1
  },
  incAlertDispatch(channel: 'EMAIL' | 'PUSH'): void {
    if (channel === 'EMAIL') counters.alertDispatchesEmail += 1
    else counters.alertDispatchesPush += 1
  },
  incJobRun(job: keyof typeof counters.jobRuns): void {
    counters.jobRuns[job] += 1
  },
  incJobError(job: keyof typeof counters.jobErrors): void {
    counters.jobErrors[job] += 1
  },
  snapshot(): typeof counters {
    return { ...counters, jobRuns: { ...counters.jobRuns }, jobErrors: { ...counters.jobErrors } }
  },
}
