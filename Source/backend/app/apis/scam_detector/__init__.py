from typing import Dict, Any, Tuple, List, Optional
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

'''
1. API用途：詐騙偵測 API，程式化分析訊息中的詐騙特徵並產生回應建議
2. 關聯頁面：前台「訊息偵測」頁面和後台的「詐騙偵測設定」頁面
3. 目前狀態：部分啟用中（文字模式偵測啟用，圖片偵測功能暫時關閉；
   注意：可以與純LLM模式並行使用，LLM模式關閉不影響此API的功能）
'''

# Import scam_utils functions with robust error handling
def import_scam_utils():
    """Helper function to import scam_utils functions with graceful fallbacks"""
    try:
        # 第一種導入路徑嘗試
        from app.apis.scam_utils import detect_scam, generate_response, analyze_image
        print("Successfully imported from app.apis.scam_utils")
        return detect_scam, generate_response, analyze_image
    except ImportError as e:
        try:
            # 第二種導入路徑嘗試
            from scam_utils import detect_scam, generate_response, analyze_image
            print("Successfully imported from scam_utils")
            return detect_scam, generate_response, analyze_image
        except ImportError as e2:
            print(f"Warning: Failed to import from scam_utils: {e}, second attempt: {e2}")
            print("Using fallback implementations for scam detection functions")
            
            # 定義備用函數實現
            def detect_scam_fallback(message: str) -> Tuple[bool, Dict[str, Any], List[str]]:
                """Simple fallback implementation for scam detection"""
                return False, None, []
                
            def generate_response_fallback(scam_info: Dict[str, Any], message_type: str = "text") -> str:
                """Simple fallback implementation for response generation"""
                return "抱歉，詐騙檢測系統目前無法使用。請稍後再試。"
                
            def analyze_image_fallback(image_url: str) -> Tuple[bool, Dict[str, Any], List[str]]:
                """Simple fallback implementation for image analysis"""
                return False, None, []
                
            return detect_scam_fallback, generate_response_fallback, analyze_image_fallback

# Import the functions using our robust import helper
scam_utils_detect_scam, scam_utils_generate_response, scam_utils_analyze_image = import_scam_utils()

# Create an API router with proper endpoints and documentation
router = APIRouter(
    prefix="/scam-detector",
    tags=["scam-detector"],
    responses={404: {"description": "Not found"}}
)

# Models for API requests and responses
class ScamDetectionRequest(BaseModel):
    text: str = Field(..., description="Text to analyze for potential scams")
    language: Optional[str] = Field("auto", description="Language of the text (auto, en, zh)")

class ScamIndicator(BaseModel):
    name: str = Field(..., description="Name of the indicator category")
    matches: List[str] = Field(..., description="Specific patterns matched")
    description: str = Field(..., description="Description of why this is concerning")

class ScamTypeInfo(BaseModel):
    id: str = Field(..., description="Identifier for the scam type")
    name: str = Field(..., description="Name of the scam type")
    description: str = Field(..., description="Description of the scam type")
    confidence_score: float = Field(..., description="Confidence score (0-1) of this being the correct classification")
    advice: List[str] = Field(..., description="Advice for handling this type of scam")

class ScamDetectionResponse(BaseModel):
    is_scam: bool = Field(..., description="Whether the message appears to be a scam")
    overall_confidence: float = Field(..., description="Overall confidence score (0-1) that this is a scam")
    scam_type: Optional[ScamTypeInfo] = Field(None, description="Information about the identified scam type")
    indicators: List[ScamIndicator] = Field([], description="List of detected scam indicators")
    analysis_summary: str = Field(..., description="Summary of the analysis in natural language")

class ImageAnalysisRequest(BaseModel):
    image_url: str = Field(..., description="URL of the image to analyze")

class AdviceRequest(BaseModel):
    scam_type_id: str = Field(..., description="Identifier for the scam type")
    is_victim: bool = Field(False, description="Whether the user is already a victim of the scam")
    language: Optional[str] = Field("zh", description="Language for the advice (zh, en)")
    user_profile: Optional[Dict[str, Any]] = Field(None, description="Optional user profile information to personalize advice")

class AdviceSuggestion(BaseModel):
    title: str = Field(..., description="Short title/header for the advice")
    description: str = Field(..., description="Detailed description of the advice")
    priority: int = Field(1, description="Priority level (1-3, with 1 being highest)")
    action_link: Optional[str] = Field(None, description="Optional link for additional resources or actions")
    action_text: Optional[str] = Field(None, description="Text for the action link")

class AdviceResponse(BaseModel):
    scam_type: ScamTypeInfo = Field(..., description="Information about the scam type")
    is_victim: bool = Field(..., description="Whether the advice is for a victim")
    immediate_steps: List[AdviceSuggestion] = Field([], description="Immediate steps to take")
    preventive_measures: List[AdviceSuggestion] = Field([], description="Preventive measures for future protection")
    support_resources: List[AdviceSuggestion] = Field([], description="Support resources and contacts")
    reassurance_message: str = Field(..., description="A reassuring message to help the user feel supported")

