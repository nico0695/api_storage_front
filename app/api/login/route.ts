import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Server-side environment variables (no NEXT_PUBLIC_ prefix needed)
    const validUsername = process.env.AUTH_USERNAME || "admin"
    const validPassword = process.env.AUTH_PASSWORD || "admin123"

    if (username === validUsername && password === validPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
