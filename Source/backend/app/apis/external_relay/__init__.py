from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import databutton as db

'''
1. API用途：LINE事件中繼服務，允許外部服務轉發LINE事件到此應用程式並處理回應
2. 關聯頁面：無直接的前端頁面，為外部LINE機器人整合提供的API
3. 目前狀態：啟用中，用於接收寄存在其他服務上的LINE訊息
'''

# 引入LINE機器人的核心功能
from app.apis.line_bot import create_line_bot_api
from app.apis.emotional_response_orchestrator import orchestrate_response, generate_emotional_support_response
from linebot.models import TextSendMessage

router = APIRouter(
    tags=["external-relay"],
    responses={404: {"description": "Not found"}},
)

# 安全驗證的密鑰常量
RELAY_API_KEY = "LINE_RELAY_API_KEY"

# 中繼事件模型
class ExternalRelayEvent(BaseModel):
    type: str
    message: Optional[Dict[str, Any]] = None
    source: Optional[Dict[str, Any]] = None
    timestamp: Optional[int] = None
    reply_token: Optional[str] = None
    user_id: str

class ExternalRelayRequest(BaseModel):
    api_key: str
    events: List[ExternalRelayEvent]

# 驗證API密鑰
def verify_api_key(api_key: str) -> bool:
    """驗證提供的API密鑰是否有效"""
    stored_key = db.secrets.get(RELAY_API_KEY, "")
    return api_key == stored_key and stored_key != ""

# CORS預檢處理
@router.options("/webhook/line")
async def external_line_webhook_options():
    """處理外部LINE Webhook中繼端點的CORS預檢請求"""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        {"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
    )

