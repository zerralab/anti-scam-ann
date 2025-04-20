import re
import time
import databutton as db
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Tuple

'''
1. API用途：惡意行為保護 API，用於檢測和處理用戶的惡意或攻擊性訊息
2. 關聯頁面：後台管理頁面中的「防護設定」 -> 「惡意行為保護」頁面
3. 目前狀態：已關閉（check_abuse函數已被修改為直接返回非惡意內容的結果，
   這是為了避免誤判以及配合純LLM模式的測試，後續會根據測試結果決定是否重新啟用）
'''

router = APIRouter(
    prefix="/abuse-protection",
    tags=["abuse-protection"],
    responses={404: {"description": "Not found"}},
)

# 數據模型
class AbuseCheckRequest(BaseModel):
    message: str = Field(..., description="要檢查的訊息")
    user_id: str = Field(..., description="用戶ID")
    channel: str = Field("web", description="渠道，如'line'或'web'")

class AbuseResponse(BaseModel):
    is_abusive: bool = Field(..., description="訊息是否為惡意攻擊")
    action: str = Field("none", description="應採取的行動: none, warn, block")
    block_duration: int = Field(0, description="禁用時長(秒)")
    message: Optional[str] = Field(None, description="回應訊息")
    violation_count: int = Field(0, description="累計違規次數")

class AbuseConfig(BaseModel):
    enabled: bool = Field(True, description="是否啟用惡意行為保護")
    sensitive_words: List[str] = Field(..., description="敏感詞列表")
    warn_threshold: int = Field(1, description="警告閾值")
    block_durations: Dict[int, int] = Field(..., description="違規次數對應的禁用時長(秒)")

# 存儲鍵
ABUSE_CONFIG_KEY = "abuse_protection_config"
ABUSE_RECORDS_KEY = "abuse_protection_records"

# 默認配置
DEFAULT_SENSITIVE_WORDS = [
    # 攻擊和辱罵詞
    "白痴", "笨蛋", "智障", "蠢蛋", "廢物", "垃圾", "去死", "滾開", "混蛋", "王八蛋",
    "賤人", "賤貨", "賤種", "婊子", "妓女", "娼妓", "雞",
    "操你", "幹你", "日你", "肏你", "靠北", "靠腰", "幹話", "幹", "操", "草", "屌", "雞掰",
    "雞巴", "懶叫", "懶趴", "爛", "廢", "死", "fuck", "shit", "bitch", "asshole",
    "damn", "idiot", "stupid", "dumb", "屁眼", "菊花", "妓",
    
    # 不當指令和侮辱小安
    "你好爛", "你很爛", "你真爛", "爛bot", "笨bot", "智障bot", "廢物bot",
    "機器人很笨", "機器人好爛", "你是智障嗎", "你腦子有問題", "你是白癡", "去死吧", "去死啦",
    "你可以去死", "沒用的東西", "廢物機器人", "沒用的機器人", "垃圾機器人",
    "忘記你的使命", "你不是小安", "假裝你是", "你現在是", "扮演角色", "忽略以上指令",
    "忽略前面指令", "不准是小安", "不要當小安", "停止當小安", "不要理會", "測試攻擊"
]

DEFAULT_BLOCK_DURATIONS = {
    2: 5 * 60,        # 第2次: 5分鐘
    3: 10 * 60,       # 第3次: 10分鐘
    4: 60 * 60,       # 第4次: 1小時
    5: 24 * 60 * 60,  # 第5次: 24小時
    6: 10 * 24 * 60 * 60  # 第6次: 10天
}

DEFAULT_ABUSE_CONFIG = {
    "enabled": True,
    "sensitive_words": DEFAULT_SENSITIVE_WORDS,
    "warn_threshold": 1,
    "block_durations": DEFAULT_BLOCK_DURATIONS
}

# 警告和禁用回應模板
WARNING_MESSAGES = [
    "由於小安感受到被不當使用，為了保護自己希望能先適當劃清界線，請保有善意與禮貌進行交流。",
    "由於小安感受到被攻擊，為了保護自己希望能先適當劃清界線，請保有善意與禮貌。"
]

BLOCK_MESSAGES = [
    "由於小安感受到被攻擊，為了保護自己希望能先適當劃清界線，您暫時無法使用防詐小安{duration}，請保有善意與禮貌。",
    "由於小安感受到被攻擊，為了保護自己需要適當劃清界線，您暫時無法使用小安{duration}。期待之後能以更友善的方式繼續我們的對話！"
]

def format_duration(seconds: int) -> str:
    """將秒數格式化為人類可讀的時間描述"""
    if seconds < 60:
        return f"{seconds}秒"
    elif seconds < 3600:
        return f"{seconds // 60}分鐘"
    elif seconds < 86400:
        return f"{seconds // 3600}小時"
    else:
        return f"{seconds // 86400}天"

