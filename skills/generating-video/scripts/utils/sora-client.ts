/**
 * SORA API Client Wrapper
 *
 * Type-safe wrapper around OpenAI's SORA video generation API
 * with automatic retry logic for all operations.
 */

import OpenAI from 'openai';
import { withRetry } from './retry.js';
import type {
  VideoGenerationRequest,
  VideoGenerationJob,
} from '../../../../src/types.js';

/**
 * SORA API client with retry logic built-in
 */
export class SoraClient {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Create a new video generation job
   *
   * @param request - Video generation parameters
   * @returns Job information with ID and initial status
   *
   * @example
   * ```typescript
   * const job = await client.createVideo({
   *   prompt: "Wide shot of a modern office, natural lighting",
   *   model: "sora-2",
   *   size: "1280x720",
   *   seconds: 5
   * });
   * console.log(`Job created: ${job.id}`);
   * ```
   */
  async createVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationJob> {
    return withRetry(
      async () => {
        const response = await this.client.videos.create({
          model: request.model,
          prompt: request.prompt,
          size: request.size,
          seconds: request.seconds.toString(),
        });

        // Transform OpenAI response to our VideoGenerationJob type
        return {
          id: response.id,
          object: 'video' as const,
          created_at: response.created_at,
          status: response.status as VideoGenerationJob['status'],
          model: response.model,
          progress: response.progress,
          seconds: response.seconds,
          size: response.size,
          error: response.error,
        };
      },
      {
        maxAttempts: 5,
        onRetry: (attempt, error, delay) => {
          console.error(
            `[SORA] Create video attempt ${attempt} failed: ${error.message}`
          );
          console.log(`[SORA] Retrying in ${delay}ms...`);
        },
      }
    );
  }

  /**
   * Create a remix of an existing video
   *
   * @param videoId - ID of the video to remix
   * @param prompt - Prompt describing the changes to make
   * @returns New job information for the remix
   *
   * @example
   * ```typescript
   * const remixJob = await client.createRemix(
   *   "video_abc123",
   *   "Change the color palette to teal, sand, and rust"
   * );
   * ```
   */
  async createRemix(
    videoId: string,
    prompt: string
  ): Promise<VideoGenerationJob> {
    return withRetry(
      async () => {
        // Using OpenAI SDK's remix endpoint
        const response = await this.client.post(
          `/videos/${videoId}/remix`,
          {
            body: { prompt },
          }
        );

        return {
          id: response.id,
          object: 'video' as const,
          created_at: response.created_at,
          status: response.status as VideoGenerationJob['status'],
          model: response.model,
          progress: response.progress,
          seconds: response.seconds,
          size: response.size,
          error: response.error,
        };
      },
      {
        maxAttempts: 5,
        onRetry: (attempt, error, delay) => {
          console.error(
            `[SORA] Create remix attempt ${attempt} failed: ${error.message}`
          );
          console.log(`[SORA] Retrying in ${delay}ms...`);
        },
      }
    );
  }

  /**
   * Get the current status of a video generation job
   *
   * @param videoId - Job ID to check
   * @returns Current job status with progress information
   *
   * @example
   * ```typescript
   * const status = await client.getVideoStatus("video_abc123");
   * console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
   * ```
   */
  async getVideoStatus(videoId: string): Promise<VideoGenerationJob> {
    return withRetry(
      async () => {
        const response = await this.client.videos.retrieve(videoId);

        return {
          id: response.id,
          object: 'video' as const,
          created_at: response.created_at,
          status: response.status as VideoGenerationJob['status'],
          model: response.model,
          progress: response.progress,
          seconds: response.seconds,
          size: response.size,
          error: response.error,
        };
      },
      {
        maxAttempts: 5,
        onRetry: (attempt, error, delay) => {
          console.error(
            `[SORA] Get status attempt ${attempt} failed: ${error.message}`
          );
          console.log(`[SORA] Retrying in ${delay}ms...`);
        },
      }
    );
  }

