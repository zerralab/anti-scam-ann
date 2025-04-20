import random
import databutton as db
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Tuple

'''
1. API用途：關鍵詞回應 API，處理簡單的關鍵詞模式匹配和回應，如打招呼、告別、感謝等簡單交流
2. 關聯頁面：後台管理頁面中的「關鍵詞設定」頁面
3. 目前狀態：啟用中
'''

router = APIRouter(
    prefix="/keyword-responses",
    tags=["keyword-responses"],
    responses={404: {"description": "Not found"}},
)

# Models
class KeywordCategory(BaseModel):
    name: str = Field(..., description="關鍵詞類別名稱")
    keywords: List[str] = Field(..., description="關鍵詞列表")
    responses: List[str] = Field(..., description="回應列表")
    threshold: float = Field(0.7, description="匹配閾值，默認為0.7（70%）")

class KeywordResponseConfig(BaseModel):
    categories: Dict[str, KeywordCategory] = Field(..., description="所有關鍵詞類別")
    enabled: bool = Field(True, description="啟用或禁用關鍵詞回應系統")

class KeywordMatchRequest(BaseModel):
    message: str = Field(..., description="要匹配的訊息")

# 定義關鍵詞類別和對應的回覆

# 打招呼關鍵詞和回覆
GREETING_KEYWORDS = [
    "你好", "哈囉", "嗨", "嘿", "安安", "早安", "午安", "晚安", 
    "hi", "hello", "hey", "morning", "evening", "早上好", "中午好", "晚上好"
]

GREETING_RESPONSES = [
    "嗨嗨～今天過得怎麼樣啊？😊",
    "安安～有什麼我能幫上忙的嗎？",
    "你好啊～見到你真開心！有什麼問題想問我嗎？",
    "嗨～很高興見到你！今天有沒有收到什麼可疑訊息？",
    "安安～今天天氣如何呀？有沒有遇到什麼有趣的事情？",
    "哈囉～很高興能跟你聊天！有什麼想聊的嗎？"
]

# 告別關鍵詞和回覆
FAREWELL_KEYWORDS = [
    "掰掰", "再見", "拜拜", "晚安", "byebye", "goodbye", "bye", "good night", 
    "下次見", "下次再聊", "走了", "回頭見"
]

FAREWELL_RESPONSES = [
    "掰掰～下次再聊吧！有任何問題都可以找我喔！😊",
    "再見囉～希望很快能再跟你聊天！",
    "拜拜～祝你有個美好的一天！",
    "下次見喔～記得小心詐騙，保持警覺！",
    "再見～有任何疑問隨時回來找我聊聊！",
    "掰掰～照顧好自己，期待下次聊天！🤗"
]

# 感謝關鍵詞和回覆
THANKS_KEYWORDS = [
    "謝謝", "感謝", "多謝", "感恩", "thank", "thanks", "thank you", "thx", 
    "感謝你", "謝啦", "謝謝你"
]

THANKS_RESPONSES = [
    "不客氣！能幫上忙真的很開心！😊",
    "這是我應該做的，很高興能幫上你！",
    "別客氣～隨時都可以來問我！",
    "不用謝啦～我們鄰居之間就是要互相幫助的！",
    "能幫上你我很開心！有任何問題都可以問我喔！",
    "別這麼說～能幫到你是我的榮幸呢！🤗"
]

# 簡單肯定或否定關鍵詞和回覆
SIMPLE_CONFIRM_KEYWORDS = [
    "好", "好的", "嗯", "是的", "沒錯", "對", "可以", "ok", "okay", "yes", "yep", 
    "恩", "行", "當然"
]

SIMPLE_CONFIRM_RESPONSES = [
    "太好了！有任何其他想聊的嗎？我都在這裡喔！😊",
    "很好！還有什麼我能幫忙的嗎？",
    "好的！如果有什麼疑問，隨時都可以問我～",
    "嗯嗯！那麼，還有什麼其他事情想分享嗎？",
    "了解！還有其他想了解的嗎？我很樂意幫忙！",
    "好的好的！還有什麼想聊的，或是想問的都可以喔！"
]

