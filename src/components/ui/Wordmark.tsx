import ShinyText from "@/components/reactbits/ShinyText";
import { APP_NAME } from "@/lib/brand";

// The Folio wordmark. `shine` enables the React Bits ShinyText shimmer (used on
// the auth screen); elsewhere it renders as calm static ink.
export default function Wordmark({
  size = "md",
  shine = false,
}: {
  size?: "sm" | "md" | "lg";
  shine?: boolean;
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-5xl",
  } as const;

  const cls = `font-serif font-bold tracking-tight ${sizes[size]}`;

  if (shine) {
    return (
      <span className={cls}>
        <ShinyText text={APP_NAME} color="#1c1b19" shineColor="#8b7fff" speed={3.2} shineWidth={28} />
      </span>
    );
  }
  return <span className={cls} style={{ color: "var(--ink)" }}>{APP_NAME}</span>;
}
