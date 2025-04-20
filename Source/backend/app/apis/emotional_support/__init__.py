from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import random

'''
1. API用途：情緒支持 API，產生根據用戶情緒狀態和詐騙類型定制的支持訊息
2. 關聯頁面：前台的「訊息中心」和「情緒支持」頁面，以及AI對話中的情緒支持功能
3. 目前狀態：啟用中
'''

# Create an API router with proper endpoints and documentation
router = APIRouter(
    prefix="/emotional-support",
    tags=["emotional-support"],
    responses={404: {"description": "Not found"}}
)

class EmotionalSupportRequest(BaseModel):
    emotional_state: str = Field(
        "general", 
        description="Current emotional state of the user (general, fear, anxiety, worry, overwhelmed, confused, etc)"
    )
    is_victim: bool = Field(
        False, 
        description="Whether the user is already a victim of a scam"
    )
    scam_type: Optional[str] = Field(
        None, 
        description="Identifier for the scam type if known (fake_customer_service, investment_scam, romance_scam, etc)"
    )
    needs_encouragement: bool = Field(
        False, 
        description="Whether the user needs encouragement for taking action"
    )
    language: str = Field(
        "zh", 
        description="Language for the response (zh, en)"
    )
    custom_context: Optional[str] = Field(
        None, 
        description="Optional custom context for tailoring the emotional support"
    )

class EmotionalSupportMessage(BaseModel):
    id: str = Field(..., description="Unique identifier for the message")
    message: str = Field(..., description="The supportive message text")
    context: str = Field(..., description="The context this message is suitable for")

class EmotionalSupportResponse(BaseModel):
    primary: str = Field(..., description="Primary emotional support message")
    messages: List[EmotionalSupportMessage] = Field([], description="List of supportive messages")

# Comfort messages - for when users feel scared, anxious, or worried
COMFORT_MESSAGES = [
    {
        "id": "comfort_1",
        "message": "我能理解你的擔憂。\n這是很自然的反應。\n讓我們一起面對，好嗎？",
        "context": "general"
    },
    {
        "id": "comfort_2",
        "message": "這確實讓人不安。\n但你並不孤單。\n我在這裡陪你。",
        "context": "general"
    },
    {
        "id": "comfort_3",
        "message": "先深呼吸一下。\n這些感受都很正常。\n我們慢慢來解決。",
        "context": "panic"
    },
    {
        "id": "comfort_4",
        "message": "別對自己太苛刻。\n每個人都可能遇到。\n你已經意識到問題了。",
        "context": "victim"
    },
    {
        "id": "comfort_5",
        "message": "害怕是正常的。\n這是你的防禦機制。\n讓它幫助你前進。",
        "context": "fear"
    }
]

# Encouragement messages - for when users need to take action or face difficulties
ENCOURAGEMENT_MESSAGES = [
    {
        "id": "encourage_1",
        "message": "你已經邁出了最重要的第一步：尋求幫助。這顯示了你的勇氣和智慧。",
        "context": "general"
    },
    {
        "id": "encourage_2",
        "message": "我相信你有能力克服這個挑戰。每一個小步驟都是朝著安全前進。",
        "context": "general"
    },
    {
        "id": "encourage_3",
        "message": "雖然現在看起來困難，但每個問題都有解決的方法。我們一起來找出最適合你的方案。",
        "context": "problem_solving"
    },
    {
        "id": "encourage_4",
        "message": "保持警覺是明智的選擇！你的謹慎態度正在保護你遠離潛在的威脅。",
        "context": "prevention"
    },
    {
        "id": "encourage_5",
        "message": "即使遇到挫折，也請記住這是暫時的。你有能力從這次經驗中恢復並更加堅強。",
        "context": "recovery"
    }
]