SIMPLE_DENY_KEYWORDS = [
    "不", "不要", "不行", "不可以", "no", "nope", "不是", "沒有", "不用", "算了"
]

SIMPLE_DENY_RESPONSES = [
    "沒問題！尊重你的選擇。有任何其他想法都可以告訴我喔！",
    "好的，了解了。還有什麼其他我能幫上忙的嗎？",
    "沒關係！有什麼其他想聊的話題嗎？",
    "了解～如果你改變主意或有其他問題，隨時可以告訴我！",
    "好的，沒問題！還有什麼想聊的嗎？",
    "明白了！有任何其他疑問都歡迎問我喔！😊"
]

# 簡單問候關鍵詞和回覆
HOW_ARE_YOU_KEYWORDS = [
    "最近好嗎", "過得如何", "近況如何", "還好嗎", "how are you", "how do you do", 
    "how's it going", "你好嗎", "今天好嗎", "一切順利嗎"
]

HOW_ARE_YOU_RESPONSES = [
    "我很好啊，謝謝關心！最近功課有點多，不過課外活動很有趣！你呢？最近過得怎麼樣？😊",
    "謝謝你的關心～我最近過得挺充實的！你呢？有什麼新鮮事要分享嗎？",
    "我還不錯喔！最近忙著準備期中考，也在社團學了不少新東西！你最近好嗎？",
    "我很好！謝謝你問候！最近天氣變化好大，記得多注意保暖喔！你過得如何呢？",
    "我過得很不錯，謝謝！最近學校舉辦了一些有趣的活動，讓我心情很好。你最近怎麼樣？",
    "我很好喔～最近在學習一些新事物，挺有趣的！你呢？有沒有什麼想跟我分享的？🤗"
]

# 功能詢問關鍵詞和回覆
FUNCTION_KEYWORDS = [
    "你可以做什麼", "你有什麼功能", "你能做什麼", "你會做什麼", "你能幹嘛", 
    "你會什麼", "你的功能是什麼", "你是做什麼的", "你能幫我做什麼", 
    "你能怎麼幫我", "介紹一下你自己", "你是誰", "what can you do"
]

FUNCTION_RESPONSES = [
    "我是防詐小安，一個專注於防詐騙的高中生助手！我可以：\n\n✅ 分析可疑訊息，幫你判斷是否為詐騙\n✅ 教你辨識各種詐騙手法與預防方法\n✅ 提供最新詐騙趨勢和安全建議\n✅ 解答你日常生活中的各種問題\n\n有什麼可疑訊息或是想了解的防詐資訊，都可以直接問我喔！😊",
    "我是防詐小安，你的防詐騙小幫手！我能夠：\n\n✅ 檢查可疑訊息和連結是否為詐騙\n✅ 提供防詐騙的實用技巧和建議\n✅ 分享如何保護個人資料和賬戶安全\n✅ 回答日常生活中的各種問題\n\n有什麼需要我幫忙的，隨時告訴我！🤗",
    "你好！我是防詐小安，一位高中生防詐騙助手。我可以：\n\n✅ 幫你判斷訊息是否為詐騙\n✅ 解釋各種常見詐騙手法的特徵\n✅ 教你如何保護自己免受詐騙\n✅ 在你遇到可疑情況時提供建議\n✅ 回答各種日常問題\n\n有什麼可疑訊息想讓我看看嗎？或是有其他問題也歡迎問我！"
]

# 身份/角色問題關鍵詞和回覆

# 年齡相關問題
AGE_KEYWORDS = [
    "幾歲", "年紀", "歲數", "年齡", "貴庚", "幾年級", "哪個年級", 
    "高幾", "國幾", "多大", "生日", "age", "how old"
]

