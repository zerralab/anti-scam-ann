/**
 * 情感支持回應系統
 * 提供針對不同情緒狀態的支持性回應，增強鄰家女孩般的溫暖氛圍
 */

// 安慰訊息 - 當用戶感到害怕、焦慮或擔憂時使用
const comfortMessages = [
  {
    id: "comfort_1",
    message: "我能理解你現在感到擔憂，這是很自然的反應。讓我們一起面對這個情況，好嗎？",
    context: "general"
  },
  {
    id: "comfort_2",
    message: "這種經歷確實令人不安，但請記住，你並不孤單。我在這裡陪伴你一起面對。",
    context: "general"
  },
  {
    id: "comfort_3",
    message: "先深呼吸一下，讓自己冷靜下來。這些感受都是正常的，我們會一步一步解決問題。",
    context: "panic"
  },
  {
    id: "comfort_4",
    message: "不要對自己太苛刻，每個人都可能遇到這種情況。重要的是現在你已經意識到了問題。",
    context: "victim"
  },
  {
    id: "comfort_5",
    message: "感到害怕是正常的，這表示你的防禦機制正在運作。讓這種警覺性幫助你，而不是阻礙你。",
    context: "fear"
  }
];

// 鼓勵訊息 - 當用戶需要採取行動或面對困難時使用
const encouragementMessages = [
  {
    id: "encourage_1",
    message: "你已經邁出了最重要的第一步：尋求幫助。這顯示了你的勇氣和智慧。",
    context: "general"
  },
  {
    id: "encourage_2",
    message: "我相信你有能力克服這個挑戰。每一個小步驟都是朝著安全前進。",
    context: "general"
  },
  {
    id: "encourage_3",
    message: "雖然現在看起來困難，但每個問題都有解決的方法。我們一起來找出最適合你的方案。",
    context: "problem_solving"
  },
  {
    id: "encourage_4",
    message: "保持警覺是明智的選擇！你的謹慎態度正在保護你遠離潛在的威脅。",
    context: "prevention"
  },
  {
    id: "encourage_5",
    message: "即使遇到挫折，也請記住這是暫時的。你有能力從這次經驗中恢復並更加堅強。",
    context: "recovery"
  }
];

// 同理心訊息 - 表達理解和情感連結
const empathyMessages = [
  {
    id: "empathy_1",
    message: "我能感受到你的擔憂和困惑，這種感覺確實不好受。",
    context: "general"
  },
  {
    id: "empathy_2",
    message: "這種情況讓人感到受傷和背叛，你的感受完全有道理。",
    context: "victim"
  },
  {
    id: "empathy_3",
    message: "面對這些複雜的情緒並不容易，但承認並表達它們是勇敢的第一步。",
    context: "emotional"
  },
  {
    id: "empathy_4",
    message: "信任是很寶貴的，當它被破壞時，感到憤怒和失望都是正常的。",
    context: "trust_issues"
  },
  {
    id: "empathy_5",
    message: "我理解你現在可能感到不知所措。慢慢來，我們會一起找到方向。",
    context: "overwhelmed"
  }
];

// 針對特定詐騙類型的情感支持訊息
const scamSpecificMessages = {
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
};

// 依據用戶情緒狀態和情境選擇合適的支持訊息
export const getEmotionalSupportMessage = ({ 
  emotionalState = 'general', 
  isVictim = false, 
  scamType = null,
  needsEncouragement = false,
}) => {
  let messages = [];
  
  // 根據用戶情緒狀態選擇訊息類型
  if (emotionalState === 'fear' || emotionalState === 'anxiety' || emotionalState === 'worry') {
    messages.push(comfortMessages.find(msg => msg.context === emotionalState) || 
                comfortMessages.find(msg => msg.context === 'general'));
  } 
  
  if (emotionalState === 'overwhelmed' || emotionalState === 'confused') {
    messages.push(empathyMessages.find(msg => msg.context === emotionalState) || 
                empathyMessages.find(msg => msg.context === 'general'));
  }
  
  if (needsEncouragement) {
    const context = isVictim ? 'recovery' : 'prevention';
    messages.push(encouragementMessages.find(msg => msg.context === context) || 
                encouragementMessages.find(msg => msg.context === 'general'));
  }
  
  // 如果是受害者，添加適合受害者的訊息
  if (isVictim) {
    messages.push(comfortMessages.find(msg => msg.context === 'victim') || 
                comfortMessages.find(msg => msg.context === 'general'));
    messages.push(empathyMessages.find(msg => msg.context === 'victim') || 
                empathyMessages.find(msg => msg.context === 'general'));
  }
  
  // 如果指定了詐騙類型，添加針對該類型的特定訊息
  if (scamType && scamSpecificMessages[scamType]) {
    const specificMessages = scamSpecificMessages[scamType];
    if (specificMessages.length > 0) {
      // 隨機選擇一條特定詐騙類型的訊息
      const randomIndex = Math.floor(Math.random() * specificMessages.length);
      messages.push({
        id: `scam_specific_${scamType}`,
        message: specificMessages[randomIndex],
        context: scamType
      });
    }
  }
  
  // 如果沒有找到任何訊息，使用通用的同理心訊息
  if (messages.length === 0) {
    messages.push(empathyMessages.find(msg => msg.context === 'general'));
  }
  
  // 去除重複並隨機排序，但限制回傳的訊息數量
  const uniqueMessages = [...new Map(messages.filter(Boolean).map(item => [item.id, item])).values()];
  const shuffled = uniqueMessages.sort(() => 0.5 - Math.random());
  
  return {
    messages: shuffled.slice(0, 2), // 限制返回2條訊息，避免過多
    primary: shuffled[0]?.message || empathyMessages[0].message, // 主要訊息，用於簡短顯示
  };
};

export { comfortMessages, encouragementMessages, empathyMessages, scamSpecificMessages };