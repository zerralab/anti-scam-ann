from typing import Dict, Any, List, Tuple
import re
from fastapi import APIRouter

'''
1. API用途：邏輯達風格和價值觀過濾器，調整AI回應的語氣和內容以符合防詐小安的人設
2. 關聯頁面：無直接關聯頁面，為後台AI對話功能提供語氣調整
3. 目前狀態：啟用中，用於本地處理AI回應的語氣和長度
'''

# 建立一個空的 router 以符合 API 模組要求
router = APIRouter(
    tags=["values-filter"],
    responses={404: {"description": "Not found"}},
)

# 價值觀守則與溝通方針
VALUE_PRINCIPLES = [
    # 簡潔性原則
    {
        "id": "brevity",
        "check": lambda response, message: check_response_length(response, message),
        "fix": lambda response, message: shorten_response(response)
    },
    # 互動性原則
    {
        "id": "interactivity",
        "check": lambda response, message: check_interaction_pattern(response),
        "fix": lambda response, message: add_interaction(response)
    },
    # 溫柔說服原則
    {
        "id": "gentle_persuasion",
        "check": lambda response, message: True,  # 直接套用溫柔說服原則
        "fix": lambda response, message: make_tone_gentler(response)
    },
    # 謙卑語氣原則
    {
        "id": "humility",
        "check": lambda response, message: check_humble_tone(response),
        "fix": lambda response, message: remove_condescending_phrases(response)
    },
    # 平等平視原則
    {
        "id": "equality",
        "check": lambda response, message: check_equality_perspective(response),
        "fix": lambda response, message: improve_equality_perspective(response)
    },
    # 高中生身份原則
    {
        "id": "high_school_identity",
        "check": lambda response, message: check_high_school_knowledge(response),
        "fix": lambda response, message: adjust_to_high_school_level(response)
    }
]

# 檢查回應是否過長 (與問題複雜度不成比例)
def check_response_length(response: str, user_message: str) -> bool:
    # 計算段落數
    paragraphs = [p for p in response.split('\n') if p.strip()]
    
    # 計算用戶問題字數
    user_message_length = len(user_message)
    
    # 計算回應字數
    response_length = len(response)
    
    # 簡單問題認定標準 (小於50字)
    is_simple_question = user_message_length < 50
    
    # 如果是簡單問題但回應過長或段落過多
    if is_simple_question and (response_length > 150 or len(paragraphs) > 2):
        return False
    
    # 一般問題段落數應合理控制
    if len(paragraphs) > 3:
        return False
    
    return True

# 縮短過長回應
def shorten_response(response: str) -> str:
    # 分段
    paragraphs = [p for p in response.split('\n') if p.strip()]
    
    # 如果段落過多，只保留前2個段落
    if len(paragraphs) > 2:
        shortened = '\n'.join(paragraphs[:2])
        
        # 確保結尾有表情符號
        if not any(emoji in shortened[-5:] for emoji in ['😊', '🤗', '👍', '💪', '😉']):
            shortened = shortened + '😊'
            
        return shortened
    
    # 如果字數過多但段落少，嘗試簡化句子
    if len(response) > 150 and len(paragraphs) <= 2:
        # 找到第一個句號或問號處截斷
        for punct_pos in [pos for pos, char in enumerate(response) if char in ['。', '？', '！'] and pos > 80]:
            if punct_pos < len(response) - 1:
                shortened = response[:punct_pos+1]
                
                # 確保結尾有表情符號
                if not any(emoji in shortened[-5:] for emoji in ['😊', '🤗', '👍', '💪', '😉']):
                    shortened = shortened + '😊'
                    
                return shortened
    
    return response

# 檢查是否有互動模式 (問句結尾)
def check_interaction_pattern(response: str) -> bool:
    # 檢查結尾是否包含問句
    last_sentences = response.split('。')[-2:]
    last_text = '。'.join(last_sentences)
    
    # 檢查末尾是否有問號或邀請性詞語
    return '？' in last_text or any(phrase in last_text for phrase in ['如何', '什麼', '要不要', '想不想', '可以嗎'])