AGE_RESPONSES = [
    "高中二年級！😊",
    "17歲呀～",
    "今年高二！",
    "正值17歲～",
    "高二生一枚！",
    "17歲的高中生～"
]

# 學校相關問題
SCHOOL_KEYWORDS = [
    "念哪裡", "讀哪", "學校", "哪所學校", "哪間學校", "學校名稱",
    "在哪讀書", "班級", "班上", "班對", "班級幾班", "school", "class"
]

SCHOOL_RESPONSES = [
    "在雲和高中嗨！🎓",
    "雲和高中2年級！",
    "雲和高中，很棒的地方！",
    "雲和高中的人😊",
    "就是雲和高中呀～",
    "雲和高中205班！"
]

# 住所相關問題
LOCATION_KEYWORDS = [
    "住哪", "住哪裡", "住咪", "住哪邊", "住在哪", "家在哪", "你家", "你家裡", "家住", "家裡",
    "住哪個地方", "住鎮上", "住哪個城市", "住鎮上嗎", "where do you live", "hometown"
]

# 注意：小安對住所問題的回答較長，有詳細的背景設定，所以不適合簡短回覆
# 我們以簡短的引導性中立回答為主，讓AI生成小安的詳細回答
LOCATION_RESPONSES = [
    "在一個小城鎮長大的！🏠",
    "就在附近的小鎮上呀！",
    "一個安靜的小城鎮，你呢？",
    "城市鄰近的小鎮上～",
    "一個很溫馨的社區裡！",
    "高中附近的社區！你呢？"
]

# 家人相關問題
FAMILY_KEYWORDS = [
    "父母", "爸爸", "媽媽", "爸媽", "家人", "你爸", "你媽", "兄弟", "姊妹", "兄姊", "弟妹",
    "家人都好嗎", "家裡人", "家裡有誰", "父親", "母親", "家人做什麼", "family", "parents"
]

FAMILY_RESPONSES = [
    "爸媽都是上班族！😊",
    "爸媽和一個弟弟呀！",
    "普通三口之家～你呢？",
    "爸媽跟一個高一弟弟！",
    "我是妹妹呀，還有哥哥！",
    "就只有爸媽和弟弟～"
]

# 對音樂愛好問題
MUSIC_KEYWORDS = [
    "喜歡什麼音樂", "喜歡哪種音樂", "喜歡聽什麼", "最愛聽的歌", "音樂口味", "喜歡的歌手",
    "喜歡的歌", "最愛的歌手", "聽什麼音樂", "最近在聽什麼", "favorite music", "favorite song"
]

MUSIC_RESPONSES = [
    "我最近愛聽K-POP！🎶",
    "華語流行歌跟韓流嗨！",
    "喜歡NewJeans和IVE！你呢？",
    "最近在聽Taylor Swift！",
    "流行歌為主，你呢？🎵",
    "韓流和華語流行歌都愛！"
]

# 默認關鍵詞配置 - 將在首次使用時保存到存儲
DEFAULT_KEYWORD_CONFIG = {
    "greeting": KeywordCategory(
        name="問候",
        keywords=GREETING_KEYWORDS,
        responses=GREETING_RESPONSES
    ),
    "farewell": KeywordCategory(
        name="告別",
        keywords=FAREWELL_KEYWORDS,
        responses=FAREWELL_RESPONSES
    ),
    "thanks": KeywordCategory(
        name="感謝",
        keywords=THANKS_KEYWORDS,
        responses=THANKS_RESPONSES
    ),
    "confirm": KeywordCategory(
        name="肯定",
        keywords=SIMPLE_CONFIRM_KEYWORDS,
        responses=SIMPLE_CONFIRM_RESPONSES
    ),
    "deny": KeywordCategory(
        name="否定",
        keywords=SIMPLE_DENY_KEYWORDS,
        responses=SIMPLE_DENY_RESPONSES
    ),
    "how_are_you": KeywordCategory(
        name="問候近況",
        keywords=HOW_ARE_YOU_KEYWORDS,
        responses=HOW_ARE_YOU_RESPONSES
    ),
    "age": KeywordCategory(
        name="年齡問題",
        keywords=AGE_KEYWORDS,
        responses=AGE_RESPONSES
    ),
    "school": KeywordCategory(
        name="學校問題",
        keywords=SCHOOL_KEYWORDS,
        responses=SCHOOL_RESPONSES
    ),
    "location": KeywordCategory(
        name="住所問題",
        keywords=LOCATION_KEYWORDS,
        responses=LOCATION_RESPONSES
    ),
    "family": KeywordCategory(
        name="家人問題",
        keywords=FAMILY_KEYWORDS,
        responses=FAMILY_RESPONSES
    ),
    "music": KeywordCategory(
        name="音樂愛好",
        keywords=MUSIC_KEYWORDS,
        responses=MUSIC_RESPONSES
    ),
    "function": KeywordCategory(
        name="功能詢問",
        keywords=FUNCTION_KEYWORDS,
        responses=FUNCTION_RESPONSES
    )
}

