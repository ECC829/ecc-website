/** Joins truthy class names into a single className string. */
export function cx(...values) {
  return values.filter(Boolean).join(" ");
}
