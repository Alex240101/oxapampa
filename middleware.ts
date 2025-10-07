import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Verificar si hay sesión de administrador
  const session = request.cookies.get("admin_session")

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/", "/login"]
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)

  // Si no hay sesión y la ruta no es pública, redirigir al login
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si hay sesión y está en login, redirigir al dashboard
  if (session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/bienvenida", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