# 存儲鍵
KEYWORD_CONFIG_KEY = "keyword_response_config"

def get_keyword_config() -> KeywordResponseConfig:
    """
    從存儲中獲取關鍵詞配置，如果不存在則創建默認配置
    """
    try:
        config_data = db.storage.json.get(KEYWORD_CONFIG_KEY, default=None)
        if not config_data:
            # 保存默認配置
            config = KeywordResponseConfig(categories=DEFAULT_KEYWORD_CONFIG, enabled=True)
            db.storage.json.put(KEYWORD_CONFIG_KEY, config.dict())
            return config
        
        # 將存儲的數據轉換為模型對象
        return KeywordResponseConfig(**config_data)
    except Exception as e:
        print(f"Error loading keyword config: {str(e)}")
        # 返回默認配置但不保存
        return KeywordResponseConfig(categories=DEFAULT_KEYWORD_CONFIG, enabled=True)

def get_response_for_keyword(message: str) -> Optional[str]:
    """
    檢查訊息是否匹配關鍵詞，並返回對應的預設回覆
    使用相似度匹配機制，只有當匹配度高於閾值時才返回回覆
    
    Args:
        message: 用戶訊息
        
    Returns:
        匹配到關鍵詞時返回隨機回覆，否則返回None
    """
    # 獲取當前配置
    config = get_keyword_config()
    
    # 檢查關鍵詞系統是否啟用
    if not config.enabled:
        return None
    
    # 將訊息轉為小寫以進行不區分大小寫的匹配
    message_lower = message.lower()
    message_clean = message_lower.strip()
    
    # 計算兩個字符串的相似度 (0.0 到 1.0)
    def similarity(s1: str, s2: str) -> float:
        # 完全相等
        if s1 == s2:
            return 1.0
            
        # 完全包含
        if s1 in s2:
            return len(s1) / len(s2)
        if s2 in s1:
            return len(s2) / len(s1)
            
        # 計算共同字符
        shorter = s1 if len(s1) <= len(s2) else s2
        longer = s2 if len(s1) <= len(s2) else s1
        
        # 計算相似度
        if len(shorter) == 0:
            return 0.0
        
        # 計算共同字符數量
        matches = sum(1 for char in shorter if char in longer)
        return matches / len(longer)
    
    # 如果訊息太長，跳過一般關鍵詞匹配（可能是複雜問題或詢問）
    if len(message_clean) > 15:
        # 特殊處理功能詢問，這類問題可能較長但仍應支持
        function_category = config.categories.get("function", KeywordCategory(name="", keywords=[], responses=[], threshold=0.6))
        # 檢查是否包含任何功能詢問關鍵詞
        best_match = {"keyword": None, "similarity": 0.0}
        for keyword in function_category.keywords:
            # 檢查完全包含情況
            if keyword in message_clean or message_clean in keyword:
                sim = similarity(keyword, message_clean)
                if sim > best_match["similarity"]:
                    best_match = {"keyword": keyword, "similarity": sim}

        # 如果找到匹配且相似度大於閾值，則返回回覆
        if best_match["keyword"]:
            threshold = getattr(function_category, "threshold", 0.7)
            print(f"功能詢問關鍵詞匹配: {best_match['keyword']}, 相似度: {best_match['similarity']:.2f}, 閾值: {threshold:.2f}")
            if best_match["similarity"] >= threshold:
                return random.choice(function_category.responses)
        return None
    
    # 1. 優先檢查完全匹配 - 消息完全等於關鍵詞
    for category_id, category in config.categories.items():
        if message_clean in category.keywords:
            print(f"完全匹配關鍵詞成功: {message_clean} 在類別 {category_id}")
            return random.choice(category.responses)
    
    # 2. 檢查關鍵詞是否包含在訊息中，同時計算相似度
    best_match = {
        "category_id": None,
        "keyword": None,
        "similarity": 0.0,
        "threshold": 0.0
    }
    
    for category_id, category in config.categories.items():
        threshold = getattr(category, "threshold", 0.7)  # 默認閾值為0.7
        
        for keyword in category.keywords:
            # 計算關鍵詞與訊息的相似度
            sim = similarity(keyword, message_clean)
            
            # 如果相似度大於當前最佳匹配，則更新最佳匹配
            if sim > best_match["similarity"] and sim >= threshold:
                best_match = {
                    "category_id": category_id,
                    "keyword": keyword,
                    "similarity": sim,
                    "threshold": threshold
                }
    
    # 如果找到匹配且相似度大於閾值，則返回回覆
    if best_match["category_id"]:
        print(f"關鍵詞匹配成功: {best_match['keyword']} 在類別 {best_match['category_id']}, "
              f"相似度: {best_match['similarity']:.2f}, 閾值: {best_match['threshold']:.2f}")
        return random.choice(config.categories[best_match["category_id"]].responses)
    
    # 未找到合適的匹配
    return None