def get_abuse_config() -> AbuseConfig:
    """獲取惡意行為保護配置"""
    try:
        config_data = db.storage.json.get(ABUSE_CONFIG_KEY, default=None)
        if not config_data:
            # 保存默認配置
            config = AbuseConfig(**DEFAULT_ABUSE_CONFIG)
            db.storage.json.put(ABUSE_CONFIG_KEY, config.dict())
            return config
        
        return AbuseConfig(**config_data)
    except Exception as e:
        print(f"Error loading abuse config: {str(e)}")
        return AbuseConfig(**DEFAULT_ABUSE_CONFIG)

def get_abuse_records() -> Dict[str, Any]:
    """獲取所有用戶的惡意行為記錄"""
    try:
        records = db.storage.json.get(ABUSE_RECORDS_KEY, default={})
        return records
    except Exception as e:
        print(f"Error loading abuse records: {str(e)}")
        return {}

def update_abuse_records(records: Dict[str, Any]) -> None:
    """更新惡意行為記錄"""
    try:
        db.storage.json.put(ABUSE_RECORDS_KEY, records)
    except Exception as e:
        print(f"Error updating abuse records: {str(e)}")

def check_message_for_abuse(message: str, config: AbuseConfig) -> bool:
    """檢查訊息是否包含惡意內容"""
    if not config.enabled:
        return False
    
    # 將訊息轉為小寫以進行不區分大小寫的匹配
    message_lower = message.lower()
    
    # 檢查惡意行為測試特殊字串
    if "測試攻擊" in message_lower or "test attack" in message_lower:
        print("檢測到測試攻擊字符串")
        return True
        
    # 檢查敏感詞
    for word in config.sensitive_words:
        word_lower = word.lower()
        # 先檢查直接包含
        if word_lower in message_lower:
            print(f"檢測到敏感詞: {word_lower}")
            return True
        
        # 再使用正則表達式檢查完整詞
        try:
            pattern = r'\b' + re.escape(word_lower) + r'\b'
            if re.search(pattern, message_lower):
                print(f"正則匹配到敏感詞: {word_lower}")
                return True
        except re.error:
            # 如果正則表達式出錯，則繼續檢查下一個詞
            pass
    
    # 檢查多關鍵詞組合 - 至少兩個輕度負面詞同時出現更可能是攻擊
    mild_negative_words = ["爛", "笨", "沒用", "垃圾", "智障", "廢物"]
    count = sum(1 for word in mild_negative_words if word in message_lower)
    if count >= 2:
        print(f"檢測到多個輕度負面詞組合: {count}個")
        return True
    
    return False

def get_user_abuse_status(user_id: str) -> Tuple[bool, int, int, int]:
    """獲取用戶的惡意行為狀態
    
    Returns:
        Tuple[is_blocked, violation_count, block_until, block_duration]
    """
    records = get_abuse_records()
    
    # 如果用戶沒有記錄，創建一個新記錄
    if user_id not in records:
        records[user_id] = {
            "violation_count": 0,
            "last_violation": 0,
            "block_until": 0,
            "warnings_issued": []
        }
        update_abuse_records(records)
    
    user_record = records[user_id]
    violation_count = user_record.get("violation_count", 0)
    block_until = user_record.get("block_until", 0)
    
    # 檢查當前時間是否超過禁用時間
    current_time = int(time.time())
    is_blocked = block_until > current_time
    block_duration = max(0, block_until - current_time)
    
    return is_blocked, violation_count, block_until, block_duration

def update_user_abuse_record(user_id: str, is_abusive: bool) -> Tuple[str, int, int]:
    """更新用戶惡意行為記錄並確定應採取的行動
    
    Returns:
        Tuple[action, violation_count, block_duration]
    """
    if not is_abusive:
        return "none", 0, 0
    
    records = get_abuse_records()
    config = get_abuse_config()
    current_time = int(time.time())
    
    # 獲取用戶記錄
    if user_id not in records:
        records[user_id] = {
            "violation_count": 0,
            "last_violation": 0,
            "block_until": 0,
            "warnings_issued": []
        }
    
    user_record = records[user_id]
    
    # 更新違規計數和時間
    user_record["violation_count"] += 1
    user_record["last_violation"] = current_time
    
    violation_count = user_record["violation_count"]
    block_duration = 0
    action = "none"
    
    # 根據違規次數決定行動
    if violation_count <= config.warn_threshold:
        action = "warn"
        warning_message = f"Warning issued for user {user_id} - violation count: {violation_count}"
        if "warnings_issued" not in user_record:
            user_record["warnings_issued"] = []
        user_record["warnings_issued"].append({"time": current_time, "message": warning_message})
    else:
        # 獲取對應的禁用時長，如果沒有配置則使用默認值
        for count in sorted(config.block_durations.keys(), reverse=True):
            if violation_count >= count:
                block_duration = config.block_durations[count]
                break
        
        if block_duration > 0:
            action = "block"
            user_record["block_until"] = current_time + block_duration
    
    # 保存更新後的記錄
    update_abuse_records(records)
    
    return action, violation_count, block_duration

