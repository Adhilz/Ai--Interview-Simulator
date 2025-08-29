import { NextRequest, NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

// Google Cloud credentials must be set in the environment
const client = new textToSpeech.TextToSpeechClient();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return new NextResponse("Missing text", { status: 400 });

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    });

    if (!response.audioContent) {
      return new NextResponse("No audio generated", { status: 500 });
    }

    return new NextResponse(Buffer.from(response.audioContent as Uint8Array), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline; filename=tts.mp3",
      },
    });
  } catch (err) {
    console.error("TTS error", err);
    return new NextResponse("TTS error", { status: 500 });
  }
}
