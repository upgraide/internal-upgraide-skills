#!/usr/bin/env tsx
/**
 * Transcription Script for Epic 3
 *
 * Generates complete timeline data from a video file:
 * - Word-level timestamps (Story 3.2)
 * - Phrase chunks and captions (Story 3.3)
 * - Timeline blueprint for orchestrator (Story 3.4)
 *
 * Usage:
 *   npm run transcribe                    # Processes inputs/avatar.mp4 (default)
 *   npm run transcribe koen_1.mp4         # Processes inputs/koen_1.mp4
 *   npm run transcribe myfile.mp4         # Processes inputs/myfile.mp4
 */

import { AssemblyAI } from "assemblyai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ============================================================================
// TYPES
// ============================================================================

interface Word {
  text: string;
  start: number;  // seconds
  end: number;    // seconds
  confidence: number;
}

interface Phrase {
  text: string;
  start: number;  // seconds
  end: number;    // seconds
}

interface Segment {
  id: string;
  start: number;
  end: number;
  text: string;
  type: "introduction" | "explanation" | "demo" | "conclusion";
  keywords: string[];
  emphasis: "high" | "medium" | "low";
  wordCount: number;
}

interface Timeline {
  duration: number;
  fullTranscript: string;
  words: Word[];
  phrases: Phrase[];
}

interface TimelineBlueprint {
  segments: Segment[];
  totalDuration: number;
  segmentCount: number;
}

interface CaptionStyle {
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  padding: string;
  textAlign: string;
  maxWords: number;
  maxDuration: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Get input file from command-line argument
// Supports both relative paths and absolute paths
const getInputPath = (): string => {
  const arg = process.argv[2];
  if (!arg) {
    return path.join(__dirname, "../../../../inputs/avatar.mp4");
  }
  // If absolute path, use as-is; otherwise resolve relative to cwd
  return path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
};

// Get output directory from command-line argument or use default
const getOutputDir = (): string => {
  const arg = process.argv[3];
  if (!arg) {
    return path.join(__dirname, "../../../../workspace");
  }
  return path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
};

const inputPath = getInputPath();
const outputDir = getOutputDir();

const PATHS = {
  input: inputPath,
  output: {
    timeline: path.join(outputDir, "timeline.json"),
    captions: path.join(outputDir, "captions.vtt"),
    captionStyle: path.join(outputDir, "caption-style.json"),
    blueprint: path.join(outputDir, "timeline-blueprint.json"),
  },
};

const RETRY_CONFIG = {
  maxAttempts: 5,
  delays: [1000, 2000, 4000, 8000, 16000], // exponential backoff in ms
};

const CHUNKING_CONFIG = {
  minWords: 2,
  maxWords: 4,
  pauseThreshold: 0.3, // seconds
  avoidBreakingAfter: new Set([
    "the", "a", "an", "of", "to", "in", "for", "with", "on", "at"
  ]),
};

const SEGMENT_CONFIG = {
  minDuration: 5.0,  // minimum segment length in seconds
  maxDuration: 8.0,  // maximum segment length in seconds
  introThreshold: 0.15,   // first 15% is introduction
  conclusionThreshold: 0.85, // last 15% is conclusion
};

// ============================================================================
// STORY 3.2: ASSEMBLY AI TRANSCRIPTION
// ============================================================================

/**
 * Transcribe audio from video file using Assembly AI
 */
async function transcribeWithRetry(filePath: string): Promise<any> {
  const apiKey = process.env.ASSEMBLY_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ASSEMBLY_AI_API_KEY not found in environment variables.\n" +
      "Add it to .env file: ASSEMBLY_AI_API_KEY=your_key_here"
    );
  }

  const client = new AssemblyAI({ apiKey });

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${RETRY_CONFIG.maxAttempts}] Transcribing ${path.basename(filePath)}...`);

      // Check for language override via environment variable or 4th argument
      const languageCode = process.argv[4] || process.env.TRANSCRIBE_LANGUAGE || undefined;

      const transcript = await client.transcripts.transcribe({
        audio: filePath,
        speech_model: "universal",
        ...(languageCode && { language_code: languageCode }),
      });

      if (transcript.status === "error") {
        throw new Error(`Transcription failed: ${transcript.error}`);
      }

      console.log("✓ Transcription complete!");
      return transcript;
    } catch (error) {
      const isLastAttempt = attempt === RETRY_CONFIG.maxAttempts;

      if (isLastAttempt) {
        throw new Error(
          `Transcription failed after ${RETRY_CONFIG.maxAttempts} attempts: ${error}`
        );
      }

      const delay = RETRY_CONFIG.delays[attempt - 1];
      console.log(`  ✗ Failed: ${error}`);
      console.log(`  ⏳ Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }

  throw new Error("Transcription failed: max retries exceeded");
}

/**
 * Extract word-level timestamps from Assembly AI transcript
 */
