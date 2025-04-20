from fastapi import APIRouter, Depends, Header, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import requests
import json
import databutton as db
import hmac
import hashlib
import base64
import traceback
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import (
    MessageEvent, TextMessage, ImageMessage, TextSendMessage,
    SourceUser, SourceGroup, SourceRoom, FollowEvent
)

'''
1. API用途：LINE聊天機器人整合API，包含網絡銷、訊息傳送功能和用戶互動
2. 關聯頁面：無直接前端頁面，作為LINE聊天機器人的後台服務
3. 目前狀態：啟用中，是防詐小安聊天機器人的核心功能
'''

# Embedded scam detection functionality
from typing import Tuple
import re

# Import orchestrator and utility modules
from app.apis.emotional_response_orchestrator import orchestrate_response, generate_emotional_support_response
from app.apis.abuse_protection import check_abuse, AbuseCheckRequest
from app.apis.usage_limits import check_usage_limits, UsageCheckRequest, update_user_usage, update_global_stats

router = APIRouter(
    prefix="/line-bot",
    tags=["line-bot"],
    responses={404: {"description": "Not found"}},
)

# Constants for API documentation
API_SUMMARY = "LINE Bot API"
API_DESCRIPTION = "Integration with LINE Messaging API for bot configuration and messaging"

# Constants for external webhook integration
DEPLOYMENT_GUIDE = """
## 外部Webhook部署指南

為了讓LINE機器人能夠正常接收事件，您可以：

1. 在支持HTTPS的服務器上部署專用的webhook處理服務
2. 該服務接收LINE事件後，轉發到Databutton的/line-relay/events端點
3. 使用API密鑰進行安全驗證

範例外部webhook代碼請參閱網站的教學部分
"""

# Configuration keys
CHANNEL_SECRET_KEY = "LINE_CHANNEL_SECRET"
CHANNEL_ACCESS_TOKEN_KEY = "LINE_CHANNEL_ACCESS_TOKEN"
CHANNEL_ID_KEY = "LINE_CHANNEL_ID"

# Models
class LineCredentials(BaseModel):
    channel_id: str = Field(..., description="LINE Channel ID")
    channel_secret: str = Field(..., description="LINE Channel Secret")
    channel_access_token: str = Field(..., description="LINE Channel Access Token")

class LineWebhookRequest(BaseModel):
    destination: str
    events: List[Dict[str, Any]]

class LineMessageRequest(BaseModel):
    user_id: str = Field(..., description="Line user ID to send message to")
    message: str = Field(..., description="Message text to send")

class TestConnectionResponse(BaseModel):
    success: bool
    message: str
    details: Optional[Dict[str, Any]] = None

# Helpers
def get_line_credentials() -> Optional[LineCredentials]:
    """
    Retrieve LINE credentials from secrets storage
    """
    try:
        channel_id = db.secrets.get(CHANNEL_ID_KEY)
        channel_secret = db.secrets.get(CHANNEL_SECRET_KEY) 
        channel_access_token = db.secrets.get(CHANNEL_ACCESS_TOKEN_KEY)
        
        if not all([channel_id, channel_secret, channel_access_token]):
            return None
            
        return LineCredentials(
            channel_id=channel_id,
            channel_secret=channel_secret,
            channel_access_token=channel_access_token
        )
    except Exception as e:
        print(f"Error retrieving LINE credentials: {str(e)}")
        return None

# 導出核心功能以便外部模塊使用
__all__ = ['detect_scam', 'generate_response', 'analyze_image', 'create_line_bot_api', 'create_webhook_handler']

def create_line_bot_api():
    """
    Create and return a LineBotApi instance using stored credentials
    """
    credentials = get_line_credentials()
    if not credentials:
        raise HTTPException(status_code=400, detail="LINE credentials not configured")
    
    return LineBotApi(credentials.channel_access_token)

def create_webhook_handler():
    """
    Create and return a WebhookHandler instance using stored credentials
    """
    credentials = get_line_credentials()
    if not credentials:
        raise HTTPException(status_code=400, detail="LINE credentials not configured")
    
    return WebhookHandler(credentials.channel_secret)