# Empathy messages - expressing understanding and emotional connection
EMPATHY_MESSAGES = [
    {
        "id": "empathy_1",
        "message": "我能感受到你的擔憂和困惑，這種感覺確實不好受。",
        "context": "general"
    },
    {
        "id": "empathy_2",
        "message": "這種情況讓人感到受傷和背叛，你的感受完全有道理。",
        "context": "victim"
    },
    {
        "id": "empathy_3",
        "message": "面對這些複雜的情緒並不容易，但承認並表達它們是勇敢的第一步。",
        "context": "emotional"
    },
    {
        "id": "empathy_4",
        "message": "信任是很寶貴的，當它被破壞時，感到憤怒和失望都是正常的。",
        "context": "trust_issues"
    },
    {
        "id": "empathy_5",
        "message": "我理解你現在可能感到不知所措。慢慢來，我們會一起找到方向。",
        "context": "overwhelmed"
    }
]

# Scam-specific emotional support messages
SCAM_SPECIFIC_MESSAGES = {
    "fake_customer_service": [
        "許多人都曾收到類似的假冒客服訊息，這不是你的錯。詐騙者非常擅長製造緊迫感。",
        "銀行和客服人員不會用這種方式聯繫你，你的警覺性幫助你避開了陷阱。"
    ],
    "investment_scam": [
        "投資詐騙設計得極具吸引力，讓人難以抗拒。許多專業人士也曾上當，不要太責備自己。",
        "尋求穩定財務的願望是正常的，但請記住：真正的好機會不會讓你倉促決定。"
    ],
    "romance_scam": [
        "情感詐騙特別傷人，因為它們利用了人類最自然的渴望－愛與連結。這完全不是你的過錯。",
        "你值得真誠的感情和關係。這次經歷雖然痛苦，但也幫助你認識到真正的愛是建立在信任和時間上的。"
    ],
    "prize_or_lottery_scam": [
        "誰不希望突然中大獎呢？詐騙者正是利用這種普遍的心理。重要的是你現在已經警覺起來。",
        "真正的獎項不需要你先付款。你的懷疑態度是正確的，這保護了你的財產安全。"
    ],
    "general_suspicious": [
        "對可疑訊息保持警覺是明智之舉。你的直覺是很好的保護機制。",
        "在數位時代，我們每天都面臨各種訊息轟炸，保持健康的懷疑態度很重要。"
    ]
}

# English comfort messages 
ENGLISH_COMFORT_MESSAGES = [
    {
        "id": "en_comfort_1",
        "message": "I understand you may feel worried right now, and that's a completely natural reaction. Let's face this situation together, okay?",
        "context": "general"
    },
    {
        "id": "en_comfort_2",
        "message": "This experience can certainly feel unsettling, but please remember, you are not alone. I'm here to support you through this.",
        "context": "general"
    },
    {
        "id": "en_comfort_3",
        "message": "Take a deep breath first and allow yourself to calm down. These feelings are normal, and we'll work through this step by step.",
        "context": "panic"
    },
    {
        "id": "en_comfort_4",
        "message": "Don't be too hard on yourself. Anyone could find themselves in this situation. What's important is that you've now recognized the issue.",
        "context": "victim"
    },
    {
        "id": "en_comfort_5",
        "message": "Feeling afraid is normal - it shows your protective instincts are working. Let this awareness help you rather than paralyze you.",
        "context": "fear"
    }
]

# English encouragement messages
ENGLISH_ENCOURAGEMENT_MESSAGES = [
    {
        "id": "en_encourage_1",
        "message": "You've already taken the most important first step: seeking help. This shows your courage and wisdom.",
        "context": "general"
    },
    {
        "id": "en_encourage_2",
        "message": "I believe you have the strength to overcome this challenge. Each small step is progress toward safety.",
        "context": "general"
    },
    {
        "id": "en_encourage_3",
        "message": "Although things might seem difficult right now, every problem has a solution. Let's find the approach that works best for you.",
        "context": "problem_solving"
    },
    {
        "id": "en_encourage_4",
        "message": "Staying vigilant is a smart choice! Your cautious attitude is protecting you from potential threats.",
        "context": "prevention"
    },
    {
        "id": "en_encourage_5",
        "message": "Even when facing setbacks, remember that this is temporary. You have the ability to recover from this experience and emerge stronger.",
        "context": "recovery"
    }
]

