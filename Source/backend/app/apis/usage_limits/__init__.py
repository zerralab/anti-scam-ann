import time
import uuid
import databutton as db
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union

'''
1. API用途：系統使用限制 API，管理和控制用戶對 AI 服務的使用限制，包括會話次數限制、token 使用計算和全局限制
2. 關聯頁面：後台管理頁面中的「服務設定」-> 「使用限制」頁面
3. 目前狀態：啟用中（通過 check_usage_limits 函數在 ai_conversation 幾乎所有的對話呼叫中進行檢定）
'''

router = APIRouter(
    prefix="/usage-limits",
    tags=["usage-limits"],
    responses={404: {"description": "Not found"}},
)

# 資料模型
class UsageCheckRequest(BaseModel):
    user_id: str = Field(..., description="使用者ID或會話ID") 
    token_count: int = Field(0, description="本次請求消耗的token數量")
    channel: str = Field("web", description="渠道，如'line'或'web'")
    message: Optional[str] = Field(None, description="用戶訊息，用於檢測緊急關鍵詞")

class UsageResponse(BaseModel):
    allowed: bool = Field(..., description="是否允許使用") 
    cooldown_remaining: int = Field(0, description="冷卻剩餘時間(秒)")
    message: Optional[str] = Field(None, description="提示訊息")
    usage_stats: Dict[str, Any] = Field({}, description="用量統計")

class UsageConfig(BaseModel):
    enabled: bool = Field(True, description="是否啟用使用限制")
    session_limit: int = Field(20, description="單一會話的最大請求數量")
    session_token_limit: int = Field(10000, description="單一會話的最大token數量")
    session_window: int = Field(60 * 60, description="會話窗口期(秒)")
    session_cooldown: int = Field(10 * 60, description="會話冷卻時間(秒)")
    global_hourly_limit: int = Field(1000, description="全局每小時最大請求數量")
    global_daily_limit: int = Field(10000, description="全局每日最大請求數量")

# 儲存鍵值
USAGE_CONFIG_KEY = "usage_limits_config"
USAGE_RECORDS_KEY = "usage_limits_records"
GLOBAL_STATS_KEY = "usage_limits_global_stats"

# 預設配置
DEFAULT_CONFIG = {
    "enabled": True,
    "session_limit": 20,           # 單一會話20次請求
    "session_token_limit": 10000,  # 單一會話10000 tokens
    "session_window": 60 * 60,     # 1小時內
    "session_cooldown": 10 * 60,   # 冷卻時間10分鐘
    "global_hourly_limit": 1000,   # 全局每小時1000次請求
    "global_daily_limit": 10000    # 全局每日10000次請求
}

# 友善訊息模板
SESSION_LIMIT_MESSAGES = [
    "目前已達到使用上限，小安暫時無法回覆。如有緊急情況，請直接撥打165尋求協助！",
    "你最近訊息較多，小安需要休息{cooldown}。如有任何可疑訊息，請直接撥打165！",
    "靠呀，小安需要少說話休息一下！請在{cooldown}後再回來找我吧。若有急事，請撥打165查詢。"
]

GLOBAL_LIMIT_MESSAGES = [
    "目前已達到使用上限，小安暫時無法回覆。如有任何可疑情況不確定是不是詐騙，或是發現可能已經被詐騙，請立即撥打165！",
    "目前已達到使用上限，小安暫時無法回覆。如有緊急情況，請直接撥打165尋求協助！"
]

def get_usage_config() -> UsageConfig:
    """取得使用限制配置"""
    try:
        config_data = db.storage.json.get(USAGE_CONFIG_KEY, default=None)
        if not config_data:
            # 儲存默認配置
            config = UsageConfig(**DEFAULT_CONFIG)
            db.storage.json.put(USAGE_CONFIG_KEY, config.dict())
            return config
        
        return UsageConfig(**config_data)
    except Exception as e:
        print(f"Error loading usage config: {str(e)}")
        return UsageConfig(**DEFAULT_CONFIG)

