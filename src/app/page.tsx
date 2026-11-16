import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { snippet } from "@/lib/text";
import Dashboard from "@/components/Dashboard";

// Server component: resolves the signed-in user and loads their documents
// (owned + shared) directly via Prisma, then hands off to the client dashboard.
export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const owned = await prisma.document.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, content: true, updatedAt: true },
  });

  const sharedRows = await prisma.share.findMany({
    where: { userId: user.id },
    orderBy: { document: { updatedAt: "desc" } },
    select: {
      role: true,
      document: {
        select: {
          id: true,
          title: true,
          content: true,
          updatedAt: true,
          owner: { select: { name: true, email: true } },
        },
      },
    },
  });

  return (
    <Dashboard
      user={{ name: user.name, email: user.email }}
      owned={owned.map((d) => ({
        id: d.id,
        title: d.title,
        preview: snippet(d.content),
        updatedAt: d.updatedAt.toISOString(),
      }))}
      shared={sharedRows.map((r) => ({
        id: r.document.id,
        title: r.document.title,
        preview: snippet(r.document.content),
        updatedAt: r.document.updatedAt.toISOString(),
        role: r.role,
        ownerName: r.document.owner.name,
      }))}
    />
  );
}
