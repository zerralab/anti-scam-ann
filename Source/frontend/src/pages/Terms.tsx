import React from 'react';
import { Header } from 'components/Header';
import { Footer } from 'components/Footer';
import { Button } from 'components/Button';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              ← 返回首頁
            </Button>
            <h1 className="text-3xl font-bold mb-2">服務條款與隱私權政策</h1>
            <p className="text-muted-foreground">最後更新日期：2025年04月19日</p>
          </div>

          <div className="prose prose-stone max-w-none dark:prose-invert">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">服務條款</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">1. 服務範圍</h3>
              <p>「防詐小安」是一個專為協助使用者辨識和防範可能詐騙的LINE聊天機器人服務。我們的服務包括但不限於：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>辨識可疑訊息、電話或電子郵件是否為詐騙</li>
                <li>提供防詐騙建議和教育資訊</li>
                <li>為詐騙受害者提供應對指導</li>
                <li>提供情感支持服務</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2. 免責聲明</h3>
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800 my-4">
                <p className="font-medium mb-2">重要提示：</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li><strong>我們不會推薦任何金融、投資或其他商業服務。</strong>如有任何自稱為「防詐小安」的推薦或廣告，均為詐騙，請勿理會。</li>
                  <li>我們僅提供辨識和建議，不承擔任何法律責任。最終判斷和行動取決於用戶本人。</li>
                  <li><strong>使用本服務不能替代向警方或相關機構報案的必要性。</strong></li>
                  <li>當您偵測到可能的詐騙行為時，請立即撥打<strong>165反詐騙專線</strong>尋求幫助。</li>
                  <li>如您因遭遇詐騙感到悲傷、焦慮或難以走出心理低潮，請撥打<strong>1995心理諮詢專線</strong>尋求專業協助。</li>
                </ul>
              </div>
              <p>「防詐小安」提供的服務僅作為參考和輔助判斷，不能保證100%準確辨識所有詐騙行為。我們努力提供最佳服務，但用戶應保持自身警覺。</p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3. 緊急聯絡資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="font-bold text-blue-800 dark:text-blue-200 mb-2">警政緊急資源：</p>
                  <ul className="space-y-2">
                    <li><strong>165</strong> - 反詐騙專線</li>
                    <li><strong>110</strong> - 警察局報案專線</li>
                    <li><strong>113</strong> - 婦幼保護專線</li>
                    <li><strong>0800-024-099</strong> - 法律扶助專線</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md border border-green-200 dark:border-green-800">
                  <p className="font-bold text-green-800 dark:text-green-200 mb-2">心理支援資源：</p>
                  <ul className="space-y-2">
                    <li><strong>1995</strong> - 心理諮詢專線</li>
                    <li><strong>1980</strong> - 強化社會安全網弹專線</li>
                    <li><strong>1925</strong> - 保護您專線</li>
                    <li><strong>1957</strong> - 寶貝寶貝專線</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm bg-muted p-3 rounded-md">以上電話專線可能因個別地區或政策變更而有所調整。若緊急情況下無法撥通專線，請將情況告知親友或尋找就近的警察局協助。</p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4. 使用條款</h3>
              <p>使用「防詐小安」服務，即表示您同意：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>不會使用我們的服務從事任何非法或不道德活動</li>
                <li>不會濫用或干擾服務的正常運作</li>
                <li>理解服務的局限性和建議的參考性質</li>
                <li>對自身採取的行動負責</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">5. AI系統使用免責聲明</h3>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800 my-4">
                <p className="font-medium mb-2">關於AI系統的重要說明：</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>「防詐小安」使用大型語言模型(LLM)提供服務，儘管經過專業調教，但仍可能產生無法預期的回應</li>
                  <li>用戶在採取任何行動前，應謹慎評估系統提供的建議或資訊</li>
                  <li>系統分析結果僅供參考，最終決策應由用戶自行判斷</li>
                  <li>如遇系統提供明顯不合理或有害建議，請立即回報給開發團隊</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">6. 安全聲明</h3>
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-800 my-4">
                <p className="font-bold text-red-800 dark:text-red-200 mb-2">重要安全提醒：</p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>「防詐小安」<strong>絕不會</strong>要求用戶進行轉帳、匯款、或提供銀行帳號、密碼等個人敏感資料</li>
                  <li>「防詐小安」<strong>絕不會</strong>要求用戶提供身分證字號、信用卡資訊或其他個人隱私資料</li>
                  <li>若您收到任何以「防詐小安」名義進行的上述請求，表示系統可能已被入侵或遭詐騙集團冒用</li>
                  <li>請立即停止對話並透過正式管道（LINE官方帳號)與開發團隊聯繫報告此情況</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">隱私權政策</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">1. 資料收集與使用</h3>
              <p>我們致力於保護您的隱私。使用「防詐小安」服務時，我們可能會收集：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>您提供的訊息內容（用於分析潛在詐騙）</li>
                <li>基本的使用統計數據（用於改進服務）</li>
                <li>使用模式和互動行為（用於優化使用者體驗）</li>
                <li>裝置類型和操作系統資訊（用於技術兼容性）</li>
              </ul>
              <p>所有收集的資訊僅用於：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>提供和改進「防詐小安」服務</li>
                <li>幫助開發更好的詐騙辨識模型</li>
                <li>匿名化研究與統計分析</li>
                <li>改善AI模型的回應品質和準確度</li>
              </ul>
              
              <p>資料儲存期限：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>用戶對話內容：最長保存30天，用於服務改進和安全審核</li>
                <li>使用統計數據：長期保存但完全匿名化處理</li>
                <li>用戶可隨時要求刪除個人對話記錄</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2. 資料保護</h3>
              <p>我們採取多種安全措施保護您的資訊：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>所有數據經過加密處理和安全儲存</li>
                <li>定期安全審核和漏洞測試</li>
                <li>嚴格的內部訪問控制</li>
                <li>符合台灣《個人資料保護法》的資料處理標準</li>
                <li>資料匿名化處理以保護用戶隱私</li>
              </ul>
              
              <p>保護措施細節：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>傳輸加密：所有與「防詐小安」的對話使用TLS協議加密</li>
                <li>儲存加密：伺服器端資料使用業界標準加密方式保存</li>
                <li>訪問控制：僅授權人員可訪問必要的資料，並有嚴格的監控</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">3. 第三方分享</h3>
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800 my-4">
                <p className="font-medium">
                  我們<strong>不會</strong>將您的個人資訊分享給第三方廣告商或營銷機構。
                </p>
              </div>
              <p>我們可能在以下情況下分享資訊：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>在法律要求下（如配合執法機關調查）</li>
                <li>保護「防詐小安」或用戶的權益和安全</li>
                <li>與技術服務提供商合作以維護服務（合作方需遵守相同的隱私保護標準）</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4. 用戶權利</h3>
              <p>作為「防詐小安」的用戶，您有權：</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>了解我們所收集的關於您的資訊</li>
                <li>要求我們刪除您的資料</li>
                <li>隨時停止使用我們的服務</li>
              </ul>
              <p>如對隱私問題有任何疑問或需求，請通過LINE與「防詐小安」聯繫。</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">條款更新</h2>
              <p>我們可能會不定期更新本服務條款與隱私權政策。重大變更時，我們會通過LINE官方帳號通知用戶。繼續使用「防詐小安」服務即表示您接受最新條款。</p>
            </section>

            <div className="mt-12 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                如對本條款有任何疑問，請通過LINE與「防詐小安」聯繫。感謝您的支持與理解。
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
