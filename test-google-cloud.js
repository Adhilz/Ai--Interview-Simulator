const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const util = require('util');

async function testTTS() {
  const client = new textToSpeech.TextToSpeechClient();
  const request = {
    input: { text: 'Hello, this is a test of Google Text to Speech.' },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };
  const [response] = await client.synthesizeSpeech(request);
  fs.writeFileSync('output.mp3', response.audioContent, 'binary');
  console.log('TTS test complete: output.mp3 created.');
}

async function testSTT() {
  const client = new speech.SpeechClient();
  const filename = 'input.wav'; // Use your own recording
  const file = fs.readFileSync(filename);
  const audioBytes = file.toString('base64');
  const audio = { content: audioBytes };
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 48000, // <-- match your file's sample rate!
    languageCode: 'en-US',
  };
  const request = { audio, config };
  const [response] = await client.recognize(request);
  const transcription = response.results.map(r => r.alternatives[0].transcript).join('\n');
  console.log('STT test transcription:', transcription);
}

(async () => {
  await testTTS();
  await testSTT();
})();