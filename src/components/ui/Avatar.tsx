// Deterministic initials avatar — no image uploads needed. Colour is derived
// from the name so each person is visually consistent.
const COLORS = [
  "#4f46e5", "#0d9488", "#b45309", "#be123c", "#7c3aed", "#0369a1", "#15803d",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase();
}

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export default function Avatar({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-medium text-white select-none"
      style={{
        width: size,
        height: size,
        background: colorFor(name),
        fontSize: size * 0.4,
      }}
      title={name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