# Endpoints
@router.post("/save-credentials", summary="Save Credentials", description="Save LINE bot credentials to the secrets storage")
async def save_credentials(credentials: LineCredentials):
    """
    Save LINE bot credentials to the secrets storage
    """
    try:
        db.secrets.put(CHANNEL_ID_KEY, credentials.channel_id)
        db.secrets.put(CHANNEL_SECRET_KEY, credentials.channel_secret)
        db.secrets.put(CHANNEL_ACCESS_TOKEN_KEY, credentials.channel_access_token)
        
        return {"success": True, "message": "LINE credentials saved successfully"}
    except Exception as e:
        print(f"Error saving LINE credentials: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to save credentials: {str(e)}"
        ) from e

@router.get("/credentials", summary="Get Credentials", description="Check if LINE credentials are configured")
async def get_credentials():
    """
    Check if LINE credentials are configured
    """
    credentials = get_line_credentials()
    
    if credentials:
        # Don't return actual credentials for security reasons
        return {"configured": True, "channel_id": credentials.channel_id}
    else:
        return {"configured": False}

# Add OPTIONS method for webhook to handle CORS preflight requests
@router.options("/webhook")
async def webhook_options():
    # 返回允許LINE平台訪問的CORS頭
    return {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, GET, OPTIONS",
        "access-control-allow-headers": "Content-Type, X-Line-Signature"
    }

@router.options("/alt-webhook")
async def alt_webhook_options():
    # 返回允許LINE平台訪問的CORS頭
    return {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, GET, OPTIONS",
        "access-control-allow-headers": "Content-Type, X-Line-Signature"
    }

@router.post("/alt-webhook", summary="Alternative Webhook", description="Alternative webhook endpoint for LINE integration")
async def alt_webhook(request: Request, x_line_signature: Optional[str] = Header(None)):
    """
    Alternative webhook endpoint that can be used if the main webhook URL has formatting issues
    This handles the request directly rather than forwarding to avoid potential CORS issues
    """
    print("=============== ALT-WEBHOOK CALLED ===============")
    print(f"Headers: {request.headers}")
    print(f"Method: {request.method}")
    print(f"URL Path: {request.url.path}")
    
    # 特別針對LINE平台驗證請求設計
    # 無條件返回200狀態碼及成功消息
    return {"status": "ok", "message": "Webhook endpoint is active"}
    
    # 注意：這只是一個簡化的版本，僅用於通過LINE平台的驗證
    # 一旦驗證成功，我們可以增強此處理程序以支持實際的消息處理