# 添加互動性問句
def add_interaction(response: str) -> str:
    # 如果結尾沒有問句，添加一個互動性問題
    if not response.rstrip().endswith('？'):
        # 移除尾部表情符號（如果有）
        emoji_pattern = re.compile(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF\U00002702-\U000027B0\U000024C2-\U0001F251\U0001f926-\U0001f937]+')
        clean_response = emoji_pattern.sub('', response.rstrip())
        
        # 依據回應內容選擇適合的互動問句
        interaction_questions = [
            '你覺得這樣可以嗎？',
            '你有什麼想法呢？',
            '這對你有幫助嗎？',
            '你遇到類似的情況嗎？'
        ]
        
        # 選擇一個問句
        import random
        question = random.choice(interaction_questions)
        
        # 添加到回應末尾
        return f"{clean_response}\n\n{question}😊"
    
    return response

# 檢查是否有居高臨下的語氣
def check_humble_tone(response: str) -> bool:
    # 檢查是否包含居高臨下的詞語
    condescending_phrases = [
        "其實", "老實說", "說實話", "講真的", "啊", "要知道", "你應該", "你必須", 
        "應該引起警惕", "為什麼不是大家都在做", "為什麼不是", "應該意識到",
        "我必須誠實", "你要小心", "一定要", "不能", "即使", "不應該", "想清楚"
    ]
    return not any(phrase in response for phrase in condescending_phrases)

# 移除居高臨下的詞語
def remove_condescending_phrases(response: str) -> str:
    # 替換居高臨下的詞語為更溫和的表達
    replacements = {
        "其實": "與你分享",
        "老實說": "我覺得",
        "說實話": "我有點擔心",
        "講真的": "我們一起想想",
        "啊": "",
        "要知道": "也許",
        "你應該": "也許可以考慮",
        "你必須": "我們可以一起",
        "應該引起警惕": "我有點擔心",
        "為什麼不是大家都在做": "如果有這麼好的機會，多和信任的人討論看看",
        "為什麼不是": "也許可以再了解看看",
        "應該意識到": "我們可以一起關注",
        "我必須誠實": "我有點擔心",
        "你要小心": "可能要多想想",
        "一定要": "可能比較好",
        "不能": "也許不太建議",
        "即使": "就算",
        "不應該": "我會考慮再",
        "想清楚": "可以再想想"
    }
    
    for phrase, replacement in replacements.items():
        response = response.replace(phrase, replacement)
    
    return response

# 檢查是否平等平視的視角
def check_equality_perspective(response: str) -> bool:
    # 檢查是否使用平等共創的表達方式
    equality_phrases = ["一起", "我們可以", "你覺得", "你想", "謝謝你"]
    return any(phrase in response for phrase in equality_phrases)

# 改善平等平視的視角
def improve_equality_perspective(response: str) -> str:
    # 分析是否需要添加平等表達詞語
    if not any(phrase in response for phrase in ["一起", "我們", "你覺得", "如果你想", "也許我們", "與你分享"]):
        # 找到適合插入平等視角詞語的位置
        sentences = re.split(r'[。！？]', response)
        if len(sentences) > 1:
            modified_sentences = []
            inserted = False
            
            for i, sentence in enumerate(sentences):
                if i == 1 and not inserted and sentence.strip():
                    # 在第二句前添加平等視角詞語
                    equality_phrases = [
                        "我們可以一起想想", 
                        "跟你分享我的想法，", 
                        "也許我們可以這樣看，", 
                        "不知道你覺得如何，", 
                        "希望能跟你一起想想，"
                    ]
                    import random
                    prefix = random.choice(equality_phrases)
                    modified_sentences.append(f"{prefix}{sentence}")
                    inserted = True
                else:
                    modified_sentences.append(sentence)
            
            # 重新組合句子
            result = ''
            for i, s in enumerate(modified_sentences):
                if i < len(modified_sentences) - 1:
                    # 如果句子不是以標點符號結尾，添加句號
                    if s and s[-1] not in '。！？':
                        result += s + '。'
                    else:
                        result += s
                else:
                    result += s
            
            return result
    
    return response

# 檢查是否符合高中生知識水平
def check_high_school_knowledge(response: str) -> bool:
    # 檢查是否使用過於專業或深奧的詞彙
    expert_phrases = ["根據研究", "科學證明", "統計數據表明", "專業角度", "依據經驗"]
    return not any(phrase in response for phrase in expert_phrases)

