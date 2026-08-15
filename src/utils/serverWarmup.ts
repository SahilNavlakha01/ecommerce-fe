/**
 * Singleton server warm-up utility.
 *
 * Polls /api/diag/ping (which runs SELECT 1) until the backend + DB are
 * both ready, then resolves the shared promise.
 *
 * Call warmupServer() as early as possible (root layout, home page, etc.)
 * so the server is hot before the user reaches the login page.
 * On the login page, await isServerReady() before sending OTP.
 */

const PING_URL = 'https://jwellerybackend-production.up.railway.app/api/diag/ping'
const MAX_WAIT_MS = 50000   // give up after 50s — button unblocks regardless
const POLL_INTERVAL_MS = 2500
const MAX_RETRIES = 20

type Listener = (ready: boolean, msg: string) => void

let _ready = false
let _started = false
let _resolve: (() => void) | null = null
const _promise: Promise<void> = new Promise(r => { _resolve = r })
const _listeners = new Set<Listener>()

function notify(msg: string) {
  _listeners.forEach(l => l(_ready, msg))
}

export function onWarmupStatus(fn: Listener): () => void {
  _listeners.add(fn)
  // Immediately fire with current state so late subscribers get current status
  fn(_ready, _ready ? '' : 'Connecting to server…')
  return () => _listeners.delete(fn)
}

/** Call once — safe to call multiple times (no-ops after first call) */
export function warmupServer(): void {
  if (_started) return
  _started = true

  let attempts = 0
  const deadline = Date.now() + MAX_WAIT_MS

  const poll = async () => {
    attempts++
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      
      const res = await fetch(PING_URL, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      })
      
      clearTimeout(timeout)
      
      if (res.ok) {
        _ready = true
        _resolve?.()
        notify('')
        console.log(`[Warmup] Server ready after ${attempts} attempts`)
        return
      }
    } catch (err) {
      // still sleeping or DB not ready — retry
      console.log(`[Warmup] Attempt ${attempts} failed:`, err instanceof Error ? err.message : 'timeout')
    }

    if (Date.now() >= deadline || attempts >= MAX_RETRIES) {
      // Deadline hit — unblock the button anyway, let the real error surface
      _ready = true
      _resolve?.()
      notify('')
      console.log(`[Warmup] Deadline reached after ${attempts} attempts - proceeding anyway`)
      return
    }

    const elapsed = Math.round((attempts * POLL_INTERVAL_MS) / 1000)
    notify(`Server waking up… (${elapsed}s)`)
    setTimeout(poll, POLL_INTERVAL_MS)
  }

  notify('Connecting to server…')
  poll()
}

/** Resolves when server is confirmed ready (or deadline hit) */
export function isServerReady(): Promise<void> {
  return _promise
}

/** Synchronous check — true once ping succeeded or deadline hit */
export function serverReady(): boolean {
  return _ready
}
