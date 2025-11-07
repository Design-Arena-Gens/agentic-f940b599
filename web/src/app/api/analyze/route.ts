import { NextResponse } from "next/server";
import { buildSeoPlan } from "@/lib/analyzer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const channelHandles = Array.isArray(body.channelHandles)
      ? body.channelHandles
      : [];
    const targetVideoUrl =
      typeof body.targetVideoUrl === "string" ? body.targetVideoUrl : undefined;

    if (!channelHandles.length) {
      return NextResponse.json(
        { error: "At least one channel handle is required." },
        { status: 400 },
      );
    }

    const result = await buildSeoPlan({
      channelHandles,
      targetVideoUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
