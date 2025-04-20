from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import re
import json
import databutton as db

'''
1. API用途：特殊回應 API，處理需要特殊關注的情境，如自殺危機、詐騙受害、群組標記和情緒支持
2. 關聯頁面：後台管理頁面中的「特殊回應設定」頁面
3. 目前狀態：暫時關閉（detect_situation函數被修改為直接返回無特殊情境的結果），
   此功能關閉是為了配合純LLM模式的測試，避免影響測試結果
'''

# Import existing modules
from app.apis.emotional_support import get_emotional_support_message

# 內容安全檢查函數（已移除原模組導入）
def check_content_safety(text):
    """備用內容安全檢查函數"""
    return {"is_safe": True, "flagged_categories": [], "alert_level": "none", "rejection_response": None, "processing_time": 0.0}

# Create an API router with proper endpoints and documentation
router = APIRouter(
    prefix="/special-response",
    tags=["special-response"],
    responses={404: {"description": "Not found"}}
)

class SpecialSituationRequest(BaseModel):
    text: str = Field(..., description="User's message text to analyze")
    user_id: Optional[str] = Field(None, description="User ID for context lookup")
    is_group: bool = Field(False, description="Whether the message is from a group chat")
    language: str = Field("zh", description="Preferred language for response (zh, en)")

class SpecialSituationResponse(BaseModel):
    situation_detected: bool = Field(..., description="Whether a special situation was detected")
    situation_type: Optional[str] = Field(None, description="Type of situation detected if any")
    response: Optional[str] = Field(None, description="Appropriate response for the situation")
    emergency_level: str = Field("none", description="Emergency level (none, low, medium, high)")
    action_needed: Optional[Dict[str, Any]] = Field(None, description="Recommended actions if any")

class SpecialResponseRule(BaseModel):
    id: str = Field(..., description="Unique identifier for the rule")
    name: str = Field(..., description="Name of the rule")
    description: str = Field(..., description="Description of the rule and when it applies")
    patterns: List[str] = Field(..., description="Regex patterns to match for this situation")
    response_templates: Dict[str, List[str]] = Field(..., description="Response templates by language")
    emergency_level: str = Field("low", description="Emergency level for this situation")
    action_type: Optional[str] = Field(None, description="Type of action recommended")
    enabled: bool = Field(True, description="Whether this rule is enabled")

class SpecialResponseConfig(BaseModel):
    rules: List[SpecialResponseRule] = Field(..., description="List of special response rules")
    system_enabled: bool = Field(True, description="Whether the special response system is enabled")
    last_updated: str = Field(..., description="When the configuration was last updated")

