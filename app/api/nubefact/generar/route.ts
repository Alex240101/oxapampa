import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const NUBEFACT_URL = "https://api.nubefact.com/api/v1/d7f5dada-0655-4178-851f-9f45d6f6dab1"
const NUBEFACT_TOKEN = "de93ae78a1354cae892aae8708e81fe8fbce45985a0d40029acc97cd9a0ed03c"

export async function POST(request: NextRequest) {
  console.log("[v0] Iniciando generación de comprobante electrónico")

  try {
    const body = await request.json()
    console.log("[v0] Datos recibidos:", JSON.stringify(body, null, 2))

    const { venta_id, tipo_comprobante, serie: serieRecibida, cliente } = body

    // Validaciones básicas
    if (!venta_id || !tipo_comprobante || !cliente) {
      console.error("[v0] Faltan datos requeridos")
      return NextResponse.json(
        { error: "Faltan datos requeridos: venta_id, tipo_comprobante, cliente" },
        { status: 400 },
      )
    }

    if (!cliente.nombre || !cliente.numero_documento || !cliente.tipo_documento) {
      console.error("[v0] Faltan datos del cliente")
      return NextResponse.json(
        { error: "Faltan datos del cliente: nombre, numero_documento, tipo_documento" },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    // Obtener datos completos de la venta
    const { data: venta, error: ventaError } = await supabase
      .from("ventas")
      .select(`
        *,
        items:venta_items(
          *,
          producto:productos(*)
        )
      `)
      .eq("id", venta_id)
      .single()

    if (ventaError || !venta) {
      console.error("[v0] Error obteniendo venta:", ventaError)
      return NextResponse.json({ error: "Error al obtener datos de la venta" }, { status: 500 })
    }

    if (!venta.items || venta.items.length === 0) {
      console.error("[v0] La venta no tiene productos")
      return NextResponse.json({ error: "La venta no tiene productos" }, { status: 400 })
    }

    console.log("[v0] Venta obtenida con", venta.items.length, "items")

    const serie = serieRecibida || (tipo_comprobante === "factura" ? "F001" : "B001")

    const { data: ultimaVenta } = await supabase
      .from("ventas")
      .select("numero_comprobante")
      .eq("serie_comprobante", serie)
      .not("numero_comprobante", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const ultimoNumero = ultimaVenta?.numero_comprobante ? Number.parseInt(ultimaVenta.numero_comprobante) : 0
    const nuevoNumero = ultimoNumero + 1

    console.log("[v0] Número de comprobante:", serie, "-", nuevoNumero)

    const items = venta.items.map((item: any) => {
      const valorUnitario = Number.parseFloat((item.precio_unitario / 1.18).toFixed(2))
      const subtotal = Number.parseFloat((valorUnitario * item.cantidad).toFixed(2))
      const igvItem = Number.parseFloat((subtotal * 0.18).toFixed(2))
      const totalItem = Number.parseFloat((subtotal + igvItem).toFixed(2))

      return {
        unidad_de_medida: getUnidadMedidaCodigo(item.producto.unidad_medida || "UNIDAD"),
        codigo: item.producto.sku || item.producto.id.substring(0, 10),
        descripcion: item.producto.nombre,
        cantidad: Number.parseFloat(item.cantidad.toString()),
        valor_unitario: valorUnitario,
        precio_unitario: Number.parseFloat(item.precio_unitario.toFixed(2)),
        descuento: 0.0,
        subtotal: subtotal,
        tipo_de_igv: 1,
        igv: igvItem,
        total: totalItem,
        anticipo_regularizacion: false,
      }
    })

    const totalGravada = Number.parseFloat(items.reduce((sum: number, item: any) => sum + item.subtotal, 0).toFixed(2))
    const totalIgv = Number.parseFloat(items.reduce((sum: number, item: any) => sum + item.igv, 0).toFixed(2))
    const total = Number.parseFloat((totalGravada + totalIgv).toFixed(2))

    console.log("[v0] Totales calculados - Gravada:", totalGravada, "IGV:", totalIgv, "Total:", total)

    const documento = {
      operacion: "generar_comprobante",
      tipo_de_comprobante: tipo_comprobante === "factura" ? 1 : 2,
      serie: serie,
      numero: nuevoNumero,
      sunat_transaction: 1,
      cliente_tipo_de_documento: getTipoDocumentoCodigo(cliente.tipo_documento),
      cliente_numero_de_documento: cliente.numero_documento,
      cliente_denominacion: cliente.nombre,
      cliente_direccion: cliente.direccion || "",
      cliente_email: cliente.email || "",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      moneda: 1,
      porcentaje_de_igv: 18.0,
      total_gravada: totalGravada,
      total_inafecta: 0.0,
      total_exonerada: 0.0,
      total_igv: totalIgv,
      total_gratuita: 0.0,
      total_otros_cargos: 0.0,
      total: total,
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: !!cliente.email,
      items: items,
    }

    console.log("[v0] Documento a enviar:", JSON.stringify(documento, null, 2))

    const nubefactResponse = await fetch(NUBEFACT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token token="${NUBEFACT_TOKEN}"`,
      },
      body: JSON.stringify(documento),
    })

    const responseText = await nubefactResponse.text()
    console.log("[v0] Status de Nubefact:", nubefactResponse.status)
    console.log("[v0] Respuesta de Nubefact:", responseText)

    if (!nubefactResponse.ok) {
      console.error("[v0] Error HTTP de Nubefact:", nubefactResponse.status)
      return NextResponse.json(
        {
          error: "Error al generar comprobante en Nubefact",
          status: nubefactResponse.status,
          detalles: responseText,
        },
        { status: 500 },
      )
    }

    let nubefactData
    try {
      nubefactData = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] Error parseando JSON:", e)
      return NextResponse.json(
        {
          error: "Error al procesar respuesta de Nubefact",
          detalles: responseText,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Respuesta parseada:", JSON.stringify(nubefactData, null, 2))

    if (nubefactData.errors) {
      console.error("[v0] Errores de validación:", nubefactData.errors)
      return NextResponse.json(
        {
          error: "Error en la validación del comprobante",
          detalles: nubefactData.errors,
        },
        { status: 400 },
      )
    }

    const numeroFormateado = nuevoNumero.toString().padStart(8, "0")

    const { error: updateError } = await supabase
      .from("ventas")
      .update({
        tipo_comprobante: tipo_comprobante,
        numero_comprobante: numeroFormateado,
        serie_comprobante: serie,
        nubefact_enlace: nubefactData.enlace || "",
        nubefact_pdf: nubefactData.enlace_del_pdf || "",
        nubefact_xml: nubefactData.enlace_del_xml || "",
        nubefact_cdr: nubefactData.enlace_del_cdr || "",
        nubefact_response: nubefactData,
      })
      .eq("id", venta_id)

    if (updateError) {
      console.error("[v0] Error actualizando venta:", updateError)
    }

    console.log("[v0] Comprobante generado exitosamente:", serie + "-" + numeroFormateado)

    return NextResponse.json({
      success: true,
      comprobante: {
        tipo: tipo_comprobante,
        serie: serie,
        numero: numeroFormateado,
        enlace: nubefactData.enlace || "",
        pdf: nubefactData.enlace_del_pdf || "",
        xml: nubefactData.enlace_del_xml || "",
        cdr: nubefactData.enlace_del_cdr || "",
        aceptada_por_sunat: nubefactData.aceptada_por_sunat || false,
        sunat_description: nubefactData.sunat_description || "",
        cadena_para_codigo_qr: nubefactData.cadena_para_codigo_qr || "",
        codigo_hash: nubefactData.codigo_hash || "",
      },
    })
  } catch (error: any) {
    console.error("[v0] Error general:", error)
    return NextResponse.json(
      {
        error: error.message || "Error interno del servidor",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

function getTipoDocumentoCodigo(tipo: string): string {
  const tipos: Record<string, string> = {
    DNI: "1",
    RUC: "6",
    CE: "4",
    PASAPORTE: "7",
    "CARNET DE EXTRANJERIA": "4",
    OTROS: "0",
  }
  return tipos[tipo.toUpperCase()] || "1"
}

function getUnidadMedidaCodigo(unidad: string): string {
  const unidades: Record<string, string> = {
    UNIDAD: "NIU",
    UNIDADES: "NIU",
    UND: "NIU",
    METRO: "MTR",
    METROS: "MTR",
    M: "MTR",
    KILOGRAMO: "KGM",
    KILOGRAMOS: "KGM",
    KG: "KGM",
    LITRO: "LTR",
    LITROS: "LTR",
    L: "LTR",
    CAJA: "BX",
    CAJAS: "BX",
    PAQUETE: "PK",
    PAQUETES: "PK",
  }
  return unidades[unidad.toUpperCase()] || "NIU"
}
