/**
 * Reusable slug generator. Normalises any text into a URL-safe slug:
 * - lowercase, no diacritics, no Unicode
 * - spaces → "-", multiple spaces/dashes collapsed
 * - strips slashes, underscores, dots, and all special characters
 *
 * Usage: generateSlug("Rixos Premium Alamein Egipt 7 Nopți")
 *        → "rixos-premium-alamein-egipt-7-nopti"
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // keep only a-z, 0-9, space, dash
    .replace(/[\s_-]+/g, '-')        // spaces / underscores → single dash
    .replace(/-+/g, '-')             // collapse multiple dashes
    .replace(/^-+|-+$/g, '');        // trim leading/trailing dashes
}

/**
 * Validate that a slug contains only lowercase letters, digits and single dashes.
 * Returns an error message if invalid, or empty string if valid.
 */
export function validateSlug(slug: string): string {
  if (!slug.trim()) return 'Slug-ul este obligatoriu.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Slug-ul poate conține doar litere mici, cifre și cratime.';
  }
  return '';
}

/**
 * Given a base slug and a set of already-used slugs, return a unique slug
 * by appending -2, -3, ... as needed. `excludeSlug` is removed from the
 * taken set (useful when editing an existing offer whose slug shouldn't
 * conflict with itself).
 */
export function ensureUniqueSlug(
  baseSlug: string,
  takenSlugs: string[],
  excludeSlug?: string,
): string {
  const taken = new Set(takenSlugs.filter((s) => s !== excludeSlug));
  if (!taken.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (taken.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

// Backwards-compatible alias
export const slugify = generateSlug;