# English empathy messages
ENGLISH_EMPATHY_MESSAGES = [
    {
        "id": "en_empathy_1",
        "message": "I can sense your worry and confusion - these feelings are certainly uncomfortable.",
        "context": "general"
    },
    {
        "id": "en_empathy_2",
        "message": "This situation can make you feel hurt and betrayed. Your feelings are completely valid.",
        "context": "victim"
    },
    {
        "id": "en_empathy_3",
        "message": "Facing these complex emotions isn't easy, but acknowledging and expressing them is a brave first step.",
        "context": "emotional"
    },
    {
        "id": "en_empathy_4",
        "message": "Trust is precious, and when it's broken, feeling anger and disappointment is natural.",
        "context": "trust_issues"
    },
    {
        "id": "en_empathy_5",
        "message": "I understand you might feel overwhelmed right now. Let's take it slow, and we'll find our way together.",
        "context": "overwhelmed"
    }
]

# English scam-specific emotional support messages
ENGLISH_SCAM_SPECIFIC_MESSAGES = {
    "fake_customer_service": [
        "Many people receive similar fake customer service messages - this isn't your fault. Scammers are very skilled at creating a sense of urgency.",
        "Banks and customer service representatives don't communicate this way. Your caution helped you avoid a trap."
    ],
    "investment_scam": [
        "Investment scams are designed to be incredibly appealing and hard to resist. Many professionals have fallen for them too, so don't blame yourself too much.",
        "Wanting financial stability is normal, but remember: real opportunities won't rush you into making decisions."
    ],
    "romance_scam": [
        "Romance scams are particularly hurtful because they exploit our most natural desire - love and connection. This is absolutely not your fault.",
        "You deserve genuine affection and relationships. While this experience is painful, it also helps you recognize that real love is built on trust and time."
    ],
    "prize_or_lottery_scam": [
        "Who wouldn't hope to suddenly win a big prize? Scammers exploit this common psychology. What's important is that you're now alert.",
        "Real prizes don't require you to pay money first. Your skepticism was correct and protected your financial safety."
    ],
    "general_suspicious": [
        "Staying vigilant about suspicious messages is wise. Your intuition serves as a good protective mechanism.",
        "In the digital age, we're bombarded with messages daily. Maintaining a healthy level of skepticism is important."
    ]
}

