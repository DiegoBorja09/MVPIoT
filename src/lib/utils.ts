export function parseValue(value: string): {
  value_number: number | null;
  value_boolean: boolean | null;
  value_string: string | null;
} {
  // Intentar convertir a número
  const num = parseFloat(value);
  if (!isNaN(num) && isFinite(num) && value.trim() === num.toString()) {
    return { value_number: num, value_boolean: null, value_string: null };
  }

  // Intentar convertir a booleano
  const lower = value.toLowerCase().trim();
  if (lower === 'true' || lower === '1' || lower === 'on') {
    return { value_number: null, value_boolean: true, value_string: null };
  }
  if (lower === 'false' || lower === '0' || lower === 'off') {
    return { value_number: null, value_boolean: false, value_string: null };
  }

  // Mantener como string
  return { value_number: null, value_boolean: null, value_string: value };
}

export function parseDate(dateString?: string): Date {
  if (!dateString) return new Date();
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
}
