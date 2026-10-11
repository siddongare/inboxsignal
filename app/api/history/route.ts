import { auth } from "@clerk/nextjs/server";
import {
  deleteAnalysis,
  getAnalysisHistory,
  updateAnalysisTitle,
} from "@/lib/history";

function unauthorized() {
  return Response.json({ error: "Login required" }, { status: 401 });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const history = await getAnalysisHistory(userId);
  return Response.json({ history });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const body = (await req.json().catch(() => null)) as {
    id?: unknown;
    title?: unknown;
  } | null;

  const id = typeof body?.id === "string" ? body.id : "";
  const title = typeof body?.title === "string" ? body.title : "";

  if (!id || !title.trim()) {
    return Response.json({ error: "Missing id or title" }, { status: 400 });
  }

  const savedAnalysis = await updateAnalysisTitle(userId, id, title);

  if (!savedAnalysis) {
    return Response.json({ error: "Analysis not found" }, { status: 404 });
  }

  return Response.json({ savedAnalysis });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const deleted = await deleteAnalysis(userId, id);

  if (!deleted) {
    return Response.json({ error: "Analysis not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