def get_usage_records() -> Dict[str, Any]:
    """取得所有使用者的使用記錄"""
    try:
        records = db.storage.json.get(USAGE_RECORDS_KEY, default={})
        return records
    except Exception as e:
        print(f"Error loading usage records: {str(e)}")
        return {}

def update_usage_records(records: Dict[str, Any]) -> None:
    """更新使用記錄"""
    try:
        db.storage.json.put(USAGE_RECORDS_KEY, records)
    except Exception as e:
        print(f"Error updating usage records: {str(e)}")

def get_global_stats() -> Dict[str, Any]:
    """取得全局使用統計"""
    try:
        current_time = int(time.time())
        stats = db.storage.json.get(GLOBAL_STATS_KEY, default=None)
        
        if not stats:
            # 創建新的全局統計
            stats = {
                "hourly": {
                    "count": 0,
                    "tokens": 0,
                    "timestamp": current_time,
                },
                "daily": {
                    "count": 0,
                    "tokens": 0,
                    "timestamp": current_time,
                },
                "all_time": {
                    "count": 0,
                    "tokens": 0,
                }
            }
            db.storage.json.put(GLOBAL_STATS_KEY, stats)
            return stats
        
        # 重置過期的統計
        hour_seconds = 60 * 60
        day_seconds = 24 * 60 * 60
        
        if current_time - stats["hourly"]["timestamp"] > hour_seconds:
            stats["hourly"] = {
                "count": 0,
                "tokens": 0,
                "timestamp": current_time,
            }
        
        if current_time - stats["daily"]["timestamp"] > day_seconds:
            stats["daily"] = {
                "count": 0,
                "tokens": 0,
                "timestamp": current_time,
            }
        
        return stats
    except Exception as e:
        print(f"Error loading global stats: {str(e)}")
        return {
            "hourly": {"count": 0, "tokens": 0, "timestamp": int(time.time())},
            "daily": {"count": 0, "tokens": 0, "timestamp": int(time.time())},
            "all_time": {"count": 0, "tokens": 0}
        }

def update_global_stats(token_count: int = 0) -> Dict[str, Any]:
    """更新全局使用統計"""
    try:
        stats = get_global_stats()
        
        # 更新計數
        stats["hourly"]["count"] += 1
        stats["hourly"]["tokens"] += token_count
        
        stats["daily"]["count"] += 1
        stats["daily"]["tokens"] += token_count
        
        stats["all_time"]["count"] += 1
        stats["all_time"]["tokens"] += token_count
        
        db.storage.json.put(GLOBAL_STATS_KEY, stats)
        return stats
    except Exception as e:
        print(f"Error updating global stats: {str(e)}")
        return {}

def format_cooldown_time(seconds: int) -> str:
    """格式化冷卻時間"""
    if seconds < 60:
        return f"{seconds}秒"
    elif seconds < 3600:
        return f"{seconds // 60}分鐘"
    else:
        hours = seconds // 3600
        mins = (seconds % 3600) // 60
        return f"{hours}小時{mins}分鐘" if mins > 0 else f"{hours}小時"

def get_random_message(templates: List[str], **kwargs) -> str:
    """從模板中隨機選擇一個訊息"""
    import random
    template = random.choice(templates)
    return template.format(**kwargs)

