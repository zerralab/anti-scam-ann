from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
import databutton as db
import json
import re

'''
1. API用途：AI人格設定API，用於管理和配置小安的人格特質、溝通風格和回應模板
2. 關聯頁面：後台管理頁面中的「AI設定」-> 「人格設定」頁面
3. 目前狀態：啟用中
'''

# Create an API router with proper documentation
router = APIRouter(
    prefix="/ai-personality",
    tags=["ai-personality"],
    responses={404: {"description": "Not found"}}
)

# 儲存鍵名
PERSONALITY_CONFIG_KEY = "ai_personality_config"

# 模型定義
class PersonalityTypeConfig(BaseModel):
    name: str = Field(..., description="人格類型名稱")
    weight: float = Field(..., description="人格類型權重 (0-1)")

class ToneConfig(BaseModel):
    name: str = Field(..., description="語氣風格名稱")
    enabled: bool = Field(True, description="是否啟用")
    weight: float = Field(..., description="語氣風格權重 (0-1)")

class CommunicationStyleConfig(BaseModel):
    name: str = Field(..., description="溝通風格名稱")
    value: float = Field(..., description="溝通風格值 (0-1)")
    description: str = Field(..., description="溝通風格描述")

class ResponseTemplate(BaseModel):
    name: str = Field(..., description="回應模板名稱")
    content: str = Field(..., description="回應模板內容")

class AIPersonalityConfig(BaseModel):
    personality_types: List[PersonalityTypeConfig] = Field(..., description="小安的人格類型設定")
    tones: List[ToneConfig] = Field(..., description="語氣風格設定")
    communication_styles: List[CommunicationStyleConfig] = Field(..., description="溝通風格偏好設定")
    response_templates: List[ResponseTemplate] = Field(..., description="回應模板設定")

# Helper functions
def get_default_config() -> AIPersonalityConfig:
    """提供默認的AI人格設定"""
    return AIPersonalityConfig(
        personality_types=[
            PersonalityTypeConfig(name="友善鄰家女孩", weight=0.8),
            PersonalityTypeConfig(name="專業防詐專家", weight=0.6),
            PersonalityTypeConfig(name="關懷守護者", weight=0.5)
        ],
        tones=[
            ToneConfig(name="友善方式", enabled=True, weight=0.7),
            ToneConfig(name="同理心", enabled=True, weight=0.5),  # 降低同理心比重
            ToneConfig(name="鼓勵性", enabled=True, weight=0.6),
            ToneConfig(name="直接清晰", enabled=True, weight=0.8)  # 提高直接清晰比重
        ],
        communication_styles=[
            CommunicationStyleConfig(
                name="正式程度",
                value=0.3,
                description="親切自然"
            ),
            CommunicationStyleConfig(
                name="詳細程度",
                value=0.4,  # 降低詳細程度，更加精簡
                description="簡潔有力"
            )
        ],
        response_templates=[
            ResponseTemplate(
                name="greeting",
                content="你好呀~我是小安，很高興能幫助你防築詐騙防線。有任何疑問或擔心的訊息，都可以跟我說喔！"
            ),
            ResponseTemplate(
                name="help",
                content="我會盡力幫助你判斷這是否為詐騙。請告訴我更多詳情，例如你收到的訊息內容或要求。"
            )
        ]
    )

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def load_personality_config() -> AIPersonalityConfig:
    """從儲存中載入AI人格設定，如果不存在則使用默認設定"""
    try:
        config_json = db.storage.text.get(sanitize_storage_key(PERSONALITY_CONFIG_KEY), default="")
        if not config_json:
            # 如果沒有保存的設定，返回默認設定
            return get_default_config()
            
        config_dict = json.loads(config_json)
        return AIPersonalityConfig(**config_dict)
    except Exception as e:
        print(f"Error loading personality config: {str(e)}")
        # 如果載入失敗，返回默認設定
        return get_default_config()

def save_personality_config(config: AIPersonalityConfig) -> bool:
    """保存AI人格設定到儲存"""
    try:
        config_json = config.model_dump_json()
        db.storage.text.put(sanitize_storage_key(PERSONALITY_CONFIG_KEY), config_json)
        return True
    except Exception as e:
        print(f"Error saving personality config: {str(e)}")
        return False

# API endpoints
@router.get("/config", response_model=AIPersonalityConfig)
def get_personality_config():
    """獲取当前的AI人格設定"""
    try:
        return load_personality_config()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"無法載入AI人格設定：{str(e)}"
        )

@router.post("/config", response_model=AIPersonalityConfig)
def update_personality_config(config: AIPersonalityConfig):
    """更新AI人格設定"""
    try:
        # 驗證權重範圍
        for personality_type in config.personality_types:
            if personality_type.weight < 0 or personality_type.weight > 1:
                raise HTTPException(
                    status_code=400,
                    detail=f"人格類型 '{personality_type.name}' 的權重必須在0到1之間"
                )
                
        for tone in config.tones:
            if tone.weight < 0 or tone.weight > 1:
                raise HTTPException(
                    status_code=400,
                    detail=f"語氣風格 '{tone.name}' 的權重必須在0到1之間"
                )
                
        for style in config.communication_styles:
            if style.value < 0 or style.value > 1:
                raise HTTPException(
                    status_code=400,
                    detail=f"溝通風格 '{style.name}' 的值必須在0到1之間"
                )
        
        # 保存設定
        if save_personality_config(config):
            return config
        else:
            raise HTTPException(
                status_code=500,
                detail="無法保存AI人格設定"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"更新AI人格設定時發生錯誤：{str(e)}"
        )