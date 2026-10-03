/**
 * Utilitaires Officiels de Formatage des Dates DDL-PN
 * Format réglementaire en République du Congo : Jour / Mois / Année (JJ/MM/AAAA)
 */

/**
 * Formate une date en JJ/MM/AAAA (ex: "02/10/2026")
 * Supporte les chaînes "AAAA-MM-JJ", ISO strings ou objets Date.
 */
export function formatDateFR(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  try {
    // Si c'est déjà au format JJ/MM/AAAA
    if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput.trim())) {
      return dateInput.trim();
    }

    // Si c'est une chaîne YYYY-MM-DD (format standard stockage/input)
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      const parts = dateInput.slice(0, 10).split('-');
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }

    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Formate une date en format littéraire complet en français (ex: "2 octobre 2026" ou "vendredi 2 octobre 2026")
 */
export function formatDateLongFR(dateInput?: string | Date | null, withWeekday: boolean = false): string {
  if (!dateInput) return '';

  try {
    let d: Date;
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      const parts = dateInput.slice(0, 10).split('-');
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    }

    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString('fr-FR', {
      weekday: withWeekday ? 'long' : undefined,
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formate date et heure en format congolais (ex: "02/10/2026 à 14h30")
 */
export function formatDateTimeFR(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    const dateStr = formatDateFR(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} à ${hours}h${minutes}`;
  } catch {
    return String(dateInput);
  }
}
