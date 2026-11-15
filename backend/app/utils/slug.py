import re
import unicodedata


def generate_slug(text: str) -> str:
    """Generate a clean URL-friendly slug from text."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8")
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text)