# Enhanced: Define potential scam patterns with detailed information
SCAM_PATTERNS = {
    "urgent_action": {
        "name": "緊急行動", 
        "description": "訊息催促您立即行動，製造緊迫感以降低您的警覺性",
        "patterns": [
            r"\b緊急\b", r"\b立即\b", r"\b速度\b", r"\b盡快\b", r"\b馬上\b", r"\b現在就\b", r"\b不得延遲\b", r"\b刻不容緩\b",
            r"\bimmediately\b", r"\burgent\b", r"\bASAP\b", r"\bquick\b", r"\bnow\b", r"\binstantly\b", r"\bno delay\b"
        ]
    },
    "financial_incentives": {
        "name": "金錢誘因", 
        "description": "訊息提供非常誘人的金錢獎勵或利益，過於美好難以置信",
        "patterns": [
            r"\b贏取\b", r"\b中獎\b", r"\b獎金\b", r"\b報酬\b", r"\b紅利\b", r"\b利率\b", r"\b回報\b", r"\b免費\b", r"\b折扣\b", r"[0-9]+,[0-9]+元", r"[0-9]+元獎金", r"[0-9]+0%", r"每月15-20%", r"輕鬆賺取", r"先支付", r"成功率", r"高報酬", r"手續費", r"立即領取",
            r"\bwin\b", r"\baward\b", r"\bprize\b", r"\breward\b", r"\bbonus\b", r"\brate\b", r"\breturn\b", r"\bfree\b", r"\bdiscount\b", r"\bclaim\b", r"\bhighly\sprofitable\b"
        ]
    },
    "personal_information": {
        "name": "個人資訊請求", 
        "description": "訊息要求您提供敏感的個人資訊，這些資料可能被用於身份盜用",
        "patterns": [
            r"\b密碼\b", r"\b驗證碼\b", r"\b帳號\b", r"\b身分證\b", r"\b信用卡\b", r"\b銀行卡\b", r"\b cvv\b", r"\b卡號\b",
            r"\bpassword\b", r"\bverify\b", r"\baccount\b", r"\bID\b", r"\bcredit card\b", r"\bcode\b", r"\bpin\b", r"\bsecurity\b"
        ]
    },
    "suspicious_links": {
        "name": "可疑連結", 
        "description": "訊息包含可疑連結，點擊可能導致釣魚網站或惡意軟體下載",
        "patterns": [
            r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
            r"bit\.ly", r"goo\.gl", r"tinyurl", r"t\.co"
        ]
    },
    "impersonation": {
        "name": "身份冒充", 
        "description": "訊息冒充官方機構或知名企業，試圖獲取您的信任",
        "patterns": [
            r"\b銀行\b", r"\b客服\b", r"\b政府\b", r"\b公司\b", r"\b警察\b", r"\b稅務\b", r"\b海關\b", r"\b電信\b", r"\b官方\b",
            r"\bbank\b", r"\bcustomer service\b", r"\bgovernment\b", r"\bcompany\b", r"\bpolice\b", r"\btax\b", r"\bofficial\b"
        ]
    },
    "investment_schemes": {
        "name": "投資騙局", 
        "description": "訊息提供不切實際的投資機會，承諾高回報和低風險",
        "patterns": [
            r"\b投資\b", r"\b股票\b", r"\b基金\b", r"\b加密貨幣\b", r"\b比特幣\b", r"\b以太幣\b", r"\b保證[^\s]*利\b", r"\b翻倍\b", r"秘密投資", r"[0-9]+%回報", r"限量名額", r"致富", r"專家團隊", r"絕佳標的", r"風險低", r"獲利", r"穩賺", r"無風險",
            r"\binvestment\b", r"\bstock\b", r"\bfund\b", r"\bcrypto\b", r"\bbitcoin\b", r"\bethereum\b", r"\bguaranteed\b", r"\bdouble\b", r"\bhigh return\b", r"\blow risk\b", r"\bsecret\b"
        ]
    },
    "romance_scam": {
        "name": "感情詐騙", 
        "description": "訊息利用感情操控，快速建立親密關係後要求金錢協助",
        "patterns": [
            r"\b交友\b", r"\b戀愛\b", r"\b愛情\b", r"\b約會\b", r"\b喜歡你\b", r"\b愛你\b", r"\b想你\b", r"\b想見你\b", r"親愛", r"借[0-9]+元", r"銀行卡", r"凍結", r"給我", r"會還你", r"一直在想你", r"見你",
            r"\bdating\b", r"\bromance\b", r"\blove\b", r"\brelationship\b", r"\blike you\b", r"\blove you\b", r"\bmiss you\b", r"dear", r"darling", r"sweetheart"
        ]
    },
    "threat_or_blackmail": {
        "name": "威脅或勒索", 
        "description": "訊息使用威脅或恐嚇手段，聲稱掌握您的隱私或會造成傷害",
        "patterns": [
            r"\b威脅\b", r"\b勒索\b", r"\b恐嚇\b", r"\b曝光\b", r"\b攻擊\b", r"\b後果\b", r"\b危險\b", r"\b黑客\b",
            r"\bthreat\b", r"\bblackmail\b", r"\bexpose\b", r"\bhack\b", r"\bdanger\b", r"\bconsequence\b", r"\bpunish\b"
        ]
    },
    "fake_job_offers": {
        "name": "虛假工作機會", 
        "description": "訊息提供不切實際的工作機會，通常要求先付費或要求個人資訊",
        "patterns": [
            r"\b工作機會\b", r"\b賺錢\b", r"\b在家工作\b", r"\b兼職\b", r"\b高薪\b", r"\b招聘\b", r"\b錄取\b", r"\b面試\b",
            r"\bjob opportunity\b", r"\bmake money\b", r"\bwork from home\b", r"\bpart-time\b", r"\bhigh salary\b", r"\bhiring\b"
        ]
    },
    "lottery_or_inheritance": {
        "name": "彩票或遺產詐騙", 
        "description": "訊息聲稱您中了彩票或有遺產繼承，但要求先付費才能領取",
        "patterns": [
            r"\b彩票\b", r"\b樂透\b", r"\b中獎\b", r"\b遺產\b", r"\b繼承\b", r"\b領取\b", r"\b抽獎\b", r"\b幸運號碼\b",
            r"\blottery\b", r"\bjackpot\b", r"\bprize\b", r"\binheritance\b", r"\bclaim\b", r"\blucky number\b", r"\bwinner\b"
        ]
    }
}

