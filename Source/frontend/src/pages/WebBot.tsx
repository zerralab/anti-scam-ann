import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "utils/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronRight, Send, Bot, MessageSquare, Phone } from "lucide-react";
import ReactMarkdown from "react-markdown";
import brain from "brain";

// 定義訊息類型
type MessageType = "user" | "bot";

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  analysis?: any;
}

export default function WebBot() {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingMessages, setPendingMessages] = useState<string[]>([]);
  const [messageBuffer, setMessageBuffer] = useState<{timeout: NodeJS.Timeout | null; messages: string[]}>({timeout: null, messages: []});
  const [botIsTyping, setBotIsTyping] = useState(false);

  // 自動調整輸入框高度的函數
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '40px';
      if (textarea.scrollHeight > 40) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  };

  // 當文字改變時調整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useLocalStorage<Message[]>("chat-messages", []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // 清理計時器
  useEffect(() => {
    return () => {
      if (messageBuffer.timeout) {
        clearTimeout(messageBuffer.timeout);
      }
    };
  }, [messageBuffer.timeout]);

  // 範例詐騙訊息與問候
  const exampleScams = [
    {
      title: "銀行帳戶出現異常交易",
      text: "【緊急通知】您的銀行帳戶出現異常交易，為確保資金安全，請立即撥打客服電話或點擊連結驗證身份：https://bank-secure.example.com"
    },
    {
      title: "下載這個 App 賺比較多",
      text: "秘密投資機會！我們的專家團隊已發現一個絕佳投資標的，保證每月15-20%回報率，風險極低。限量名額，立即聯繫我們開始致富之旅！"
    },
    {
      title: "親愛的我好想你",
      text: "親愛的，自從上次聊天後我一直在想你。我很快就能到台灣見你了，但我遇到了一些問題。我的銀行卡被凍結了，能借給我5000元解決緊急問題嗎？我到了一定會還你的。"
    },
    {
      title: "恭喜您中獎了！",
      text: "恭喜您！您的電子郵件地址在我們的年度抽獎中獲得了1,000,000元獎金。要領取您的獎金，請先支付5,000元的手續費用於以下帳戶..."
    }
  ];

  // 滾動到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 生成唯一ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 初始歡迎訊息
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: generateId(),
        content: "嗨嗨～好久不見了呢 👋 最近過得怎麼樣啊？有什麼我能幫上忙的嗎？",
        type: "bot",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // 新增集合連續訊息的函數
  const collectAndProcessMessage = (messageText: string) => {
    // 將新訊息加入暫存區
    const updatedBuffer = [...messageBuffer.messages, messageText];
    
    // 如果已有計時器，清除它
    if (messageBuffer.timeout) {
      clearTimeout(messageBuffer.timeout);
    }
    
    // 設置新計時器，800毫秒後處理訊息
    const newTimeout = setTimeout(() => {
      // 防止重複處理
      if (isAnalyzing) return;
      
      // 合併暫存區中的訊息
      const combinedMessage = updatedBuffer.join("\n");
      
      // 添加用戶訊息
      const userMessage: Message = {
        id: generateId(),
        content: combinedMessage,
        type: "user",
        timestamp: new Date()
      };
      
      // 更新訊息列表
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // 設置分析中狀態
      setIsAnalyzing(true);
      
      // 清空暫存區
      setMessageBuffer({timeout: null, messages: []});
      
      // 確保滾動到底部
      scrollToBottom();
      
      // 設置機器人正在輸入狀態
      setBotIsTyping(true);
      
      // 發送到API處理
      processMessage(combinedMessage, updatedMessages);
    }, 800); // 800毫秒等待時間，可根據需要調整
    
    // 更新訊息暫存和計時器狀態
    setMessageBuffer({timeout: newTimeout, messages: updatedBuffer});
  };
  
  // 處理訊息並發送到API
  const processMessage = async (messageText: string, updatedMessages: Message[]) => {
    try {
      // 首先檢查是否匹配關鍵詞
      const keywordResponse = await brain.match_keyword({
        message: messageText
      });
      const keywordData = await keywordResponse.json();
      
      // 如果匹配到關鍵詞，直接使用關鍵詞回應
      if (keywordData.matched && keywordData.response) {
        console.log("匹配到關鍵詞，使用預設回應");
        
        // 添加機器人回覆
        const botMessage: Message = {
          id: generateId(),
          content: keywordData.response,
          type: "bot",
          timestamp: new Date()
        };
        
        // 更新訊息列表
        setMessages([...updatedMessages, botMessage]);
        setIsAnalyzing(false);
        return;
      }
      
      // 如果沒有匹配到關鍵詞，使用AI對話API
      console.log("未匹配到關鍵詞，使用AI對話");
      
      // 準備聊天歷史 (可選，最多提供3-5條最近對話)
      const chatHistory = messages.slice(-6).map(msg => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content
      }));
      
      const conversation = await brain.ai_conversation_chat({ 
        message: messageText,
        chat_history: chatHistory
      });
      const conversationData = await conversation.json();
      
      // 從回應中獲取分析結果
      const analysisData = {
        is_scam: conversationData.is_scam,
        scam_info: conversationData.scam_info,
        matched_categories: conversationData.analysis?.matched_categories || [],
        confidence: conversationData.analysis?.confidence || 0
      };
      
      // 獲取AI生成的回應
      const adviceData = {
        response: conversationData.response
      };

      // 添加機器人回覆
      const botMessage: Message = {
        id: generateId(),
        content: adviceData.response,
        type: "bot",
        timestamp: new Date(),
        analysis: analysisData
      };

      // 確保包含用戶訊息和機器人回覆
      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.error("Error analyzing message:", error);

      // 添加錯誤訊息
      const errorMessage: Message = {
        id: generateId(),
        content: "很抱歉，分析過程中發生錯誤。請稍後再試。",
        type: "bot",
        timestamp: new Date()
      };

      // 確保包含用戶訊息和錯誤訊息
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsAnalyzing(false);
      setBotIsTyping(false);
    }
  };

  // 直接處理單條訊息的函數
  const handleSingleMessage = (messageText: string) => {
    // 防止重複處理
    if (isAnalyzing) return;
    
    // 添加用戶訊息
    const userMessage: Message = {
      id: generateId(),
      content: messageText,
      type: "user",
      timestamp: new Date()
    };
    
    // 更新訊息列表
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // 設置分析中狀態
    setIsAnalyzing(true);
    
    // 確保滾動到底部
    scrollToBottom();
    
    // 設置機器人正在輸入狀態
    setBotIsTyping(true);
    
    // 發送到API處理
    processMessage(messageText, updatedMessages);
  };
  
  const sendMessage = async () => {
    // 防止空白訊息
    if (!inputMessage.trim()) return;

    // 保存當前輸入訊息內容
    const messageText = inputMessage.trim();
    
    // 立即清空輸入框（確保在處理訊息前清空）
    setInputMessage("");
    
    // 調整輸入框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
    
    // 確保UI已更新後再處理訊息
    setTimeout(() => {
      // 直接處理訊息
      handleSingleMessage(messageText);
    }, 0);
  };

  // 使用範例詐騙訊息
  const useExample = (example: { title: string; text: string }) => {
    setInputMessage(example.text);
    // 使消息輸入框獲得焦點
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // 格式化電話號碼，使其可點擊
  const formatPhoneNumbers = (text: string) => {
    return text.replace(/(\d{4}|\*\*\d{4}\*\*)/g, (match) => {
      const number = match.replace(/\*/g, '');
      return `<a href="tel:${number}" class="text-blue-500 underline">${match}</a>`;
    });
  };
  
  // 渲染訊息氣泡
  const renderMessage = (message: Message) => {
    const isBot = message.type === "bot";
    const hasScamAnalysis = message.analysis && message.analysis.is_scam;

    return (
      <div key={message.id} className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
        <div className={`flex ${isBot ? "flex-row" : "flex-row-reverse"} max-w-[80%]`}>
          {/* 頭像 */}
          {isBot ? (
            <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-2">
              <img 
                src="/public/fe77384c-c5dc-46d4-96b1-951b9bd7b2b3/openart-image_4s_fnjsi_1740812391514_raw.jpg" 
                alt="小安" 
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ml-2">
              <span className="text-blue-500 text-xs font-medium">您</span>
            </div>
          )}

          {/* 訊息內容 */}
          <div>
            <div className={`py-2 px-3 rounded-lg ${isBot ? "bg-slate-100 text-foreground rounded-tl-none" : "bg-primary text-primary-foreground rounded-tr-none"}`}>
              {isBot ? (
                <div className="text-sm">
                  <ReactMarkdown className="whitespace-pre-wrap text-base break-words leading-relaxed" components={{
                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline" />,
                    p: ({ node, ...props }) => <p {...props} className="mb-2" />,
                    li: ({ node, ...props }) => <li {...props} className="mb-1" />
                  }}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-base break-words leading-relaxed">{message.content}</div>
              )}
            </div>

            {/* 詐騙分析標記 */}
            {hasScamAnalysis && (
              <div className="mt-1 flex">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7 flex items-center gap-1"
                  onClick={() => setSelectedAnalysis(message.analysis)}
                >
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-red-500 font-medium">怎麼分析疑似為詐騙的？</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染詐騙分析詳情
  const renderAnalysisDetails = () => {
    if (!selectedAnalysis) return null;

    return (
      <Card className="mt-4 border-red-200 shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" /> 
            詐騙分析詳情
          </CardTitle>
          <CardDescription>
            以下是偵測到的詐騙特徵
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="font-medium">詐騙風險:</div>
              <Badge variant={selectedAnalysis.is_scam ? "destructive" : "outline"}>
                {selectedAnalysis.is_scam ? "高風險" : "低風險"}
              </Badge>
            </div>

            {selectedAnalysis.matched_categories && selectedAnalysis.matched_categories.length > 0 && (
              <div>
                <div className="font-medium mb-1">匹配的詐騙特徵:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedAnalysis.matched_categories.map((category: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-yellow-50">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedAnalysis.scam_info && (
              <div>
                <div className="font-medium mt-2">{selectedAnalysis.scam_info.name}</div>
                <div className="text-muted-foreground mt-1">{selectedAnalysis.scam_info.description}</div>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setSelectedAnalysis(null)}
            >
              關閉分析
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            回首頁
          </Button>
        </div>
        <div className="flex flex-col">


        {/* 聊天區域 */}
        <div className="flex flex-col">
          <Card className="shadow-sm bg-white rounded-xl relative overflow-hidden">
            {/* 卡片右上角裝飾 */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-3xl z-0"></div>
            <CardHeader className="pb-2 relative z-10 mb-4 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm"></div>
                  <div className="relative flex-shrink-0 h-[50px] w-[50px] rounded-full overflow-hidden border-2 border-primary/30 z-10">
                    <img 
                      src="/public/fe77384c-c5dc-46d4-96b1-951b9bd7b2b3/openart-image_4s_fnjsi_1740812391514_raw.jpg" 
                      alt="防詐小安" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              <div>
                <CardTitle className="text-xl font-bold">小安</CardTitle>
                <CardDescription>與小安聊聊天，她會幫你判斷訊息是否為詐騙</CardDescription>
              </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              {/* 訊息區域 - 修改為更靈活的佈局 */}
              <div className="overflow-y-auto mb-4 pr-2 min-h-[350px] max-h-[calc(65vh-120px)] text-base flex flex-col">
                <div className="space-y-6">
                  {messages.map(renderMessage)}
                  {botIsTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="flex flex-row max-w-[80%]">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-2">
                          <img 
                            src="/public/fe77384c-c5dc-46d4-96b1-951b9bd7b2b3/openart-image_4s_fnjsi_1740812391514_raw.jpg" 
                            alt="小安" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="py-2 px-3 rounded-lg bg-slate-100 text-foreground rounded-tl-none flex items-center">
                            <div className="flex space-x-1">
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* 範例訊息 */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">你有收到這類訊息嗎？</p>
                <div 
                  ref={scrollContainerRef}
                  className="overflow-x-scroll pb-2 cursor-grab active:cursor-grabbing" 
                  style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                  onMouseDown={(e) => {
                    if (!scrollContainerRef.current) return;
                    
                    const slider = scrollContainerRef.current;
                    let isDown = true;
                    const startX = e.pageX - slider.offsetLeft;
                    const scrollLeft = slider.scrollLeft;
                    
                    const onMouseMove = (moveEvent: MouseEvent) => {
                      if (!isDown) return;
                      moveEvent.preventDefault();
                      const x = moveEvent.pageX - slider.offsetLeft;
                      const walk = (x - startX) * 2; // 滑動靈敏度
                      slider.scrollLeft = scrollLeft - walk;
                    };
                    
                    const onMouseUp = () => {
                      isDown = false;
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                      slider.classList.remove('active:cursor-grabbing');
                      slider.classList.add('cursor-grab');
                    };
                    
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                    slider.classList.remove('cursor-grab');
                    slider.classList.add('cursor-grabbing');
                  }}
                  onMouseLeave={() => {
                    document.removeEventListener('mousemove', () => {});
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.classList.remove('cursor-grabbing');
                      scrollContainerRef.current.classList.add('cursor-grab');
                    }
                  }}
                >
                  <div className="flex gap-2 whitespace-nowrap px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {exampleScams.map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-[14px] flex-shrink-0 flex items-center gap-1"
                        onClick={() => useExample(example)}
                      >
                        <span>{example.title}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 輸入區域 */}
              <div className="flex items-center gap-2 mt-2 border-t pt-4">
                <Textarea
                  ref={textareaRef}
                  placeholder="輸入訊息..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 text-base resize-none overflow-hidden min-h-[40px] rounded-md px-[1.2rem] py-[0.8rem]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isAnalyzing || !inputMessage.trim()}
                  size="icon"
                  className="h-10 w-10 flex items-center justify-center self-start mt-[5px]"
                >
                  {isAnalyzing ? (
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* 免責聲明 */}
              <div className="mt-4 pt-2 border-t border-gray-100">
                <p className="text-xs text-muted-foreground text-center mb-1">
                  小安可能會發生錯誤，請查核重要資訊。如當您偵測到可能的詐騙行為，請撥打<strong>165反詐騙專線</strong>。
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  如您因遭遇詐騙感到悲傷或難以走出心理低潮，可撥打<strong>1995心理諮詢專線</strong>尋求協助。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 詐騙分析詳情 */}
          {renderAnalysisDetails()}
        </div>
      </div>
      </div>
    </div>
  );
}
