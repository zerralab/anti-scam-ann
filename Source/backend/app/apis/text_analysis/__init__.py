from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

'''
1. API用途：提供簡化的文字分析功能，用於偵測詐騙訊息和生成進一步建議
2. 關聯頁面：聊天頁面和訊息偵測功能
3. 目前狀態：啟用中，作為前端聚合API使用；此API使用基本規則進行分析，
   不依賴LLM功能，因此LLM模式關閉不影響此API的基本功能
'''

# Import scam detection functionality from scam_utils module
from app.apis.scam_utils import detect_scam, generate_response

router = APIRouter(
    prefix="/text-analysis",
    tags=["text-analysis"],
    responses={404: {"description": "Not found"}},
)

# Models
class TextAnalysisRequest(BaseModel):
    text: str
    
class TextAnalysisResponse(BaseModel):
    is_scam: bool
    scam_info: Optional[Dict[str, Any]] = None
    matched_categories: List[str] = []
    confidence: float = 0.0

class AdviceRequest(BaseModel):
    is_scam: bool
    scam_info: Optional[Dict[str, Any]] = None
    
class AdviceResponse(BaseModel):
    response: str

# Analyze text for scam indicators - renamed to avoid operation ID conflicts
@router.post("/analyze", response_model=TextAnalysisResponse)
async def analyze_text2(request: TextAnalysisRequest):
    """
    Analyze text for potential scam indicators
    """
    try:
        # Use the scam detection function from line_bot module
        is_scam, scam_info, matched_categories = detect_scam(request.text)
        
        # Calculate a simple confidence score based on number of matched categories
        confidence = min(1.0, len(matched_categories) * 0.2) if matched_categories else 0.0
        
        return TextAnalysisResponse(
            is_scam=is_scam,
            scam_info=scam_info,
            matched_categories=matched_categories,
            confidence=confidence
        )
    except Exception as e:
        print(f"Error analyzing text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze text: {str(e)}") from e

# Generate advice based on scam analysis - renamed to avoid operation ID conflicts
@router.post("/generate-advice", response_model=AdviceResponse)
async def generate_advice2(request: AdviceRequest):
    """
    Generate advice response based on scam analysis
    """
    try:
        # Generate response using function from line_bot module
        response_text = generate_response(request.scam_info, "text") if request.is_scam else generate_response(None)
        
        # 格式化步驟式回應
        if request.is_scam and response_text:
            # 確保限制回應長度
            lines = response_text.split('\n')
            formatted_lines = []
            for line in lines:
                if '安全建議：' in line:
                    formatted_lines.append(line)
                elif line.strip() and any(f"{i}. " in line for i in range(1, 10)):
                    formatted_lines.append(line)
                elif line.strip():
                    # 確保每一行不超過50個字符
                    if len(line) > 50:
                        formatted_lines.append(line[:50] + "...")
                    else:
                        formatted_lines.append(line)
                elif line.strip() == "":
                    formatted_lines.append(line)
            
            response_text = '\n'.join(formatted_lines)
        
        return AdviceResponse(
            response=response_text
        )
    except Exception as e:
        print(f"Error generating advice: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate advice: {str(e)}") from e