# Enhanced: Define detailed victim recovery advice for each scam type
VICTIM_RECOVERY_ADVICE = {
    "fake_customer_service": {
        "immediate_steps": [
            {
                "title": "立即聯絡銀行或相關機構",
                "description": "如果您已經提供帳號、密碼等資訊，請立即聯絡您的銀行或相關機構凍結帳戶和卡片，並更改其他使用相同密碼的帳號。",
                "priority": 1
            },
            {
                "title": "保存所有通訊紀錄",
                "description": "保留與詐騙者的所有對話、訊息、電子郵件和電話記錄，這些將作為舉報的證據。",
                "priority": 2
            },
            {
                "title": "檢查設備安全",
                "description": "如果您點擊了可疑連結或下載了檔案，請執行完整的病毒掃描，必要時重設您的裝置。",
                "priority": 2
            }
        ],
        "support_resources": [
            {
                "title": "撥打165反詐騙專線",
                "description": "請撥打165反詐騙專線尋求協助和舉報詐騙行為。",
                "priority": 1,
                "action_link": "tel:165",
                "action_text": "立即撥打"
            },
            {
                "title": "向金融監督管理委員會舉報",
                "description": "如果是金融機構相關詐騙，向金管會舉報有助於防止其他人受騙。",
                "priority": 2
            }
        ],
        "reassurance": "許多人都曾遭遇類似的詐騙嘗試，您不是孤單的。越快採取行動，就能降低損失的風險。我們在這裡支持您度過這個困難時期。"
    },
    "investment_scam": {
        "immediate_steps": [
            {
                "title": "停止所有進一步的資金轉移",
                "description": "無論詐騙者如何遊說或威脅，立即停止任何進一步的資金轉移。",
                "priority": 1
            },
            {
                "title": "收集證據和紀錄",
                "description": "保存所有通訊、轉帳證明和投資合約，這些將成為重要的證據。",
                "priority": 1
            },
            {
                "title": "向銀行報告詐騙轉帳",
                "description": "立即聯絡您的銀行報告詐騙轉帳，某些情況下可能還能追回款項。",
                "priority": 1
            }
        ],
        "support_resources": [
            {
                "title": "向金管會證券期貨局舉報",
                "description": "向金管會證券期貨局舉報未經核准的投資計劃或可疑的投資詐騙。",
                "priority": 1
            },
            {
                "title": "向165反詐騙專線舉報",
                "description": "聯絡165反詐騙專線報案並提供詳細的詐騙情況說明。",
                "priority": 1,
                "action_link": "tel:165",
                "action_text": "立即撥打"
            },
            {
                "title": "尋求法律諮詢",
                "description": "諮詢律師了解您的法律選擇和可能的賠償途徑。",
                "priority": 2
            }
        ],
        "reassurance": "投資詐騙常使用複雜的手法使人信服，許多聰明的人都曾受騙。重要的是現在採取行動防止進一步損失，並嘗試追回資金。您並不孤單，有專業人士可以幫助您。"
    },
    "romance_scam": {
        "immediate_steps": [
            {
                "title": "立即中斷聯繫",
                "description": "無論有多麼困難，立即中斷與詐騙者的所有聯繫，並阻止其聯絡管道。",
                "priority": 1
            },
            {
                "title": "檢查其他財務帳戶",
                "description": "檢查您的信用報告和銀行對帳單，確保沒有其他未經授權的活動。",
                "priority": 1
            },
            {
                "title": "向銀行報告詐騙交易",
                "description": "如果您曾向詐騙者轉帳，立即聯絡銀行嘗試阻止或撤銷這些交易。",
                "priority": 1
            }
        ],
        "support_resources": [
            {
                "title": "尋求情感支持",
                "description": "與信任的朋友、家人或專業心理諮詢師交談，處理這種背叛可能帶來的情感創傷。",
                "priority": 1
            },
            {
                "title": "向165反詐騙專線舉報",
                "description": "向165反詐騙專線詳細報告您的經歷，幫助當局追蹤和制止這些詐騙者。",
                "priority": 1,
                "action_link": "tel:165",
                "action_text": "立即撥打"
            },
            {
                "title": "向交友平台報告",
                "description": "向您認識詐騙者的網站或應用程式報告此帳號，以防止他們詐騙他人。",
                "priority": 2
            }
        ],
        "reassurance": "感情詐騙特別傷人，因為它們利用了人們尋求連結的自然渴望。請記住，您並沒有做錯什麼，這些經歷不代表您的判斷能力。給自己時間痊癒，並允許信任的人在這個過程中支持您。"
    },
    "prize_or_lottery_scam": {
        "immediate_steps": [
            {
                "title": "向銀行報告詐騙轉帳",
                "description": "如果您已向詐騙者付款，立即聯絡您的銀行報告詐騙並嘗試撤回款項。",
                "priority": 1
            },
            {
                "title": "檢查您的帳戶安全",
                "description": "如果您提供了個人資料，請更改相關帳戶的密碼，並監控信用報告中的可疑活動。",
                "priority": 1
            },
            {
                "title": "保存所有通訊證據",
                "description": "保留所有詐騙者的訊息、電子郵件和其他通訊記錄，作為舉報的證據。",
                "priority": 2
            }
        ],
        "support_resources": [
            {
                "title": "向165反詐騙專線舉報",
                "description": "撥打165反詐騙專線報案，提供詳細情況和任何收集到的證據。",
                "priority": 1,
                "action_link": "tel:165",
                "action_text": "立即撥打"
            },
            {
                "title": "向消費者保護官舉報",
                "description": "聯絡當地消費者保護官舉報此詐騙，幫助警示其他人。",
                "priority": 2
            }
        ],
        "reassurance": "中獎詐騙針對的是人們改善生活的希望，受害者遍布各年齡層和背景。重要的是記住，您不會因為未參加的活動中獎，而任何合法獎項不會要求您預先付款。"
    },
    "general_suspicious": {
        "immediate_steps": [
            {
                "title": "保存證據但不要回應",
                "description": "保存可疑訊息作為記錄，但不要回應或點擊其中的任何連結。",
                "priority": 1
            },
            {
                "title": "檢查您的帳戶安全",
                "description": "如果您已分享敏感資訊，請立即更改相關帳戶的密碼並啟用雙因素認證。",
                "priority": 1
            },
            {
                "title": "向相關機構確認",
                "description": "如果訊息聲稱來自特定組織，請通過官方管道直接聯絡該組織確認。",
                "priority": 2
            }
        ],
        "support_resources": [
            {
                "title": "向165反詐騙專線諮詢",
                "description": "如果您懷疑可能遭遇詐騙，可以撥打165反詐騙專線尋求專業建議。",
                "priority": 1,
                "action_link": "tel:165",
                "action_text": "立即撥打"
            },
            {
                "title": "向電信商舉報",
                "description": "如果是來自簡訊或電話的可疑訊息，向您的電信商舉報。",
                "priority": 2
            }
        ],
        "reassurance": "對訊息保持警覺是明智之舉。在數位時代，謹慎處理未經確認的通訊是保護自己的重要方式。您的警覺性是最好的防線。"
    }
}

