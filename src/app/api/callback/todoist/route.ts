import { NextResponse } from "next/server";
import { TodoistService } from "../../../../../utils/integrations/todoist/TodoistService";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code query param missing" }, { status: 400 });
  }

  try {
    const todoistService = new TodoistService();
    await todoistService.handleCallback(code);
    return NextResponse.redirect("http://localhost:3000/success");
  } catch (error) {
    console.error("Error handling callback:", error);
    return NextResponse.json({ error: "Error handling callback" }, { status: 500 });
  }
}