def check_user_limits(user_id: str, token_count: int = 0) -> Dict[str, Any]:
    """檢查使用者的使用限制狀態
    
    Returns:
        Dict containing:
        - allowed: 是否允許使用
        - cooldown_remaining: 冷卻剩餘時間(秒)
        - message: 提示訊息
        - stats: 使用統計
    """
    config = get_usage_config()
    if not config.enabled:
        return {"allowed": True, "cooldown_remaining": 0, "message": None, "stats": {}}
    
    current_time = int(time.time())
    records = get_usage_records()
    
    # 初始化用戶記錄
    if user_id not in records:
        records[user_id] = {
            "requests": [],
            "tokens": 0,
            "total_requests": 0,
            "total_tokens": 0,
            "cool_until": 0
        }
    
    user_record = records[user_id]
    
    # 檢查冷卻期
    if user_record["cool_until"] > current_time:
        cooldown_remaining = user_record["cool_until"] - current_time
        message = get_random_message(
            SESSION_LIMIT_MESSAGES, 
            cooldown=format_cooldown_time(cooldown_remaining)
        )
        
        return {
            "allowed": False,
            "cooldown_remaining": cooldown_remaining,
            "message": message,
            "stats": {
                "session_requests": len(user_record["requests"]),
                "session_tokens": user_record["tokens"],
                "total_requests": user_record["total_requests"],
                "total_tokens": user_record["total_tokens"]
            }
        }
    
    # 清理過期的請求
    window_start = current_time - config.session_window
    user_record["requests"] = [r for r in user_record["requests"] if r["timestamp"] > window_start]
    
    # 計算當前會話的token使用量
    session_tokens = user_record["tokens"]
    
    # 檢查會話限制
    if len(user_record["requests"]) >= config.session_limit or session_tokens >= config.session_token_limit:
        # 設置冷卻期
        user_record["cool_until"] = current_time + config.session_cooldown
        update_usage_records(records)
        
        cooldown_remaining = config.session_cooldown
        message = get_random_message(
            SESSION_LIMIT_MESSAGES, 
            cooldown=format_cooldown_time(cooldown_remaining)
        )
        
        return {
            "allowed": False,
            "cooldown_remaining": cooldown_remaining,
            "message": message,
            "stats": {
                "session_requests": len(user_record["requests"]),
                "session_tokens": session_tokens,
                "total_requests": user_record["total_requests"],
                "total_tokens": user_record["total_tokens"]
            }
        }
    
    # 允許使用
    return {
        "allowed": True,
        "cooldown_remaining": 0,
        "message": None,
        "stats": {
            "session_requests": len(user_record["requests"]),
            "session_tokens": session_tokens,
            "total_requests": user_record["total_requests"],
            "total_tokens": user_record["total_tokens"]
        }
    }

def check_global_limits() -> Dict[str, Any]:
    """檢查全局使用限制
    
    Returns:
        Dict containing:
        - allowed: 是否允許使用
        - message: 提示訊息
        - stats: 全局統計
    """
    config = get_usage_config()
    if not config.enabled:
        return {"allowed": True, "message": None, "stats": {}}
    
    global_stats = get_global_stats()
    
    # 檢查全局限制
    if global_stats["hourly"]["count"] >= config.global_hourly_limit or \
       global_stats["daily"]["count"] >= config.global_daily_limit:
        message = get_random_message(GLOBAL_LIMIT_MESSAGES)
        
        return {
            "allowed": False,
            "message": message,
            "stats": global_stats
        }
    
    return {"allowed": True, "message": None, "stats": global_stats}

def update_user_usage(user_id: str, token_count: int) -> None:
    """更新使用者的使用記錄"""
    current_time = int(time.time())
    records = get_usage_records()
    
    if user_id not in records:
        records[user_id] = {
            "requests": [],
            "tokens": 0,
            "total_requests": 0,
            "total_tokens": 0,
            "cool_until": 0
        }
    
    user_record = records[user_id]
    
    # 更新請求記錄
    user_record["requests"].append({
        "timestamp": current_time,
        "tokens": token_count
    })
    
    # 更新token使用量
    user_record["tokens"] += token_count
    user_record["total_requests"] += 1
    user_record["total_tokens"] += token_count
    
    # 清理過期的請求
    config = get_usage_config()
    window_start = current_time - config.session_window
    user_record["requests"] = [r for r in user_record["requests"] if r["timestamp"] > window_start]
    
    # 重新計算當前會話的token使用量
    user_record["tokens"] = sum(r["tokens"] for r in user_record["requests"])
    
    update_usage_records(records)

