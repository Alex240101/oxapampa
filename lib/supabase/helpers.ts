import { createClient } from "./client"

/**
 * Obtiene o crea una categoría por defecto para productos sin categoría
 * @returns El ID de la categoría "Sin categoría"
 */
export async function getOrCreateDefaultCategory(): Promise<string | null> {
  try {
    const supabase = createClient()
    const defaultCategoryName = "Sin categoría"

    // Buscar si ya existe la categoría
    const { data: existingCategory, error: searchError } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre", defaultCategoryName)
      .maybeSingle()

    if (searchError) {
      console.error("[v0] Error buscando categoría por defecto:", searchError)
      return null
    }

    // Si existe, retornar su ID
    if (existingCategory) {
      return existingCategory.id
    }

    // Si no existe, crearla
    const { data: newCategory, error: createError } = await supabase
      .from("categorias")
      .insert({
        nombre: defaultCategoryName,
        descripcion: "Categoría por defecto para productos sin clasificar",
        activa: true,
      })
      .select("id")
      .single()

    if (createError) {
      console.error("[v0] Error creando categoría por defecto:", createError)
      return null
    }

    return newCategory.id
  } catch (error) {
    console.error("[v0] Error en getOrCreateDefaultCategory:", error)
    return null
  }
}
