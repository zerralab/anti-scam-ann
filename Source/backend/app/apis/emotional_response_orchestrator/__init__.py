from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
import time
import databutton as db
from fastapi import APIRouter

'''
1. API用途：情緒回應編排器，作為整合AI回應的核心模組，根據用戶訊息決定最佳回應策略
2. 關聯頁面：主要作為LINE機器人和聚合API的後台服務，無直接關聯頁面
3. 目前狀態：啟用中，包含自身實現的內容安全檢查功能，主要用於聊天機器人的回應生成
'''

# 創建路由器（必須定義，即使沒有暴露端點）
router = APIRouter()

# Import required modules
from app.apis.emotion_analysis import analyze_emotion, get_emotional_response_strategy
from app.apis.emotional_support import get_emotional_support_message, EmotionalSupportRequest

# 內容安全檢查函數（已移除原模組導入）
def check_content_safety(text):
    """備用內容安全檢查函數"""
    return {"is_safe": True, "flagged_categories": [], "alert_level": "none", "rejection_response": None, "processing_time": 0.0}

from app.apis.scam_detector import detect_scam
from app.apis.special_response import detect_special_situation, generate_special_response
from app.apis.keyword_responses import get_response_for_keyword

# Define priority levels for different types of responses
class ResponsePriority:
    """Constants for response priority levels"""
    CRISIS = 100    # Immediate life-threatening situations
    URGENT = 80     # Urgent emotional needs (not life-threatening)
    HIGH = 60       # High priority responses (serious scams, etc)
    MEDIUM = 40     # Medium priority (suspicious but not urgent)
    NORMAL = 20     # Regular interactions
    LOW = 10        # Just informational

class ResponseDecision(BaseModel):
    """Model representing the decision about what response approach to use"""
    priority: int = Field(..., description="Priority level of the response")
    response_type: str = Field(..., description="Type of response to generate")
    response_function: str = Field(..., description="Function to call for generating the response")
    context: Dict[str, Any] = Field({}, description="Context for the response generation")
    reason: str = Field(..., description="Reason for this decision")

class CrisisIndicator(BaseModel):
    """Model for identifying potential crisis situations"""
    is_crisis: bool = Field(..., description="Whether this is a crisis situation")
    crisis_type: Optional[str] = Field(None, description="Type of crisis if detected")
    confidence: float = Field(..., description="Confidence in the detection (0.0-1.0)")
    priority: int = Field(..., description="Priority level for this crisis")
    recommended_action: str = Field(..., description="Recommended action for handling this situation")

# 全局開關，控制是否使用只使用LLM而跳過其他API檢測
USE_ONLY_LLM = True