@router.post("/check", summary="檢查使用限制", description="檢查使用者是否達到使用限制")
# 檢測緊急關鍵詞的函數
def has_emergency_keywords(message: str) -> bool:
    """檢查訊息是否包含緊急關鍵詞，允許這些訊息繞過使用限制"""
    if not message:
        return False
        
    # 緊急情況關鍵詞列表
    emergency_keywords = [
        "被騙了", "詐騙", "騙走", "騙錢", "被騙", "騙我", 
        "被盜", "被盜用", "身分證", "個資外洩",
        "急", "緊急", "救命", "幫助", "害怕", "恐懼",
        "自殺", "輕生", "不想活", "想死", "了結",  
        "被勒索", "威脅", "警察", "報警", "165"
    ]
    
    # 檢查是否包含任意緊急關鍵詞
    return any(keyword in message for keyword in emergency_keywords)


class EmergencyCheckRequest(BaseModel):
    message: str = Field(..., description="要檢查的訊息內容")

@router.post("/has-emergency-keywords", summary="檢查是否包含緊急關鍵詞", description="檢查訊息是否包含緊急關鍵詞，允許繞過限制")
def has_emergency_keywords_endpoint(request: EmergencyCheckRequest):
    """檢查訊息是否包含緊急關鍵詞"""
    return {
        "has_emergency": has_emergency_keywords(request.message),
        "message": request.message
    }

def check_usage_limits(request: UsageCheckRequest) -> UsageResponse:
    """檢查使用者是否達到使用限制"""
    try:
        # 檢查是否有提供訊息內容且包含緊急關鍵詞
        if request.message and has_emergency_keywords(request.message):
            print(f"緊急情況關鍵詞檢測到，允許繞過使用限制: {request.user_id}")
            return UsageResponse(
                allowed=True,
                cooldown_remaining=0,
                message=None,
                usage_stats={
                    "bypass_reason": "emergency_keywords"
                }
            )
        
        # 檢查全局限制
        global_check = check_global_limits()
        if not global_check["allowed"]:
            return UsageResponse(
                allowed=False,
                cooldown_remaining=0,
                message=global_check["message"],
                usage_stats={
                    "global": global_check["stats"],
                    "reason": "global_limit"
                }
            )
        
        # 檢查使用者限制 - 確保使用者 ID 是有效的字串
        user_id = request.user_id if request.user_id else f"web-user-{str(uuid.uuid4())[:8]}"
        user_check = check_user_limits(user_id, request.token_count)
        if not user_check["allowed"]:
            return UsageResponse(
                allowed=False,
                cooldown_remaining=user_check["cooldown_remaining"],
                message=user_check["message"],
                usage_stats={
                    "user": user_check["stats"],
                    "reason": "user_limit"
                }
            )
        
        # 更新使用統計
        update_user_usage(request.user_id, request.token_count)
        update_global_stats(request.token_count)
        
        return UsageResponse(
            allowed=True,
            cooldown_remaining=0,
            message=None,
            usage_stats={
                "user": user_check["stats"],
                "global": global_check["stats"]
            }
        )
    except Exception as e:
        print(f"Error checking usage limits: {str(e)}")
        # 出錯時預設允許使用
        return UsageResponse(
            allowed=True,
            cooldown_remaining=0,
            message=None,
            usage_stats={"error": str(e)}
        )

@router.get("/config", summary="獲取使用限制配置", description="獲取當前的使用限制配置")
def get_usage_config_endpoint():
    """獲取當前的使用限制配置"""
    return get_usage_config()

@router.post("/config", summary="更新使用限制配置", description="更新使用限制配置")
def update_usage_config(config: UsageConfig):
    """更新使用限制配置"""
    try:
        db.storage.json.put(USAGE_CONFIG_KEY, config.dict())
        return {"success": True, "message": "使用限制配置已更新"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新配置失敗: {str(e)}") from e

@router.post("/toggle", summary="開關使用限制功能", description="啟用或禁用使用限制功能")
def toggle_usage_limits(enabled: bool = True):
    """啟用或禁用使用限制功能"""
    try:
        config = get_usage_config()
        config.enabled = enabled
        db.storage.json.put(USAGE_CONFIG_KEY, config.dict())
        status = "啟用" if enabled else "禁用"
        return {"success": True, "message": f"使用限制功能已{status}", "enabled": enabled}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"切換系統狀態失敗: {str(e)}") from e

