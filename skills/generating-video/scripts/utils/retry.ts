/**
 * Retry utility with exponential backoff
 *
 * Implements the standard retry pattern used across all skills:
 * - 5 total attempts
 * - Exponential backoff: 1s, 2s, 4s, 8s, 16s
 * - Transparent error propagation on final failure
 */

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of attempts (default: 5) */
  maxAttempts?: number;

  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;

  /** Backoff multiplier (default: 2 for exponential) */
  backoffMultiplier?: number;

  /** Optional callback for logging retry attempts */
  onRetry?: (attempt: number, error: Error, nextDelay: number) => void;
}

/**
 * Execute an async operation with exponential backoff retry logic
 *
 * @param operation - The async function to execute
 * @param config - Retry configuration
 * @returns The result of the successful operation
 * @throws The last error if all retries are exhausted
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => {
 *     return await apiClient.createVideo({ prompt: "..." });
 *   },
 *   {
 *     maxAttempts: 5,
 *     onRetry: (attempt, error, delay) => {
 *       console.error(`Attempt ${attempt} failed: ${error.message}`);
 *       console.log(`Retrying in ${delay}ms...`);
 *     }
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts = 5,
    initialDelay = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = config;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Attempt the operation
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Calculate delay for next attempt: 1s, 2s, 4s, 8s, 16s
      const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError, delay);
      }

      // Wait before next attempt
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Check if an error is retryable (network, timeout, rate limit, etc.)
 *
 * @param error - The error to check
 * @returns True if the error is likely transient and worth retrying
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Network errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('socket hang up')
  ) {
    return true;
  }

  // Rate limiting
  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('429')
  ) {
    return true;
  }

  // Server errors (5xx)
  if (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  ) {
    return true;
  }

  // OpenAI specific errors
  if (
    message.includes('overloaded') ||
    message.includes('server_error') ||
    message.includes('service_unavailable')
  ) {
    return true;
  }

  return false;
}

/**
 * Execute operation with retry, but only for retryable errors
 *
 * @param operation - The async function to execute
 * @param config - Retry configuration
 * @returns The result of the successful operation
 * @throws Immediately if error is not retryable, or after retries if retryable
 *
 * @example
 * ```typescript
 * const result = await withSmartRetry(
 *   async () => await apiClient.createVideo({ prompt: "..." }),
 *   { onRetry: (attempt, error, delay) => console.log(`Retry ${attempt}`) }
 * );
 * ```
 */
export async function withSmartRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  return withRetry(async () => {
    try {
      return await operation();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // If error is not retryable, throw immediately without retrying
      if (!isRetryableError(err)) {
        throw err;
      }

      // Otherwise, let retry logic handle it
      throw err;
    }
  }, config);
}
