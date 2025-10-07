"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, LogOut, Home, History } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import NuevaVentaTab from "@/components/ventas/nueva-venta-tab"
import HistorialVentasTab from "@/components/ventas/historial-ventas-tab"

export default function VentasPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hasSession = document.cookie.includes("admin_session")
    if (!hasSession) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    document.cookie = "admin_session=; path=/; max-age=0"
    router.push("/login")
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-foreground">Ilumitek</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Módulo de Ventas</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => router.push("/bienvenida")} className="hidden sm:flex">
              <Home className="mr-2 h-4 w-4" />
              Inicio
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/bienvenida")} className="sm:hidden">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="sm:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h2 className="mb-1 sm:mb-2 text-xl sm:text-3xl font-bold text-foreground">Gestión de Ventas</h2>
          <p className="text-xs sm:text-base text-muted-foreground">
            Registre ventas y consulte el historial de transacciones
          </p>
        </div>

        <Tabs defaultValue="nueva" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="nueva" className="text-xs sm:text-sm py-2">
              <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Nueva Venta</span>
              <span className="xs:hidden">Nueva</span>
            </TabsTrigger>
            <TabsTrigger value="historial" className="text-xs sm:text-sm py-2">
              <History className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nueva" className="mt-4 sm:mt-6">
            <NuevaVentaTab />
          </TabsContent>

          <TabsContent value="historial" className="mt-4 sm:mt-6">
            <HistorialVentasTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