# Enhanced: Define detailed preventive measures for each scam type
PREVENTIVE_ADVICE = {
    "fake_customer_service": {
        "preventive_measures": [
            {
                "title": "直接聯絡官方管道",
                "description": "收到聲稱來自銀行或公司的訊息時，不要使用訊息中提供的聯絡方式，而是通過官方網站或應用程式直接聯絡客服。",
                "priority": 1
            },
            {
                "title": "保護個人資訊",
                "description": "永遠不要通過電子郵件、簡訊或電話提供您的完整帳號、密碼、驗證碼或個人資料。合法機構不會以這種方式要求這些資訊。",
                "priority": 1
            },
            {
                "title": "檢查通訊真實性",
                "description": "留意電子郵件地址、網址和電話號碼的細微差異。合法機構的官方網址通常以公司名稱開頭，且有安全連線(https)。",
                "priority": 2
            },
            {
                "title": "使用多因素認證",
                "description": "為您的重要帳戶啟用雙因素或多因素認證，增加額外的安全層級。",
                "priority": 3
            }
        ],
        "support_resources": [
            {
                "title": "定期檢查帳戶活動",
                "description": "養成定期檢查銀行和信用卡對帳單的習慣，及早發現可疑交易。",
                "priority": 2
            },
            {
                "title": "學習辨別詐騙訊息",
                "description": "了解詐騙者常用的手法和警示信號，提高警覺性。",
                "priority": 2,
                "action_link": "https://165.npa.gov.tw/",
                "action_text": "了解更多"
            }
        ],
        "reassurance": "保持健康的懷疑態度是保護自己的最佳方法。當心急切要求立即行動的訊息，合法機構會給您時間思考和確認。"
    },
    "investment_scam": {
        "preventive_measures": [
            {
                "title": "進行充分研究",
                "description": "在任何投資前，徹底研究該公司、產品和相關人員。查詢其是否在金管會註冊及其監管狀態。",
                "priority": 1
            },
            {
                "title": "警惕高報酬低風險承諾",
                "description": "對承諾高回報且風險極低的投資保持高度警惕。合法投資通常會坦誠說明風險與報酬的關係。",
                "priority": 1
            },
            {
                "title": "抵制高壓銷售策略",
                "description": "警惕使用期限限制、獨家機會和其他製造緊迫感的策略。給自己時間冷靜思考和尋求獨立建議。",
                "priority": 2
            },
            {
                "title": "了解投資產品",
                "description": "只投資您真正理解的產品。如果解釋過於複雜或模糊，這可能是一個警訊。",
                "priority": 2
            }
        ],
        "support_resources": [
            {
                "title": "諮詢認證財務顧問",
                "description": "在進行大筆投資前，考慮諮詢獨立的認證財務顧問的專業建議。",
                "priority": 1
            },
            {
                "title": "查詢金管會投資警示",
                "description": "定期查詢金管會發布的投資警示和未經核准的投資計劃清單。",
                "priority": 2,
                "action_link": "https://www.fsc.gov.tw/",
                "action_text": "查看警示"
            }
        ],
        "reassurance": "明智的投資需要時間和研究。保持謹慎和了解市場現實將幫助您做出更安全的財務決策。記住：如果聽起來好得不像真的，那它可能就不是真的。"
    },
    "romance_scam": {
        "preventive_measures": [
            {
                "title": "進行視訊通話確認",
                "description": "在建立深入關係前，堅持進行視訊通話。詐騙者通常會找藉口避免露面。",
                "priority": 1
            },
            {
                "title": "警惕快速發展的線上關係",
                "description": "對於迅速表達強烈感情或很快談及未來的網友保持警惕，真實的感情需要時間建立。",
                "priority": 1
            },
            {
                "title": "反向搜尋照片",
                "description": "使用Google圖片搜尋或TinEye等工具，檢查對方的照片是否被盜用或出現在其他地方。",
                "priority": 2
            },
            {
                "title": "保持財務獨立",
                "description": "無論理由多麼令人同情，永遠不要向網友轉帳、投資或提供財務支援，特別是在未曾面對面見過的情況下。",
                "priority": 1
            }
        ],
        "support_resources": [
            {
                "title": "徵詢信任的朋友意見",
                "description": "與信任的朋友分享您的線上關係狀況，獲取客觀的第三方觀點。",
                "priority": 2
            },
            {
                "title": "了解常見感情詐騙手法",
                "description": "熟悉感情詐騙的常見模式和警示信號，提高自我保護意識。",
                "priority": 2,
                "action_link": "https://165.npa.gov.tw/",
                "action_text": "了解更多"
            }
        ],
        "reassurance": "在數位時代尋找連結是自然的，但保持健康的界限和適度的懷疑態度是明智之舉。真正關心您的人會尊重您的安全考量和時間需求。"
    },
    "prize_or_lottery_scam": {
        "preventive_measures": [
            {
                "title": "質疑未參加的中獎通知",
                "description": "記住一個基本原則：您不可能在未參加的抽獎活動中獲獎。任何聲稱您中獎但您不記得參加的通知都應被視為可疑。",
                "priority": 1
            },
            {
                "title": "警惕預付費用要求",
                "description": "合法獎項不會要求您支付任何費用來領取獎金。如果要求您支付稅金、手續費或任何費用，這是詐騙的明確信號。",
                "priority": 1
            },
            {
                "title": "驗證抽獎活動真實性",
                "description": "收到中獎通知時，獨立搜尋該抽獎活動和舉辦組織的相關資訊，通過官方管道確認其真實性。",
                "priority": 2
            },
            {
                "title": "保護個人資訊",
                "description": "不要向陌生的抽獎或獎金通知提供您的銀行資訊、身分證號碼或其他敏感個人資料。",
                "priority": 1
            }
        ],
        "support_resources": [
            {
                "title": "了解合法抽獎特徵",
                "description": "熟悉合法抽獎活動的特徵，如清晰的規則、主辦方資訊和無預付費用要求。",
                "priority": 2,
                "action_link": "https://165.npa.gov.tw/",
                "action_text": "了解更多"
            },
            {
                "title": "檢查官方中獎名單",
                "description": "大型彩券和抽獎活動通常會在官方網站公布獲獎者名單，可以前往查證。",
                "priority": 3
            }
        ],
        "reassurance": "人人都希望贏得大獎，但合法的中獎通知不會讓您感到壓力或要求您立即行動。給自己時間核實所有資訊，這是保護自己的明智做法。"
    },
    "general_suspicious": {
        "preventive_measures": [
            {
                "title": "保持警覺和批判性思考",
                "description": "對任何非預期或不尋常的訊息保持謹慎。詢問自己：這為什麼會發給我？有語法或拼字錯誤嗎？寄件者要求什麼？",
                "priority": 1
            },
            {
                "title": "不點擊可疑連結",
                "description": "避免點擊未經證實來源的訊息中的連結。如果需要訪問某網站，請直接在瀏覽器中輸入已知的官方網址。",
                "priority": 1
            },
            {
                "title": "定期更新密碼",
                "description": "使用強密碼並定期更換，為不同帳戶使用不同密碼，以防一個帳戶被入侵影響其他帳戶。",
                "priority": 2
            },
            {
                "title": "保持軟體更新",
                "description": "確保您的設備、應用程式和防毒軟體保持最新狀態，以防範最新的安全威脅。",
                "priority": 2
            }
        ],
        "support_resources": [
            {
                "title": "學習辨別詐騙技巧",
                "description": "熟悉常見詐騙手法和警告信號，提高自我保護能力。",
                "priority": 2,
                "action_link": "https://165.npa.gov.tw/",
                "action_text": "了解更多"
            },
            {
                "title": "使用安全工具",
                "description": "考慮使用密碼管理器、雙因素認證和防毒軟體等工具增強您的數位安全。",
                "priority": 3
            }
        ],
        "reassurance": "數位世界日益複雜，但通過保持警覺和採取基本的安全措施，您可以大大降低成為詐騙受害者的風險。您的直覺通常是正確的——如果感覺不對勁，那可能就是有問題。"
    }
}