  /**
   * Download the completed video content
   *
   * @param videoId - Job ID of completed video
   * @param variant - Content variant to download ('video', 'thumbnail', 'spritesheet')
   * @returns ArrayBuffer containing the file data
   *
   * @example
   * ```typescript
   * const videoData = await client.downloadVideo("video_abc123");
   * await fs.writeFile("output.mp4", Buffer.from(videoData));
   * ```
   */
  async downloadVideo(
    videoId: string,
    variant: 'video' | 'thumbnail' | 'spritesheet' = 'video'
  ): Promise<ArrayBuffer> {
    return withRetry(
      async () => {
        const response = await this.client.videos.downloadContent(
          videoId,
          variant
        );

        // Return the ArrayBuffer directly
        return await response.arrayBuffer();
      },
      {
        maxAttempts: 5,
        onRetry: (attempt, error, delay) => {
          console.error(
            `[SORA] Download video attempt ${attempt} failed: ${error.message}`
          );
          console.log(`[SORA] Retrying in ${delay}ms...`);
        },
      }
    );
  }

  /**
   * Poll a video generation job until completion or failure
   *
   * @param videoId - Job ID to poll
   * @param pollInterval - Milliseconds between status checks (default: 10000)
   * @param onProgress - Optional callback for progress updates
   * @returns Final job status when completed or failed
   *
   * @example
   * ```typescript
   * const finalJob = await client.pollUntilComplete(
   *   "video_abc123",
   *   10000,
   *   (job) => console.log(`Progress: ${job.progress}%`)
   * );
   * ```
   */
  async pollUntilComplete(
    videoId: string,
    pollInterval: number = 10000,
    onProgress?: (job: VideoGenerationJob) => void
  ): Promise<VideoGenerationJob> {
    while (true) {
      const job = await this.getVideoStatus(videoId);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(job);
      }

      // Check if job is in terminal state
      if (job.status === 'completed' || job.status === 'failed') {
        return job;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Delete a video from OpenAI storage
   *
   * @param videoId - Job ID to delete
   *
   * @example
   * ```typescript
   * await client.deleteVideo("video_abc123");
   * console.log("Video deleted successfully");
   * ```
   */
  async deleteVideo(videoId: string): Promise<void> {
    return withRetry(
      async () => {
        await this.client.videos.del(videoId);
      },
      {
        maxAttempts: 5,
        onRetry: (attempt, error, delay) => {
          console.error(
            `[SORA] Delete video attempt ${attempt} failed: ${error.message}`
          );
          console.log(`[SORA] Retrying in ${delay}ms...`);
        },
      }
    );
  }

  /**
   * List all videos with pagination
   *
   * @param limit - Number of videos to retrieve (max 100)
   * @param after - Cursor for pagination (video ID)
   * @param order - Sort order ('asc' or 'desc')
   * @returns List of video jobs
   *
   * @example
   * ```typescript
   * const videos = await client.listVideos(20);
   * console.log(`Found ${videos.data.length} videos`);
   * ```
   */
  async listVideos(
    limit: number = 20,
    after?: string,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: VideoGenerationJob[]; has_more: boolean }> {
    return withRetry(
      async () => {
        const response = await this.client.videos.list({
          limit,
          after,
          order,
        });

        return {
          data: response.data.map((video) => ({
            id: video.id,
            object: 'video' as const,
            created_at: video.created_at,
            status: video.status as VideoGenerationJob['status'],
            model: video.model,
            progress: video.progress,
            seconds: video.seconds,
            size: video.size,
            error: video.error,
          })),
          has_more: response.has_more,
        };
      },
      {
        maxAttempts: 5,
        onRetry: (attempt, error, delay) => {
          console.error(
            `[SORA] List videos attempt ${attempt} failed: ${error.message}`
          );
          console.log(`[SORA] Retrying in ${delay}ms...`);
        },
      }
    );
  }
}

/**
 * Create a new SORA client instance
 *
 * @param apiKey - Optional OpenAI API key (defaults to OPENAI_API_KEY env var)
 * @returns Configured SORA client
 *
 * @example
 * ```typescript
 * const client = createSoraClient();
 * const job = await client.createVideo({ ... });
 * ```
 */
export function createSoraClient(apiKey?: string): SoraClient {
  return new SoraClient(apiKey);
}
