"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false)
  const [notificationManager, setNotificationManager] = useState<any>(null)

  useEffect(() => {
    import("@/lib/notifications").then((mod) => {
      setNotificationManager(mod.notificationManager)
    })
  }, [])

  useEffect(() => {
    if (!notificationManager) return

    const checkPermission = async () => {
      const granted = await notificationManager.requestPermission()
      setHasPermission(granted)
    }

    checkPermission()
  }, [notificationManager])

  useEffect(() => {
    if (!hasPermission || !notificationManager) return

    const checkProductosStockBajo = async () => {
      try {
        const supabase = createClient()

        const { data: stockBajo } = await supabase
          .from("productos")
          .select("id, nombre, stock, stock_minimo")
          .not("stock_minimo", "is", null)
          .order("stock", { ascending: true })

        if (!stockBajo) return

        const productosAlerta = stockBajo.filter((p) => p.stock_minimo !== null && p.stock <= p.stock_minimo)

        if (productosAlerta.length > 0) {
          notificationManager?.showNotification("Alerta de Stock Bajo", {
            body: `${productosAlerta.length} producto(s) con stock bajo o agotado. Revisa el inventario urgentemente.`,
            tag: "stock-bajo",
            data: { url: "/inventario/stock-bajo" },
            playSound: true,
          })
        }
      } catch (error) {
        console.error("[v0] Error verificando stock bajo:", error)
      }
    }

    checkProductosStockBajo()

    const interval = setInterval(checkProductosStockBajo, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [hasPermission, notificationManager])

  return { hasPermission }
}
