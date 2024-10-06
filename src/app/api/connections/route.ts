import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prisma/prisma";

export async function GET() {
    try {
        const data = await prisma.user.findFirst({
            where: {
                id: "1"
            }
        })
        return NextResponse.json({ success: true, data });
    }
    catch(err) {
        return NextResponse.json({ success: false, data: null });
    }
}