# Default configuration
# Default configuration
DEFAULT_CONFIG = {
    "rules": [
        {
            "id": "suicide_crisis",
            "name": "自殺危機",
            "description": "用戶表達自殺意向或危機信息",
            "patterns": [
                r"\b(?:自殺|不想活了|想結束生命|不如死了|我就去死|想跳樓|我想死|不想活|活不下去|沒意思|沒價值|活著沒意義)\b",
                r"\b(?:suicide|kill myself|end my life|want to die|rather be dead|jump off|no point living)\b"
            ],
            "response_templates": {
                "zh": [
                    "聽你這麼說，我好擔心你。這種感受很難熬，但不用一個人面對。\n\n步驟1: 立即撥打1925或1995專線，有專業人員隨時願意聽你說話\n步驟2: 告訴他們你的感受，不需要隱藏或害怕\n\n最近發生什麼讓你這麼難過？我在這裡陪你。",
                    "謝謝你願意跟我說這些，需要很大的勇氣。\n\n步驟1: 請立即聯繫1925或1995專線尋求專業協助\n步驟2: 如果你願意，可以告訴我更多，我會陪著你\n\n今天有什麼特別的事讓你感到痛苦嗎？"
                ],
                "en": [
                    "I'm worried about you. These feelings are really tough, but you don't have to face them alone.\n\nStep 1: Call the 1925 or 1995 hotlines right away for professional support\nStep 2: Share your feelings with them openly - it's okay to ask for help\n\nWhat's been going on that's making you feel this way? I'm here for you.",
                    "Thank you for sharing this with me - that takes courage.\n\nStep 1: Please contact the 1925 or 1995 hotlines immediately\nStep 2: If you feel comfortable, tell me more about what's happening\n\nDid something specific happen today that's causing you pain?"
                ]
            },
            "emergency_level": "high",
            "action_type": "hotline_referral",
            "enabled": True
        },
        {
            "id": "scam_victim",
            "name": "詐騙受害者",
            "description": "用戶表達已經受到詐騙或損失金錢",
            "patterns": [
                r"\b(?:被騙了|上當了|騙走了|掛了|損失了|轉了|已經轉賬|不知道處理|怕家人知道|要我怎麼辦|沒有錢|搶救)\b.{0,30}?\b(?:錢|元|塊|款|安全碎|測試金|備付金|身分證|密碼|資料)\b",
                r"\b(?:I was|I've been|got)\b.{0,30}?\b(?:scammed|tricked|duped|defrauded|swindled|cheated)\b"
            ],
            "response_templates": {
                "zh": [
                    "被騙真的很難過，你願意說出來很勇敢。\n\n步驟1: 立即撥打165反詐騙專線報案\n步驟2: 保存所有對話和交易紀錄作為證據\n步驟3: 如果已轉帳，立即聯繫銀行嘗試止付\n\n你已經採取什麼行動了嗎？",
                    "被騙不是你的錯，詐騙手法真的很狡猾。\n\n步驟1: 撥打165反詐騙專線尋求專業協助\n步驟2: 向當地警察局報案\n\n方便分享一下詐騙過程嗎？或許能幫助其他人避免同樣情況。"
                ],
                "en": [
                    "Being scammed is really tough, and you're brave to talk about it.\n\nStep 1: Call the 165 anti-fraud hotline immediately\nStep 2: Save all conversations and transaction records as evidence\nStep 3: If you've transferred money, contact your bank to try to stop payment\n\nHave you taken any action so far?",
                    "This isn't your fault - scammers are very clever.\n\nStep 1: Contact the 165 anti-fraud hotline for help\nStep 2: Report to your local police station\n\nWould you mind sharing what happened? It might help others avoid similar situations."
                ]
            },
            "emergency_level": "medium",
            "action_type": "police_report",
            "enabled": True
        },
        {
            "id": "group_tag",
            "name": "群組標記",
            "description": "小安被群組標記或呼叫",
            "patterns": [
                r"@防詐小安",
                r"@小安",
                r"@安安",
                r"@?防詐大使",
                r"@Anti-?Scam"
            ],
            "response_templates": {
                "zh": [
                    "嗨！我是防詐小安。\n\n有疑似詐騙訊息想分析？\n或是想了解如何保護自己免受詐騙？\n\n請直接告訴我，很高興能幫忙！",
                    "你好！我是防詐小安。\n\n步驟1: 將可疑訊息或截圖分享給我\n步驟2: 告訴我您的問題或疑慮\n\n我會立即協助您分析並提供建議！"
                ],
                "en": [
                    "Hi! I'm Anti-Scam Xiao An.\n\nDo you have suspicious messages to analyze?\nOr want to learn how to protect yourself from scams?\n\nJust let me know, happy to help!",
                    "Hello! I'm Anti-Scam Xiao An.\n\nStep 1: Share any suspicious messages or screenshots with me\nStep 2: Tell me your questions or concerns\n\nI'll analyze them right away and provide guidance!"
                ]
            },
            "emergency_level": "none",
            "action_type": None,
            "enabled": True
        },
        {
            "id": "emotional_support",
            "name": "情緒支持",
            "description": "用戶表達負面情緒或需要支持",
            "patterns": [
                r"\b(?:難過|傷心|沮喪|憂鬱|焦慮|壓力|緊張|害怕|恐懼|孤單|寂寞|無助|絕望|寂寞|沒有人關心|沒人關心|沒人理|沒人懂|不被在意|沒有在意|私人問題|想不開|好累|累了|撐不住|太痛苦|好痛苦)\b",
                r"\b(?:sad|depressed|anxious|stressed|nervous|scared|afraid|lonely|helpless|hopeless|no one cares|nobody understands|nobody loves)\b"
            ],
            "response_templates": {
                "zh": [
                    "聽你說心情不好，謝謝願意分享。\n\n步驟1: 先深呼吸幾次，讓自己平靜一下\n步驟2: 分享讓你感到不好的事情，我會認真聆聽\n\n想聊聊發生什麼事嗎？或者只是想有人聽你說說也可以。",
                    "心情不好的時候真的很難受，你的感受很重要。\n\n步驟1: 嘗試說出具體讓你難過的事\n步驟2: 想想有什麼小事可以讓你現在感覺好一點\n\n願意一起聊聊嗎？我在這裡支持你。"
                ],
                "en": [
                    "I hear you're not feeling great. Thanks for sharing that with me.\n\nStep 1: Take a few deep breaths to calm yourself\nStep 2: Share what's bothering you, I'm here to listen\n\nWant to talk about what happened? Or maybe you just need someone to listen?",
                    "It's tough when you're feeling down. Your feelings are totally valid.\n\nStep 1: Try to identify what specifically is making you feel this way\nStep 2: Think of small things that might make you feel a little better right now\n\nWant to chat about it? I'm here to support you."
                ]
            },
            "emergency_level": "low",
            "action_type": None,
            "enabled": True
        }
    ],
    "system_enabled": True,
    "last_updated": "2025-03-01T00:00:00Z"
}

