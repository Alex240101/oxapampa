// Cliente para integración con Nubefact API
// Documentación: https://www.nubefact.com/integracion

interface NubefactConfig {
  ruc: string
  usuario: string
  token: string
  url: string
}

interface NubefactItem {
  unidad_de_medida: string
  codigo: string
  descripcion: string
  cantidad: number
  valor_unitario: number
  precio_unitario: number
  descuento: string
  subtotal: number
  tipo_de_igv: number
  igv: number
  total: number
  anticipo_regularizacion: boolean
  anticipo_documento_serie: string
  anticipo_documento_numero: string
}

interface NubefactCliente {
  tipo_de_documento: string // 1=DNI, 6=RUC, 4=CE, 7=Pasaporte, 0=Otros
  numero: string
  denominacion: string
  direccion: string
  email?: string
  telefono?: string
}

interface NubefactDocumento {
  operacion: string // "generar_comprobante"
  tipo_de_comprobante: number // 1=Factura, 2=Boleta, 3=Nota Crédito, 4=Nota Débito
  serie: string
  numero: number
  sunat_transaction: number // 1=Venta interna, 2=Exportación, etc.
  cliente: NubefactCliente
  fecha_de_emision: string // DD-MM-YYYY
  moneda: number // 1=PEN (Soles), 2=USD
  tipo_de_cambio: string
  porcentaje_de_igv: number // 18.00
  descuento_global: string
  total_descuento: number
  total_anticipo: number
  total_gravada: number
  total_inafecta: number
  total_exonerada: number
  total_igv: number
  total_gratuita: number
  total_otros_cargos: number
  total: number
  percepcion_tipo: string
  percepcion_base_imponible: number
  total_percepcion: number
  total_incluido_percepcion: number
  detraccion: boolean
  observaciones: string
  documento_que_se_modifica_tipo: string
  documento_que_se_modifica_serie: string
  documento_que_se_modifica_numero: string
  tipo_de_nota_de_credito: string
  tipo_de_nota_de_debito: string
  enviar_automaticamente_a_la_sunat: boolean
  enviar_automaticamente_al_cliente: boolean
  codigo_unico: string
  condiciones_de_pago: string
  medio_de_pago: string
  placa_vehiculo: string
  orden_compra_servicio: string
  tabla_personalizada_codigo: string
  formato_de_pdf: string
  items: NubefactItem[]
}

interface NubefactResponse {
  errors: string
  sunat_description: string
  sunat_note: string
  sunat_responsecode: string
  sunat_soap_error: string
  pdf_zip_base64: string
  xml_zip_base64: string
  cdr_zip_base64: string
  enlace: string
  enlace_del_pdf: string
  enlace_del_xml: string
  enlace_del_cdr: string
  aceptada_por_sunat: boolean
  numero_comprobante: string
  serie_comprobante: string
}

export class NubefactClient {
  private config: NubefactConfig

  constructor() {
    this.config = {
      ruc: process.env.NUBEFACT_RUC || "",
      usuario: process.env.NUBEFACT_USUARIO || "",
      token: process.env.NUBEFACT_TOKEN || "",
      url: process.env.NUBEFACT_URL || "https://api.nubefact.com/api/v1",
    }
  }

  async generarComprobante(documento: NubefactDocumento): Promise<NubefactResponse> {
    try {
      const response = await fetch(`${this.config.url}/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.token}`,
        },
        body: JSON.stringify(documento),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error Nubefact: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("[v0] Error generando comprobante Nubefact:", error)
      throw error
    }
  }

  // Convertir tipo de documento a código Nubefact
  static getTipoDocumentoCodigo(tipo: string): string {
    const tipos: Record<string, string> = {
      DNI: "1",
      RUC: "6",
      CE: "4",
      PASAPORTE: "7",
      OTROS: "0",
    }
    return tipos[tipo] || "0"
  }

  // Convertir unidad de medida a código SUNAT
  static getUnidadMedidaCodigo(unidad: string): string {
    const unidades: Record<string, string> = {
      UNIDAD: "NIU",
      UNIDADES: "NIU",
      METRO: "MTR",
      METROS: "MTR",
      KILOGRAMO: "KGM",
      KILOGRAMOS: "KGM",
      LITRO: "LTR",
      LITROS: "LTR",
      CAJA: "BX",
      CAJAS: "BX",
      PAQUETE: "PK",
      PAQUETES: "PK",
      ROLLO: "RO",
      ROLLOS: "RO",
      BOLSA: "BG",
      BOLSAS: "BG",
    }
    return unidades[unidad.toUpperCase()] || "NIU"
  }
}