def get_emotional_support_message(request: EmotionalSupportRequest) -> Dict[str, Any]:
    """
    Generate appropriate emotional support messages based on the user's emotional state and context
    更新: 避免重複表達同理心，保持回答精簡有力，使用步驟式格式提供清晰建議
    """
    # Select appropriate message sets based on language
    if request.language.lower() == "en":
        comfort_msgs = ENGLISH_COMFORT_MESSAGES
        encouragement_msgs = ENGLISH_ENCOURAGEMENT_MESSAGES
        empathy_msgs = ENGLISH_EMPATHY_MESSAGES
        scam_specific_msgs = ENGLISH_SCAM_SPECIFIC_MESSAGES
    else:  # Default to Chinese
        comfort_msgs = COMFORT_MESSAGES
        encouragement_msgs = ENCOURAGEMENT_MESSAGES
        empathy_msgs = EMPATHY_MESSAGES
        scam_specific_msgs = SCAM_SPECIFIC_MESSAGES
    
    emotional_state = request.emotional_state.lower()
    context_to_match = request.custom_context.lower() if request.custom_context else emotional_state
    
    # 優先級排序 - 根據使用者狀態來決定最適合的回應類型
    priority_message = None
    secondary_message = None
    
    # 1. 如果是詐騙受害者，優先提供具體相關的詐騙訊息
    if request.is_victim and request.scam_type and request.scam_type in scam_specific_msgs:
        specific_messages = scam_specific_msgs[request.scam_type]
        if specific_messages:
            random_idx = random.randint(0, len(specific_messages) - 1)
            priority_message = {
                "id": f"scam_specific_{request.scam_type}",
                "message": specific_messages[random_idx],
                "context": request.scam_type
            }
    
    # 2. 根據情緒狀態選擇最合適的一種支持訊息
    # (a) 恐懼/焦慮/擔憂狀態
    if not priority_message and emotional_state in ["fear", "anxiety", "worry"]:
        comfort_msg = next((msg for msg in comfort_msgs if msg["context"] == emotional_state), 
                       next((msg for msg in comfort_msgs if msg["context"] == "general"), comfort_msgs[0]))
        priority_message = comfort_msg
    
    # (b) 不知所措/困惑狀態
    elif not priority_message and emotional_state in ["overwhelmed", "confused"]:
        empathy_msg = next((msg for msg in empathy_msgs if msg["context"] == emotional_state), 
                       next((msg for msg in empathy_msgs if msg["context"] == "general"), empathy_msgs[0]))
        priority_message = empathy_msg
    
    # (c) 受害者狀態
    elif not priority_message and request.is_victim:
        victim_msg = next((msg for msg in comfort_msgs if msg["context"] == "victim"), 
                      next((msg for msg in empathy_msgs if msg["context"] == "victim"), None))
        if victim_msg:
            priority_message = victim_msg
    
    # 3. 如果需要鼓勵，選擇一個鼓勵訊息作為次要訊息
    if request.needs_encouragement:
        encouragement_context = "recovery" if request.is_victim else "prevention"
        encourage_msg = next((msg for msg in encouragement_msgs if msg["context"] == encouragement_context), 
                          next((msg for msg in encouragement_msgs if msg["context"] == "general"), encouragement_msgs[0]))
        secondary_message = encourage_msg
    
    # 如果沒有選擇任何訊息，提供一般性同理心訊息
    if not priority_message:
        general_empathy = next((msg for msg in empathy_msgs if msg["context"] == "general"), empathy_msgs[0])
        priority_message = general_empathy
    
    # 產生最終回應 - 確保不重複同類型訊息並優化格式
    selected_messages = []
    if priority_message:
        # 將訊息格式優化為步驟式格式（如適用）
        message_text = priority_message["message"]
        if "步驟" not in message_text and len(message_text) > 50 and "，" in message_text:
            # 將逗號分隔的句子轉換為步驟格式
            parts = message_text.split("，")
            if len(parts) >= 2:
                formatted_message = "\n".join([f"步驟{i+1}: {part.strip()}" for i, part in enumerate(parts) if part.strip()])
                priority_message["message"] = formatted_message
        
        selected_messages.append(priority_message)
    
    # 只有當次要訊息與主要訊息類型不同時才添加
    if secondary_message and (not priority_message or priority_message["id"].split("_")[0] != secondary_message["id"].split("_")[0]):
        # 同樣優化次要訊息格式
        message_text = secondary_message["message"]
        if "步驟" not in message_text and len(message_text) > 50 and "，" in message_text:
            parts = message_text.split("，")
            if len(parts) >= 2:
                formatted_message = "\n".join([f"步驟{i+1}: {part.strip()}" for i, part in enumerate(parts) if part.strip()])
                secondary_message["message"] = formatted_message
                
        selected_messages.append(secondary_message)
    
    # 確保我們有至少一個訊息
    if not selected_messages and empathy_msgs:
        selected_messages = [empathy_msgs[0]]
    
    return {
        "primary": selected_messages[0]["message"] if selected_messages else "我在這裡支持你。",
        "messages": selected_messages
    }

@router.post("/generate", response_model=EmotionalSupportResponse, summary="Generate Emotional Support Messages", description="Generate supportive emotional responses based on user's emotional state and context")
def generate_emotional_support(request: EmotionalSupportRequest) -> EmotionalSupportResponse:
    """
    Generate emotional support messages that provide comfort, encouragement, and empathy
    """
    try:
        response = get_emotional_support_message(request)
        
        return EmotionalSupportResponse(
            primary=response["primary"],
            messages=[EmotionalSupportMessage(**msg) for msg in response["messages"]]
        )
    except Exception as e:
        print(f"Error generating emotional support messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating emotional support: {str(e)}"
        ) from e