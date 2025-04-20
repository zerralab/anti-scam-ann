/**
 * 首頁 HTML 代碼
 * 可供下載使用
 */

export const homepageHTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>防詐小安 - 您的鄰家女孩防詐小助手</title>
  <meta name="description" content="防詐小安就像您身邊的鄰居妹妹，隨時幫您辨識詐騙、提供建議，並給予情感支持。透過 LINE 訊息，讓小安成為您的數位安全小幫手。">
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>安</text></svg>">
</head>
<body>
  <header class="py-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
    <div class="container mx-auto px-4 flex justify-between items-center">
      <div class="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-2">
          安
        </div>
        <div class="flex items-center">
          <h1 class="text-xl font-bold">防詐小安</h1>
          <span class="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-medium">Beta</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="pt-16 pb-16 bg-gradient-to-b from-brand-light to-background">
    <div class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-12">
        <div class="max-w-xl">
          <div class="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            防詐守護者
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6" style="line-height: 1.35;">
            小安就在您身邊
            <span class="text-primary">防詐小幫手</span>
          </h1>
          <p class="text-lg text-muted-foreground mb-8">
            「防詐小安」就像您身邊的鄰居妹妹，隨時幫您辨識詐騙、提供建議，並給予情感支持。透過 LINE 訊息，讓小安成為您的數位安全小幫手。
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button class="btn btn-primary btn-lg">立即加入好友</button>
            <button class="btn btn-outline btn-lg">了解更多</button>
          </div>
        </div>
        
        <div class="relative w-full max-w-md">
          <div class="relative bg-white p-6 rounded-2xl shadow-lg border border-border overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-3xl z-0"></div>
            <div class="relative z-10">
              <div class="flex items-start gap-3 mb-6 bg-muted p-4 rounded-lg">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
                  安
                </div>
                <div class="bg-white p-3 rounded-lg shadow-sm border">
                  <p class="text-sm">您好！我是防詐小安。有什麼可以幫到您的嗎？</p>
                </div>
              </div>
              <div class="flex items-start justify-end gap-3 mb-6">
                <div class="bg-primary/10 p-3 rounded-lg">
                  <p class="text-sm">最近收到一封奢侈品抽獎的訊息，要我點連結領獎...</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
                  安
                </div>
                <div class="bg-white p-3 rounded-lg shadow-sm border">
                  <p class="text-sm text-destructive font-medium">這是詐騙！</p>
                  <p class="text-sm mt-1">請不要點擊這個連結。它有可能是釣魚連結，目的是竟邂您的個人資料或帳戶存取權。</p>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute -z-10 w-24 h-24 bg-secondary/50 rounded-full -bottom-6 -left-6 blur-xl"></div>
          <div class="absolute -z-10 w-32 h-32 bg-accent/50 rounded-full -top-8 -right-8 blur-xl"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-20">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-16 animate fade-up">
        <h2 class="text-3xl font-bold mb-4">防詐小安的暖心陪伴</h2>
        <p class="text-muted-foreground">
          小安就像一位暖心的鄰居妹妹，為您提供支援，陪您渡過人生的至暗時刻。
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="feature-card primary animate fade-up" style="animation-delay: 100ms;">
          <div class="icon-wrapper primary">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h3 class="title">即時詐騙辨識</h3>
          <p class="description">小安可協助判斷可疑訊息、電話或電子郵件是否為詐騙，提供即時安全建議。</p>
        </div>

        <div class="feature-card secondary animate fade-up" style="animation-delay: 200ms;">
          <div class="icon-wrapper secondary">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h3 class="title">個人化防詐建議</h3>
          <p class="description">根據您的年齡和需求，提供針對性建議，幫助您安全遊歩數位世界。</p>
        </div>

        <div class="feature-card tertiary animate fade-up" style="animation-delay: 300ms;">
          <div class="icon-wrapper tertiary">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
              <path d="m18 15-2-2" />
              <path d="m15 18-2-2" />
            </svg>
          </div>
          <h3 class="title">情感支持服務</h3>
          <p class="description">無論您是擔心有詐騙嫌疑，還是不幸遭遇詐騙，小安都提供情感支持。</p>
        </div>
      </div>
    </div>
  </section>

  <!-- How It Works Section -->
  <section id="how-it-works" class="py-20 bg-muted">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-16 animate fade-up">
        <h2 class="text-3xl font-bold mb-4">如何使用防詐小安</h2>
        <p class="text-muted-foreground">
          簡單三步驟，讓小安成為您的防詐好幫手。
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-background rounded-2xl p-6 shadow-sm relative overflow-hidden animate slide-right" style="animation-delay: 100ms;">
          <div class="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-3xl z-0"></div>
          <div class="relative z-10">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mb-4">
              1
            </div>
            <h3 class="text-xl font-bold mb-2">加入LINE好友</h3>
            <p class="text-muted-foreground">
              掃描下方的QR碼，或點擊「加入好友」按鈕，將小安加入您的LINE訊息列表。
            </p>
          </div>
        </div>

        <div class="bg-background rounded-2xl p-6 shadow-sm relative overflow-hidden animate fade-up" style="animation-delay: 200ms;">
          <div class="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-bl-3xl z-0"></div>
          <div class="relative z-10">
            <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xl font-bold mb-4">
              2
            </div>
            <h3 class="text-xl font-bold mb-2">傳送可疑訊息</h3>
            <p class="text-muted-foreground">
              收到可疑訊息時，只需轉發給小安，或直接描述您遇到的情況。
            </p>
          </div>
        </div>

        <div class="bg-background rounded-2xl p-6 shadow-sm relative overflow-hidden animate slide-left" style="animation-delay: 300ms;">
          <div class="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-bl-3xl z-0"></div>
          <div class="relative z-10">
            <div class="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl font-bold mb-4">
              3
            </div>
            <h3 class="text-xl font-bold mb-2">獲得即時幫助</h3>
            <p class="text-muted-foreground">
              小安會立即分析訊息，並提供防詐建議和情感支持。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Already Scammed Section -->
  <section id="already-scammed" class="py-20 bg-secondary/10">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-16 animate fade-up">
        <h2 class="text-3xl font-bold mb-4">已經被詐騙了怎麼辦？</h2>
        <p class="text-muted-foreground">
          若不幸遭遇詐騙，小安將提供清楚的指引，協助您采取適當的行動。
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-background rounded-2xl p-8 shadow-sm animate slide-right" style="animation-delay: 100ms;">
          <h3 class="text-2xl font-bold mb-6 text-primary">立即采取行動</h3>
          <ul class="space-y-4">
            <li class="flex">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                1
              </div>
              <div>
                <p class="font-medium">留存診據</p>
                <p class="text-muted-foreground">保存所有相關對話、交易紀錄和診據</p>
              </div>
            </li>
            <li class="flex">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                2
              </div>
              <div>
                <p class="font-medium">聯絡金融機構</p>
                <p class="text-muted-foreground">如果涉及信用卡或銀行賬戶，立即與金融機構聯絡凍結交易</p>
              </div>
            </li>
            <li class="flex">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                3
              </div>
              <div>
                <p class="font-medium">報警</p>
                <p class="text-muted-foreground">向警方報案，操作165及防詐專線</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="bg-background rounded-2xl p-8 shadow-sm animate slide-left" style="animation-delay: 200ms;">
          <h3 class="text-2xl font-bold mb-6 text-accent">小安能提供的幫助</h3>
          <div class="space-y-6">
            <div class="flex">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-4">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
                  <path d="m18 15-2-2" />
                  <path d="m15 18-2-2" />
                </svg>
              </div>
              <div>
                <p class="font-medium">情感支持</p>
                <p class="text-muted-foreground">被詐騙後可能會感到憤怒、焦慮或羞愧和羞恑，小安提供情感上的支持。</p>
              </div>
            </div>
            <div class="flex">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-4">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p class="font-medium">快速行動指導</p>
                <p class="text-muted-foreground">根據詐騙類型提供具體步驟，指導您采取正確行動。</p>
              </div>
            </div>
            <div class="flex">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-4">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
              <div>
                <p class="font-medium">詐騙預防建議</p>
                <p class="text-muted-foreground">提供未來防詐的建議，降低再次受害風險。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-12 text-center animate fade-up" style="animation-delay: 300ms;">
        <button class="btn btn-secondary btn-lg">了解更多詐騙類型</button>
      </div>
    </div>
  </section>

  <!-- Common Scams Section -->
  <section id="scam-types" class="py-20">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-16 animate fade-up">
        <h2 class="text-3xl font-bold mb-4">常見詐騙類型</h2>
        <p class="text-muted-foreground">
          識別這些常見的詐騙手法，更好地保護自己。
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-background rounded-xl border p-6 hover:shadow-md transition-shadow animate fade-up" style="animation-delay: 100ms;">
          <h3 class="text-xl font-bold mb-3">藉政府機關名義詐騙</h3>
          <p class="text-muted-foreground mb-4">
            自稱是政府機關工作人員，聲稱您有法律問題需要處理，或是罰單沒繳，並要求提供個人資料或轉帳。
          </p>
          <div class="flex items-center text-primary">
            <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span class="font-medium">小安可協助辨識此類詐騙</span>
          </div>
        </div>
        
        <!-- More scam types... -->
      </div>
    </div>
  </section>

  <!-- LINE Integration Guide -->
  <section id="line-integration" class="py-20 bg-primary/10">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-3xl mx-auto mb-16 animate fade-up">
        <h2 class="text-3xl font-bold mb-6">立即加入防詐小安的LINE好友</h2>
        <p class="text-lg text-muted-foreground">
          讓小安成為您的數位安全小幫手，如同可靠的鄰居妹妹一樣幫助您防築詐騙防線。<br />
          完全免費，隨時可用！
        </p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div class="flex-1 bg-background p-8 rounded-2xl shadow-sm h-full flex flex-col animate slide-right" style="animation-delay: 100ms;">
          <h3 class="text-2xl font-bold mb-6">三種簡單方式加入防詐小安</h3>
          
          <div class="space-y-8">
            <!-- Method 1 -->
            <div class="flex items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                1
              </div>
              <div>
                <h4 class="text-xl font-semibold mb-2">掃描QR碼</h4>
                <div class="space-y-3">
                  <p class="text-muted-foreground">使用您的LINE應用程式掃描右側的QR碼。</p>
                  <div class="space-y-1">
                    <p class="font-medium">行動裝置使用者：</p>
                    <ol class="list-decimal pl-5 text-sm text-muted-foreground">
                      <li>開啟LINE應用程式</li>
                      <li>點擊右下角的「主頁」標籤</li>
                      <li>點擊右上角的朋友添加圖標</li>
                      <li>選擇「行動條碼」</li>
                      <li>對準本頁面上的QR碼掃描</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex-shrink-0 w-full max-w-sm mx-auto lg:mx-0 h-full animate slide-left" style="animation-delay: 200ms;">
          <div class="bg-background p-8 rounded-2xl shadow-sm flex flex-col items-center h-full">
            <img 
              src="./images/profile.jpg" 
              alt="防詐小安" 
              class="w-24 h-24 mb-6 rounded-full object-cover border-4 border-primary/20" 
            />
            <h4 class="text-xl font-bold mb-1">防詐小安</h4>
            <p class="text-sm text-muted-foreground mb-6">您的鄰家女孩防詐小助手</p>
            
            <!-- QR Code -->
            <div class="relative w-[240px] h-[240px] flex items-center justify-center bg-white p-6 rounded-xl border shadow-md">
              <img 
                src="./images/profile.jpg" 
                alt="QR碼即將推出" 
                class="w-[180px] h-[180px] object-cover filter blur-md opacity-40" 
              />
              <div class="absolute inset-0 flex items-center justify-center flex-col p-4 text-center">
                <span class="text-lg font-bold text-primary">即將推出</span>
                <span class="text-sm text-muted-foreground mt-2">LINE Bot 正在準備中</span>
              </div>
            </div>
            
            <div class="mt-8 w-full">
              <a href="https://lihi.cc/2PKn3/ann-homepage" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg w-full flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
                試用機器人
              </a>
            </div>
            
            <div class="mt-6 text-center">
              <p class="text-sm text-muted-foreground">
                完全免費 • 隨時可用 • 保護您的資產安全
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Fixed Banner -->
  <div class="fixed bottom-0 left-0 right-0 z-50 py-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg border-t border-primary/30">
    <div class="container mx-auto px-4 text-center">
      <div class="max-w-4xl mx-auto py-2 rounded-lg flex flex-col md:flex-row items-center justify-center gap-4">
        <div class="flex-1 flex items-center gap-2">
          <div class="animate-pulse bg-white rounded-full h-3 w-3"></div>
          <p class="text-white font-medium text-sm text-left">
            <span class="font-bold mr-1">公告：</span>
            LINE Bot 開發中
          </p>
        </div>
        <div class="md:h-8 md:w-px bg-white/20 mx-2 hidden md:block"></div>
        <div class="flex flex-col md:flex-row gap-2 items-center">
          <a 
            href="https://lihi.cc/2PKn3/ann-homepage" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn btn-white btn-sm animate-pulse-slow">前往體驗 GPT 版</a>
          <p class="text-white/90 text-xs whitespace-nowrap">
            緊急資訊：<strong>165</strong> 反詐騙 | <strong>1995</strong> 心理支持
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Space to prevent fixed banner from covering content -->
  <div class="h-28"></div>
  
  <footer class="bg-muted py-8 border-t">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <div class="flex items-center">
            <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">
              安
            </div>
            <span class="text-base font-bold">防詐小安</span>
          </div>
          <p class="text-sm text-muted-foreground mt-2">
            盡可能降低受詐風險，像鄰居妹妹一樣暖心的守護者。
          </p>
        </div>
      </div>
    </div>
  </footer>

  <script src="animations.js"></script>
</body>
</html>`;
