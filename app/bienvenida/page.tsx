"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, LogOut, ArrowRight, Truck, FileText, Receipt, CreditCard } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { RegisterServiceWorker } from "@/app/register-sw"

export default function BienvenidaPage() {
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
      <RegisterServiceWorker />

      {/* Header - Mobile responsive */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
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
              <p className="text-[10px] sm:text-xs text-muted-foreground">Sistema de Gestión</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout} size="sm" className="text-xs sm:text-sm">
              <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile responsive */}
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="mb-2 sm:mb-4 text-2xl sm:text-4xl font-bold text-foreground">Bienvenido al Sistema</h2>
          <p className="text-sm sm:text-lg text-muted-foreground">Seleccione el módulo con el que desea trabajar</p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-6xl lg:mx-auto">
          {/* Módulo de Inventario */}
          <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-chart-1 shadow-lg shadow-chart-1/50 transition-transform group-hover:scale-110">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-card-foreground">Inventario</CardTitle>
              <CardDescription className="text-sm">Gestione productos, categorías y stock</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/inventario")} className="w-full">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Módulo de Ventas */}
          <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-chart-2 shadow-lg shadow-chart-2/50 transition-transform group-hover:scale-110">
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-card-foreground">Ventas</CardTitle>
              <CardDescription className="text-sm">Facturas y boletas electrónicas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/ventas")} className="w-full">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Módulo de Guías de Remisión */}
          <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-chart-3 shadow-lg shadow-chart-3/50 transition-transform group-hover:scale-110">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-card-foreground">Guías de Remisión</CardTitle>
              <CardDescription className="text-sm">Traslado de mercancías</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/guias-remision")} className="w-full">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Módulo de Notas de Crédito/Débito */}
          <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-chart-4 shadow-lg shadow-chart-4/50 transition-transform group-hover:scale-110">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-card-foreground">Notas</CardTitle>
              <CardDescription className="text-sm">Notas de crédito y débito</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/notas-credito")} className="w-full">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Módulo de Retenciones */}
          <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-chart-5 shadow-lg shadow-chart-5/50 transition-transform group-hover:scale-110">
                <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-card-foreground">Retenciones</CardTitle>
              <CardDescription className="text-sm">Comprobantes de retención</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/retenciones")} className="w-full">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Módulo de Percepciones */}
          <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/50 transition-transform group-hover:scale-110">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-card-foreground">Percepciones</CardTitle>
              <CardDescription className="text-sm">Comprobantes de percepción</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/percepciones")} className="w-full">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
