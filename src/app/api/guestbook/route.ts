import { NextRequest, NextResponse } from "next/server";
import { addEntry, getEntries } from "@/lib/dynamodb";

export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch guestbook entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    const entry = await addEntry(firstName.trim(), lastName.trim());
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to add guestbook entry:", error);
    return NextResponse.json(
      { error: "Failed to add entry" },
      { status: 500 }
    );
  }
}