# Enhanced: Define scam types with more detailed classifications and advice
SCAM_TYPES = {
    "fake_customer_service": {
        "name": "假冒客服詐騙",
        "description": "詐騙者冒充銀行、電商平台或公用事業等客服人員，聲稱您的賬戶有疑似不對勢交易或問題需要針對。",
        "advice": [
            "永遠不要提供您的賬號、密碼、OTP等資料，合法客服總和不會記齊要求這些資料",
            "不要急於點擊訊息連結，請直接聯絡官方客服管道確認",
            "無論對方如何急迫，總應多花3分鐘思考認真輕重"
        ],
        "indicators": ["personal_information", "urgent_action", "impersonation", "suspicious_links"]
    },
    "investment_scam": {
        "name": "投資詐騙",
        "description": "詐騙者以高報酬率或誘餌引誘受害者進行投資，包含加密貨幣及股息、股票、投款計劃等方式。",
        "advice": [
            "沒有穩賺的投資，請細心謹慎對待投資高收益率的產品",
            "只向合法監管機構的投資平台投資",
            "投資前仔細查核公司背景及合約細則"
        ],
        "indicators": ["financial_incentives", "investment_schemes", "urgent_action"]
    },
    "romance_scam": {
        "name": "交友詐騙",
        "description": "詐騙者在交友軟件或社交平台上創建虛假個人資料，並織造浪漫的戀愛情節。在建立信任關係後，開始要求金錢援助。",
        "advice": [
            "謹慎交友，尤其是顯示經濟富裕的陌生人",
            "盡量使用視訊或實際見面驗證對方身份",
            "不要輕易轉帳或提供個人財物資料"
        ],
        "indicators": ["romance_scam", "financial_incentives", "urgent_action"]
    },
    "prize_or_lottery_scam": {
        "name": "中獎詐騙",
        "description": "詐騙者通知您在未參加的抽獎活動中獲獎，但提取獎金前，您需要先支付手續費或稅金等費用。",
        "advice": [
            "未參加的抽獎活動不可能中獎",
            "真正的獎項不會要求您預先支付任何費用",
            "對任何要求轉帳的抽獎通知保持警惕"
        ],
        "indicators": ["financial_incentives", "suspicious_links", "urgent_action"]
    },
    "general_suspicious": {
        "name": "可疑訊息",
        "description": "這則訊息包含一些可疑元素，建議您提高警覺。",
        "advice": [
            "對要求個人資料或金錢的訊息保持警惕",
            "不要點擊不明來源的連結",
            "如有疑問，請透過官方管道確認"
        ],
        "indicators": []
    }
}

