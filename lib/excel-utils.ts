import * as XLSX from "xlsx"

export interface ExcelProductRow {
  Tienda?: string | number
  Codigo?: string | number
  Descripcion?: string
  Stock?: string | number
  "Limite Stock"?: string | number
}

export interface ProductoImport {
  tienda: string
  modelo: string
  nombre: string
  stock: number
  stock_minimo: number
}

export function parseExcelFile(file: File): Promise<ExcelProductRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<ExcelProductRow>(worksheet)

        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Error al leer el archivo"))
    reader.readAsBinaryString(file)
  })
}

export function validateExcelData(data: ExcelProductRow[]): { valid: ProductoImport[]; errors: string[] } {
  const valid: ProductoImport[] = []
  const errors: string[] = []
  const usedModelos = new Set<string>()

  data.forEach((row, index) => {
    const rowNumber = index + 2

    const descripcion = String(row.Descripcion || "").trim()
    const tienda = String(row.Tienda || "").trim()
    let modelo = String(row.Codigo || "").trim()

    // Validar que al menos tenga descripción
    if (!descripcion) {
      errors.push(`Fila ${rowNumber}: El campo "Descripcion" es obligatorio`)
      return
    }

    // Si no tiene modelo, generar uno automáticamente basado en la descripción
    if (!modelo) {
      // Generar modelo: primeras 3 letras + timestamp + índice
      const prefix = descripcion
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "X")
      const timestamp = Date.now().toString().slice(-6)
      modelo = `${prefix}-${timestamp}-${index + 1}`
    }

    // Verificar que el modelo no esté duplicado en el archivo
    if (usedModelos.has(modelo)) {
      // Si está duplicado, agregar sufijo
      let suffix = 1
      let newModelo = `${modelo}-${suffix}`
      while (usedModelos.has(newModelo)) {
        suffix++
        newModelo = `${modelo}-${suffix}`
      }
      modelo = newModelo
    }
    usedModelos.add(modelo)

    const parseNumber = (value: any): number => {
      if (value === null || value === undefined || value === "") return 0
      const str = String(value).trim()
      if (str === "") return 0
      const cleaned = str.replace(/[,\s]/g, "")
      const num = Number(cleaned)
      return isNaN(num) ? 0 : Math.max(0, num)
    }

    const stock = parseNumber(row.Stock)
    const limiteStock = parseNumber(row["Limite Stock"])

    valid.push({
      tienda: tienda || "Principal",
      modelo,
      nombre: descripcion,
      stock,
      stock_minimo: limiteStock || 5, // Default mínimo de 5 si no se especifica
    })
  })

  return { valid, errors }
}

export function exportToExcel(productos: any[], filename = "productos.xlsx") {
  const excelData = productos.map((p) => ({
    Tienda: p.tienda || "Principal",
    Codigo: p.modelo || p.sku || "",
    Descripcion: p.nombre || "",
    Stock: Number(p.stock) || 0,
    "Limite Stock": Number(p.stock_minimo) || 0,
  }))

  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")

  const columnWidths = [
    { wch: 15 }, // Tienda
    { wch: 20 }, // Codigo
    { wch: 40 }, // Descripcion
    { wch: 12 }, // Stock
    { wch: 15 }, // Limite Stock
  ]
  worksheet["!cols"] = columnWidths

  XLSX.writeFile(workbook, filename)
}