# Storage key for configuration
CONFIG_STORAGE_KEY = "special_response_config"

def get_config() -> SpecialResponseConfig:
    """
    Get current configuration, loading from storage or using defaults
    """
    try:
        # Try to load from storage
        config_json = db.storage.json.get(CONFIG_STORAGE_KEY)
        return SpecialResponseConfig(**config_json)
    except Exception as e:
        print(f"Error loading special response config: {str(e)}. Using defaults.")
        # Return default config if not found
        return SpecialResponseConfig(**DEFAULT_CONFIG)

def save_config(config: SpecialResponseConfig) -> bool:
    """
    Save configuration to storage
    """
    try:
        # Sanitize the storage key to ensure it's valid
        sanitized_key = re.sub(r'[^a-zA-Z0-9._-]', '', CONFIG_STORAGE_KEY)
        
        # Convert to dict and save
        config_dict = config.dict()
        db.storage.json.put(sanitized_key, config_dict)
        return True
    except Exception as e:
        print(f"Error saving special response config: {str(e)}")
        return False

def detect_special_situation(text: str, is_group: bool = False) -> Tuple[bool, Optional[SpecialResponseRule]]:
    """
    Detect if the text indicates a special situation
    
    Args:
        text: The user's message text
        is_group: Whether the message is from a group chat
        
    Returns:
        Tuple containing whether a situation was detected and the matching rule if any
    """
    # Get current configuration
    config = get_config()
    
    # If system is disabled, return immediately
    if not config.system_enabled:
        return False, None
    
    # Skip detection for empty messages
    if not text or not text.strip():
        return False, None
    
    # Check each enabled rule
    for rule in config.rules:
        # Skip disabled rules
        if not rule.enabled:
            continue
            
        # Skip group tag detection in 1:1 chats
        if rule.id == "group_tag" and not is_group:
            continue
            
        # Check patterns
        for pattern in rule.patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True, rule
    
    return False, None

def generate_special_response(situation_rule: SpecialResponseRule, language: str = "zh") -> str:
    """
    Generate an appropriate response for the detected special situation
    
    Args:
        situation_rule: The matched rule for this situation
        language: Preferred language (zh, en)
        
    Returns:
        Response text appropriate for the situation
    """
    # Default to Chinese if language not supported
    if language not in situation_rule.response_templates:
        language = "zh"
        
    # Get templates for the language
    templates = situation_rule.response_templates.get(language, [])
    
    # If no templates found, return a generic response
    if not templates:
        return "我已注意到您的情況。有什麼需要我協助的嗎？" if language == "zh" else \
               "I've noticed your situation. How can I assist you?"
    
    # Return the first template (could be randomized in future versions)
    return templates[0]

