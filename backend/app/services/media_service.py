import os
import uuid
from io import BytesIO

from fastapi import UploadFile
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import BadRequestException
from app.models.content import MediaAsset

ALLOWED_MIME_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/x-icon": "ico",
    "image/svg+xml": "svg",
    "video/mp4": "mp4",
    "video/webm": "webm",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB


class MediaService:
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def upload_file(
        self,
        file: UploadFile,
        media_type: str = "general",
    ) -> MediaAsset:
        """
        Validate, optimize, store media file securely and record metadata in PostgreSQL.
        Enforces tenant isolation by placing files under `tenants/{tenant_id}/{media_type}/`.
        """
        content_type = file.content_type.lower() if file.content_type else ""
        if content_type not in ALLOWED_MIME_TYPES:
            raise BadRequestException(
                f"Unsupported media type: '{content_type}'. Allowed types: {list(ALLOWED_MIME_TYPES.keys())}"
            )

        contents = await file.read()
        file_size = len(contents)

        is_video = "video" in content_type
        max_allowed = MAX_VIDEO_SIZE if is_video else MAX_IMAGE_SIZE

        if file_size > max_allowed:
            raise BadRequestException(f"File size exceeds maximum allowed limit ({max_allowed // (1024 * 1024)}MB)")

        # Verify image integrity with Pillow if image (unless SVG)
        metadata_info = {"file_size": file_size}
        if not is_video and content_type != "image/svg+xml":
            try:
                img = Image.open(BytesIO(contents))
                img.verify()
                # Reopen to read dimensions after verify
                img = Image.open(BytesIO(contents))
                metadata_info["width"] = img.width
                metadata_info["height"] = img.height
                metadata_info["format"] = img.format
            except Exception:
                raise BadRequestException("Uploaded file is not a valid or readable image")

        ext = ALLOWED_MIME_TYPES[content_type]
        safe_filename = f"{uuid.uuid4().hex}.{ext}"
        relative_dir = os.path.join("tenants", str(self.tenant_id), media_type)
        relative_path = os.path.join(relative_dir, safe_filename).replace("\\", "/")

        if settings.STORAGE_PROVIDER == "imgbb" and settings.IMGBB_API_KEY and not is_video:
            # ImgBB Cloud Storage
            import base64
            import json
            import urllib.parse
            import urllib.request

            b64_img = base64.b64encode(contents).decode("utf-8")
            data = urllib.parse.urlencode({"image": b64_img, "name": safe_filename}).encode("utf-8")
            req = urllib.request.Request(
                f"https://api.imgbb.com/1/upload?key={settings.IMGBB_API_KEY}",
                data=data,
                method="POST",
                headers={"User-Agent": "Mozilla/5.0"},
            )
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    res = json.loads(resp.read().decode("utf-8"))
                    file_url = res["data"]["url"]
                    metadata_info["imgbb_id"] = res["data"].get("id")
                    metadata_info["delete_url"] = res["data"].get("delete_url")
            except Exception:
                # Fallback to local filesystem storage if network timeout
                full_dir = os.path.join(settings.LOCAL_STORAGE_DIR, relative_dir)
                os.makedirs(full_dir, exist_ok=True)
                full_path = os.path.join(full_dir, safe_filename)
                with open(full_path, "wb") as f:
                    f.write(contents)
                file_url = f"/storage/{relative_path}"
        elif settings.STORAGE_PROVIDER == "s3" and settings.S3_ENDPOINT_URL:
            # S3 / MinIO storage
            import boto3

            s3 = boto3.client(
                "s3",
                endpoint_url=settings.S3_ENDPOINT_URL,
                aws_access_key_id=settings.S3_ACCESS_KEY_ID,
                aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
                region_name=settings.S3_REGION,
            )
            s3.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=relative_path,
                Body=contents,
                ContentType=content_type,
            )
            base_url = settings.S3_PUBLIC_BASE_URL or f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}"
            file_url = f"{base_url}/{relative_path}"
        else:
            # Local filesystem storage
            full_dir = os.path.join(settings.LOCAL_STORAGE_DIR, relative_dir)
            os.makedirs(full_dir, exist_ok=True)
            full_path = os.path.join(full_dir, safe_filename)
            with open(full_path, "wb") as f:
                f.write(contents)
            file_url = f"/storage/{relative_path}"

        media_asset = MediaAsset(
            tenant_id=self.tenant_id,
            file_name=safe_filename,
            original_name=file.filename or "unknown",
            file_path=relative_path,
            file_url=file_url,
            mime_type=content_type,
            file_size=file_size,
            storage_provider=settings.STORAGE_PROVIDER,
            media_type=media_type,
            metadata_info=metadata_info,
        )
        self.db.add(media_asset)
        await self.db.commit()
        await self.db.refresh(media_asset)
        return media_asset

    async def create_asset_from_url(
        self,
        url: str,
        original_name: str,
        media_type: str = "gallery",
        label: str | None = None,
        file_size: int = 0,
    ) -> MediaAsset:
        safe_filename = f"{uuid.uuid4().hex}.jpg"
        media_asset = MediaAsset(
            tenant_id=self.tenant_id,
            file_name=safe_filename,
            original_name=original_name,
            file_path=url,
            file_url=url,
            mime_type="image/jpeg",
            file_size=file_size,
            storage_provider="imgbb",
            media_type=media_type,
            metadata_info={"label": label or original_name.upper()},
        )
        self.db.add(media_asset)
        await self.db.commit()
        await self.db.refresh(media_asset)
        return media_asset

    async def delete_asset(self, asset_id: uuid.UUID) -> None:
        from app.core.exceptions import NotFoundException
        from app.repositories.tenant_aware import TenantAwareRepository

        repo = TenantAwareRepository(MediaAsset, self.db, self.tenant_id)
        asset = await repo.get_by_id(asset_id)
        if not asset:
            raise NotFoundException("Media asset not found")
        await repo.soft_delete(asset_id)
