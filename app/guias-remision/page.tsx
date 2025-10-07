"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, LogOut, Home, History } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import NuevaGuiaTab from "@/components/guias/nueva-guia-tab"
import HistorialGuiasTab from "@/components/guias/historial-guias-tab"

export default function GuiasRemisionPage() {
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
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Ilumitek</h1>
              <p className="text-xs text-muted-foreground">Guías de Remisión</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => router.push("/bienvenida")}>
              <Home className="mr-2 h-4 w-4" />
              Inicio
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-foreground">Guías de Remisión</h2>
          <p className="text-muted-foreground">Genere guías de remisión electrónicas para el traslado de mercancías</p>
        </div>

        <Tabs defaultValue="nueva" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="nueva">
              <Truck className="mr-2 h-4 w-4" />
              Nueva Guía
            </TabsTrigger>
            <TabsTrigger value="historial">
              <History className="mr-2 h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nueva" className="mt-6">
            <NuevaGuiaTab />
          </TabsContent>

          <TabsContent value="historial" className="mt-6">
            <HistorialGuiasTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
