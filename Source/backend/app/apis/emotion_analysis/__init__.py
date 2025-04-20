from typing import Dict, Any, List, Tuple, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import re
import databutton as db
import json
from types import SimpleNamespace

'''
1. API用途：情緒分析 API，原先設計使用 LLM 分析用戶訊息中的情緒狀態並生成相應策略
2. 關聯頁面：主要在後台使用，為AI對話和情緒支持功能提供情緒分析能力
3. 目前狀態：已停用（因無 gpt-4o-mini 的 API key，目前使用默認回應）
'''

# Import OpenAI client with improved error handling
def setup_llm_client():
    """Setup LLM client with fallback mechanisms"""
    try:
        from openai import OpenAI
        print("Successfully imported OpenAI SDK")
        
        # Define wrapper function to get OpenAI client
        def get_openai_client():
            """Create an OpenAI client with the API key from secrets"""
            try:
                api_key = db.secrets.get("OPENAI_API_KEY")
                if not api_key:
                    print("Warning: OPENAI_API_KEY not found in secrets")
                    api_key = "" # Will trigger fallback
                
                client = OpenAI(api_key=api_key)
                return client
            except Exception as e:
                print(f"Error creating OpenAI client: {str(e)}")
                raise e
        
        return True, OpenAI, get_openai_client
        
    except ImportError as e:
        print(f"OpenAI package not available, will use fallback mechanisms: {e}")
        
        # Define mock OpenAI client
        class MockOpenAI:
            """Mocked OpenAI client for fallback"""
            def __init__(self, **kwargs):
                self.chat = type('obj', (object,), {
                    'completions': type('obj', (object,), {
                        'create': self.mock_create
                    })
                })
                
            def mock_create(self, **kwargs):
                """Mock completion creation"""
                # Create a minimal response structure
                response = SimpleNamespace()
                response.choices = [SimpleNamespace()]
                response.choices[0].message = SimpleNamespace()
                response.choices[0].message.content = '{"primary_emotion": "中性", "emotion_intensity": 0.5, "secondary_emotions": [], "requires_immediate_support": false, "context_factors": [], "confidence": 0.4}'
                return response
        
        def mock_get_client():
            """Mock client getter"""
            return MockOpenAI()
            
        return False, MockOpenAI, mock_get_client

# Setup the LLM client
OPENAI_AVAILABLE, OpenAI, get_openai_client = setup_llm_client()

# Create an API router with proper endpoints and documentation
router = APIRouter(
    prefix="/emotion-analysis",
    tags=["emotion-analysis"],
    responses={404: {"description": "Not found"}}
)

class EmotionAnalysisRequest(BaseModel):
    message: str = Field(..., description="User's message to analyze for emotional content")
    chat_history: Optional[List[Dict[str, str]]] = Field(None, description="Optional chat history for context")
    user_id: Optional[str] = Field(None, description="User ID for tracking")

class EmotionAnalysisResponse(BaseModel):
    primary_emotion: str = Field(..., description="The primary emotion detected")
    emotion_intensity: float = Field(..., description="Intensity of the detected emotion (0.0-1.0)")
    secondary_emotions: List[str] = Field([], description="Additional emotions detected")
    requires_immediate_support: bool = Field(False, description="Whether the user needs immediate emotional support")
    context_factors: List[str] = Field([], description="Contextual factors affecting emotional state")
    confidence: float = Field(..., description="Confidence in the emotion analysis (0.0-1.0)")

# Emotion categories with descriptions
EMOTION_CATEGORIES = {
    "恐懼": "對威脅或危險的反應，擔心被詐騙或遭受損失",
    "焦慮": "對不確定性的擔憂，不知道該如何處理可能的詐騙情況", 
    "憤怒": "對被詐騙或被欺騙的憤怒反應",
    "沮喪": "對失去金錢或被詐騙後的低落情緒",
    "困惑": "對詐騙手法或如何應對的不確定和迷惑",
    "無助": "感到對詐騙情況無法控制或無法解決",
    "信任": "願意相信他人或信息的程度",
    "懷疑": "對信息或聯絡真實性的質疑",
    "急迫": "感到需要立即做出決定或採取行動",
    "安心": "在確認信息非詐騙或解決問題後的放鬆感",
    "羞愧": "因被騙或感到自己應該更謹慎而產生的羞恥感",
    "孤獨": "感到沒有人可以傾訴或幫助解決詐騙問題",
    "警覺": "對可能的詐騙提高警惕",
    "擔憂": "對可能的後果或影響的關注",
    "如釋重負": "避開詐騙或確認訊息為安全後的輕鬆感"
}

