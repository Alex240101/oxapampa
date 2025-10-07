"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, LogOut, Home, Tag, AlertTriangle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import ProductosTab from "@/components/inventario/productos-tab"
import CategoriasTab from "@/components/inventario/categorias-tab"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

export default function InventarioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [totalProductos, setTotalProductos] = useState(0)

  useEffect(() => {
    const hasSession = document.cookie.includes("admin_session")
    if (!hasSession) {
      router.push("/login")
    } else {
      setIsLoading(false)
      loadTotalProductos()
    }
  }, [router])

  const loadTotalProductos = async () => {
    try {
      const supabase = createClient()
      const { count, error } = await supabase.from("productos").select("*", { count: "exact", head: true })

      if (error) {
        console.error("[v0] Error contando productos:", error)
        return
      }

      setTotalProductos(count || 0)
    } catch (error) {
      console.error("[v0] Error cargando total de productos:", error)
    }
  }

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
              <p className="text-[10px] sm:text-xs text-muted-foreground">Módulo de Inventario</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/inventario/stock-bajo")}
              className="hidden md:flex"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Stock Bajo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/inventario/stock-bajo")}
              className="md:hidden"
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
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
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="text-xl sm:text-3xl font-bold text-foreground">Gestión de Inventario</h2>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Productos</p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{totalProductos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-xs sm:text-base text-muted-foreground">
            Administre productos y categorías de la ferretería
          </p>
        </div>

        <Tabs defaultValue="productos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="productos" className="text-xs sm:text-sm py-2">
              <Package className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="categorias" className="text-xs sm:text-sm py-2">
              <Tag className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Categorías
            </TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="mt-4 sm:mt-6">
            <ProductosTab onProductosChange={setTotalProductos} />
          </TabsContent>

          <TabsContent value="categorias" className="mt-4 sm:mt-6">
            <CategoriasTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
