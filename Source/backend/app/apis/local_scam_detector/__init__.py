from typing import Dict, Any, Tuple, List
from fastapi import APIRouter

'''
1. API用途：本地詐騙偵測功能，提供基礎的訊息詐騙偵測和回應生成
2. 關聯頁面：主要作為LINE機器人和聊天功能的支援模組，無直接關聯頁面
3. 目前狀態：以被更高級的scam_detector大部分取代，僅用於基礎功能和備用
'''

# Create an empty router to satisfy the FastAPI API importing mechanism
router = APIRouter()

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
    # Simplified implementation for now
    if 'scam' in message.lower() or '詐騙' in message or '騙' in message:
        scam_info = {
            "id": "general_suspicious",
            "name": "可疑訊息", 
            "description": "這則訊息包含可疑的關鍵詞，建議您提高警覺。",
            "advice": [
                "對要求個人資料或金錢的訊息保持警惕",
                "不要點擊不明來源的連結",
                "如有疑問，請透過官方管道確認"
            ]
        }
        return True, scam_info, ["suspicious_content"]
    else:
        return False, None, []

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
    
def analyze_image(image_url: str) -> Tuple[bool, Dict[str, Any], List[str]]:
    """
    Analyze an image for potential scam indicators
    
    Args:
        image_url: URL of the image to analyze
        
    Returns:
        Tuple containing:
        - Boolean indicating if the image appears to be a scam
        - Dictionary with scam type information if detected, or None
        - List of matched pattern categories
    """
    # For now, we'll return a generic response for images
    # In the future, we could implement image analysis with OCR and computer vision
    return False, None, []