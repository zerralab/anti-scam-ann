from typing import Tuple, Dict, Any, List
import re
from fastapi import APIRouter

'''
1. API用途：提供詐騙偵測和回應生成的共用功能，被其他API模組引用
2. 關聯頁面：無直接關聯前端頁面，為後台互動提供支援
3. 目前狀態：啟用中，為多個聊天相關功能提供基本偵測功能，LLM模式關閉不影響此API的基本分析功能
'''

# 創建一個空的router物件以符合Databutton框架要求
router = APIRouter(
    prefix="/scam-utils",
    tags=["scam-utils"],
    responses={404: {"description": "Not found"}},
)

# Define simplified scam detection functions
def detect_scam(message: str) -> Tuple[bool, Dict[str, Any], List[str]]:
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
    
    # 先檢查高風險短句 - 這些短句通常本身就表示詐騙風險
    high_risk_phrases = [
        r"下載\s*(?:投資|理財|交易|賺錢)\s*(?:app|軟體|程式|平台)",
        r"(?:投資|理財|交易)\s*(?:app|軟體|程式|平台)\s*下載",
        r"教\s*(?:你|我)\s*(?:投資|理財|賺錢|賺大錢)",
        r"(?:穩賺|穩贏|保證獲利|保證賺錢|高報酬|高回報)"
    ]
    
    for phrase in high_risk_phrases:
        if re.search(phrase, message, re.IGNORECASE):
            return True, {
                "id": "investment_scam",
                "name": "投資詐騙",
                "description": "這看起來是典型的投資詐騙。詐騙者通常會誘導您下載未經授權的投資應用程式，並以高回報率為誘餌。",
                "advice": [
                    "不要下載來路不明的投資APP或金融工具",
                    "正規投資平台會有完整的監管資訊和公司資料",
                    "謹記：高報酬通常伴隨高風險，沒有穩賺不賠的投資"
                ]
            }, ["investment_schemes", "high_risk_phrase"]
    # Simple pattern detection for common scam keywords in both English and Chinese
    patterns = {
        "urgent_action": [r"\b緊急\b", r"\b立即\b", r"\b速度\b", r"\b盡快\b", r"\b馬上\b",
                        r"\bimmediately\b", r"\burgent\b", r"\bASAP\b", r"\bquick\b"],
        "financial_incentives": [r"\b贏取\b", r"\b中獎\b", r"\b獎金\b", r"\b報酬\b", r"\b紅利\b", r"\b利率\b",
                                r"\bwin\b", r"\baward\b", r"\bprize\b", r"\breward\b", r"\bbonus\b", r"\brate\b"],
        "personal_information": [r"\b密碼\b", r"\b驗證碼\b", r"\b帳號\b", r"\b身分證\b", r"\b信用卡\b",
                               r"\bpassword\b", r"\bverify\b", r"\baccount\b", r"\bID\b", r"\bcredit card\b", r"\bcode\b"],
        "suspicious_links": [r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"],
        "impersonation": [r"\b銀行\b", r"\b客服\b", r"\b政府\b", r"\b公司\b", r"\b警察\b", r"\b稅務\b",
                         r"\bbank\b", r"\bcustomer service\b", r"\bgovernment\b", r"\bcompany\b", r"\bpolice\b", r"\btax\b"],
        "investment_schemes": [r"\b投資\b", r"\b股票\b", r"\b基金\b", r"\b加密貨幣\b", r"\b比特幣\b", r"\b以太幣\b",
                              r"\binvestment\b", r"\bstock\b", r"\bfund\b", r"\bcrypto\b", r"\bbitcoin\b", r"\bethereum\b"],
        "romance_scam": [r"\b交友\b", r"\b戀愛\b", r"\b愛情\b", r"\b約會\b", 
                        r"\bdating\b", r"\bromance\b", r"\blove\b", r"\brelationship\b"],
        "money_requests": [
            r"\b(?:借[给給]我|借我|能借|可以借|借錢|轉[给給]我|匯[给給]我)\b.{0,15}?\b(?:[0-9]+|幾千|幾百|一些|[0-9零一二三四五六七八九十百千萬億]+)\s*(?:元|塊|圓|美金|美元|台幣|日元|歐元|澳幣|幣|RMB|USD|TWD|JPY|EUR|AUD)\b",
            r"\b(?:幫我|協助我|資助我|支援我).{0,15}?\b(?:解決|處理|應急|急需|緊急).{0,15}?\b(?:資金|錢|費用|財務|金錢)\b",
            r"\b(?:銀行|帳戶|賬戶|卡).{0,10}?\b(?:凍結|被凍|鎖住|鎖定|被盜|有問題)\b"
        ]
    }
    
    # 檢查消息是否為空
    if not message:
        return False, None, []
    
    # Check for patterns
    matched_categories = []
    for category, pattern_list in patterns.items():
        for pattern in pattern_list:
            if re.search(pattern, message, re.IGNORECASE):
                matched_categories.append(category)
                break
    
    # If no patterns matched, it's not a scam
    if not matched_categories:
        return False, None, []
    
    # Define scam types
    scam_types = {
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
        "money_request_scam": {
            "name": "借錢詐騙",
            "description": "詐騙者假裝是您認識的人，或利用緊急情況，要求您轉賬或借錢解決「緊急問題」。",
            "advice": [
                "收到借錢要求時，務必透過其他管道直接與對方確認",
                "緊急求助且要求金錢幾乎都是詐騙，請保持冷靜",
                "不要立即轉賬或借錢，先打電話跟對方確認身份"
            ],
            "indicators": ["urgent_action", "money_requests"]
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
    
    # Determine scam type
    most_likely_scam = None
    max_score = 0
    
    for scam_id, scam_info in scam_types.items():
        if scam_id == "general_suspicious":
            continue
            
        indicators = scam_info.get("indicators", [])
        score = sum(1 for cat in matched_categories if cat in indicators)
        
        if score > max_score:
            max_score = score
            most_likely_scam = scam_info.copy()
            most_likely_scam["id"] = scam_id
    
    # If no specific scam type matched but we have suspicious elements, use generic
    is_scam = bool(matched_categories)
    if is_scam and (max_score < 2 or not most_likely_scam):
        most_likely_scam = scam_types["general_suspicious"].copy()
        most_likely_scam["id"] = "general_suspicious"
    
    return is_scam, most_likely_scam, matched_categories

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
    
    # Build the response
    response = f"⚠️ 警告！這可能是【{scam_name}】\n\n{description}\n\n安全建議：\n"
    
    for i, advice in enumerate(advice_list, 1):
        response += f"{i}. {advice}\n"
    
    response += "\n如果您已經提供了個人資料或進行轉帳，請立即聯絡相關機構並撥打165防詐專線。\n\n小安在此陪伴您，有任何疑問都可以詢問我。"
    
    return response
    
def analyze_image(image_url: str) -> Tuple[bool, Dict[str, Any], List[str]]:
    """
    Analyze an image for potential scam indicators - simplified placeholder function
    """
    # This is just a placeholder - we're not actually analyzing images yet
    return False, None, []

# 導出核心功能以便外部模組使用
__all__ = ['detect_scam', 'generate_response', 'analyze_image']