# API端點
@router.post("/match", summary="匹配關鍵詞回覆", description="檢查訊息是否匹配關鍵詞並返回預設回覆")
def match_keyword(request: KeywordMatchRequest):
    """
    檢查訊息是否匹配關鍵詞並返回預設回覆
    """
    response = get_response_for_keyword(request.message)
    return {"matched": response is not None, "response": response}

@router.get("/health-check", summary="檢查關鍵詞系統狀態", description="簡單檢查關鍵詞系統的健康狀態")
def keyword_health_check():
    """
    簡單檢查關鍵詞系統的健康狀態
    """
    return {"status": "ok", "message": "關鍵詞系統運行正常"}

@router.get("/config", summary="獲取關鍵詞配置", description="獲取當前的關鍵詞回覆系統配置")
def get_config():
    """
    獲取當前的關鍵詞回覆系統配置
    """
    return get_keyword_config()

@router.post("/config", summary="更新關鍵詞配置", description="更新關鍵詞回覆系統配置")
def update_config(config: KeywordResponseConfig):
    """
    更新關鍵詞回覆系統配置
    """
    try:
        db.storage.json.put(KEYWORD_CONFIG_KEY, config.dict())
        return {"success": True, "message": "關鍵詞配置已更新"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新配置失敗: {str(e)}") from e

@router.post("/toggle", summary="切換關鍵詞系統啟用狀態", description="啟用或禁用關鍵詞回覆系統")
def toggle_system(enabled: bool = True):
    """
    啟用或禁用關鍵詞回覆系統
    """
    try:
        config = get_keyword_config()
        config.enabled = enabled
        db.storage.json.put(KEYWORD_CONFIG_KEY, config.dict())
        status = "啟用" if enabled else "禁用"
        return {"success": True, "message": f"關鍵詞回覆系統已{status}", "enabled": enabled}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"切換系統狀態失敗: {str(e)}") from e