def analyze_emotion(message: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """
    Analyze the emotional content of a user message using LLM
    
    Args:
        message: The user's message to analyze
        chat_history: Optional previous conversation context
        
    Returns:
        Dictionary with emotion analysis results
    """
    # Initialize default response in case of errors
    default_response = {
        "primary_emotion": "中性",
        "emotion_intensity": 0.1,
        "secondary_emotions": [],
        "requires_immediate_support": False,
        "context_factors": [],
        "confidence": 0.5
    }
            
    # 直接使用LLM進行分析，不使用規則匹配
    try:
        client = get_openai_client()
        
        # Prepare conversation context if available
        context = ""
        if chat_history and len(chat_history) > 0:
            context = "以下是對話歷史：\n"
            for entry in chat_history[-3:]:  # Only use last 3 messages for context
                role = entry.get("role", "")
                content = entry.get("content", "")
                if role and content:
                    context += f"{role}: {content}\n"
        
        # Build the prompt for emotion analysis
        prompt = f"""
        請分析以下訊息中表達的情緒狀態。考慮以下各方面：
        
        1. 主要情緒（必須從以下選擇一項）：恐懼、焦慮、憤怒、沮喪、困惑、無助、信任、懷疑、急迫、安心、羞愧、孤獨、警覺、擔憂、如釋重負
        2. 情緒強度（0.0-1.0，其中1.0為最強烈）
        3. 次要情緒（列出最多3種）
        4. 是否需要立即情緒支持（True/False）
        5. 影響情緒的情境因素（列出最多3項）
        6. 分析可信度（0.0-1.0）
        
        {context}
        
        用戶訊息：{message}
        
        以下是回應模板，請依此格式回覆，僅填入JSON格式的分析結果：
        {{
            "primary_emotion": "主要情緒",
            "emotion_intensity": 情緒強度,
            "secondary_emotions": ["次要情緒1", "次要情緒2"],
            "requires_immediate_support": true/false,
            "context_factors": ["情境因素1", "情境因素2"],
            "confidence": 可信度
        }}
        僅回應JSON格式，不要包含其他解釋文字。
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,  # Lower temperature for more consistent results
            response_format={"type": "json_object"}
        )
        
        # Extract and parse the response
        result_text = response.choices[0].message.content
        emotion_result = json.loads(result_text)
        
        # Validate the primary emotion is from our defined categories
        if emotion_result.get("primary_emotion") not in EMOTION_CATEGORIES.keys():
            emotion_result["primary_emotion"] = "困惑"  # Default if not in our categories
            
        # Validate numerical values are in range
        emotion_result["emotion_intensity"] = min(1.0, max(0.0, emotion_result.get("emotion_intensity", 0.5)))
        emotion_result["confidence"] = min(1.0, max(0.0, emotion_result.get("confidence", 0.5)))
        
        # Ensure secondary emotions are valid
        valid_secondary = []
        for emotion in emotion_result.get("secondary_emotions", []):
            if emotion in EMOTION_CATEGORIES.keys() and emotion != emotion_result["primary_emotion"]:
                valid_secondary.append(emotion)
        emotion_result["secondary_emotions"] = valid_secondary[:3]  # Limit to 3
        
        # Validate requires_immediate_support is boolean
        emotion_result["requires_immediate_support"] = bool(emotion_result.get("requires_immediate_support", False))
        
        # Validate context factors
        emotion_result["context_factors"] = emotion_result.get("context_factors", [])[:3]  # Limit to 3
        
        return emotion_result
        
    except Exception as e:
        print(f"Error in emotion analysis: {str(e)}")
        return default_response

def get_emotional_response_strategy(emotion_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a response strategy based on emotional analysis
    
    Args:
        emotion_analysis: Results from emotion analysis
        
    Returns:
        Dictionary with response strategy parameters
    """
    strategy = {
        "focus_on_emotion": False,  # Whether to prioritize emotional support
        "response_tone": "balanced",  # neutral, warm, empathetic, reassuring, informative
        "directness": "moderate",  # direct, moderate, indirect
        "detail_level": "moderate",  # brief, moderate, detailed
        "prioritize_actions": False,  # Whether to prioritize actionable steps
        "temperature_modifier": 0.0,  # Adjustment to LLM temperature (-0.2 to +0.2)
        "special_instructions": []  # Additional instructions for response generation
    }
    
    # Extract primary factors
    primary = emotion_analysis.get("primary_emotion", "中性")
    intensity = emotion_analysis.get("emotion_intensity", 0.5)
    needs_support = emotion_analysis.get("requires_immediate_support", False)
    secondary = emotion_analysis.get("secondary_emotions", [])
    
    # Determine if emotional support should be the primary focus
    high_intensity_emotions = ["恐懼", "焦慮", "憤怒", "沮喪", "無助", "急迫", "羞愧"]
    
    # High intensity negative emotions require emotional focus
    if primary in high_intensity_emotions and intensity > 0.6:
        strategy["focus_on_emotion"] = True
        strategy["response_tone"] = "empathetic"
        
        # Different strategies based on primary emotion
        if primary == "恐懼" or primary == "焦慮":
            strategy["response_tone"] = "reassuring"
            strategy["directness"] = "moderate"
            strategy["detail_level"] = "moderate"
            strategy["special_instructions"] = [
                "先確認用戶的擔憂是合理的",
                "提供明確資訊以減輕恐懼",
                "以鼓勵性的語氣結束"
            ]
            
        elif primary == "憤怒":
            strategy["response_tone"] = "empathetic"
            strategy["directness"] = "direct"
            strategy["detail_level"] = "brief"
            strategy["special_instructions"] = [
                "確認用戶的憤怒感受是合理的",
                "不要使用'冷靜下來'等語句",
                "提供具體的下一步建議"
            ]
            
        elif primary in ["沮喪", "無助", "羞愧"]:
            strategy["response_tone"] = "warm"
            strategy["directness"] = "indirect"
            strategy["detail_level"] = "moderate"
            strategy["special_instructions"] = [
                "強調這不是用戶的錯",
                "分享其他人也有類似經歷",
                "提供可行的小步驟以恢復信心"
            ]
            
        elif primary == "急迫":
            strategy["response_tone"] = "calm"
            strategy["directness"] = "direct"
            strategy["detail_level"] = "brief"
            strategy["prioritize_actions"] = True
            strategy["special_instructions"] = [
                "提供明確且簡短的指示",
                "使用列表格式增加可讀性",
                "結尾提醒用戶可以進一步提問"
            ]
    
    # Medium intensity emotions or cognitive states
    elif primary in ["困惑", "懷疑"] or intensity <= 0.6:
        if primary == "困惑":
            strategy["response_tone"] = "informative"
            strategy["directness"] = "moderate"
            strategy["detail_level"] = "detailed"
            strategy["temperature_modifier"] = -0.1  # More focused and clear
            strategy["special_instructions"] = [
                "使用簡單易懂的語言",
                "分步驟解釋複雜概念",
                "提供例子增進理解"
            ]
            
        elif primary == "懷疑":
            strategy["response_tone"] = "neutral"
            strategy["directness"] = "direct"
            strategy["detail_level"] = "detailed"
            strategy["special_instructions"] = [
                "提供可驗證的資訊和來源",
                "解釋判斷詐騙的具體線索",
                "避免權威口吻，鼓勵用戶自行判斷"
            ]
            
    # Positive emotions
    elif primary in ["安心", "信任", "如釋重負"]:
        strategy["response_tone"] = "warm"
        strategy["directness"] = "moderate"
        strategy["detail_level"] = "moderate"
        strategy["temperature_modifier"] = 0.1  # More conversational and natural
        strategy["special_instructions"] = [
            "肯定用戶的判斷或行動",
            "提供額外的安全建議作為參考",
            "鼓勵用戶在未來遇到疑問時繼續尋求幫助"
        ]
        
    # If needs immediate support, override some settings
    if needs_support:
        strategy["focus_on_emotion"] = True
        if strategy["response_tone"] != "reassuring":
            strategy["response_tone"] = "empathetic"
        strategy["directness"] = "direct"  # Be more direct when immediate support is needed
        strategy["special_instructions"].append("優先處理用戶的情緒需求，後續再提供資訊")
        
    # Secondary emotion influences
    if "恐懼" in secondary and primary != "恐懼":
        strategy["special_instructions"].append("加入安撫恐懼的簡短語句")
        
    if "憤怒" in secondary and primary != "憤怒":
        strategy["special_instructions"].append("肯定用戶情緒的合理性")
        
    if "困惑" in secondary and primary != "困惑":
        strategy["special_instructions"].append("提供清晰的解釋以減少困惑")
        
    return strategy

@router.post("/analyze", response_model=EmotionAnalysisResponse, summary="Analyze Emotional Content", description="Analyze the emotional content of a user message")
def analyze_emotion_endpoint(request: EmotionAnalysisRequest) -> EmotionAnalysisResponse:
    """
    Analyze the emotional content of a user message
    """
    try:
        result = analyze_emotion(
            message=request.message,
            chat_history=request.chat_history
        )
        
        return EmotionAnalysisResponse(**result)
    except Exception as e:
        print(f"Error in emotion analysis endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing emotions: {str(e)}"
        ) from e