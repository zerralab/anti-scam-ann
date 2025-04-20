import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "components/SEO";
import { Header } from "components/Header";
import { Footer } from "components/Footer";
import { Button } from "components/Button";
import { FeatureCard } from "components/FeatureCard";
import { QrCode } from "components/QrCode";
import {
  ShieldCheckIcon,
  AlertCircleIcon,
  HeartHandshakeIcon,
  MessageCircleIcon
} from "components/Icons";
import { ScrollAnimation } from "components/ScrollAnimation";

export default function App() {
  const navigate = useNavigate();
  // 添加按鈕動畫效果
  useEffect(() => {
    // 添加動畫樣式到頭部
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes pulse-slow {
        0% {
          box-shadow: 0 0 0 0 rgba(68, 118, 197, 0.4);
          transform: scale(1);
        }
        70% {
          box-shadow: 0 0 0 5px rgba(68, 118, 197, 0);
          transform: scale(1.02);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(68, 118, 197, 0);
          transform: scale(1);
        }
      }
      .animate-pulse-slow {
        animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `;
    document.head.appendChild(styleElement);

    // 清理函數
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SEO />
      <Header />

      {/* Hero Section */}
      <section className="pt-16 pb-16 bg-gradient-to-b from-brand-light to-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                防詐守護者
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ lineHeight: '1.35' }}>
                小安就在您身邊
                <span className="text-primary">防詐小幫手</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                「防詐小安」就像您身邊的鄰居妹妹，隨時幫您辨識詐騙、提供建議，並給予情感支持。透過 LINE 訊息，讓小安成為您的數位安全小幫手。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => document.getElementById('line-integration')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  立即加入好友
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  了解更多
                </Button>
              </div>
            </div>

            <div className="relative w-full max-w-md">
              <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-border overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-3xl z-0"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-6 bg-muted p-4 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
                      安
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-sm">您好！我是防詐小安。有什麼可以幫到您的嗎？</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end gap-3 mb-6">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-sm">最近收到一封奢侈品抽獎的訊息，要我點連結領獎...</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
                      安
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-sm text-destructive font-medium">這是詐騙！</p>
                      <p className="text-sm mt-1">請不要點擊這個連結。它有可能是釣魚連結，目的是竟邂您的個人資料或帳戶存取權。</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 w-24 h-24 bg-secondary/50 rounded-full -bottom-6 -left-6 blur-xl"></div>
              <div className="absolute -z-10 w-32 h-32 bg-accent/50 rounded-full -top-8 -right-8 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">防詐小安的暖心陪伴</h2>
              <p className="text-muted-foreground">
                小安就像一位暖心的鄰居妹妹，為您提供支援，陪您渡過人生的至暗時刻。
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollAnimation animation="fade-up" delay={100}>
              <FeatureCard
                title="即時詐騙辨識"
                description="小安可協助判斷可疑訊息、電話或電子郵件是否為詐騙，提供即時安全建議。"
                icon={<ShieldCheckIcon className="w-5 h-5" />}
                variant="primary"
              />
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={200}>
              <FeatureCard
                title="個人化防詐建議"
                description="根據您的年齡和需求，提供針對性建議，幫助您安全遊歩數位世界。"
                icon={<AlertCircleIcon className="w-5 h-5" />}
                variant="secondary"
              />
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={300}>
              <FeatureCard
                title="情感支持服務"
                description="無論您是擔心有詐騙嫌疑，還是不幸遭遇詐騙，小安都提供情感支持。"
                icon={<HeartHandshakeIcon className="w-5 h-5" />}
                variant="tertiary"
              />
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">如何使用防詐小安</h2>
              <p className="text-muted-foreground">
                簡單三步驟，讓小安成為您的防詐好幫手。
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollAnimation animation="slide-right" delay={100}>
              <div className="bg-background rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-3xl z-0"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-bold mb-2">加入LINE好友</h3>
                  <p className="text-muted-foreground">
                    掃描下方的QR碼，或點擊「加入好友」按鈕，將小安加入您的LINE訊息列表。
                  </p>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-up" delay={200}>
              <div className="bg-background rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-bl-3xl z-0"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xl font-bold mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-bold mb-2">傳送可疑訊息</h3>
                  <p className="text-muted-foreground">
                    收到可疑訊息時，只需轉發給小安，或直接描述您遇到的情況。
                  </p>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-left" delay={300}>
              <div className="bg-background rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-bl-3xl z-0"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl font-bold mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-bold mb-2">獲得即時幫助</h3>
                  <p className="text-muted-foreground">
                    小安會立即分析訊息，並提供防詐建議和情感支持。
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Already Scammed Section */}
      <section id="already-scammed" className="py-20 bg-secondary/10">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">已經被詐騙了怎麼辦？</h2>
              <p className="text-muted-foreground">
                若不幸遭遇詐騙，小安將提供清楚的指引，協助您采取適當的行動。
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollAnimation animation="slide-right" delay={100}>
              <div className="bg-background rounded-2xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold mb-6 text-primary">立即采取行動</h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                      1
                    </div>
                    <div>
                      <p className="font-medium">留存證據</p>
                      <p className="text-muted-foreground">保存所有相關對話、交易紀錄和診據</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                      2
                    </div>
                    <div>
                      <p className="font-medium">聯絡金融機構</p>
                      <p className="text-muted-foreground">如果涉及信用卡或銀行賬戶，立即與金融機構聯絡凍結交易</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
                      3
                    </div>
                    <div>
                      <p className="font-medium">報警</p>
                      <p className="text-muted-foreground">向警方報案，操作165及防詐專線</p>
                    </div>
                  </li>
                </ul>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-left" delay={200}>
              <div className="bg-background rounded-2xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold mb-6 text-accent">小安能提供的幫助</h3>
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-4">
                      <HeartHandshakeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">情感支持</p>
                      <p className="text-muted-foreground">被詐騙後可能會感到憤怒、焦慮或羞愧和羞恑，小安提供情感上的支持。</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-4">
                      <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">快速行動指導</p>
                      <p className="text-muted-foreground">根據詐騙類型提供具體步驟，指導您采取正確行動。</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-4">
                      <AlertCircleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">詐騙預防建議</p>
                      <p className="text-muted-foreground">提供未來防詐的建議，降低再次受害風險。</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>

          <ScrollAnimation animation="fade-up" delay={300}>
            <div className="mt-12 text-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => document.getElementById('scam-types')?.scrollIntoView({ behavior: 'smooth' })}
              >
                了解更多詐騙類型
              </Button>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Common Scams Section */}
      <section id="scam-types" className="py-20">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">常見詐騙類型</h2>
              <p className="text-muted-foreground">
                識別這些常見的詐騙手法，更好地保護自己。
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollAnimation animation="fade-up" delay={100}>
              <div className="bg-background rounded-xl border p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-3">藉政府機關名義詐騙</h3>
                <p className="text-muted-foreground mb-4">
                  自稱是政府機關工作人員，聲稱您有法律問題需要處理，或是罰單沒繳，並要求提供個人資料或轉帳。
                </p>
                <div className="flex items-center text-primary">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">小安可協助辨識此類詐騙</span>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-up" delay={200}>
              <div className="bg-background rounded-xl border p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-3">網路釣魚詐騙</h3>
                <p className="text-muted-foreground mb-4">
                  收到看似合法的電子郵件或訊息，點擊後導向假網站，並要求您輸入個人資料或帳號密碼。
                </p>
                <div className="flex items-center text-primary">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">小安可協助判斷可疑連結</span>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-up" delay={300}>
              <div className="bg-background rounded-xl border p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-3">假裝親友或想談戀愛</h3>
                <p className="text-muted-foreground mb-4">
                  盜用親友身份，或從陌生人開始慢慢培養感情，最後提到患重病，希望獲得金錢支持，説一定會還你。
                </p>
                <div className="flex items-center text-primary">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">小安可協助確認真實性</span>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-up" delay={400}>
              <div className="bg-background rounded-xl border p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-3">投資或工作詐騙</h3>
                <p className="text-muted-foreground mb-4">
                  先吸引你下載合法 App 並讓你賺到錢，再引導你另外下載 App 可以獲得更多分潤。或是介紹海外高薪工作。
                </p>
                <div className="flex items-center text-primary">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">小安可協助辨識可疑投資或工作</span>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* LINE Integration Guide */}
      <section id="line-integration" className="py-20 bg-primary/10">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-6">立即加入防詐小安的LINE好友</h2>
              <p className="text-lg text-muted-foreground">
                讓小安成為您的數位安全小幫手，如同可靠的鄰居妹妹一樣幫助您防築詐騙防線。<br />
                完全免費，隨時可用！
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ScrollAnimation animation="slide-right" delay={100}>
              <div className="flex-1 bg-background p-8 rounded-2xl shadow-sm h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-6">三種簡單方式加入防詐小安</h3>

                <div className="space-y-8">
                  {/* Method 1 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                      1
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">掃描QR碼</h4>
                      <div className="space-y-3">
                        <p className="text-muted-foreground">使用您的LINE應用程式掃描右側的QR碼。</p>
                        <div className="space-y-1">
                          <p className="font-medium">行動裝置使用者：</p>
                          <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                            <li>開啟LINE應用程式</li>
                            <li>選擇以「行動條碼」加入好友</li>
                            <li>對準本頁面上的QR碼掃描</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Method 2 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                      2
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">LINE ID搜尋</h4>
                      <div className="space-y-2">
                        <p className="text-muted-foreground">您可以直接搜尋防詐小安的LINE ID。</p>
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex items-center justify-center flex-col">
                            <span className="font-medium mb-1">即將推出</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Method 3 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                      3
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">點擊連結</h4>
                      <div className="space-y-3">
                        <p className="text-muted-foreground">在正式推出後，您可以點擊按鈕跳轉到LINE應用程式加入好友。</p>
                        <div>
                          <Button
                            size="lg"
                            variant="outline"
                            disabled
                          >
                            <MessageCircleIcon className="w-5 h-5 mr-2" />
                            加入LINE好友
                            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">即將推出</span>
                          </Button>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg border border-muted">
                          <p className="text-sm text-muted-foreground">
                            請先使用下方「體驗版」跟小安聊聊
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slide-left" delay={200}>
              <div className="flex-shrink-0 w-full max-w-sm mx-auto lg:mx-0 h-full">
                <div className="bg-background p-8 rounded-2xl shadow-sm flex flex-col items-center h-full">
                  <img
                    src="/public/fe77384c-c5dc-46d4-96b1-951b9bd7b2b3/openart-image_4s_fnjsi_1740812391514_raw.jpg"
                    alt="防詐小安"
                    className="w-24 h-24 mb-6 rounded-full object-cover border-4 border-primary/20"
                  />
                  <h4 className="text-xl font-bold mb-1">防詐小安</h4>
                  <p className="text-sm text-muted-foreground mb-6">您的鄰家女孩防詐小助手</p>

                  {/* 模糊的QR碼 */}
                  <div className="relative w-[240px] h-[240px] flex items-center justify-center bg-white p-6 rounded-xl border shadow-md">
                    <img
                      src="/public/fe77384c-c5dc-46d4-96b1-951b9bd7b2b3/openart-image_4s_fnjsi_1740812391514_raw.jpg"
                      alt="QR碼即將推出"
                      className="w-[180px] h-[180px] object-cover filter blur-md opacity-40"
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col p-4 text-center">
                      <span className="text-lg font-bold text-primary">即將推出</span>
                      <span className="text-sm text-muted-foreground mt-2">LINE Bot 正在準備中</span>
                    </div>
                  </div>

                  <div className="mt-8 w-full">
                    <a
                      href="https://lihi.cc/2PKn3/ann-homepage"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center font-medium transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-12 px-6 text-base bg-primary text-white hover:bg-primary/90 w-full"
                    >
                      <MessageCircleIcon className="w-5 h-5 mr-2" />
                      先試用 GPTs
                    </a>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      完全免費 • 隨時可用 • 保護您的資產安全
                    </p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* 修改為固定在螢幕底部的公告橫幅 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 py-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg border-t border-primary/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto py-2 rounded-lg flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="animate-pulse bg-white rounded-full h-3 w-3"></div>
              <p className="text-white font-medium text-sm text-left">
                <span className="font-bold mr-1">公告：</span>
                LINE Bot 開發中
              </p>
            </div>
            <div className="md:h-8 md:w-px bg-white/20 mx-2 hidden md:block"></div>
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <a
                href="https://lihi.cc/2PKn3/ann-homepage"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-medium transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-9 px-4 text-sm bg-white hover:bg-white/90 font-medium border-none shadow-md animate-pulse-slow"
                style={{ color: '#4476C5', fontWeight: 'bold' }}
              >
                <MessageCircleIcon className="w-4 h-4 mr-1" />
                前往體驗 GPT 版
              </a>
              <p className="text-white/90 text-xs whitespace-nowrap">
                緊急資訊：<strong>165</strong> 反詐騙 | <strong>1995</strong> 心理支持
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* 添加底部留白空間，防止公告橫幅覆蓋 footer 內容 */}
      <div className="h-28"></div>
    </div>
  );
}