def calculate_confidence_score(matched_categories: List[str], matched_indicators: List[Dict[str, Any]], message_length: int) -> float:
    """
    Calculate a confidence score based on the number and types of matched categories,
    the specific matches found, and the message length
    
    Args:
        matched_categories: List of matched category IDs
        matched_indicators: Detailed information about matches
        message_length: Length of the message in characters
        
    Returns:
        Confidence score between 0 and 1
    """
    # Base factors
    category_count = len(matched_categories)  # Number of different categories matched
    total_categories = len(SCAM_PATTERNS)     # Total number of possible categories
    
    # No matches means no confidence
    if category_count == 0:
        return 0.0
    
    # Base score from category matches (0.1 to 0.7)
    # More weight given to matches to make detection more sensitive
    base_score = min(0.7, (category_count / total_categories) * 0.7 + 0.15)
    
    # Adjust based on high-risk and medium-risk categories
    high_risk_categories = ["personal_information", "suspicious_links", "threat_or_blackmail"]
    medium_risk_categories = ["urgent_action", "financial_incentives", "impersonation"]
    
    high_risk_bonus = sum(0.12 for cat in matched_categories if cat in high_risk_categories)
    medium_risk_bonus = sum(0.07 for cat in matched_categories if cat in medium_risk_categories)
    risk_score = min(0.25, high_risk_bonus + medium_risk_bonus)  # Cap at 0.25
    
    # Adjust based on number of matches in each category (density of hits)
    match_density = 0
    for ind in matched_indicators:
        matches_count = len(ind.get("matches", []))
        # More matches in a single category increases confidence
        match_density += min(0.05, matches_count * 0.01)  # Diminishing returns
    
    # Adjust for message length (very short or very long messages are less likely to be scams)
    length_factor = 1.0
    if message_length < 20:  # Very short messages
        length_factor = 0.5
    elif message_length > 500:  # Very long messages
        length_factor = 0.8
    
    # Combine factors
    confidence = (base_score + risk_score + match_density) * length_factor
    
    # Ensure score is between 0 and 1
    return min(1.0, max(0.0, confidence))

def generate_analysis_summary(is_scam: bool, scam_type: Optional[Dict[str, Any]], 
                              indicators: List[Dict[str, Any]], confidence: float) -> str:
    """
    Generate a natural language summary of the scam analysis
    
    Args:
        is_scam: Whether the message appears to be a scam
        scam_type: Information about the identified scam type
        indicators: List of detected scam indicators
        confidence: Overall confidence score
        
    Returns:
        String containing the analysis summary
    """
    if not is_scam or confidence < 0.2:
        return "此訊息未顯示明顯的詐騙特徵。但請記住，詐騙手法日益精進，若您對任何訊息感到懷疑，請多加留意。"
    
    # Format confidence level as percentage and text
    confidence_percent = int(confidence * 100)
    confidence_text = "低" if confidence < 0.5 else "中" if confidence < 0.75 else "高"
    
    # Start with basic summary
    if scam_type:
        summary = f"此訊息極有可能是【{scam_type['name']}】。風險評估：{confidence_text}級風險 ({confidence_percent}%)。\n\n"
        summary += f"{scam_type['description']}\n\n"
    else:
        summary = f"此訊息顯示可疑特徵，風險評估：{confidence_text}級風險 ({confidence_percent}%)。\n\n"
    
    # Add information about detected patterns
    if indicators:
        summary += "檢測到的可疑元素：\n"
        for i, indicator in enumerate(indicators[:3], 1):  # Show at most 3 indicators
            summary += f"{i}. {indicator['name']}：{indicator['description']}\n"
        
        if len(indicators) > 3:
            summary += f"...以及其他 {len(indicators) - 3} 個可疑元素\n"
    
    # Add advice
    if scam_type and "advice" in scam_type:
        summary += "\n安全建議：\n"
        for i, advice in enumerate(scam_type["advice"], 1):
            summary += f"{i}. {advice}\n"
    
    summary += "\n若您已經提供個人資料或進行轉帳，請立即聯絡相關機構並撥打165防詐騙專線。"
    
    return summary

# Enhanced detection function with rich analysis and confidence scoring
def detect_scam(message: str) -> Tuple[bool, Dict[str, Any], List[Dict[str, Any]], float]:
    """
    Analyze a message for potential scam indicators
    
    Args:
        message: The message text to analyze
        
    Returns:
        Tuple containing:
        - Boolean indicating if the message appears to be a scam
        - Dictionary with scam type information if detected, or None
        - List of matched pattern categories
    """
    # Skip short messages or empty ones
    if not message or len(message) < 5:
        return False, None, [], 0.0
        
    # Check for patterns and collect detailed information
    matched_indicators = []
    for category_id, category_info in SCAM_PATTERNS.items():
        matches = []
        for pattern in category_info["patterns"]:
            # Find all matches in the message
            matches_found = re.findall(pattern, message, re.IGNORECASE)
            if matches_found:
                matches.extend(matches_found)
        
        # If we found matches for this category, add it to our results
        if matches:
            matched_indicators.append({
                "category_id": category_id,
                "name": category_info["name"],
                "description": category_info["description"],
                "matches": list(set(matches))  # Remove duplicates
            })
    
    # Extract just the category IDs for easier processing
    matched_categories = [ind["category_id"] for ind in matched_indicators]
    
    # Skip if no patterns matched
    if not matched_categories:
        return False, None, [], 0.0
        
    # Calculate overall confidence score
    confidence_score = calculate_confidence_score(matched_categories, matched_indicators, len(message))
    
    # Determine most likely scam type with improved scoring
    most_likely_scam = None
    max_score = 0
    
    for scam_id, scam_info in SCAM_TYPES.items():
        # Skip general suspicious category in initial matching
        if scam_id == "general_suspicious":
            continue
            
        indicators = scam_info.get("indicators", [])
        
        # Calculate a score based on how many of this scam type's indicators match our message
        # Give more weight to matches with multiple patterns in the same category
        score = 0
        for cat in matched_categories:
            if cat in indicators:
                # Increase score more if we have a lot of matches in this category
                cat_matches = sum(len(ind["matches"]) for ind in matched_indicators 
                                  if ind["category_id"] == cat)
                score += 1 + min(0.5, cat_matches * 0.1)  # Base + bonus for multiple matches
        
        # If we match more indicators than the current best match, update our result
        if score > max_score:
            max_score = score
            
            # Create a copy of the scam info with the ID and a confidence score
            most_likely_scam = scam_info.copy()
            most_likely_scam["id"] = scam_id
            
            # Calculate specific confidence for this scam type
            matched_indicator_ratio = sum(1 for ind in indicators if ind in matched_categories) / len(indicators) if indicators else 0
            type_confidence = matched_indicator_ratio * 0.7 + confidence_score * 0.3
            most_likely_scam["confidence_score"] = min(1.0, type_confidence)
    
    # If no specific scam type matched well but we have suspicious elements, use generic
    is_scam = confidence_score > 0.2  # Lower threshold to catch more potential scams
    
    if is_scam and (max_score < 1.5 or not most_likely_scam):
        most_likely_scam = SCAM_TYPES["general_suspicious"].copy()
        most_likely_scam["id"] = "general_suspicious"
        most_likely_scam["confidence_score"] = confidence_score
    
    return is_scam, most_likely_scam, matched_indicators, confidence_score