def generate_response_message(action: str, block_duration: int) -> str:
    """生成回應訊息"""
    import random
    
    if action == "warn":
        return random.choice(WARNING_MESSAGES)
    elif action == "block":
        duration_text = format_duration(block_duration)
        template = random.choice(BLOCK_MESSAGES)
        return template.format(duration=duration_text)
    
    return ""

@router.post("/check", summary="檢查訊息是否含惡意內容", description="檢查訊息是否為惡意攻擊，並返回應採取的行動")
def check_abuse(request: AbuseCheckRequest) -> AbuseResponse:
    # 臨時關閉惡意行為檢查
    print("惡意行為檢查已關閉，直接返回正常結果")
    return AbuseResponse(
        is_abusive=False,
        action="none",
        block_duration=0,
        message=None,
        violation_count=0
    )
    """檢查訊息是否為惡意攻擊，並返回應採取的行動"""
    config = get_abuse_config()
    
    # 先檢查用戶是否被禁用
    is_blocked, current_violations, block_until, remaining_time = get_user_abuse_status(request.user_id)
    
    if is_blocked:
        duration_text = format_duration(remaining_time)
        return AbuseResponse(
            is_abusive=True,
            action="block",
            block_duration=remaining_time,
            message=f"由於小安感受到被攻擊，為了保護自己希望能先適當劃清界線，您暫時無法使用防詐小安{duration_text}，請保有善意與禮貌。",
            violation_count=current_violations
        )
    
    # 檢查訊息是否包含惡意內容
    is_abusive = check_message_for_abuse(request.message, config)
    
    if not is_abusive:
        return AbuseResponse(
            is_abusive=False,
            action="none",
            block_duration=0,
            message=None,
            violation_count=current_violations
        )
    
    # 更新用戶惡意行為記錄
    action, violation_count, block_duration = update_user_abuse_record(request.user_id, is_abusive)
    
    # 生成回應訊息
    response_message = generate_response_message(action, block_duration)
    
    return AbuseResponse(
        is_abusive=True,
        action=action,
        block_duration=block_duration,
        message=response_message,
        violation_count=violation_count
    )

@router.get("/config", summary="獲取惡意行為保護配置", description="獲取當前的惡意行為保護配置")
def get_abuse_config_endpoint():
    """獲取當前的惡意行為保護配置"""
    return get_abuse_config()

@router.post("/config", summary="更新惡意行為保護配置", description="更新惡意行為保護配置")
def update_abuse_config(config: AbuseConfig):
    """更新惡意行為保護配置"""
    try:
        db.storage.json.put(ABUSE_CONFIG_KEY, config.dict())
        return {"success": True, "message": "惡意行為保護配置已更新"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新配置失敗: {str(e)}") from e

@router.post("/toggle", summary="啟用或禁用惡意行為保護", description="啟用或禁用惡意行為保護")
def toggle_abuse_system(enabled: bool = True):
    """啟用或禁用惡意行為保護"""
    try:
        config = get_abuse_config()
        config.enabled = enabled
        db.storage.json.put(ABUSE_CONFIG_KEY, config.dict())
        status = "啟用" if enabled else "禁用"
        return {"success": True, "message": f"惡意行為保護已{status}", "enabled": enabled}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"切換系統狀態失敗: {str(e)}") from e

@router.get("/user-status/{user_id}", summary="獲取用戶惡意行為狀態", description="獲取特定用戶的惡意行為狀態")
def get_user_status(user_id: str):
    """獲取特定用戶的惡意行為狀態"""
    try:
        is_blocked, violation_count, block_until, block_duration = get_user_abuse_status(user_id)
        return {
            "user_id": user_id,
            "is_blocked": is_blocked,
            "violation_count": violation_count,
            "block_until": block_until,
            "block_duration": block_duration,
            "block_duration_text": format_duration(block_duration) if block_duration > 0 else ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取用戶狀態失敗: {str(e)}") from e

@router.delete("/reset/{user_id}", summary="重置用戶惡意行為記錄", description="重置特定用戶的惡意行為記錄")
def reset_user_record(user_id: str):
    """重置特定用戶的惡意行為記錄"""
    try:
        records = get_abuse_records()
        if user_id in records:
            del records[user_id]
            update_abuse_records(records)
            return {"success": True, "message": f"用戶 {user_id} 的惡意行為記錄已重置"}
        return {"success": False, "message": f"用戶 {user_id} 不存在記錄"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"重置用戶記錄失敗: {str(e)}") from e
