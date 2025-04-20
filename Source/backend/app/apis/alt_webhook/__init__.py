from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json
import databutton as db
import traceback

'''
1. API用途：LINE訊息的替代接收端點，為LINE訊息提供簡化路徑的webhook處理
2. 關聯頁面：LINE聊天機器人服務，無特定後台頁面關聯
3. 目前狀態：啟用中，用於接收LINE消息並處理防詐相關訊息
'''

# 導入相關功能
from app.apis.scam_utils import detect_scam, generate_response
from app.apis.line_bot import create_line_bot_api
from linebot.models import TextSendMessage

router = APIRouter(
    tags=["webhook"],
    responses={404: {"description": "Not found"}},
)

# 安全驗證密鑰
def verify_api_key(api_key: str) -> bool:
    """Validate the provided API key"""
    try:
        stored_key = db.secrets.get("LINE_RELAY_API_KEY")
        return api_key == stored_key and stored_key != ""
    except Exception as e:
        print(f"驗證API密鑰時出錯: {str(e)}")
        return False

# 預檢請求處理
@router.options("/alt")
async def alt_webhook_options2():
    """Handle CORS preflight requests"""
    return JSONResponse(
        {"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, User-Agent, X-Line-Signature",
        },
    )

# 替代的webhook端點，使用簡單路徑
@router.post("/alt")
async def alt_webhook2(request: Request):
    """Alternative webhook with simpler path for external services"""
    try:
        # 先從Authorization頭部檢查API密鑰
        auth_header = request.headers.get("Authorization", "")
        api_key = ""
        
        # 解析Authorization頭部
        if auth_header.startswith("Bearer "):
            api_key = auth_header.replace("Bearer ", "")
            print("Found API key in Authorization header")
        
        # 取得請求體
        raw_body = await request.body()
        body_str = raw_body.decode("utf-8") if raw_body else "{}"
        
        print(f"Received webhook request: {body_str[:200]}...")
        
        # 如果頭部沒有API密鑰，則嘗試從請求體讀取
        if not api_key:
            try:
                body_data = json.loads(body_str)
                # 從請求體取得API密鑰（兼容舊方式）
                api_key = body_data.get("api_key", "")
                if api_key:
                    print("Found API key in request body")
            except json.JSONDecodeError:
                return {"status": "error", "message": "Invalid JSON"}
        
        # 驗證API密鑰
        if not verify_api_key(api_key):
            return {"status": "error", "message": "Invalid API key", "code": 401}
        
        # 匯入LINE API客戶端
        line_bot_api = create_line_bot_api()
        
        # 取得事件
        events = body_data.get("events", [])
        if not events:
            return {"status": "ok", "message": "No events received"}
        
        print(f"Processing {len(events)} events")
        
        results = []
        for event in events:
            # 確保事件有類型
            event_type = event.get("type")
            if not event_type:
                results.append({"status": "error", "message": "Event missing type"})
                continue
                
            # 只處理訊息類型的事件
            if event_type == "message" and "message" in event:
                message = event.get("message", {})
                message_type = message.get("type")
                
                # 取得用戶ID - 支持多種格式
                user_id = event.get("user_id") or event.get("source", {}).get("userId")
                reply_token = event.get("reply_token")
                
                # 處理文本訊息
                if message_type == "text":
                    message_text = message.get("text", "")
                    
                    print(f"Processing message from {user_id}: {message_text[:50]}...")
                    
                    # 判斷是否為詐騙訊息
                    is_scam, scam_info, matched_categories = detect_scam(message_text)
                    
                    # 生成回應
                    response_text = generate_response(scam_info, "text") if is_scam else generate_response(None)
                    
                    # 回覆用戶
                    try:
                        if reply_token:
                            line_bot_api.reply_message(
                                reply_token,
                                TextSendMessage(text=response_text)
                            )
                            status = "replied"
                        elif user_id:
                            line_bot_api.push_message(
                                user_id,
                                TextSendMessage(text=response_text)
                            )
                            status = "pushed"
                        else:
                            status = "error - no reply token or user ID"
                            
                        results.append({
                            "user_id": user_id,
                            "is_scam": is_scam,
                            "status": status
                        })
                    except Exception as msg_err:
                        print(f"Error sending message: {str(msg_err)}")
                        results.append({
                            "user_id": user_id,
                            "status": "failed",
                            "error": str(msg_err)
                        })
                else:
                    results.append({
                        "message_type": message_type,
                        "status": "unsupported_message_type"
                    })
            else:
                results.append({
                    "type": event_type,
                    "status": "unsupported_event_type"
                })
        
        return {
            "status": "ok", 
            "message": f"Successfully processed {len(results)} events",
            "results": results
        }
    except Exception as e:
        error_detail = str(e) + "\n" + traceback.format_exc()
        print(f"Error processing webhook: {error_detail}")
        return {
            "status": "error",
            "message": "Error processing events",
            "error": str(e)
        }