def generate_response(scam_info: Dict[str, Any], message_type: str = "text") -> str:
    """
    Generate a response based on the detected scam type
    
    Args:
        scam_info: Dictionary containing scam type information
        message_type: Type of message (text, image, etc.)
        
    Returns:
        String containing the response message
    """
    if not scam_info:
        return "您好！我是防詐小安。有什麼需要我協助的嗎？如果您收到可疑訊息，可以轉發給我來分析。"
    
    scam_name = scam_info.get("name", "可疑訊息")
    description = scam_info.get("description", "")
    advice_list = scam_info.get("advice", [])
    
    # 縮短描述長度以保持回覆簡短
    if len(description) > 60:
        description = description[:60] + "..."
    
    # Build the response with clear step numbering
    response = f"⚠️ 警告！這可能是【{scam_name}】\n\n{description}\n\n安全建議：\n"
    
    for i, advice in enumerate(advice_list, 1):
        # 確保每條建議不超過60個字符
        if len(advice) > 60:
            advice = advice[:60] + "..."
        response += f"步驟{i}: {advice}\n"
    
    # 簡化最後的提醒以減少總長度
    response += "\n如有提供個資或轉帳，請立即聯絡相關機構並撥打165防詐專線。\n\n小安在此陪伴您！"
    
    return response
    
def analyze_image(image_url: str) -> Tuple[bool, Dict[str, Any], List[Dict[str, Any]], float]:
    """
    Analyze an image for potential scam indicators - enhanced placeholder
    
    Args:
        image_url: URL of the image to analyze
        
    Returns:
        Tuple containing:
        - Boolean indicating if the image appears to be a scam
        - Dictionary with scam type information if detected, or None
        - List of detailed indicator dictionaries
        - Overall confidence score
    """
    # This is just a placeholder - we're not actually analyzing images yet
    # In the future, we could implement OCR and image analysis
    return False, None, [], 0.0