def process_special_situation(request: SpecialSituationRequest) -> Dict[str, Any]:
    """
    Process a user message to detect and respond to special situations
    
    Args:
        request: The situation request parameters
        
    Returns:
        Response object with situation details and appropriate response
    """
    # First check if message contains sensitive content like suicide signals
    situation_detected, situation_rule = detect_special_situation(
        text=request.text,
        is_group=request.is_group
    )
    
    # If no special situation detected, return normally
    if not situation_detected or situation_rule is None:
        return {
            "situation_detected": False,
            "situation_type": None,
            "response": None,
            "emergency_level": "none",
            "action_needed": None
        }
    
    # Generate response based on the situation
    response_text = generate_special_response(
        situation_rule=situation_rule,
        language=request.language
    )
    
    # Prepare action information if needed
    action_needed = None
    if situation_rule.action_type == "hotline_referral":
        action_needed = {
            "type": "hotline_referral",
            "hotlines": [
                {"name": "自殺防治專線", "number": "1925"},
                {"name": "關懷專線", "number": "1995"}
            ]
        }
    elif situation_rule.action_type == "police_report":
        action_needed = {
            "type": "police_report",
            "hotlines": [{"name": "反詐騙專線", "number": "165"}]
        }
    
    return {
        "situation_detected": True,
        "situation_type": situation_rule.id,
        "response": response_text,
        "emergency_level": situation_rule.emergency_level,
        "action_needed": action_needed
    }

@router.post("/detect", response_model=SpecialSituationResponse, summary="Detect Special Situations", description="Analyze text for special situations like suicide crisis, scam victimization, etc.")
def detect_situation(request: SpecialSituationRequest) -> SpecialSituationResponse:
    # 臨時關閉特殊情境檢測
    print("特殊情境檢測已關閉，直接返回正常結果")
    return SpecialSituationResponse(
        situation_detected=False,
        situation_type=None,
        response=None,
        emergency_level="none",
        action_needed=None
    )
    
    # 以下是原始實現，目前被禁用
    """
    try:
        result = process_special_situation(request)
        return SpecialSituationResponse(**result)
    except Exception as e:
        print(f"Error detecting special situation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error detecting special situation: {str(e)}"
        ) from e
    """
    """
    Detect special situations in user messages and provide appropriate responses
    """
    try:
        result = process_special_situation(request)
        return SpecialSituationResponse(**result)
    except Exception as e:
        print(f"Error detecting special situation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error detecting special situation: {str(e)}"
        ) from e

@router.get("/config", response_model=SpecialResponseConfig, summary="Get Special Response Configuration", description="Get the current configuration for special response rules")
def get_special_response_config() -> SpecialResponseConfig:
    """
    Get the current configuration for special response rules
    """
    try:
        return get_config()
    except Exception as e:
        print(f"Error getting special response config: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting special response config: {str(e)}"
        ) from e

@router.post("/config", response_model=SpecialResponseConfig, summary="Update Special Response Configuration", description="Update the configuration for special response rules")
def update_special_response_config(config: SpecialResponseConfig) -> SpecialResponseConfig:
    """
    Update the configuration for special response rules
    """
    try:
        success = save_config(config)
        if not success:
            raise ValueError("Failed to save configuration")
        return config
    except Exception as e:
        print(f"Error updating special response config: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating special response config: {str(e)}"
        ) from e

@router.post("/toggle", summary="Toggle Special Response System", description="Enable or disable the entire special response system")
def toggle_system2(enabled: bool) -> Dict[str, Any]:
    """
    Enable or disable the entire special response system
    """
    try:
        config = get_config()
        config.system_enabled = enabled
        success = save_config(config)
        
        if not success:
            raise ValueError("Failed to save configuration")
            
        return {"success": True, "system_enabled": enabled}
    except Exception as e:
        print(f"Error toggling special response system: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error toggling special response system: {str(e)}"
        ) from e
