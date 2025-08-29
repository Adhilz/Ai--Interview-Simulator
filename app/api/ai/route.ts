import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, history = [] } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...history, // should be an array of { role, parts: [{ text }] }
            { role: "user", parts: [{ text: prompt }] }
          ]
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: "Gemini API error", details: err }, { status: 500 });
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
