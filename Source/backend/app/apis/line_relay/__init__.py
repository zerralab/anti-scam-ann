from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import json
import databutton as db
import re

'''
1. API用途：LINE訊息中繼 API，负責接收並處理來自外部 LINE Bot webhook 的訊息中繼轉發
2. 關聯頁面：非直接關聯網頁頁面，而是為 LINE 機器人提供服務
3. 目前狀態：啟用中（接收並處理來自外部 LINE Bot webhook 的訊息）
'''

# 引入必要模塊
from app.apis.scam_utils import detect_scam, generate_response
from app.apis.line_bot import create_line_bot_api
from app.apis.usage_limits import check_usage_limits, UsageCheckRequest, update_user_usage, update_global_stats
from linebot.models import TextSendMessage

router = APIRouter(
    prefix="/line-relay",
    tags=["line-relay"],
    responses={404: {"description": "Not found"}},
)

# 安全驗證的密鑰常量
RELAY_API_KEY = "LINE_RELAY_API_KEY"

# 模型定義
class LineRelayEvent(BaseModel):
    type: str
    message: Optional[Dict[str, Any]] = None
    source: Optional[Dict[str, Any]] = None
    timestamp: Optional[int] = None
    reply_token: Optional[str] = None
    user_id: str
    
    class Config:
        schema_extra = {
            "example": {
                "type": "message",
                "message": {"type": "text", "text": "這是測試訊息"},
                "source": {"type": "user", "userId": "U1234567890abcdef"},
                "timestamp": 1612345678901,
                "reply_token": "abcdef1234567890",
                "user_id": "U1234567890abcdef"
            }
        }

class LineRelayRequest(BaseModel):
    api_key: str = Field(..., description="API key for authentication")
    events: List[LineRelayEvent] = Field(..., description="LINE events from external webhook")

class RelayResponse(BaseModel):
    success: bool
    message: str
    responses: Optional[List[Dict[str, Any]]] = None

# 輔助函數：驗證API密鑰
def verify_api_key(api_key: str) -> bool:
    """驗證提供的API密鑰是否有效"""
    try:
        stored_key = db.secrets.get(RELAY_API_KEY)
        return api_key == stored_key and stored_key != ""
    except Exception as e:
        print(f"驗證API密鑰時出錯: {str(e)}")
        return False

# 端點：設置API密鑰
@router.post("/setup-key", summary="設置中繼API密鑰", description="為外部webhook設置API密鑰")
async def setup_api_key(request: Dict[str, Any]):
    """設置用於外部webhook中繼的API密鑰"""
    try:
        if "api_key" not in request:
            raise HTTPException(status_code=400, detail="Missing api_key in request")
            
        api_key = request["api_key"]
        if not api_key or len(api_key) < 8:
            raise HTTPException(status_code=400, detail="API key must be at least 8 characters long")
            
        # 存儲API密鑰
        db.secrets.put(RELAY_API_KEY, api_key)
        return {"success": True, "message": "API key set successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set API key: {str(e)}")

