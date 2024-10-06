import { serviceManager } from "../../../../../../utils/integrations/ServiceManager";

export async function GET() {
  const isConnected = await serviceManager.isConnected("todoist");

  if (isConnected) {
    return new Response(JSON.stringify({ message: "Todoist is connected" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ message: "Todoist is not connected" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
