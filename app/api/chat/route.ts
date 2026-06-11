import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    console.error("[/api/chat] ANTHROPIC_API_KEY is not set");
    return NextResponse.json({
      text: "Server error: add ANTHROPIC_API_KEY to .env.local and restart the dev server.",
    });
  }

  try {
    const { messages, systemPrompt } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: systemPrompt || "",
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `API error (${response.status})`;
      console.error("[/api/chat] Anthropic error:", data?.error);
      return NextResponse.json({ text: `⚠️ ${errMsg}` });
    }

    const text = data?.content?.[0]?.text;
    if (!text) {
      console.error("[/api/chat] No text in Anthropic response:", data);
      return NextResponse.json({ text: "Something went wrong — empty response from AI." });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[/api/chat] Unexpected error:", error);
    return NextResponse.json({ text: "Connection error — please try again." });
  }
}
