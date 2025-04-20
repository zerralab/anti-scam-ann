from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse, JSONResponse
import json

'''
1. API用途：提供測試端點以驗證API的基本功能和狀態
2. 關聯頁面：無直接的前端頁面，主要用於開發與測試
3. 目前狀態：啟用中，主要用於開發期間的健康度檢查和測試
'''

router = APIRouter(
    tags=["test"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
def check_health():
    """檢查API應用程序的健康狀態"""
    return {"status": "healthy"}


@router.post("/echo")
async def echo(request: Request):
    """接收並回過請求體，用於測試POST請求"""
    try:
        body = await request.body()
        if not body:
            return {"message": "No body provided"}

        try:
            # 嘗試解析JSON
            data = json.loads(body)
            return {"echo": data, "type": "json"}
        except json.JSONDecodeError:
            # 不是JSON，只返回原始文本
            return {"echo": body.decode("utf-8"), "type": "text"}
    except Exception as e:
        return {"error": str(e)}


@router.get("/headers")
def get_headers(request: Request):
    """返回請求的全部頭信息，用於調試"""
    return {"headers": dict(request.headers)}


@router.options("/open")
def open_options():
    """返回CORS頭，允許跨域請求"""
    return PlainTextResponse(
        "OK",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
    )


@router.get("/open")
def open_endpoint():
    """開放的測試端點，允許跨域請求"""
    return JSONResponse(
        {"status": "ok", "message": "This endpoint is open for cross-origin requests"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        },
    )


@router.post("/open")
async def open_post(request: Request):
    """開放的POST測試端點，允許跨域請求"""
    try:
        body = await request.body()
        body_text = body.decode("utf-8") if body else ""

        return JSONResponse(
            {
                "status": "ok",
                "message": "Received your POST request",
                "body_length": len(body_text),
                "content": body_text[:100] + ("..." if len(body_text) > 100 else ""),
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            },
        )
    except Exception as e:
        return JSONResponse(
            {"status": "error", "message": str(e)},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            },
        )
