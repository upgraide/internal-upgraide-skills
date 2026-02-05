"""
Qwen client wrapper with automatic retry logic.

Supports both:
- qwen3-vl-235b-a22b-thinking (DashScope native API)
- qwen3-omni-flash (OpenAI-compatible API with audio support)

Provides a reliable interface with:
- 5 retries with exponential backoff (1s, 2s, 4s, 8s, 16s)
- Video and audio upload handling
- Response parsing and error handling
"""

import os
import sys
import time
import json
from typing import Dict, Any, Optional, List
from pathlib import Path

try:
    from dashscope import MultiModalConversation
    import dashscope
except ImportError:
    print(json.dumps({
        "error": "dashscope package not installed",
        "message": "Run: pip install dashscope>=1.24.6"
    }), file=sys.stderr)
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional if env vars are set another way


class QwenClient:
    """
    Unified wrapper for Qwen models via DashScope.

    Supports:
    - qwen3-vl-235b-a22b-thinking: DashScope native (vision-language, 235B params)
    - qwen3-omni-flash: OpenAI-compatible (audio-visual, 30B params)

    Implements automatic retry logic per architecture requirements:
    - 5 retries with exponential backoff
    - Transparent error handling
    - Fatal errors surface after exhaustion
    """

    # Retry configuration (per architecture.md lines 314-332)
    MAX_RETRIES = 5
    BACKOFF_DELAYS = [1, 2, 4, 8, 16]  # seconds

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Qwen client.

        Args:
            api_key: DashScope API key (defaults to DASHSCOPE_API_KEY env var)
        """
        self.api_key = api_key or os.getenv('DASHSCOPE_API_KEY')

        if not self.api_key:
            raise ValueError(
                "DASHSCOPE_API_KEY not found. Set environment variable or pass api_key parameter."
            )

        # DashScope native client (always initialized)
        dashscope.api_key = self.api_key
        dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

        # OpenAI-compatible client (lazy initialization)
        self.openai_client = None

    def _is_omni_model(self, model: str) -> bool:
        """Check if model uses OpenAI-compatible API."""
        return model.startswith("qwen3-omni") or model.startswith("qwen-omni")

    def _init_openai_client(self):
        """Lazy initialization of OpenAI client."""
        if self.openai_client is None:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(
                    api_key=self.api_key,
                    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
                    http_client=None  # Disable default HTTP client config
                )
            except ImportError:
                raise ImportError(
                    "openai package not installed. "
                    "Run: pip install openai>=1.0.0"
                )
            except TypeError:
                # Fallback for older OpenAI SDK versions
                from openai import OpenAI
                self.openai_client = OpenAI(
                    api_key=self.api_key,
                    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
                )

    def _make_request_dashscope(
        self,
        messages: List[Dict[str, Any]],
        model: str
    ) -> Dict[str, Any]:
        """
        Make API request using DashScope native SDK with retry logic.

        Args:
            messages: Chat messages in DashScope format
            model: Model identifier

        Returns:
            Parsed response dict

        Raises:
            Exception: After all retries exhausted
        """
        last_error = None

        for attempt in range(self.MAX_RETRIES):
            try:
                response = MultiModalConversation.call(
                    model=model,
                    messages=messages
                )

                # Check for API-level errors
                if response.status_code != 200:
                    raise Exception(f"API error: {response.code} - {response.message}")

                return response

            except Exception as e:
                last_error = e

                # If this isn't the last attempt, wait and retry
                if attempt < self.MAX_RETRIES - 1:
                    delay = self.BACKOFF_DELAYS[attempt]
                    print(
                        f"Attempt {attempt + 1}/{self.MAX_RETRIES} failed: {str(e)}. "
                        f"Retrying in {delay}s...",
                        file=sys.stderr
                    )
                    time.sleep(delay)
                else:
                    # All retries exhausted
                    print(
                        f"All {self.MAX_RETRIES} retries exhausted. Last error: {str(e)}",
                        file=sys.stderr
                    )

        # If we get here, all retries failed
        raise Exception(f"Fatal error after {self.MAX_RETRIES} retries: {str(last_error)}")

    def _make_request_openai(
        self,
        messages: List[Dict[str, Any]],
        model: str
    ) -> str:
        """
        Make API request using OpenAI-compatible SDK with retry logic.

        Args:
            messages: Chat messages in OpenAI format
            model: Model identifier

        Returns:
            Response text

        Raises:
            Exception: After all retries exhausted
        """
        self._init_openai_client()
        last_error = None

        for attempt in range(self.MAX_RETRIES):
            try:
                completion = self.openai_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    stream=False
                )

                # Extract content from response
                if completion.choices and len(completion.choices) > 0:
                    return completion.choices[0].message.content

                raise Exception("No choices in OpenAI response")

            except Exception as e:
                last_error = e

                # If this isn't the last attempt, wait and retry
                if attempt < self.MAX_RETRIES - 1:
                    delay = self.BACKOFF_DELAYS[attempt]
                    print(
                        f"Attempt {attempt + 1}/{self.MAX_RETRIES} failed: {str(e)}. "
                        f"Retrying in {delay}s...",
                        file=sys.stderr
                    )
                    time.sleep(delay)
                else:
                    # All retries exhausted
                    print(
                        f"All {self.MAX_RETRIES} retries exhausted. Last error: {str(e)}",
                        file=sys.stderr
                    )

        # If we get here, all retries failed
        raise Exception(f"Fatal error after {self.MAX_RETRIES} retries: {str(last_error)}")

    def analyze_video(
        self,
        video_path: str,
        prompt: str,
        model: str = "qwen3-vl-235b-a22b-thinking"
    ) -> str:
        """
        Analyze a video with a text prompt.

        Args:
            video_path: Path to video file (local) or URL (http/https)
            prompt: Analysis prompt
            model: Model identifier (default: qwen3-vl-235b-a22b-thinking)

        Returns:
            Model response text

        Raises:
            Exception: If video file not found or API fails after retries
        """
        # Validate video exists if local path
        if not video_path.startswith(('http://', 'https://', 'file://')):
            video_file = Path(video_path)
            if not video_file.exists():
                raise FileNotFoundError(f"Video file not found: {video_path}")

        # Route to appropriate implementation based on model
        if self._is_omni_model(model):
            return self._analyze_with_openai(video_path, prompt, model)
        else:
            return self._analyze_with_dashscope(video_path, prompt, model)

    def _analyze_with_dashscope(
        self,
        video_path: str,
        prompt: str,
        model: str
    ) -> str:
        """
        Analyze video using DashScope native API (VL models).

        Args:
            video_path: Path to video file
            prompt: Analysis prompt
            model: Model identifier

        Returns:
            Model response text
        """
        # Convert to file:// URL if local path
        if not video_path.startswith(('http://', 'https://', 'file://')):
            video_path = f"file://{Path(video_path).absolute()}"

        # Construct messages in DashScope format
        messages = [
            {
                "role": "user",
                "content": [
                    {"video": video_path},
                    {"text": prompt}
                ]
            }
        ]

        # Make request with retry logic
        response = self._make_request_dashscope(messages, model)

        # Extract text from response
        if hasattr(response, 'output') and hasattr(response.output, 'choices'):
            if len(response.output.choices) > 0:
                content = response.output.choices[0].message.content
                # Handle if content is a list (join all text elements)
                if isinstance(content, list):
                    text_parts = []
                    for item in content:
                        if isinstance(item, dict) and 'text' in item:
                            text_parts.append(item['text'])
                        elif isinstance(item, str):
                            text_parts.append(item)
                    return '\n'.join(text_parts)
                return content

        raise Exception(f"Unexpected response format: {response}")

    def _analyze_with_openai(
        self,
        video_path: str,
        prompt: str,
        model: str
    ) -> str:
        """
        Analyze video using OpenAI-compatible API (Omni models).

        Args:
            video_path: URL to video file (must be http/https)
            prompt: Analysis prompt
            model: Model identifier

        Returns:
            Model response text
        """
        # Validate URL format (Omni API requires remote URLs)
        if not video_path.startswith(('http://', 'https://')):
            raise ValueError(
                f"Omni models require http/https video URL. Got: {video_path}\n"
                "For local files, upload to remote URL first (Supabase, S3, etc.)"
            )

        # Construct content array
        content = [
            {"type": "video_url", "video_url": {"url": video_path}},
            {"type": "text", "text": prompt}
        ]

        # Construct messages in OpenAI format
        messages = [
            {
                "role": "user",
                "content": content
            }
        ]

        # Make request with retry logic
        return self._make_request_openai(messages, model)

    def analyze_video_structured(
        self,
        video_path: str,
        prompt: str,
        model: str = "qwen3-vl-235b-a22b-thinking"
    ) -> Dict[str, Any]:
        """
        Analyze video and return structured JSON response.

        This method attempts to parse the model's response as JSON.
        Prompt should request JSON output format.

        Args:
            video_path: Path to video file or URL
            prompt: Analysis prompt (should request JSON output)
            model: Model identifier (default: qwen3-vl-235b-a22b-thinking)

        Returns:
            Parsed JSON response as dict

        Raises:
            Exception: If analysis fails or response isn't valid JSON
        """
        response_text = self.analyze_video(video_path, prompt, model)

        # Try to extract JSON from response
        # Model might wrap JSON in markdown code blocks
        response_text = response_text.strip()

        # Remove markdown code fences if present
        if response_text.startswith('```'):
            lines = response_text.split('\n')
            # Remove first line (```json or ```)
            lines = lines[1:]
            # Remove last line (```)
            if lines[-1].strip() == '```':
                lines = lines[:-1]
            response_text = '\n'.join(lines)

        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            raise Exception(
                f"Failed to parse response as JSON: {str(e)}\n"
                f"Response text: {response_text}"
            )


# Backward compatibility alias
QwenVLClient = QwenClient


def main():
    """
    CLI interface for testing.

    Usage:
        python qwen_client.py <video_path> <prompt> [model]
    """
    if len(sys.argv) < 3:
        print("Usage: python qwen_client.py <video_path> <prompt> [model]")
        print("\nExamples:")
        print("  # VL model (default)")
        print("  python qwen_client.py video.mp4 'Analyze this video'")
        print("\n  # Omni model (requires http/https URL)")
        print("  python qwen_client.py https://url.com/video.mp4 'Analyze audio-visual sync' qwen3-omni-flash")
        sys.exit(1)

    video_path = sys.argv[1]
    prompt = sys.argv[2]
    model = sys.argv[3] if len(sys.argv) > 3 else "qwen3-vl-235b-a22b-thinking"

    try:
        client = QwenClient()
        response = client.analyze_video(video_path, prompt, model)
        print(response)
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "video_path": video_path,
            "model": model
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
