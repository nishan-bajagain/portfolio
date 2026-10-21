import { NextRequest, NextResponse } from "next/server"
import { verifyAdminRequest } from "@/lib/auth.server"
import { deleteMessage, setMessageRead } from "@/lib/database"

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" }

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS })
  }
  try {
    const bodyText = await request.text()
    if (new TextEncoder().encode(bodyText).length > 4_000) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413, headers: PRIVATE_HEADERS })
    }
    let body: unknown
    try {
      body = JSON.parse(bodyText)
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: PRIVATE_HEADERS })
    }
    if (
      typeof body !== "object" ||
      body === null ||
      !("read" in body) ||
      typeof body.read !== "boolean"
    ) {
      return NextResponse.json({ error: "Expected a boolean read field" }, { status: 400, headers: PRIVATE_HEADERS })
    }
    const { id } = await params
    if (!(await setMessageRead(id, body.read))) {
      return NextResponse.json({ error: "Message not found" }, { status: 404, headers: PRIVATE_HEADERS })
    }
    return NextResponse.json({ success: true }, { headers: PRIVATE_HEADERS })
  } catch (error) {
    console.error("Message PATCH error:", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500, headers: PRIVATE_HEADERS })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS })
  }
  try {
    const { id } = await params
    if (!(await deleteMessage(id))) {
      return NextResponse.json({ error: "Message not found" }, { status: 404, headers: PRIVATE_HEADERS })
    }
    return NextResponse.json({ success: true }, { headers: PRIVATE_HEADERS })
  } catch (error) {
    console.error("Message DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500, headers: PRIVATE_HEADERS })
  }
}
