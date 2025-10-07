"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Search, Download, Percent, Calendar } from "lucide-react"

export function HistorialPercepcionesTab() {
  const [percepciones, setPercepciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    cargarPercepciones()
  }, [])

  const cargarPercepciones = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.from("percepciones").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPercepciones(data || [])
    } catch (error) {
      console.error("[v0] Error cargando percepciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const percepcionesFiltradas = percepciones.filter(
    (per) =>
      per.serie_comprobante?.toLowerCase().includes(busqueda.toLowerCase()) ||
      per.numero_comprobante?.toLowerCase().includes(busqueda.toLowerCase()) ||
      per.cliente_nombre?.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buscar Percepciones</CardTitle>
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

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Cargando...</CardContent>
          </Card>
        ) : percepcionesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No se encontraron percepciones</CardContent>
          </Card>
        ) : (
          percepcionesFiltradas.map((percepcion) => (
            <Card key={percepcion.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">
                        {percepcion.serie_comprobante}-{percepcion.numero_comprobante}
                      </span>
                      <Badge variant="secondary">Percepción</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(percepcion.created_at).toLocaleDateString("es-PE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div>Cliente: {percepcion.cliente_nombre}</div>
                      <div>
                        {percepcion.cliente_tipo_documento}: {percepcion.cliente_numero_documento}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold">S/. {Number(percepcion.total_percibido).toFixed(2)}</div>
                    </div>
                    {percepcion.nubefact_pdf && (
                      <Button size="sm" onClick={() => window.open(percepcion.nubefact_pdf, "_blank")}>
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