@router.post("/webhook", summary="Webhook", description="Handle LINE webhook calls.\nThis endpoint is called by LINE when events occur (messages, follows, etc.)")
async def webhook(request: Request, x_line_signature: Optional[str] = Header(None)):
    """
    Handle LINE webhook calls.
    This endpoint is called by LINE when events occur (messages, follows, etc.)
    """
    print("=============== WEBHOOK CALLED ===============")
    print(f"Headers: {request.headers}")
    print(f"Method: {request.method}")
    print(f"URL Path: {request.url.path}")
    
    # 始終返回成功響應，即使是驗證請求 - 這對LINE平台的webhook驗證至關重要
    # 這是處理LINE驗證webhook的關鍵
    
    # 檢查是否有請求體
    body = await request.body()
    body_text = body.decode('utf-8') if body else ""
    print(f"Webhook body length: {len(body_text)}")
    
    # 如果是空請求體或特別短的請求，這很可能是LINE的驗證請求
    # 直接返回成功響應，不進行額外處理
    if not body_text or len(body_text) < 10:
        print("Empty or very short body detected - this is likely a verification request")
        # 直接返回純文本的200 OK響應，這是LINE期望的驗證響應格式
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse("OK", status_code=200)
    
    # 對於有內容的請求，嘗試解析並處理
    # Enhanced logging: Try to parse the JSON and extract user information
    try:
        webhook_data = json.loads(body_text)
        events = webhook_data.get("events", [])
        for event in events:
            event_type = event.get("type")
            source = event.get("source", {})
            user_id = source.get("userId")
            print(f"EVENT DETAILS: Type={event_type}, UserID={user_id}")
            print(f"FULL EVENT: {json.dumps(event, indent=2)}")
            
            # Store the last few user IDs for testing purposes
            if user_id:
                recent_users = db.storage.json.get("recent_line_users", default=[])
                if not isinstance(recent_users, list):
                    recent_users = []
                
                # Add user ID if not already in the list
                if user_id not in recent_users:
                    recent_users.append(user_id)
                    # Keep only the last 5 users
                    if len(recent_users) > 5:
                        recent_users = recent_users[-5:]
                    db.storage.json.put("recent_line_users", recent_users)
                    print(f"Stored user ID {user_id} for future testing")
    except Exception as e:
        print(f"Error parsing webhook data: {str(e)}")
        # 即使解析失敗，也返回成功以避免LINE平台標記webhook為失敗
    
    # Try to process as a LINE webhook event even if signature is missing
    # This allows easier debugging
    credentials = get_line_credentials()
    if not credentials:
        print("ERROR: LINE credentials not configured")
        return {"status": "error", "message": "LINE credentials not configured"}
    
    # Create LINE API and webhook handler instances
    try:
        line_bot_api = LineBotApi(credentials.channel_access_token)
        handler = WebhookHandler(credentials.channel_secret)
    except Exception as e:
        print(f"Error creating LINE API client: {str(e)}")
        return {"status": "error", "message": f"Failed to initialize LINE client: {str(e)}"}
    
    # If we have a signature, verify it properly
    if x_line_signature:
        print(f"X-Line-Signature detected: {x_line_signature}")
    else:
        print("WARNING: No X-Line-Signature header found - cannot verify request authenticity")
        # We'll still try to process the request, but log a warning
    
    # Set up message event handler
    @handler.add(MessageEvent, message=TextMessage)
    def handle_text_message(event):
        try:
            print(f"Received text message: {event.message.text}")
            message_text = event.message.text
            user_id = event.source.user_id
            
            # -1. 檢查使用限制
            usage_result = check_usage_limits(UsageCheckRequest(
                user_id=user_id,
                channel="line",
                token_count=0  # 先設為0，後續會更新實際的token使用量
            ))
            
            if not usage_result.allowed:
                print(f"使用限制已達限！用戶: {user_id}, 冷卻時間: {usage_result.cooldown_remaining}秒")
                line_bot_api.reply_message(
                    event.reply_token,
                    TextSendMessage(text=usage_result.message or "靜置時間到了！你最近的訊息較多，小安需要休息一下。留一點時間給其他人使用吧！")
                )
                return
            
            # 0. 檢查惡意行為並處理可能的封禁
            abuse_check_result = check_abuse(AbuseCheckRequest(
                message=message_text,
                user_id=user_id,
                channel="line"
            ))
            
            if abuse_check_result.is_abusive:
                print(f"檢測到惡意行為！用戶: {user_id}, 行為: {abuse_check_result.action}, 違規次數: {abuse_check_result.violation_count}")
                line_bot_api.reply_message(
                    event.reply_token,
                    TextSendMessage(text=abuse_check_result.message or "抱歉，我無法回應這類型的訊息。請以尊重的方式溝通，謝謝。")
                )
                return
            
            # 使用統一的編排器來處理訊息
            print(f"使用編排器處理來自用戶 {user_id} 的訊息")
            # 獲取聊天歷史（如果有）- 未來可實現
            chat_history = None
            
            # 使用編排器決定回應類型
            response_type, context = orchestrate_response(message_text, user_id, chat_history)
            print(f"編排器決定的回應類型: {response_type}")
            
            # 根據不同回應類型生成相應的回應
            if response_type == "keyword_match":
                # 關鍵詞匹配
                response_message = context.get("response", "抱歉，我沒有理解您的訊息。請再說明一下您的問題？")
                print(f"關鍵詞匹配，返回預設回應: {response_message[:30]}...")
                
            elif response_type == "safety_violation":
                # 內容安全問題
                safety_result = context.get("safety_result", {})
                response_message = safety_result.get("rejection_response", "抱歉，您的訊息含有不適當內容，我無法回應。")
                print(f"內容安全檢查失敗: {safety_result.get('flagged_categories', [])}")
                
            elif response_type == "special_situation":
                # 特殊情境處理
                special_situation = context.get("special_situation", {})
                situation_rule = special_situation.get("rule")
                if situation_rule:
                    from app.apis.special_response import generate_special_response
                    response_message = generate_special_response(situation_rule)
                    print(f"檢測到特殊情境: {situation_rule.id if hasattr(situation_rule, 'id') else '未知'}")
                else:
                    response_message = "我了解您可能處於特殊情況，請告訴我更多詳情，我會盡力協助您。"
                
            elif response_type == "emotional_support" or response_type == "crisis":
                # 情緒支持或危機情況
                print(f"處理{response_type}情況，使用LLM生成支持性回應")
                try:
                    # 獲取Anthropic客戶端
                    from app.apis.ai_conversation import get_anthropic_client, get_system_prompt
                    client = get_anthropic_client()
                    
                    # 構建特殊系統提示
                    emotion_analysis = context.get("emotion_analysis", {})
                    primary_emotion = emotion_analysis.get("primary_emotion", "強烈情緒")
                    crisis_type = context.get("crisis_result", {}).get("crisis_type", "emotional_distress")
                    
                    crisis_prompt_additions = ""
                    if crisis_type == "suicide_risk":
                        crisis_prompt_additions = """
                        這是一個可能的自殺風險情況，你的回應至關重要：
                        1. 表達關心但不要顯得驚慌
                        2. 鼓勵用戶立即聯繫專業心理健康熱線 1925 或 1980
                        3. 提醒他們這些感受是暫時的，幫助是可得的
                        4. 避免長篇大論，提供簡潔、明確的支持
                        5. 保持尊重的態度，避免任何批判性言論
                        """
                    elif crisis_type == "immediate_danger":
                        crisis_prompt_additions = """
                        這是一個可能的人身安全威脅情況：
                        1. 鼓勵用戶立即報警 (110)
                        2. 引導他們尋找安全場所
                        3. 鼓勵與他人保持聯繫
                        4. 避免提供可能使情況惡化的建議
                        """
                    elif crisis_type == "severe_financial_distress":
                        crisis_prompt_additions = """
                        用戶可能經歷嚴重財務困境或詐騙損失：
                        1. 表達理解和支持，避免任何責備語氣
                        2. 提供實用的下一步建議（如報警、銀行止付）
                        3. 強調事情可以慢慢處理，鼓勵正視問題
                        4. 分享找專業金融或法律諮詢的資源
                        """
                    
                    support_prompt = f"""
                    你是「防詐小安」，一位16歲的高中生，從小學時期就與用戶住在同一條巷子裡的鄰家女孩。
                    
                    用戶正在經歷強烈的{primary_emotion}情緒。你的首要任務是提供情緒支持和理解。
                    
                    {crisis_prompt_additions}
                    
                    回應要點：
                    1. 用溫暖且理解的語氣，表達對用戶感受的理解和同理心
                    2. 強調用戶不是孤單的，你在這裡支持他/她
                    3. 提供1-2個簡單的、可以立即執行的建議
                    4. 避免過度樂觀或淡化用戶的情緒
                    5. 結尾表達持續支持的意願
                    
                    使用全形標點符號，保持溫暖友善的語氣，像對待真正朋友一樣交流。
                    
                    【重要】回覆必須非常簡短，總字數不超過100字。最多分成2個段落，每段只寫1-2句話。著重於你的同理心和最重要的1個建議。
                    
                    # 步驟必須明確編號
                    # 1. 使用明確的數字編號「1. 」「2. 」「3. 」
                    # 2. 避免使用符號列表，一律使用數字列表
                    # 3. 步驟說明用「步驟1：」（冒號用全形）
                    # 4. 確保所有回應使用全形標點符號，保持一致的格式。
                    """
                    
                    
                    # 調用LLM生成回應
                    response = client.messages.create(
                        model="claude-3-haiku-20240307",
                        max_tokens=600,
                        temperature=0.7,
                        system=support_prompt,
                        messages=[{"role": "user", "content": message_text}]
                    )
                    
                    response_message = response.content[0].text
                    print(f"LLM生成支持性回應成功：{response_message[:50]}...")
                    
                    # 計算token使用量
                    token_estimate = response.usage.input_tokens + response.usage.output_tokens
                except Exception as e:
                    print(f"生成支持性回應失敗: {str(e)}")
                    print(traceback.format_exc())
                    # 如果失敗，回退到基本回應
                    response_message = generate_emotional_support_response(context)
                    # 使用粗略估算的token量
                    token_estimate = int((len(message_text) + len(response_message)) * 1.5)
                
            elif response_type == "scam_alert" or response_type == "emotional_scam_hybrid":
                # 詐騙警告
                scam_analysis = context.get("scam_analysis", {})
                is_scam = scam_analysis.get("is_scam", False)
                scam_info = scam_analysis.get("scam_info")
                matched_categories = scam_analysis.get("matched_categories", [])
                
                # 使用從scam_detector導入的generate_response函數
                from app.apis.scam_detector import generate_response
                response_message = generate_response(scam_info, "text") if is_scam else "我沒有發現明顯的詐騙跡象，但仍建議您保持警覺。"
                print(f"詐騙檢測結果: {is_scam}, 類別: {matched_categories}")
                
            else:
                # 一般對話 - 使用LLM生成回應
                print("使用LLM生成一般對話回應")
                try:
                    # 獲取Anthropic客戶端
                    from app.apis.ai_conversation import get_anthropic_client, get_system_prompt, build_prompt
                    client = get_anthropic_client()
                    
                    # 構建系統提示和對話歷史
                    system_prompt = get_system_prompt(
                        is_scam=False,
                        scam_info=None,
                        matched_categories=None,
                        emotion_data=context.get("emotion_analysis", {}),
                        response_strategy=context.get("response_strategy", {})
                    )
                    
                    # 構建僅含當前訊息的簡化對話歷史
                    messages = [{"role": "user", "content": message_text}]
                    
                    # 調用Claude API生成回應
                    response = client.messages.create(
                        model="claude-3-haiku-20240307",
                        max_tokens=600,
                        temperature=0.7,
                        system=system_prompt,
                        messages=messages
                    )
                    
                    # 獲取生成的回應
                    if response and response.content and len(response.content) > 0:
                        response_message = response.content[0].text
                        print(f"LLM生成回應成功：{response_message[:50]}...")
                        
                        # 估算token用量
                        prompt_tokens = response.usage.input_tokens
                        completion_tokens = response.usage.output_tokens
                        token_estimate = prompt_tokens + completion_tokens
                    else:
                        print("LLM返回空回應，使用預設回應")
                        response_message = "您好！我是防詐小安。有什麼需要我協助的嗎？如果您收到可疑訊息，可以轉發給我來分析。"
                        # 使用預估的token量
                        token_estimate = int((len(message_text) + len(response_message)) * 1.5)
                except Exception as e:
                    print(f"使用LLM生成回應失敗: {str(e)}")
                    print(traceback.format_exc())
                    response_message = "您好！我是防詐小安。有什麼需要我協助的嗎？如果您收到可疑訊息，可以轉發給我來分析。"
                    # 使用預估的token量
                    token_estimate = int((len(message_text) + len(response_message)) * 1.5)
            
            # 估算token用量（LINE無法精確獲取，使用粗略估算方法）
            estimated_tokens = len(message_text) + len(response_message)
            # 使用粗略比例因子，一般來說Claude的token比字符數要多
            token_estimate = int(estimated_tokens * 1.5)
            
            # 更新用戶和全局使用統計
            update_user_usage(user_id, token_estimate)
            update_global_stats(token_estimate)
            
            # Send response back to the user
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(text=response_message)
            )
        except Exception as e:
            print(f"Error handling text message: {str(e)}")
            print(traceback.format_exc())
            # Reply with a fallback message
            try:
                line_bot_api.reply_message(
                    event.reply_token,
                    TextSendMessage(text="很抱歉，我處理您的訊息時發生了問題。請稍後再試。")
                )
            except Exception as reply_err:
                print(f"Failed to send error message: {str(reply_err)}")  # Log but continue
    
    @handler.add(MessageEvent, message=ImageMessage)
    def handle_image_message(event):
        try:
            print("Received image message")
            
            # Get message ID and log it for debugging/future reference
            message_id = event.message.id
            print(f"Received image with ID: {message_id}")
            
            # Note: We're not currently downloading or analyzing the image content, but in the future
            # we could process it with: content = line_bot_api.get_message_content(message_id)
            
            # For now, we respond with a generic message for images
            # In the future, we could implement image analysis
            response_message = "謝謝您傳送圖片。我正在學習如何分析圖片中的詐騙風險。若您擔心這張圖片可能有風險，請先不要點擊其中任何連結，並謹慎對待其中的資訊。"
            
            # Send response back to the user
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(text=response_message)
            )
        except Exception as e:
            print(f"Error handling image message: {str(e)}")
            print(traceback.format_exc())
            # Reply with a fallback message
            try:
                line_bot_api.reply_message(
                    event.reply_token,
                    TextSendMessage(text="很抱歉，我處理您的圖片時發生了問題。請稍後再試。")
                )
            except Exception as reply_err:
                print(f"Failed to send error message: {str(reply_err)}")  # Log but continue
    
    # Handle follow event (when user adds the bot as a friend)
    @handler.add(FollowEvent)
    def handle_follow(event):
        try:
            user_id = event.source.user_id
            print(f"New follower: {user_id}")
            
            # Send welcome message
            welcome_message = (
                "感謝您加入防詐小安！👋\n\n我是您的鄰家妹妹式防詐小幫手，隨時為您提供：\n\n"
                "✅ 詐騙訊息分析與預警\n"
                "✅ 個人化防詐建議\n"
                "✅ 情感支持與協助\n\n"
                "您可以隨時傳送可疑的訊息、連結或圖片給我分析，我會幫您判斷是否為詐騙，並提供保護建議。\n\n"
                "有任何疑問或需要協助，請直接告訴我！"
            )
            
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(text=welcome_message)
            )
        except Exception as e:
            print(f"Error handling follow event: {str(e)}")
            print(traceback.format_exc())
    
    # Process webhook event
    try:
        handler.handle(body_text, x_line_signature)
        return {"success": True}
    except InvalidSignatureError as e:
        raise HTTPException(
            status_code=400, 
            detail="Invalid signature"
        ) from e
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Webhook processing error: {str(e)}"
        ) from e

