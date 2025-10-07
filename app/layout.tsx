import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationProvider } from "@/components/notification-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Ilumitek - Sistema de Gestión Profesional",
    template: "%s | Ilumitek",
  },
  description:
    "Sistema de gestión profesional para Ferretería Ilumitek. Administra inventario, ventas, compras, clientes y proveedores de manera eficiente.",
  keywords: [
    "ferretería",
    "sistema de gestión",
    "inventario",
    "ventas",
    "compras",
    "Ilumitek",
    "gestión empresarial",
    "facturación electrónica",
  ],
  authors: [{ name: "Ilumitek" }],
  creator: "Ilumitek",
  publisher: "Ilumitek",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ilumitek.vercel.app"),
  openGraph: {
    title: "Ilumitek - Sistema de Gestión Profesional",
    description:
      "Sistema de gestión profesional para Ferretería Ilumitek. Administra inventario, ventas, compras, clientes y proveedores.",
    url: "https://ilumitek.com",
    siteName: "Ilumitek",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ilumitek - Sistema de Gestión",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ilumitek - Sistema de Gestión Profesional",
    description: "Sistema de gestión profesional para Ferretería Ilumitek",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.jpg", type: "image/jpeg", sizes: "192x192" },
    ],
    apple: [{ url: "/icons/icon-192x192.jpg", sizes: "192x192", type: "image/jpeg" }],
  },
  manifest: "/manifest.json",
  applicationName: "Ilumitek",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ilumitek",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.jpg" />
        <link rel="icon" type="image/jpeg" sizes="192x192" href="/icons/icon-192x192.jpg" />
        <link rel="icon" type="image/jpeg" sizes="512x512" href="/icons/icon-512x512.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ilumitek" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Ilumitek" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider>
          <NotificationProvider>
            <Suspense fallback={null}>
              {children}
              <Toaster />
            </Suspense>
          </NotificationProvider>
          <Analytics />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('[v0] Service Worker registrado exitosamente:', registration.scope);
                      
                      // Verificar actualizaciones cada hora
                      setInterval(function() {
                        registration.update();
                      }, 3600000);
                      
                      // Manejar actualizaciones del SW
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[v0] Nueva versión disponible');
                            // Aquí podrías mostrar una notificación al usuario
                          }
                        });
                      });
                    })
                    .catch(function(error) {
                      console.error('[v0] Error al registrar Service Worker:', error);
                    });
                });
              } else {
                console.log('[v0] Service Workers no soportados en este navegador');
              }
              
              // Detectar cuando la app se instala
              window.addEventListener('beforeinstallprompt', function(e) {
                console.log('[v0] PWA instalable detectada');
                e.preventDefault();
                window.deferredPrompt = e;
              });
              
              window.addEventListener('appinstalled', function() {
                console.log('[v0] PWA instalada exitosamente');
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