# 端點：處理來自外部webhook的LINE事件
@router.post("/events", response_model=RelayResponse, summary="處理中繼事件", description="處理從外部webhook轉發的LINE事件")
async def process_relay_events(relay_request: LineRelayRequest):
    """處理從外部webhook轉發的LINE事件"""
    # 驗證API密鑰
    if not verify_api_key(relay_request.api_key):
        raise HTTPException(status_code=401, detail="Invalid API key")
        
    responses = []
    success_count = 0
    
    try:
        line_bot_api = create_line_bot_api()
        
        for event in relay_request.events:
            try:
                # 處理不同類型的事件
                if event.type == "message" and event.message and event.message.get("type") == "text":
                    # 處理文本消息
                    message_text = event.message.get("text", "")
                    
                    # 檢查使用限制
                    user_id = event.user_id
                    usage_result = check_usage_limits(UsageCheckRequest(
                        user_id=user_id,
                        channel="line_relay",
                        token_count=0,  # 先設為0，後續會更新實際的token使用量
                        message=message_text  # 傳送訊息內容以檢測緊急關鍵詞
                    ))
                    
                    if not usage_result.allowed:
                        # 使用限制已達限，回備提示訊息
                        limit_message = usage_result.message or "靜置時間到了！你最近的訊息較多，小安需要休息一下。留一點時間給其他人使用吧！"
                        
                        # 如果有reply_token，使用reply功能
                        if event.reply_token:
                            line_bot_api.reply_message(
                                event.reply_token,
                                TextSendMessage(text=limit_message)
                            )
                            response_info = {"type": "reply", "success": True}
                        else:
                            # 否則使用push消息
                            line_bot_api.push_message(
                                event.user_id,
                                TextSendMessage(text=limit_message)
                            )
                            response_info = {"type": "push", "success": True}
                            
                        success_count += 1
                        responses.append(response_info)
                        continue
                    
                    # 檢測詐騙並生成響應
                    is_scam, scam_info, matched_categories = detect_scam(message_text)
                    response_text = generate_response(scam_info, "text") if is_scam else generate_response(None)
                    
                    # 若為沒有詐騙的一般對話，使用簡單的token計算
                    estimated_tokens = len(message_text) + len(response_text)
                    # 使用粗略比例因子，一般來說很多LLM的token比字符數要多
                    token_estimate = int(estimated_tokens * 1.5)
                    
                    # 更新用戶和全局使用統計
                    update_user_usage(user_id, token_estimate)
                    update_global_stats(token_estimate)
                    
                    # 如果有reply_token，使用reply功能
                    if event.reply_token:
                        line_bot_api.reply_message(
                            event.reply_token,
                            TextSendMessage(text=response_text)
                        )
                        response_info = {"type": "reply", "success": True}
                    else:
                        # 否則使用push消息
                        line_bot_api.push_message(
                            event.user_id,
                            TextSendMessage(text=response_text)
                        )
                        response_info = {"type": "push", "success": True}
                        
                    # 記錄最近用戶ID
                    if event.user_id:
                        recent_users = db.storage.json.get("recent_line_users", default=[])
                        if event.user_id not in recent_users:
                            recent_users.append(event.user_id)
                            if len(recent_users) > 5:
                                recent_users = recent_users[-5:]
                            db.storage.json.put("recent_line_users", recent_users)
                    
                    success_count += 1
                elif event.type == "follow":
                    # 處理關注事件
                    welcome_message = (
                        "感謝您加入防詐小安！👋\n\n我是您的鄰家妹妹式防詐小幫手，隨時為您提供：\n\n"
                        "✅ 詐騙訊息分析與預警\n"
                        "✅ 個人化防詐建議\n"
                        "✅ 情感支持與協助\n\n"
                        "您可以隨時傳送可疑的訊息、連結或圖片給我分析，我會幫您判斷是否為詐騙，並提供保護建議。\n\n"
                        "有任何疑問或需要協助，請直接告訴我！"
                    )
                    
                    if event.reply_token:
                        line_bot_api.reply_message(
                            event.reply_token,
                            TextSendMessage(text=welcome_message)
                        )
                        response_info = {"type": "reply", "success": True}
                    else:
                        line_bot_api.push_message(
                            event.user_id,
                            TextSendMessage(text=welcome_message)
                        )
                        response_info = {"type": "push", "success": True}
                        
                    success_count += 1
                else:
                    # 未實現的事件類型
                    response_info = {"type": "unsupported", "event_type": event.type}
                    
                responses.append(response_info)
            except Exception as event_error:
                # 記錄單個事件處理錯誤
                responses.append({"type": "error", "error": str(event_error)})
        
        # 返回響應
        return RelayResponse(
            success=success_count > 0,
            message=f"Processed {success_count} of {len(relay_request.events)} events",
            responses=responses
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing events: {str(e)}")
