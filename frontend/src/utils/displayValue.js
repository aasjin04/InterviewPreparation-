export function formatAIValue(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatAIValue).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    if (value.name && value.details) {
      return `${formatAIValue(value.name)}: ${formatAIValue(value.details)}`;
    }

    if (value.skill && value.reason) {
      return `${formatAIValue(value.skill)}: ${formatAIValue(value.reason)}`;
    }

    if (value.title && value.description) {
      return `${formatAIValue(value.title)}: ${formatAIValue(value.description)}`;
    }

    return Object.entries(value)
      .map(([key, item]) => `${key}: ${formatAIValue(item)}`)
      .join(", ");
  }

  return String(value);
}
