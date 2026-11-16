import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAccessibleDocument } from "@/lib/access";
import Editor from "@/components/Editor";

// Server component: enforces access control before rendering the editor.
// A user who neither owns nor is shared the document gets a 404 (not a 403),
// so we don't reveal that the document exists.
export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getAccessibleDocument(user.id, params.id);
  if (!result) notFound();

  const { doc, role } = result;

  return (
    <Editor
      id={doc.id}
      initialTitle={doc.title}
      initialContent={doc.content}
      role={role}
      ownerName={doc.owner.name}
    />
  );
}