@router.post("/test-connection", response_model=TestConnectionResponse, summary="Test Connection", description="Test the connection to LINE Messaging API using stored credentials")
async def test_connection():
    """
    Test the connection to LINE Messaging API using stored credentials
    """
    credentials = get_line_credentials()
    if not credentials:
        return TestConnectionResponse(
            success=False,
            message="LINE credentials not configured",
            details={"error": "Missing credentials"}
        )
    
    try:
        # Create a LINE Bot API instance
        line_bot_api = LineBotApi(credentials.channel_access_token)
        
        # Get bot information (simple API call to test connection)
        bot_info = line_bot_api.get_bot_info()
        
        return TestConnectionResponse(
            success=True,
            message="Successfully connected to LINE Messaging API",
            details={
                "bot_name": bot_info.display_name,
                "picture_url": bot_info.picture_url if hasattr(bot_info, 'picture_url') else None,
            }
        )
    except Exception as e:
        error_message = str(e)
        print(f"Error testing LINE connection: {error_message}")
        return TestConnectionResponse(
            success=False,
            message="Failed to connect to LINE Messaging API",
            details={"error": error_message}
        )

@router.post("/send-message", summary="Send Message", description="Send a test message to a specific user")
async def send_message(message_request: LineMessageRequest):
    """
    Send a test message to a specific user
    """
    try:
        print(f"Attempting to send message to user ID: {message_request.user_id}")
        print(f"Message content: {message_request.message}")
        
        # 檢查用戶ID是否符合預期格式
        if not message_request.user_id.startswith("U") or len(message_request.user_id) < 10:
            return {
                "success": False, 
                "message": "Invalid user ID format. LINE user IDs typically start with 'U' and are longer than 10 characters."
            }
        
        # 創建API客戶端
        line_bot_api = create_line_bot_api()
        
        # 檢查用戶是否已關注機器人 (這不是必須的，但可以提供更明確的錯誤消息)
        try:
            profile = line_bot_api.get_profile(message_request.user_id)
            print(f"User profile retrieved: {profile.display_name}")
        except Exception as profile_err:
            print(f"Error getting user profile: {str(profile_err)}")
            # 不中斷流程，繼續嘗試發送
        
        # 嘗試發送消息
        response = line_bot_api.push_message(
            message_request.user_id, 
            TextSendMessage(text=message_request.message)
        )
        print(f"LINE API response: {response}")
        
        return {"success": True, "message": "Message sent successfully"}
    except Exception as e:
        error_message = str(e)
        error_traceback = traceback.format_exc()
        print(f"Error sending message: {error_message}")
        print(f"Traceback: {error_traceback}")
        
        # 檢查是否是友誼狀態問題
        if "Failed to send messages" in error_message:
            info_message = "這可能是因為用戶尚未將機器人添加為好友，或者機器人的推送消息功能受到限制。請確保用戶已添加機器人為好友。"
        else:
            info_message = ""
        
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to send message: {error_message}. {info_message}"
        ) from e

@router.get("/recent-users", summary="Get Recent Users", description="Get a list of recent LINE users who have interacted with the bot")
async def get_recent_users():
    """
    Get a list of recent LINE users who have interacted with the bot
    This is useful for testing the send-message endpoint
    """
    try:
        recent_users = db.storage.json.get("recent_line_users", default=[])
        return {"users": recent_users, "count": len(recent_users)}
    except Exception as e:
        print(f"Error getting recent users: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recent users: {str(e)}"
        ) from e