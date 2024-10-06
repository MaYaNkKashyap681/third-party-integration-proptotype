import { NextResponse } from "next/server";
import { NotionService } from "../../../../../utils/integrations/notion/NotionService";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code query param missing" }, { status: 400 });
  }

  try {
    const notionService = new NotionService();
    await notionService.handleCallback(code);
    return NextResponse.redirect("http://localhost:3000/success");
  } catch (error) {
    console.error("Error handling callback:", error);
    return NextResponse.json({ error: "Error handling callback" }, { status: 500 });
  }
}
