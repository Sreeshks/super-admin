import re


def extract_youtube_id(url: str) -> str | None:
    """
    Extracts the YouTube video ID from various URL formats safely:
    - https://www.youtube.com/watch?v=dQw4w9WgXcQ
    - https://youtu.be/dQw4w9WgXcQ
    - https://www.youtube.com/embed/dQw4w9WgXcQ
    - https://www.youtube.com/v/dQw4w9WgXcQ
    - https://www.youtube.com/shorts/dQw4w9WgXcQ
    """
    patterns = [r"(?:v=|\/v\/|youtu\.be\/|\/embed\/|\/shorts\/|^)([a-zA-Z0-9_-]{11})(?:[&?\/]|$)"]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_youtube_embed_url(video_id: str) -> str:
    """Safely construct a sandboxed YouTube embed URL."""
    return f"https://www.youtube-nocookie.com/embed/{video_id}"
