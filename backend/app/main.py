import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import get_settings

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("affordability-api")
settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0", docs_url="/api/docs" if settings.environment != "production" else None, redoc_url=None)
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_origin], allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])


@app.middleware("http")
async def security_and_request_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    started = time.perf_counter()
    if request.headers.get("content-length") and int(request.headers["content-length"]) > settings.request_body_limit_bytes:
        return JSONResponse(status_code=413, content={"error": {"code": "REQUEST_TOO_LARGE", "message": "Request body is too large."}}, headers={"x-request-id": request_id})
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("request_failed request_id=%s route=%s", request_id, request.url.path)
        response = JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_ERROR", "message": "Something went wrong. Please try again."}})
    response.headers["x-request-id"] = request_id
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["referrer-policy"] = "strict-origin-when-cross-origin"
    logger.info("request_id=%s route=%s status=%s latency_ms=%.2f", request_id, request.url.path, response.status_code, (time.perf_counter() - started) * 1000)
    return response


app.include_router(router)
