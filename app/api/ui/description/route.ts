import { getDescription, writeDescription } from "@/config/data/files";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const currentData = await getDescription();
    return Response.json(currentData);
  } catch {
    return Response.json(
      { error: "Failed to load Description" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const currentData = await getDescription();

    const updatedData = {
      ...currentData,
      ...data,
    };

    await writeDescription(updatedData);

    return Response.json(updatedData);
  } catch {
    return Response.json(
      { error: "Failed to update Description" },
      { status: 500 }
    );
  }
}

