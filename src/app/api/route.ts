import { NextResponse } from "next/server";
import {prisma} from '../../../utils/prisma/prisma'

export async function GET() {
  const result = { hello: "Mayank Kashyap" };
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Unknown error" }, { status: 500 });
  }
}