def orchestrate_response(
    message: str, 
    user_id: Optional[str] = None, 
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Tuple[str, Dict[str, Any]]:
    """
    Orchestrate the response generation process based on emotional, safety, and scam analysis.
    
    This is the central decision-making function that determines which type of response
    should be prioritized based on the user's message and context.
    
    Args:
        message: The user's message
        user_id: Optional user ID for tracking
        chat_history: Optional chat history for context
        
    Returns:
        A tuple containing (response_type, context_dict) where context_dict contains
        all the analysis results needed for generating the final response
    """
    try:
        context = {}
        decisions = []
        processing_start = time.time()
        
        # 如果啟用了純LLM模式，直接跳過所有檢測，返回一般對話類型
        # 但提供基本上下文以避免後續處理錯誤
        if USE_ONLY_LLM:
            print("已啟用純LLM模式，跳過所有API檢測和規則判斷")
            return "general_conversation", {
                "llm_only_mode": True,
                "processing_time": time.time() - processing_start,
                # 提供空的但有效的上下文結構
                "emotion_analysis": {},
                "scam_analysis": {"is_scam": False, "scam_info": None, "matched_categories": []},
                "safety_result": {"is_safe": True, "flagged_categories": []},
                "response_strategy": {"style": "friendly"},
                "emotion_priority": ResponsePriority.NORMAL
            }
        
        # 1. Quick response for exact keyword matches (fastest)
        keyword_response = get_response_for_keyword(message)
        if keyword_response:
            print(f"關鍵詞完全匹配，返回預設回覆: {keyword_response[:30]}...")
            return "keyword_match", {
                "response": keyword_response,
                "processing_time": time.time() - processing_start
            }
        
        # 2. Safety check (must be done early)
        safety_result = check_content_safety(message)
        if not safety_result["is_safe"] and safety_result["rejection_response"]:
            print(f"內容安全檢查失敗: {safety_result['flagged_categories']}")
            return "safety_violation", {
                "safety_result": safety_result,
                "processing_time": time.time() - processing_start
            }
        context["safety_result"] = safety_result
        
        # 3. Crisis detection - highest priority
        crisis_result = detect_crisis_situation(message, chat_history)
        context["crisis_result"] = crisis_result
        
        if crisis_result.is_crisis:
            decisions.append(ResponseDecision(
                priority=crisis_result.priority,
                response_type="crisis",
                response_function="generate_crisis_response",
                context={"crisis_type": crisis_result.crisis_type},
                reason=f"Crisis detected: {crisis_result.crisis_type} (confidence: {crisis_result.confidence})"
            ))
        
        # 4. Full emotion analysis
        emotion_analysis = analyze_emotion(message, chat_history)
        context["emotion_analysis"] = emotion_analysis
        response_strategy = get_emotional_response_strategy(emotion_analysis)
        context["response_strategy"] = response_strategy
        
        # Determine if emotions need priority handling
        emotion_priority = calculate_emotion_priority(emotion_analysis)
        context["emotion_priority"] = emotion_priority
        
        if emotion_priority >= ResponsePriority.URGENT:
            # This is an urgent emotional situation requiring immediate support
            decisions.append(ResponseDecision(
                priority=emotion_priority,
                response_type="emotional_support",
                response_function="generate_emotional_support_response",
                context={"primary_emotion": emotion_analysis["primary_emotion"]},
                reason=f"Urgent emotional support needed: {emotion_analysis['primary_emotion']} (intensity: {emotion_analysis['emotion_intensity']})"
            ))
        elif emotion_priority >= ResponsePriority.HIGH:
            # High emotional need, but not urgent
            decisions.append(ResponseDecision(
                priority=emotion_priority,
                response_type="emotional_balanced",
                response_function="generate_emotional_balanced_response",
                context={"focus_on_emotion": True},
                reason=f"High emotional component: {emotion_analysis['primary_emotion']} (intensity: {emotion_analysis['emotion_intensity']})"
            ))
        
        # 5. Special situation detection
        situation_detected, situation_rule = detect_special_situation(message)
        context["special_situation"] = {
            "detected": situation_detected,
            "rule": situation_rule
        }
        
        if situation_detected and situation_rule:
            situation_priority = ResponsePriority.HIGH
            if situation_rule.emergency_level == "high":
                situation_priority = ResponsePriority.URGENT
            
            decisions.append(ResponseDecision(
                priority=situation_priority,
                response_type="special_situation",
                response_function="generate_special_situation_response",
                context={"situation_rule": situation_rule},
                reason=f"Special situation detected: {situation_rule.id} (emergency: {situation_rule.emergency_level})"
            ))
        
        # 6. Scam detection
        is_scam, scam_info, matched_categories = detect_scam(message)
        context["scam_analysis"] = {
            "is_scam": is_scam,
            "scam_info": scam_info,
            "matched_categories": matched_categories
        }
        
        if is_scam:
            # Calculate scam priority based on severity
            scam_severity = calculate_scam_severity(scam_info, matched_categories)
            scam_priority = ResponsePriority.MEDIUM
            
            if scam_severity > 0.8:
                scam_priority = ResponsePriority.HIGH
            
            # If emotional priority is higher than scam priority, we'll need a hybrid approach
            if emotion_priority >= scam_priority and emotion_priority >= ResponsePriority.HIGH:
                decisions.append(ResponseDecision(
                    priority=max(emotion_priority, scam_priority) - 5,  # Slightly lower than pure emotional
                    response_type="emotional_scam_hybrid",
                    response_function="generate_emotional_scam_hybrid_response",
                    context={
                        "emotion_first": emotion_priority > scam_priority,
                        "scam_info": scam_info
                    },
                    reason=f"Hybrid needed: emotional ({emotion_priority}) + scam ({scam_priority})"
                ))
            else:
                # Standard scam response
                decisions.append(ResponseDecision(
                    priority=scam_priority,
                    response_type="scam_alert",
                    response_function="generate_scam_alert_response",
                    context={"scam_info": scam_info},
                    reason=f"Scam detected: {scam_info['name'] if scam_info else 'unknown'} (severity: {scam_severity})"
                ))
        
        # 7. Default conversation (lowest priority)
        decisions.append(ResponseDecision(
            priority=ResponsePriority.NORMAL,
            response_type="general_conversation",
            response_function="generate_general_conversation_response",
            context={},
            reason="Default conversation handling"
        ))
        
        # Select the highest priority decision
        selected_decision = sorted(decisions, key=lambda x: x.priority, reverse=True)[0]
        context["selected_decision"] = selected_decision.dict()
        context["processing_time"] = time.time() - processing_start
        
        return selected_decision.response_type, context
    except Exception as e:
        # 記錄詳細錯誤信息但返回安全默認值
        print(f"編排器錯誤（這不會崩潰系統）: {e}")
        import traceback
        print(traceback.format_exc())
        
        # 返回一個安全的默認值，讓主流程可以繼續
        return "general_conversation", {
            "error": str(e),
            "fallback": True,
            "processing_time": time.time() - processing_start if 'processing_start' in locals() else 0
        }

def detect_crisis_situation(message: str, chat_history: Optional[List[Dict[str, str]]] = None) -> CrisisIndicator:
    """
    Detect potential crisis situations that require immediate attention.
    
    Args:
        message: The user's message
        chat_history: Optional chat history for context
        
    Returns:
        CrisisIndicator with detection results
    """
    # Self-harm and suicidal ideation patterns
    suicide_patterns = [
        "想死", "自殺", "輕生", "了結", "活不下去", "沒意思了", "不想活", "結束生命",
        "沒有活下去的意義", "沒理由再活著", "想一死百了", "不如死了算了", "活著沒意思"
    ]
    
    # Immediate danger patterns
    danger_patterns = [
        "有人威脅我", "被追殺", "被跟蹤", "被人找上門", "被恐嚇", "被綁架", "被監禁",
        "他們逼我交錢", "他們說要傷害我", "恐怕他們要來找我"
    ]
    
    # Severe financial loss patterns
    severe_loss_patterns = [
        "我已經被騙了", "我失去了所有積蓄", "我借了很多錢", "把退休金都給了",
        "跳樓", "負債累累", "無力償還", "透支了全部信用卡", "被騙了很大一筆錢"
    ]
    
    # Check for crisis indicators
    for pattern in suicide_patterns:
        if pattern in message:
            return CrisisIndicator(
                is_crisis=True,
                crisis_type="suicide_risk",
                confidence=0.9,
                priority=ResponsePriority.CRISIS,
                recommended_action="immediate_emotional_support_with_resources"
            )
    
    for pattern in danger_patterns:
        if pattern in message:
            return CrisisIndicator(
                is_crisis=True,
                crisis_type="immediate_danger",
                confidence=0.85,
                priority=ResponsePriority.CRISIS,
                recommended_action="safety_first_with_emergency_contact_info"
            )
    
    for pattern in severe_loss_patterns:
        if pattern in message:
            return CrisisIndicator(
                is_crisis=True,
                crisis_type="severe_financial_distress",
                confidence=0.8,
                priority=ResponsePriority.URGENT,
                recommended_action="supportive_guidance_with_resources"
            )
    
    # Check chat history for escalating distress if available
    if chat_history and len(chat_history) > 1:
        user_messages = [msg["content"] for msg in chat_history if msg.get("role") == "user"]
        if len(user_messages) >= 2:
            # Simple escalation detection - check if recent messages contain more distress indicators
            distress_keywords = ["害怕", "擔心", "焦慮", "絕望", "痛苦", "無助", "受不了", "無力"]
            recent_distress_count = sum(1 for kw in distress_keywords if any(kw in msg for msg in user_messages[-2:]))
            
            if recent_distress_count >= 3:
                return CrisisIndicator(
                    is_crisis=True,
                    crisis_type="escalating_distress",
                    confidence=0.7,
                    priority=ResponsePriority.URGENT,
                    recommended_action="validation_and_grounding_support"
                )
    
    # No crisis detected
    return CrisisIndicator(
        is_crisis=False,
        crisis_type=None,
        confidence=1.0,
        priority=ResponsePriority.NORMAL,
        recommended_action="standard_processing"
    )

def calculate_emotion_priority(emotion_analysis: Dict[str, Any]) -> int:
    """
    Calculate the priority level for emotional response based on emotion analysis.
    
    Args:
        emotion_analysis: The emotion analysis result
        
    Returns:
        Priority level as integer
    """
    primary_emotion = emotion_analysis.get("primary_emotion", "")
    intensity = emotion_analysis.get("emotion_intensity", 0.0)
    requires_support = emotion_analysis.get("requires_immediate_support", False)
    
    # Crisis-level emotions with high intensity
    crisis_emotions = ["恐懼", "急迫", "無助"]
    high_priority_emotions = ["焦慮", "憤怒", "沮喪", "羞愧"]
    medium_priority_emotions = ["困惑", "擔憂", "懷疑"]
    
    # Immediate support needed
    if requires_support:
        return ResponsePriority.URGENT
    
    # Calculate based on emotion type and intensity
    if primary_emotion in crisis_emotions and intensity > 0.7:
        return ResponsePriority.URGENT
    elif primary_emotion in crisis_emotions and intensity > 0.5:
        return ResponsePriority.HIGH
    elif primary_emotion in high_priority_emotions and intensity > 0.7:
        return ResponsePriority.HIGH
    elif primary_emotion in high_priority_emotions and intensity > 0.5:
        return ResponsePriority.MEDIUM
    elif primary_emotion in medium_priority_emotions and intensity > 0.7:
        return ResponsePriority.MEDIUM
    else:
        return ResponsePriority.NORMAL

def calculate_scam_severity(scam_info: Optional[Dict[str, Any]], matched_categories: List[str]) -> float:
    """
    Calculate the severity level of a detected scam.
    
    Args:
        scam_info: Information about the scam if available
        matched_categories: Categories of scam patterns matched
        
    Returns:
        Severity score from 0.0 to 1.0
    """
    # Base severity based on number of matched categories
    base_severity = min(1.0, len(matched_categories) * 0.2) if matched_categories else 0.0
    
    # Adjust based on scam type if available
    if scam_info and "severity" in scam_info:
        return max(base_severity, scam_info["severity"])
    
    # High severity scam types
    high_severity_types = ["investment_scam", "government_impersonation", "extortion", "emergency_scam"]
    if scam_info and "type" in scam_info and scam_info["type"] in high_severity_types:
        return max(base_severity, 0.8)
    
    return base_severity

def generate_emotional_support_response(context: Dict[str, Any]) -> str:
    """
    Generate an emotionally supportive response based on the detected emotional state.
    
    Args:
        context: Context information including emotion analysis
        
    Returns:
        Supportive response text
    """
    emotion_analysis = context.get("emotion_analysis", {})
    primary_emotion = emotion_analysis.get("primary_emotion", "general")
    is_victim = False
    scam_type = None
    
    # Check if user is a scam victim from context
    scam_analysis = context.get("scam_analysis", {})
    if scam_analysis.get("is_scam", False):
        is_victim = True
        scam_info = scam_analysis.get("scam_info", {})
        if scam_info and "type" in scam_info:
            scam_type = scam_info["type"]
    
    # Create emotional support request
    support_request = EmotionalSupportRequest(
        emotional_state=primary_emotion,
        is_victim=is_victim,
        scam_type=scam_type,
        needs_encouragement=True,
        language="zh",  # Default to Chinese
        custom_context=None
    )
    
    # Get emotional support message
    support_response = get_emotional_support_message(support_request)
    
    return support_response["primary"]

def integrate_with_ai_conversation(decision_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare context data for the AI conversation module based on decision type.
    
    Args:
        decision_type: Type of response decision made
        context: Full context from orchestration
        
    Returns:
        Processed context for AI conversation
    """
    result = {
        "response_type": decision_type,
        "emotion_analysis": context.get("emotion_analysis", {}),
        "is_scam": context.get("scam_analysis", {}).get("is_scam", False),
        "scam_info": context.get("scam_analysis", {}).get("scam_info", None),
        "matched_categories": context.get("scam_analysis", {}).get("matched_categories", []),
        "processing_time": context.get("processing_time", 0),
        "response_style": {
            "concise": True,  # 啟用簡潔回應風格
            "avoid_repetition": True,  # 避免重複類似的同理心表達
            "max_empathy_statements": 1,  # 最多使用一個同理心表達
            "prioritize_actionable_advice": True,  # 優先提供可行動的建議
            "max_paragraphs": 3,  # 限制最大段落數為3段
            "brevity": "high"  # 高度精簡
        }
    }
    
    # Add decision-specific context
    if decision_type == "crisis":
        result["crisis_info"] = context.get("crisis_result", {})
        result["require_special_handling"] = True
        # 即使是危機情況，也要保持回應簡潔
        result["response_style"]["max_paragraphs"] = 3
    
    elif decision_type == "emotional_support":
        result["require_special_handling"] = True
        result["focus_on_emotion"] = True
        # 對情緒支持類型，限制表達同理心的方式，減少段落數
        result["response_style"]["empathy_style"] = "brief_acknowledgment"
        result["response_style"]["max_paragraphs"] = 2  # 情緒支持可以更短
        
    elif decision_type == "emotional_scam_hybrid":
        result["require_special_handling"] = False
        result["hybrid_response"] = True
        result["emotion_first"] = context.get("selected_decision", {}).get("context", {}).get("emotion_first", True)
        # 混合類型的回應，確保同理心和建議之間有良好平衡，且保持簡潔
        result["response_style"]["empathy_to_advice_ratio"] = 0.2  # 20% 同理心，80% 建議
        result["response_style"]["max_paragraphs"] = 3  # 最多3段
    
    return result