# 端點：處理中繼事件
@router.post("/webhook/line")
async def external_line_webhook(request: Request):
    """外部LINE Webhook中繼端點，允許其他服務轉發LINE事件"""
    try:
        # 解析請求體以進行API密鑰驗證
        raw_body = await request.body()
        body_str = raw_body.decode("utf-8") if raw_body else "{}"
        
        print(f"收到外部中繼請求：{body_str[:200]}...")
        
        try:
            body_data = json.loads(body_str)
        except json.JSONDecodeError:
            return {"status": "error", "message": "無效的JSON格式"}
        
        # 驗證API密鑰
        api_key = body_data.get("api_key", "")
        if not verify_api_key(api_key):
            return {"status": "error", "message": "無效的API密鑰", "code": 401}
        
        # 創建LINE API客戶端
        line_bot_api = create_line_bot_api()
        
        # 取得事件列表
        events = body_data.get("events", [])
        
        # 記錄接收到的事件數量
        event_count = len(events)
        if event_count == 0:
            return {"status": "ok", "message": "未收到事件"}
        
        print(f"處理 {event_count} 個外部中繼事件")
        
        results = []
        for event in events:
            # 確保事件有類型
            event_type = event.get("type")
            if not event_type:
                results.append({"status": "error", "message": "事件缺少類型"})
                continue
                
            # 只處理訊息類型的事件
            if event_type == "message" and "message" in event:
                message = event.get("message", {})
                message_type = message.get("type")
                
                # 獲取用戶ID - 支持多種格式
                user_id = event.get("user_id") or event.get("source", {}).get("userId")
                reply_token = event.get("reply_token")
                
                # 處理文本訊息
                if message_type == "text":
                    message_text = message.get("text", "")
                    
                    print(f"處理來自 {user_id} 的訊息：{message_text[:50]}...")
                    
                    # 使用統一的編排器來決定回應策略和生成回應
                    print(f"使用編排器處理來自用戶 {user_id} 的訊息")
                    # 獲取聊天歷史（如果有）
                    chat_history = None  # 在未來可以實現聊天歷史記錄功能
                    
                    # 使用編排器決定回應類型
                    response_type, context = orchestrate_response(message_text, user_id, chat_history)
                    print(f"編排器決定的回應類型: {response_type}")
                    
                    # 根據不同回應類型生成相應的回應
                    if response_type == "keyword_match":
                        # 關鍵詞匹配直接返回預設回應
                        response_text = context.get("response", "抱歉，我沒有理解您的訊息。請再說明一下您的問題？")
                        print(f"關鍵詞匹配，返回預設回應: {response_text[:30]}...")
                    
                    elif response_type == "safety_violation":
                        # 內容安全問題
                        safety_result = context.get("safety_result", {})
                        response_text = safety_result.get("rejection_response", "抱歉，您的訊息含有不適當內容，我無法回應。")
                        print(f"內容安全檢查失敗: {safety_result.get('flagged_categories', [])}")
                    
                    elif response_type == "special_situation":
                        # 特殊情境處理
                        special_situation = context.get("special_situation", {})
                        situation_rule = special_situation.get("rule")
                        if situation_rule:
                            from app.apis.special_response import generate_special_response
                            response_text = generate_special_response(situation_rule)
                            print(f"檢測到特殊情境: {situation_rule.id if hasattr(situation_rule, 'id') else '未知'}")
                        else:
                            response_text = "我了解您可能處於特殊情況，請告訴我更多詳情，我會盡力協助您。"
                    
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
                            """
                            
                            
                            # 調用LLM生成回應
                            response = client.messages.create(
                                model="claude-3-haiku-20240307",
                                max_tokens=600,
                                temperature=0.7,
                                system=support_prompt,
                                messages=[{"role": "user", "content": message_text}]
                            )
                            
                            # 確保回應使用全形標點符號並處理換行格式
                            response_text = response.content[0].text
                            # 移除多餘的換行以保持一致性
                            response_text = response_text.replace('\n\n\n', '\n').replace('\n\n', '\n')
                            print(f"LLM生成支持性回應成功：{response_text[:50]}...")
                        except Exception as e:
                            print(f"生成支持性回應失敗: {str(e)}")
                            # 如果失敗，回退到基本回應
                            response_text = generate_emotional_support_response(context)
                    
                    elif response_type == "scam_alert" or response_type == "emotional_scam_hybrid":
                        # 詐騙警告
                        scam_analysis = context.get("scam_analysis", {})
                        is_scam = scam_analysis.get("is_scam", False)
                        scam_info = scam_analysis.get("scam_info")
                        matched_categories = scam_analysis.get("matched_categories", [])
                        
                        # 使用從scam_detector導入的generate_response函數
                        from app.apis.scam_detector import generate_response
                        response_text = generate_response(scam_info, "text") if is_scam else "我沒有發現明顯的詐騙跡象，但仍建議您保持警覺。"
                        print(f"詐騙檢測結果: {is_scam}, 類別: {matched_categories}")
                    
                    else:
                        # 一般對話 - 使用LLM生成回應
                        print("使用LLM生成一般對話回應")
                        try:
                            # 獲取Anthropic客戶端
                            from app.apis.ai_conversation import get_anthropic_client, get_system_prompt
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
                                response_text = response.content[0].text
                                print(f"LLM生成回應成功：{response_text[:50]}...")
                                
                                # 更新is_scam變量以正確提供結果
                                is_scam = False
                                matched_categories = []
                            else:
                                print("LLM返回空回應，使用預設回應")
                                response_text = "您好！我是防詐小安。有什麼需要我協助的嗎？如果您收到可疑訊息，可以轉發給我來分析。"
                                is_scam = False
                                matched_categories = []
                        except Exception as e:
                            print(f"使用LLM生成回應失敗: {str(e)}")
                            import traceback
                            print(traceback.format_exc())
                            response_text = "您好！我是防詐小安。有什麼需要我協助的嗎？如果您收到可疑訊息，可以轉發給我來分析。"
                            is_scam = False
                            matched_categories = []
                    
                    # 回覆用戶
                    if reply_token:
                        try:
                            line_bot_api.reply_message(
                                reply_token,
                                TextSendMessage(text=response_text)
                            )
                            results.append({
                                "user_id": user_id,
                                "is_scam": is_scam,
                                "categories": matched_categories,
                                "status": "replied"
                            })
                        except Exception as reply_err:
                            print(f"回覆訊息失敗：{str(reply_err)}")
                            # 如果回覆失敗但有用戶ID，嘗試使用push message
                            if user_id:
                                try:
                                    line_bot_api.push_message(
                                        user_id,
                                        TextSendMessage(text=response_text)
                                    )
                                    results.append({
                                        "user_id": user_id,
                                        "is_scam": is_scam,
                                        "categories": matched_categories,
                                        "status": "pushed_after_reply_failed"
                                    })
                                except Exception as push_err:
                                    results.append({
                                        "user_id": user_id,
                                        "status": "failed",
                                        "error": str(push_err)
                                    })
                            else:
                                results.append({
                                    "status": "failed",
                                    "error": str(reply_err)
                                })
                    elif user_id:
                        # 如果沒有reply_token但有用戶ID，使用push message
                        try:
                            line_bot_api.push_message(
                                user_id,
                                TextSendMessage(text=response_text)
                            )
                            results.append({
                                "user_id": user_id,
                                "is_scam": is_scam,
                                "categories": matched_categories,
                                "status": "pushed"
                            })
                        except Exception as push_err:
                            results.append({
                                "user_id": user_id,
                                "status": "failed",
                                "error": str(push_err)
                            })
                    else:
                        results.append({
                            "status": "error",
                            "message": "缺少reply_token和user_id，無法回覆用戶"
                        })
                else:
                    results.append({
                        "type": event_type,
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
            "message": f"成功處理 {len(results)} 個事件",
            "processed": results
        }
        
    except Exception as e:
        import traceback
        error_detail = str(e) + "\n" + traceback.format_exc()
        print(f"處理外部中繼事件時發生錯誤：{error_detail}")
        return {
            "status": "error",
            "message": "處理事件時發生錯誤",
            "error": str(e),
            "detail": error_detail
        }

# 端點：測試連線
@router.get("/ping")
def external_ping():
    """測試連線狀態的端點"""
    return {"status": "ok", "message": "External relay API is working!"}

# 端點：設置API密鑰
@router.post("/setup-key")
async def external_setup_api_key(request: Dict[str, Any]):
    """設置用於外部webhook中繼的API密鑰"""
    try:
        if "api_key" not in request:
            raise HTTPException(status_code=400, detail="Missing api_key in request")
            
        api_key = request["api_key"]
        if not api_key or len(api_key) < 8:
            raise HTTPException(status_code=400, detail="API key must be at least 8 characters long")
        
        # 將密鑰存儲到安全存儲中
        db.secrets.put(RELAY_API_KEY, api_key)
        
        return {"status": "ok", "message": "已成功設置API密鑰"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
