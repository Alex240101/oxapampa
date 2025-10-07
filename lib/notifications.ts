export class NotificationManager {
  private static instance: NotificationManager | null = null
  private audio: HTMLAudioElement | null = null
  private initialized = false

  private constructor() {
    // Don't initialize anything here - wait for first use
  }

  private initialize() {
    if (this.initialized || typeof window === "undefined") return

    try {
      this.audio = new Audio("/sounds/notification.mp3")
      this.audio.volume = 0.5
      this.initialized = true
    } catch (error) {
      console.error("[v0] Error inicializando audio:", error)
    }
  }

  static getInstance(): NotificationManager | null {
    if (typeof window === "undefined") return null

    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false
    }

    this.initialize()

    try {
      const permission = Notification.permission

      if (permission === "granted") {
        return true
      }

      if (permission === "denied") {
        return false
      }

      const result = await Notification.requestPermission()
      return result === "granted"
    } catch (error) {
      console.error("[v0] Error solicitando permisos:", error)
      return false
    }
  }

  async showNotification(title: string, options?: NotificationOptions & { playSound?: boolean }) {
    if (typeof window === "undefined") return

    this.initialize()

    const hasPermission = await this.requestPermission()

    if (!hasPermission) {
      return
    }

    try {
      const defaultOptions: NotificationOptions = {
        icon: "/icons/icon-192x192.jpg",
        badge: "/icons/icon-72x72.jpg",
        vibrate: [200, 100, 200],
        ...options,
      }

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, defaultOptions)
      } else {
        new Notification(title, defaultOptions)
      }

      if (options?.playSound !== false) {
        this.playSound()
      }
    } catch (error) {
      console.error("[v0] Error mostrando notificación:", error)
    }
  }

  playSound() {
    if (typeof window === "undefined") return

    this.initialize()

    if (this.audio) {
      this.audio.currentTime = 0
      this.audio.play().catch((error) => {
        console.log("[v0] Error reproduciendo sonido:", error)
      })
    }
  }
}

export const notificationManager = typeof window !== "undefined" ? NotificationManager.getInstance() : null
