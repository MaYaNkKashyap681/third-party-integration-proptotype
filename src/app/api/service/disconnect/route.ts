import { serviceManager } from "../../../../../utils/integrations/ServiceManager";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const serviceName = searchParams.get('service');
        serviceManager.disconnect(serviceName as string);
        return NextResponse.json({success: true, data: serviceName})
    }catch(err) {
        return NextResponse.json({success: false, data: null})
    }
}