import { NextResponse } from 'next/server';
import { serviceManager } from '../../../../utils/integrations/ServiceManager';

export async function POST(req: Request) {
  try {
    const { serviceName, action, payload } = await req.json();
    const result = await serviceManager.executeServiceAction(serviceName, action, payload);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Unknown error" }, { status: 500 });
  }
}
