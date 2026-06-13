import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export const CLASS_COLORS = {
  Ripe:     '#22c55e',
  Unripe:   '#eab308',
  Overripe: '#f97316',
  Rotten:   '#ef4444',
  Unknown:  '#9ca3af',
  Error:    '#6366f1',
};

export const CLASS_ICONS = {
  Ripe: CheckCircle2,
  Unripe: AlertTriangle,
  Overripe: AlertTriangle,
  Rotten: XCircle,
  Unknown: HelpCircle,
  Error: XCircle,
};

export function normalizeLabel(label) {
  if (!label) return 'Unknown';
  // Capitalize first letter, lower rest. e.g., "ROTTEN" -> "Rotten", "unripe" -> "Unripe"
  const str = label.toString();
  const normalized = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return CLASS_COLORS[normalized] ? normalized : 'Unknown';
}
