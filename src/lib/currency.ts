/**
 * Formatea un valor numérico como moneda peruana (Soles - S/.)
 * @param value - Valor a formatear (string, number o null/undefined)
 * @returns String formateado como moneda peruana o "-" si el valor es inválido
 */
export const formatCurrency = (value?: string | number | null): string => {
  if (value === null || value === undefined) {
    return "-";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(numericValue);
};