@router.get("/stats", summary="獲取使用統計", description="獲取全局使用統計")
def get_usage_stats():
    """獲取全局使用統計"""
    global_stats = get_global_stats()
    records = get_usage_records()
    
    user_count = len(records)
    active_users = sum(1 for u in records.values() if u["requests"])
    
    # 計算出每月的統計資料 (過去30天)
    current_time = int(time.time())
    
    # 建立月統計結構，如果沒有則默認為0
    if "monthly" not in global_stats:
        global_stats["monthly"] = {
            "count": 0,
            "tokens": 0,
            "timestamp": current_time
        }
    
    # 檢查並重置月統計資料如果超過30天
    month_seconds = 30 * 24 * 60 * 60  # 30天的秒數
    if current_time - global_stats["monthly"]["timestamp"] > month_seconds:
        global_stats["monthly"] = {
            "count": 0,
            "tokens": 0,
            "timestamp": current_time
        }
    
    return {
        "global": global_stats,
        "users": {
            "total": user_count,
            "active": active_users
        }
    }

@router.get("/user/{user_id}", summary="獲取使用者使用統計", description="獲取特定使用者的使用統計")
def get_user_stats(user_id: str):
    """獲取特定使用者的使用統計"""
    records = get_usage_records()
    if user_id not in records:
        return {"found": False, "message": "使用者記錄不存在"}
    
    user_record = records[user_id]
    current_time = int(time.time())
    
    # 計算冷卻狀態
    is_cooling = user_record["cool_until"] > current_time
    cooldown_remaining = max(0, user_record["cool_until"] - current_time) if is_cooling else 0
    
    # 過濾出當前會話的請求
    config = get_usage_config()
    window_start = current_time - config.session_window
    session_requests = [r for r in user_record["requests"] if r["timestamp"] > window_start]
    
    return {
        "found": True,
        "user_id": user_id,
        "is_cooling": is_cooling,
        "cooldown_remaining": cooldown_remaining,
        "cooldown_remaining_formatted": format_cooldown_time(cooldown_remaining) if cooldown_remaining > 0 else "",
        "session": {
            "requests": len(session_requests),
            "tokens": sum(r["tokens"] for r in session_requests)
        },
        "total": {
            "requests": user_record["total_requests"],
            "tokens": user_record["total_tokens"]
        }
    }

@router.delete("/reset/{user_id}", summary="重置使用者使用記錄", description="重置特定使用者的使用記錄")
def reset_user_stats(user_id: str):
    """重置特定使用者的使用記錄"""
    records = get_usage_records()
    if user_id in records:
        del records[user_id]
        update_usage_records(records)
        return {"success": True, "message": f"使用者 {user_id} 的使用記錄已重置"}
    
    return {"success": False, "message": f"使用者 {user_id} 不存在記錄"}

@router.get("/top-users", summary="獲取使用量前10名用戶", description="按總請求數排序獲取前10名用戶的使用統計")
def get_top_users():
    """獲取使用量前10名用戶"""
    records = get_usage_records()
    
    # 按總請求數排序
    top_users = sorted(
        [
            {
                "user_id": user_id,
                "total_requests": data["total_requests"],
                "total_tokens": data["total_tokens"],
                "is_cooling": data["cool_until"] > int(time.time())
            }
            for user_id, data in records.items()
            if data["total_requests"] > 0  # 只包含有請求記錄的用戶
        ],
        key=lambda x: x["total_requests"],
        reverse=True
    )[:10]  # 只取前10名
    
    return {
        "top_users": top_users,
        "total_tracked_users": len(records)
    }

@router.get("/generate-id", summary="生成臨時使用者ID", description="生成一個唯一的臨時使用者ID")
def generate_user_id():
    """生成一個唯一的臨時使用者ID"""
    return {"user_id": f"temp-{str(uuid.uuid4())[:8]}"}
