"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, History, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { NuevaRetencionTab } from "@/components/retenciones/nueva-retencion-tab"
import { HistorialRetencionesTab } from "@/components/retenciones/historial-retenciones-tab"

export default function RetencionesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("nueva")

  const handleLogout = async () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Ilumitek</h1>
                <p className="text-xs text-muted-foreground">Retenciones</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => router.push("/bienvenida")}>
                <Home className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Gestión de Retenciones</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Emite comprobantes de retención electrónicos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nueva" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Retención</span>
              <span className="sm:hidden">Nueva</span>
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nueva">
            <NuevaRetencionTab />
          </TabsContent>

          <TabsContent value="historial">
            <HistorialRetencionesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