function extractWords(transcript: any): Word[] {
  if (!transcript.words || transcript.words.length === 0) {
    throw new Error("No words found in transcript. Check that avatar.mp4 has audible speech.");
  }

  return transcript.words.map((word: any) => ({
    text: word.text,
    start: word.start / 1000, // Convert ms to seconds
    end: word.end / 1000,     // Convert ms to seconds
    confidence: word.confidence,
  }));
}

// ============================================================================
// STORY 3.3: CAPTION GENERATION
// ============================================================================

/**
 * Check if word ends with punctuation
 */
function hasPunctuation(text: string): boolean {
  return /[.!?,;:]$/.test(text);
}

/**
 * Remove punctuation from end of word
 */
function stripPunctuation(text: string): string {
  return text.replace(/[.!?,;:]+$/, "");
}

/**
 * Determine if phrase should end at this word
 */
function shouldEndPhrase(
  word: Word,
  nextWord: Word | null,
  phraseLength: number,
  config: typeof CHUNKING_CONFIG
): boolean {
  // Priority 1: Punctuation = always end phrase
  if (hasPunctuation(word.text)) {
    return true;
  }

  // Priority 2: Max words = hard cap
  if (phraseLength >= config.maxWords) {
    return true;
  }

  // Priority 3: Pause detection (>0.3s gap)
  if (nextWord && (nextWord.start - word.end) > config.pauseThreshold) {
    return true;
  }

  // Priority 4: Smart pattern avoidance
  // Don't end after article/preposition IF under minWords
  if (phraseLength < config.minWords) {
    const cleanWord = stripPunctuation(word.text).toLowerCase();
    if (config.avoidBreakingAfter.has(cleanWord)) {
      return false; // Keep going
    }
  }

  return false;
}

/**
 * Chunk words into phrases for captions
 * Grammar-aware: respects punctuation, pauses, and natural breaks
 */
function chunkIntoPhrases(words: Word[]): Phrase[] {
  const phrases: Phrase[] = [];
  let currentPhrase: Word[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = i < words.length - 1 ? words[i + 1] : null;

    currentPhrase.push(word);

    const shouldEnd = !nextWord || shouldEndPhrase(
      word,
      nextWord,
      currentPhrase.length,
      CHUNKING_CONFIG
    );

    if (shouldEnd && currentPhrase.length > 0) {
      // Create phrase with punctuation stripped from display
      const cleanText = currentPhrase
        .map(w => stripPunctuation(w.text))
        .join(" ");

      phrases.push({
        text: cleanText,
        start: currentPhrase[0].start,
        end: currentPhrase[currentPhrase.length - 1].end,
      });

      currentPhrase = [];
    }
  }

  return phrases;
}

/**
 * Format timestamp for WebVTT (HH:MM:SS.mmm)
 */
function formatVTTTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":") + "." + milliseconds.toString().padStart(3, "0");
}

/**
 * Generate WebVTT captions from phrases
 */
function generateWebVTT(phrases: Phrase[]): string {
  let vtt = "WEBVTT\n\n";

  for (const phrase of phrases) {
    const startTime = formatVTTTimestamp(phrase.start);
    const endTime = formatVTTTimestamp(phrase.end);
    vtt += `${startTime} --> ${endTime}\n${phrase.text}\n\n`;
  }

  return vtt.trim();
}

/**
 * Generate caption style configuration
 */
function generateCaptionStyle(): CaptionStyle {
  return {
    fontSize: "4rem",
    fontWeight: "800",
    fontFamily: "Inter, sans-serif",
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: "0.5rem 1rem",
    textAlign: "center",
    maxWords: CHUNKING_CONFIG.maxWords,
    maxDuration: 1.5,
  };
}

// ============================================================================
// STORY 3.4: TIMELINE BLUEPRINT FOR ORCHESTRATOR
// ============================================================================

/**
 * Detect segment type based on position and content
 */
function detectSegmentType(
  text: string,
  startTime: number,
  totalDuration: number
): Segment["type"] {
  const position = startTime / totalDuration;

  // First 15% = introduction
  if (position < SEGMENT_CONFIG.introThreshold) {
    return "introduction";
  }

  // Last 15% = conclusion
  if (position > SEGMENT_CONFIG.conclusionThreshold) {
    return "conclusion";
  }

  // Contains demo keywords = demo
  if (/\b(show|demo|demonstrate|example|here|look|see)\b/i.test(text)) {
    return "demo";
  }

  // Default = explanation
  return "explanation";
}

/**
 * Extract keywords from text for B-roll matching
 */
function extractKeywords(text: string): string[] {
  // Remove common words and extract meaningful terms
  const commonWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
    "this", "that", "these", "those", "it", "its", "i", "you", "we", "they"
  ]);

  const words = text.toLowerCase()
    .replace(/[.,!?;:]/g, "") // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  // Return unique keywords
  return [...new Set(words)];
}

/**
 * Determine emphasis level based on segment type
 */
function getEmphasis(type: Segment["type"]): Segment["emphasis"] {
  switch (type) {
    case "introduction":
    case "conclusion":
      return "high";
    case "demo":
      return "medium";
    case "explanation":
    default:
      return "low";
  }
}

