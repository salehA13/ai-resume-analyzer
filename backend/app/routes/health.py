"""Health check endpoint."""

import os

from fastapi import APIRouter

from app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    mode = "live" if os.getenv("OPENAI_API_KEY") else "mock"
    return HealthResponse(status="ok", version="1.0.0", mode=mode)
