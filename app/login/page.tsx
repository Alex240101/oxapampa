"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let supabase
      try {
        supabase = createClient()
      } catch (clientError) {
        console.error("[v0] Error creando cliente Supabase:", clientError)
        setError("Error de configuración. Por favor, contacte al administrador del sistema.")
        setIsLoading(false)
        return
      }

      // Consultar la tabla de administradores
      const { data, error: dbError } = await supabase
        .from("administradores")
        .select("*")
        .eq("usuario", usuario)
        .eq("password", password)
        .single()

      if (dbError || !data) {
        console.error("[v0] Error de autenticación:", dbError)
        setError("Usuario o contraseña incorrectos")
        setIsLoading(false)
        return
      }

      // Crear sesión en cookie
      document.cookie = `admin_session=${data.id}; path=/; max-age=86400; SameSite=Lax`

      // Redirigir a bienvenida
      router.push("/bienvenida")
    } catch (err) {
      console.error("[v0] Error en login:", err)
      setError("Error al iniciar sesión. Por favor, intente nuevamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/50">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Ilumitek</CardTitle>
          <CardDescription className="text-slate-400">Ingrese sus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-slate-200">
                Usuario
              </Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingrese su usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-900 bg-red-950/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-amber-500 text-white hover:bg-amber-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