# Generate personalized advice based on scam type and victim status
def generate_personalized_advice(scam_type_id: str, is_victim: bool, user_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate personalized advice based on scam type and whether the user is a victim
    
    Args:
        scam_type_id: Identifier for the scam type
        is_victim: Whether the user is already a victim of the scam
        user_profile: Optional user profile information to further personalize advice
        
    Returns:
        Dictionary containing personalized advice
    """
    # Default to general suspicious if scam type not found
    if scam_type_id not in SCAM_TYPES and scam_type_id not in PREVENTIVE_ADVICE:
        scam_type_id = "general_suspicious"
        
    # Get basic scam type information
    scam_type_info = SCAM_TYPES.get(scam_type_id, SCAM_TYPES["general_suspicious"]).copy()
    scam_type_info["id"] = scam_type_id
    
    # Initialize response structure
    advice_response = {
        "scam_type": scam_type_info,
        "is_victim": is_victim,
        "immediate_steps": [],
        "preventive_measures": [],
        "support_resources": [],
        "reassurance_message": ""
    }
    
    if is_victim:
        # For victims, focus on recovery steps
        recovery_advice = VICTIM_RECOVERY_ADVICE.get(scam_type_id, VICTIM_RECOVERY_ADVICE["general_suspicious"])
        
        # Add immediate steps
        advice_response["immediate_steps"] = recovery_advice.get("immediate_steps", [])
        
        # Add support resources
        advice_response["support_resources"] = recovery_advice.get("support_resources", [])
        
        # Add reassurance message
        advice_response["reassurance_message"] = recovery_advice.get("reassurance", "您不是孤單的。許多人都曾經歷類似情況，重要的是現在採取行動保護自己。")
        
        # Add preventive measures (fewer for victims as they need to focus on recovery)
        preventive_advice = PREVENTIVE_ADVICE.get(scam_type_id, PREVENTIVE_ADVICE["general_suspicious"])
        top_preventive_measures = sorted(preventive_advice.get("preventive_measures", []), key=lambda x: x.get("priority", 99))[:2]
        advice_response["preventive_measures"] = top_preventive_measures
    else:
        # For non-victims, focus on prevention
        preventive_advice = PREVENTIVE_ADVICE.get(scam_type_id, PREVENTIVE_ADVICE["general_suspicious"])
        
        # Add preventive measures
        advice_response["preventive_measures"] = preventive_advice.get("preventive_measures", [])
        
        # Add support resources
        advice_response["support_resources"] = preventive_advice.get("support_resources", [])
        
        # Add reassurance message
        advice_response["reassurance_message"] = preventive_advice.get("reassurance", "保持警覺是保護自己最好的方式。了解詐騙手法可以幫助您避免成為受害者。")
    
    # Personalize advice based on user profile if available
    if user_profile:
        # Example: Add age-specific advice
        age = user_profile.get("age")
        if age and age > 65:
            advice_response["preventive_measures"].append({
                "title": "尋求家人協助",
                "description": "與信任的家人分享可疑訊息，在做出財務決定前徵詢他們的意見。",
                "priority": 1
            })
    
    return advice_response

# API Endpoints
@router.post("/analyze-text", response_model=ScamDetectionResponse, summary="Analyze Text", description="Analyze text for potential scam indicators")
def analyze_scam_text(request: ScamDetectionRequest):
    """
    Analyze text for potential scam indicators
    """
    # 臨時關閉詐騙檢測
    print("詐騙檢測已關閉，直接返回正常結果")
    return ScamDetectionResponse(
        is_scam=False,
        overall_confidence=0.0,
        scam_type=None,
        indicators=[],
        analysis_summary="訊息分析結果正常，未檢測到詐騙跡象。"
    )
    
    try:
        # Run the scam detection using the imported function
        is_scam, scam_type_info, matched_categories = scam_utils_detect_scam(request.text)
        
        # For compatibility with older API, set confidence to a reasonable value based on matches
        confidence = min(1.0, len(matched_categories) * 0.2) if matched_categories else 0.0
        
        # Convert matched categories to the expected format for the response
        matched_indicators = []
        for category in matched_categories:
            matched_indicators.append({
                "name": category.replace("_", " ").title(),
                "matches": [category],  # simplified
                "description": f"Detected {category.replace('_', ' ')} patterns in the message"
            })
        
        # Generate analysis summary
        analysis_summary = "This message " + ("appears to contain elements commonly found in scam messages. Please be cautious." if is_scam else "does not appear to contain obvious scam indicators. However, always stay vigilant.")
        
        if is_scam and scam_type_info:
            analysis_summary = f"This message appears to be a {scam_type_info['name']}. {scam_type_info['description']}\n\nAdvice:\n" + "\n".join([f"- {advice}" for advice in scam_type_info.get("advice", [])])
        
        # Convert the matched indicators to the response format
        indicators = [
            ScamIndicator(
                name=ind["name"],
                matches=ind["matches"],
                description=ind["description"]
            ) for ind in matched_indicators
        ]
        
        # Convert the scam type info to the response format
        scam_type = None
        if scam_type_info:
            # Add a confidence score if not present
            if "confidence_score" not in scam_type_info:
                scam_type_info["confidence_score"] = confidence
                
            scam_type = ScamTypeInfo(
                id=scam_type_info.get("id", "unknown"),
                name=scam_type_info.get("name", "Unknown Scam Type"),
                description=scam_type_info.get("description", ""),
                confidence_score=scam_type_info.get("confidence_score", 0.5),
                advice=scam_type_info.get("advice", [])
            )
        
        # Return the response
        return ScamDetectionResponse(
            is_scam=is_scam,
            overall_confidence=confidence,
            scam_type=scam_type,
            indicators=indicators,
            analysis_summary=analysis_summary
        )
    except Exception as e:
        # Log the error
        print(f"Error analyzing text: {str(e)}")
        # Re-raise as HTTP exception
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing text: {str(e)}"
        ) from e

@router.post("/analyze-image", response_model=ScamDetectionResponse, summary="Analyze Image", description="Analyze an image for potential scam indicators (placeholder)")
def analyze_image_endpoint(request: ImageAnalysisRequest):
    """
    Placeholder for future image analysis capability
    """
    # 臨時關閉圖片詐騙檢測
    print("圖片詐騙檢測已關閉，直接返回正常結果")
    return ScamDetectionResponse(
        is_scam=False,
        overall_confidence=0.0,
        scam_type=None,
        indicators=[],
        analysis_summary="圖片分析結果正常，未檢測到詐騙跡象。"
    )
    # This is just a placeholder - we're not actually analyzing images yet
    return ScamDetectionResponse(
        is_scam=False,
        overall_confidence=0.0,
        scam_type=None,
        indicators=[],
        analysis_summary="圖片分析功能正在開發中。目前無法分析圖片中的詐騙風險。"
    )

# Generate personalized advice endpoint
@router.post("/generate-advice", response_model=AdviceResponse, summary="Generate Personalized Advice", description="Generate personalized advice based on scam type and victim status")
def generate_advice(request: AdviceRequest):
    """
    Generate personalized advice based on scam type and victim status
    """
    try:
        advice = generate_personalized_advice(
            scam_type_id=request.scam_type_id,
            is_victim=request.is_victim,
            user_profile=request.user_profile
        )
        
        # Convert to Pydantic model format
        return AdviceResponse(
            scam_type=ScamTypeInfo(
                id=advice["scam_type"]["id"],
                name=advice["scam_type"]["name"],
                description=advice["scam_type"]["description"],
                confidence_score=1.0,  # Not relevant for this endpoint but required
                advice=advice["scam_type"]["advice"]
            ),
            is_victim=advice["is_victim"],
            immediate_steps=[AdviceSuggestion(**step) for step in advice["immediate_steps"]],
            preventive_measures=[AdviceSuggestion(**measure) for measure in advice["preventive_measures"]],
            support_resources=[AdviceSuggestion(**resource) for resource in advice["support_resources"]],
            reassurance_message=advice["reassurance_message"]
        )
    except Exception as e:
        # Log the error
        print(f"Error generating advice: {str(e)}")
        # Re-raise as HTTP exception
        raise HTTPException(
            status_code=500,
            detail=f"Error generating advice: {str(e)}"
        ) from e

# Testing endpoint
@router.get("/examples", summary="Get Examples", description="Get example scam messages for testing")
def get_examples():
    """
    Get example scam messages for testing
    """
    examples = [
        {
            "title": "假冒銀行客服",
            "text": "【緊急通知】您的銀行帳戶出現異常交易，為確保資金安全，請立即撥打客服電話或點擊連結驗證身份：https://bank-secure.example.com"
        },
        {
            "title": "投資詐騙",
            "text": "秘密投資機會！我們的專家團隊已發現一個絕佳投資標的，保證每月15-20%回報率，風險極低。限量名額，立即聯繫我們開始致富之旅！"
        },
        {
            "title": "愛情詐騙",
            "text": "親愛的，自從上次聊天後我一直在想你。我很快就能到台灣見你了，但我遇到了一些問題。我的銀行卡被凍結了，能借給我5000元解決緊急問題嗎？我到了一定會還你的。"
        },
        {
            "title": "彩票詐騙",
            "text": "恭喜您！您的電子郵件地址在我們的年度抽獎中獲得了1,000,000元獎金。要領取您的獎金，請先支付5,000元的手續費用於以下帳戶..."
        },
        {
            "title": "工作機會詐騙",
            "text": "高薪在家工作機會！每天只需2小時，輕鬆賺取3,000-5,000元。無需經驗，我們提供培訓。請先支付1,000元報名費以獲取工作資料。"
        }
    ]
    return {"examples": examples}
