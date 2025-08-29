import { NextRequest, NextResponse } from "next/server";
import speech from "@google-cloud/speech";
import type { protos } from "@google-cloud/speech";

// Google Cloud credentials must be set in the environment
const client = new speech.SpeechClient();

export async function POST(req: NextRequest) {
  try {
    // Accept audio as binary (webm, wav, or mp3)
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("audio/")) {
      return new NextResponse("Invalid content type", { status: 400 });
    }
    const audioBuffer = Buffer.from(await req.arrayBuffer());

    // Configure recognition (adjust encoding if needed)
    const audio: protos.google.cloud.speech.v1.IRecognitionAudio = {
      content: audioBuffer.toString("base64"),
    };
    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: "WEBM_OPUS", // Change to "LINEAR16" for wav, "MP3" for mp3, etc.
      sampleRateHertz: 48000, // Adjust if needed
      languageCode: "en-US",
    };

    const response = await client.recognize({ audio, config });
    const results = response[0]?.results || [];
    const transcript = results.map((r: any) => r.alternatives?.[0]?.transcript).join(" ") || "";
    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("STT error", err);
    return new NextResponse("STT error", { status: 500 });
  }
}
