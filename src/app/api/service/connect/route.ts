import { serviceManager } from "../../../../../utils/integrations/ServiceManager";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const serviceName = searchParams.get('service');
        const connectUrl = await serviceManager.connect(serviceName as string);
        // console.log(connectUrl)
        return NextResponse.json({success: true, data: connectUrl})
    }catch(err) {
        return NextResponse.json({success: false, data: null})
    }
}