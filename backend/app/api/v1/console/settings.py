from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.models.audit import PlatformSetting
from app.models.user import User
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/settings", tags=["Console - Platform Settings"])


class PlatformSettingPayload(BaseModel):
    key: str
    value: dict[str, Any]
    description: str | None = None


@router.get("", response_model=StandardResponse[list[dict[str, Any]]])
async def list_settings(
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(PlatformSetting).order_by(PlatformSetting.key.asc())
    settings_list = (await db.execute(stmt)).scalars().all()
    return StandardResponse(
        message="Platform settings retrieved",
        data=[{"key": s.key, "value": s.value, "description": s.description} for s in settings_list],
    )


@router.post("", response_model=StandardResponse[dict[str, Any]])
async def set_setting(
    payload: PlatformSettingPayload,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(PlatformSetting).where(PlatformSetting.key == payload.key)
    setting = (await db.execute(stmt)).scalars().first()
    if setting:
        setting.value = payload.value
        if payload.description is not None:
            setting.description = payload.description
    else:
        setting = PlatformSetting(key=payload.key, value=payload.value, description=payload.description)
        db.add(setting)

    await db.commit()
    await db.refresh(setting)
    return StandardResponse(
        message="Platform setting saved",
        data={"key": setting.key, "value": setting.value, "description": setting.description},
    )
