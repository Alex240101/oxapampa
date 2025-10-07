"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Search, Download, FileText, Calendar } from "lucide-react"

interface HistorialNotasTabProps {
  tipo: "credito" | "debito"
}

export function HistorialNotasTab({ tipo }: HistorialNotasTabProps) {
  const [notas, setNotas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    cargarNotas()
  }, [tipo])

  const cargarNotas = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("notas_credito_debito")
        .select("*")
        .eq("tipo", tipo)
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotas(data || [])
    } catch (error) {
      console.error("[v0] Error cargando notas:", error)
    } finally {
      setLoading(false)
    }
  }

  const notasFiltradas = notas.filter(
    (nota) =>
      nota.serie_comprobante?.toLowerCase().includes(busqueda.toLowerCase()) ||
      nota.numero_comprobante?.toLowerCase().includes(busqueda.toLowerCase()) ||
      nota.cliente_nombre?.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Notas de {tipo === "credito" ? "Crédito" : "Débito"}</CardTitle>
          <CardDescription>Filtre por serie, número o cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de notas */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Cargando...</CardContent>
          </Card>
        ) : notasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No se encontraron notas de {tipo}
            </CardContent>
          </Card>
        ) : (
          notasFiltradas.map((nota) => (
            <Card key={nota.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">
                        {nota.serie_comprobante}-{nota.numero_comprobante}
                      </span>
                      <Badge variant="secondary">{tipo === "credito" ? "Crédito" : "Débito"}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(nota.created_at).toLocaleDateString("es-PE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div>Cliente: {nota.cliente_nombre}</div>
                      <div>Motivo: {nota.motivo_descripcion}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold">S/. {Number(nota.total).toFixed(2)}</div>
                    </div>
                    {nota.nubefact_pdf && (
                      <Button size="sm" onClick={() => window.open(nota.nubefact_pdf, "_blank")}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
