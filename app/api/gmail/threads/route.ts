import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHeader(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || ""
}

function decodeBody(data?: string): string {
  if (!data) return ""
  try {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
  } catch {
    return ""
  }
}

function extractText(payload: any): string {
  if (!payload) return ""
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBody(payload.body.data)
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractText(part)
      if (text) return text
    }
  }
  return ""
}

// ─── Token refresh helper ────────────────────────────────────────────────────

async function refreshToken(refresh_token: string, userId: string): Promise<string | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token,
      }),
    })
    const data = await res.json()
    if (!res.ok || !data.access_token) return null

    // Save refreshed token back to DB
    await prisma.account.updateMany({
      where: { userId, provider: "google" },
      data: {
        access_token: data.access_token,
        expires_at: data.expires_in
          ? Math.floor(Date.now() / 1000) + data.expires_in
          : null,
      },
    })

    return data.access_token
  } catch {
    return null
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Get the session — accessToken is injected by the NextAuth jwt callback
  const session = await getServerSession(authOptions) as any

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (session.error === "RefreshAccessTokenError") {
    // Refresh token is invalid — user needs to re-sign in
    return NextResponse.json(
      { error: "Session expired. Please sign in again.", reauth: true },
      { status: 401 }
    )
  }

  // Try to get accessToken from session first (Google OAuth login)
  // If missing (credentials login), fall back to the Account table in the DB
  let accessToken = session.accessToken as string | undefined

  if (!accessToken) {
    const userId = session.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: "Gmail access not granted. Please sign in with Google.", reauth: true },
        { status: 403 }
      )
    }

    // Look up the stored Google OAuth token from the Account table
    const account = await prisma.account.findFirst({
      where: { userId, provider: "google" },
      select: { access_token: true, refresh_token: true, expires_at: true },
    })

    if (!account?.access_token) {
      // User has no linked Google account — they signed up with email/password
      return NextResponse.json(
        { error: "No Google account linked. Please sign in with Google to use Gmail.", reauth: true },
        { status: 403 }
      )
    }

    // Check if token is expired and refresh if needed
    const isExpired = account.expires_at
      ? Date.now() > account.expires_at * 1000
      : false

    console.log("[gmail/threads] token expires_at:", account.expires_at)
    console.log("[gmail/threads] token isExpired:", isExpired)
    console.log("[gmail/threads] has refresh_token:", !!account.refresh_token)

    if (isExpired && account.refresh_token) {
      const refreshed = await refreshToken(account.refresh_token, userId)
      if (!refreshed) {
        return NextResponse.json(
          { error: "Gmail session expired. Please sign out and sign in with Google again.", reauth: true },
          { status: 403 }
        )
      }
      accessToken = refreshed
    } else {
      accessToken = account.access_token
    }
  }

  try {
    // 1. List inbox threads
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=200&labelIds=INBOX",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!listRes.ok) {
      const err = await listRes.json()
      throw new Error(err?.error?.message || "Failed to list threads")
    }

    const listData = await listRes.json()
    const threadIds: string[] = (listData.threads || []).map((t: any) => t.id)

    if (threadIds.length === 0) {
      return NextResponse.json({ threads: [] })
    }

    // 2. Fetch full thread details in parallel
    const threadDetails = await Promise.all(
      threadIds.map((id) =>
        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/threads/${id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        ).then((r) => r.json())
      )
    )

    // 3. Shape threads
    const threads = threadDetails.map((thread) => {
      const messages = (thread.messages || []).map((msg: any) => {
        const headers = msg.payload?.headers || []
        return {
          id: msg.id,
          from: getHeader(headers, "From"),
          to: getHeader(headers, "To"),
          subject: getHeader(headers, "Subject"),
          date: getHeader(headers, "Date"),
          snippet: msg.snippet || "",
          body: extractText(msg.payload),
          labelIds: msg.labelIds || [],
        }
      })

      const firstMsg = messages[0] || {}
      const labelIds: string[] = thread.messages?.[0]?.labelIds || []

      return {
        id: thread.id,
        subject: firstMsg.subject || "(No subject)",
        snippet: thread.snippet || firstMsg.snippet || "",
        unread: labelIds.includes("UNREAD"),
        messages,
      }
    })

    return NextResponse.json({ threads })
  } catch (err: any) {
    console.error("Gmail threads error:", err)
    return NextResponse.json({ error: err.message || "Failed to fetch threads" }, { status: 500 })
  }
}