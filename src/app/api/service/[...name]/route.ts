import { serviceManager } from "../../../../../utils/integrations/ServiceManager";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { name: string[] } }) {
  try {
    const [serviceName, actionName] = params.name;   
    const payload = await req.json().catch(() => null);
    if (!serviceName || !actionName) {
      return NextResponse.json(
        { success: false, message: "Service name and action are required" }, 
        { status: 400 }
      );
    }
    
    // Handle the case when payload is null
    const result = await serviceManager.executeServiceAction(serviceName, actionName, payload ?? {});    
    return NextResponse.json({ success: true, result });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Unknown error" }, 
      { status: 500 }
    );
  }
}