/**
 * Group words into segments for orchestrator
 */
function createTimelineBlueprint(words: Word[], totalDuration: number): TimelineBlueprint {
  const segments: Segment[] = [];
  let currentSegmentWords: Word[] = [];
  let segmentCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    currentSegmentWords.push(word);

    const duration = word.end - currentSegmentWords[0].start;
    const isLastWord = i === words.length - 1;

    // End segment if:
    // 1. Reached max duration, OR
    // 2. Reached min duration AND last word, OR
    // 3. Reached min duration AND next word would exceed max
    const shouldEnd = isLastWord ||
      duration >= SEGMENT_CONFIG.maxDuration ||
      (duration >= SEGMENT_CONFIG.minDuration &&
       i < words.length - 1 &&
       words[i + 1].end - currentSegmentWords[0].start > SEGMENT_CONFIG.maxDuration);

    if (shouldEnd && currentSegmentWords.length > 0) {
      segmentCount++;
      const start = currentSegmentWords[0].start;
      const end = currentSegmentWords[currentSegmentWords.length - 1].end;
      const text = currentSegmentWords.map(w => w.text).join(" ");
      const type = detectSegmentType(text, start, totalDuration);

      segments.push({
        id: `seg-${segmentCount}`,
        start,
        end,
        text,
        type,
        keywords: extractKeywords(text),
        emphasis: getEmphasis(type),
        wordCount: currentSegmentWords.length,
      });

      currentSegmentWords = [];
    }
  }

  return {
    segments,
    totalDuration,
    segmentCount: segments.length,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJSON(filePath: string, data: any): void {
  ensureDirectoryExists(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function writeText(filePath: string, text: string): void {
  ensureDirectoryExists(filePath);
  fs.writeFileSync(filePath, text, "utf-8");
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Epic 3: Transcription, Timestamps & Captions");
  console.log("=".repeat(60));

  try {
    // Validate input file exists
    if (!fs.existsSync(PATHS.input)) {
      throw new Error(
        `Input file not found: ${PATHS.input}\n` +
        `Usage: npx tsx transcribe.ts <audio-path> [output-dir]\n` +
        `Example: npx tsx transcribe.ts public/audio/voiceover.mp3 workspace/`
      );
    }

    // Story 3.2: Transcribe with Assembly AI
    console.log("\n[Story 3.2] Transcribing audio...");
    const transcript = await transcribeWithRetry(PATHS.input);
    const words = extractWords(transcript);
    const duration = words[words.length - 1].end;

    console.log(`✓ Extracted ${words.length} words (${duration.toFixed(1)}s)`);

    // Story 3.3: Generate captions
    console.log("\n[Story 3.3] Generating captions...");
    const phrases = chunkIntoPhrases(words);
    const webVTT = generateWebVTT(phrases);
    const captionStyle = generateCaptionStyle();

    console.log(`✓ Created ${phrases.length} caption phrases`);

    // Story 3.4: Create timeline blueprint
    console.log("\n[Story 3.4] Creating timeline blueprint...");
    const blueprint = createTimelineBlueprint(words, duration);

    console.log(`✓ Created ${blueprint.segmentCount} orchestrator segments`);

    // Write all outputs
    console.log("\n[Output] Writing files...");

    const timeline: Timeline = {
      duration,
      fullTranscript: transcript.text,
      words,
      phrases,
    };

    writeJSON(PATHS.output.timeline, timeline);
    console.log(`  ✓ ${path.basename(PATHS.output.timeline)}`);

    writeText(PATHS.output.captions, webVTT);
    console.log(`  ✓ ${path.basename(PATHS.output.captions)}`);

    writeJSON(PATHS.output.captionStyle, captionStyle);
    console.log(`  ✓ ${path.basename(PATHS.output.captionStyle)}`);

    writeJSON(PATHS.output.blueprint, blueprint);
    console.log(`  ✓ ${path.basename(PATHS.output.blueprint)}`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✓ TRANSCRIPTION COMPLETE");
    console.log("=".repeat(60));
    console.log(`Duration: ${duration.toFixed(1)}s`);
    console.log(`Words: ${words.length}`);
    console.log(`Phrases: ${phrases.length}`);
    console.log(`Segments: ${blueprint.segmentCount}`);
    console.log("\nSegment breakdown:");

    const segmentTypes = blueprint.segments.reduce((acc, seg) => {
      acc[seg.type] = (acc[seg.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(segmentTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log("\nOutputs:");
    console.log(`  workspace/timeline.json`);
    console.log(`  workspace/captions.vtt`);
    console.log(`  workspace/caption-style.json`);
    console.log(`  workspace/timeline-blueprint.json`);
    console.log("\n" + "=".repeat(60));

  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("✗ TRANSCRIPTION FAILED");
    console.error("=".repeat(60));
    console.error(error);
    console.error("=".repeat(60));
    process.exit(1);
  }
}

// Run if called directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
