"use client"

import type React from "react"

import { useEffect } from "react"
import { useNotifications } from "@/hooks/use-notifications"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { hasPermission } = useNotifications()

  useEffect(() => {
    console.log("[v0] Sistema de notificaciones:", hasPermission ? "activo" : "inactivo")
  }, [hasPermission])

  return <>{children}</>
}