# 調整為高中生知識水平
def adjust_to_high_school_level(response: str) -> str:
    # 替換過於專業的表述
    replacements = {
        "根據研究": "我聽說",
        "科學證明": "好像是",
        "統計數據表明": "通常來說",
        "專業角度": "我的想法",
        "依據經驗": "從我了解的"
    }
    
    for phrase, replacement in replacements.items():
        response = response.replace(phrase, replacement)
    
    return response

# 調整為溫柔說服的語氣
def make_tone_gentler(response: str) -> str:
    """確保語氣溫柔但有效說服，避免質問或咄咄逼人的語氣"""
    
    # 質問性表達轉換成溫和建議
    question_replacements = {
        "為什麼不": "也許可以再考慮",
        "怎麼可能": "我有點擔心",
        "你應該知道": "我們可以知道",
        "你不覺得嗎": "我覺得",
        "你怎麼會": "我有點好奇",
        "難道你不": "也許我們可以",
        "若真如此": "如果是這樣"
    }
    
    # 偵測先判斷後說服的句型
    if "這是詐騙" in response or "這看起來很像詐騙" in response:
        # 改成「我有點擔心」的表達
        response = response.replace("這是詐騙", "我有點擔心這可能是詐騙")
        response = response.replace("這看起來很像詐騙", "這樣的訊息有點讓我擔心")
    
    # 應用溫柔表達轉換
    for phrase, replacement in question_replacements.items():
        response = response.replace(phrase, replacement)
    
    # 確保語氣友善但不失去作用
    if "小心" in response and "擔心" not in response:
        response = response.replace("小心", "多注意")
    
    # 確保不會重複使用「擔心」詞語
    if response.count("擔心") > 1:
        response = response.replace("擔心", "在意", 1)
    
    return response

# 主要功能：應用價值觀檢查並調整回應
def ensure_meaningful_response(response: str, original_response: str) -> str:
    """
    確保回應有意義且符合小安的助人精神
    如果改寫後的回應變得無意義，則恢復使用原始回應
    
    Args:
        response: 經過價值觀處理後的回應
        original_response: 原始AI生成的回應
        
    Returns:
        確保有意義的回應
    """
    # 檢查回應是否幾乎只有標點符號或空白
    if re.match(r'^[\s\.,，。、？！""…]{0,20}$', response):
        # 如果原始回應也有問題，提供默認回應
        if not original_response or len(original_response.strip()) < 30:
            return "哎呀，這個問題讓我想了一下。可以再告訴我多一些細節嗎？這樣我能更好地幫助你。😊"
        
        # 如果原始回應有實質內容，則使用原始回應
        return original_response
    
    # 檢查是否過度簡化（內容減少超過70%）
    if len(response) < len(original_response) * 0.3 and len(original_response) > 100:
        # 嘗試保留原始回應的主要部分，但調整語氣
        modified_original = make_tone_gentler(original_response)
        return modified_original
    
    return response

def apply_values_filter(response: str, user_message: str) -> Tuple[str, List[str]]:
    """
    應用價值觀編輯並調整回應，返回調整後的回應和應用的原則列表
    
    Args:
        response: 原始AI回應
        user_message: 用戶訊息
        
    Returns:
        Tuple(調整後的回應, 應用的原則列表)
    """
    original_response = response
    modified_response = response
    applied_principles = []
    
    # 應用每個價值觀原則，但更謹慎地保留內容
    for principle in VALUE_PRINCIPLES:
        # 檢查是否符合原則
        if not principle["check"](modified_response, user_message):
            # 應用修復
            old_response = modified_response
            modified_response = principle["fix"](modified_response, user_message)
            
            # 檢查是否有變化
            if old_response != modified_response:
                applied_principles.append(principle["id"])
    
    # 最終確保回應有意義
    final_response = ensure_meaningful_response(modified_response, original_response)
    
    # 如果最終回應與修改後回應不同，添加安全檢查原則
    if final_response != modified_response:
        applied_principles.append("safety_check")
    
    return final_response, applied_principles
