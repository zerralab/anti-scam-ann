import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DetectionTest } from "components/DetectionTest";
import { UserStatus } from "components/UserStatus";
import { AdminNav } from "components/AdminNav";
import { Toaster, toast } from "sonner";
import { AlertTriangle, ShieldCheck, Settings2, Shield, AlertCircle } from "lucide-react";
import brain from "brain";

export default function AbuseManager() {
  const [userId, setUserId] = useState("test-user-" + Math.floor(Math.random() * 1000));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [systemData, setSystemData] = useState<any>(null);
  const [abuseConfig, setAbuseConfig] = useState<any>(null);
  
  // 獲取用戶狀態
  const fetchUserStatus = async () => {
    if (!userId.trim()) return;
    
    try {
      const response = await brain.get_user_status(userId);
      const data = await response.json();
      setUserStatus(data);
    } catch (error) {
      console.error("Error fetching user status:", error);
      toast.error("無法獲取用戶狀態", {
        description: "請檢查用戶ID是否有效",
        duration: 3000
      });
    }
  };
  
  // 獲取系統狀態和配置
  const fetchSystemData = async () => {
    setDataLoading(true);
    try {
      const response = await brain.get_abuse_config_endpoint();
      const data = await response.json();
      setSystemData(data);
      setAbuseConfig(data);
    } catch (error) {
      console.error("Error fetching system status:", error);
      toast.error("無法獲取系統狀態", {
        duration: 3000
      });
    } finally {
      setDataLoading(false);
    }
  };
  
  // 初始化加載
  useEffect(() => {
    fetchSystemData();
  }, []);
  
  // 檢測訊息
  const checkMessage = async (message: string) => {
    if (!message.trim() || !userId.trim()) return;
    
    setLoading(true);
    try {
      const response = await brain.check_abuse({
        message,
        user_id: userId,
        channel: "web"
      });
      const data = await response.json();
      setResult(data);
      
      // 更新用戶狀態
      await fetchUserStatus();
      
      // 顯示操作結果
      if (data.is_abusive) {
        toast.warning("檢測到惡意內容", {
          description: data.action === "block" ? "用戶已被暫時封禁" : "已記錄違規行為",
          duration: 4000
        });
      } else {
        toast.success("內容正常", {
          description: "未檢測到惡意行為",
          duration: 2000
        });
      }
    } catch (error) {
      console.error("Error checking message:", error);
      toast.error("檢測失敗", {
        description: "請稍後再試",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 重置用戶記錄
  const resetUser = async () => {
    if (!userId.trim()) return;
    
    if (!confirm(`確定要重置用戶 ${userId} 的違規記錄嗎？此操作無法撤銷。`)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await brain.reset_user_record(userId);
      const data = await response.json();
      
      toast.success("用戶記錄已重置", {
        description: data.message,
        duration: 3000
      });
      
      await fetchUserStatus();
      setResult(null);
    } catch (error) {
      console.error("Error resetting user:", error);
      toast.error("重置失敗", {
        description: "請稍後再試",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 切換系統狀態
  const toggleSystem = async () => {
    if (!systemData) return;
    
    setLoading(true);
    try {
      const response = await brain.toggle_abuse_system(!systemData.enabled);
      const data = await response.json();
      
      toast.info(systemData.enabled ? "系統已禁用" : "系統已啟用", {
        description: data.message,
        duration: 3000
      });
      
      // 重新獲取系統狀態
      await fetchSystemData();
    } catch (error) {
      console.error("Error toggling system:", error);
      toast.error("操作失敗", {
        description: "無法切換系統狀態，請稍後再試",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <Toaster position="top-center" richColors />
      
      {/* 頁面標題與控制按鈕 */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <h1 className="text-xl font-bold">惡意行為監測系統</h1>
          {systemData && (
            <Badge variant={systemData.enabled ? "success" : "destructive"} className="ml-2">
              {systemData.enabled ? "系統已啟用" : "系統已禁用"}
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          {systemData && (
            <Button
              variant={systemData.enabled ? "destructive" : "default"}
              size="sm"
              onClick={toggleSystem}
              disabled={loading || dataLoading}
            >
              {systemData.enabled ? 
                <><AlertTriangle className="w-4 h-4 mr-1" />禁用系統</> : 
                <><ShieldCheck className="w-4 h-4 mr-1" />啟用系統</>}
            </Button>
          )}
        </div>
      </div>
      
      <AdminNav activePage="abuse" className="mb-6" />
      
      {/* 系統狀態儀表板 */}
      {systemData && (
        <Card className={`mb-6 ${systemData.enabled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${systemData.enabled ? "bg-green-100" : "bg-red-100"}`}>
                  <Shield className={`h-6 w-6 ${systemData.enabled ? "text-green-600" : "text-red-600"}`} />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">
                    {systemData.enabled ? "惡意行為監測系統已啟用" : "惡意行為監測系統已禁用"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {systemData.enabled 
                      ? "系統目前正在主動監測並防止惡意行為" 
                      : "系統目前已停止監測，用戶將不會因惡意行為被限制"}
                  </p>
                </div>
              </div>
              
              <div className="text-center hidden md:block">
                <div className="text-sm font-medium text-muted-foreground">違規策略</div>
                <div className="mt-1 font-semibold">
                  {abuseConfig && (
                    <span>{abuseConfig.max_violations} 次違規 = {Math.floor(abuseConfig.block_duration / 60)} 分鐘封禁</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 主要內容區域 - 用戶狀態與檢測測試 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 用戶狀態卡片 */}
        <UserStatus 
          userId={userId}
          onChangeUserId={setUserId}
          onCheckStatus={fetchUserStatus}
          onResetUser={resetUser}
          userStatus={userStatus}
          loading={loading}
        />
        
        {/* 檢測測試卡片 */}
        <DetectionTest 
          onCheck={checkMessage}
          loading={loading}
          result={result}
        />
      </div>
      
      {/* 系統說明卡片 */}
      <Card className="bg-blue-50 shadow-sm">
        <CardHeader className="py-4 border-b">
          <div className="text-lg font-semibold text-blue-700">
            <Settings2 className="inline w-5 h-5 mr-2 text-blue-600" />
            惡意行為監測系統說明
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="p-3 bg-white rounded-md shadow-sm">
              <h3 className="text-sm font-semibold text-blue-600 mb-2">
                系統功能
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>偵測用戶的惡意行為並記錄</li>
                <li>根據違規次數實施不同級別的懲罰</li>
                <li>自動封禁違規用戶一段時間</li>
                <li>提供友善但堅定的警告訊息</li>
              </ul>
            </div>
            
            <div className="p-3 bg-white rounded-md shadow-sm">
              <h3 className="text-sm font-semibold text-blue-600 mb-2">
                惡意行為類型
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>人身攻擊和辱罵</li>
                <li>連續發送重複或無意義內容</li>
                <li>發送垃圾訊息或廣告</li>
                <li>嘗試欺騙系統或獲取非法資訊</li>
              </ul>
            </div>
          </div>
          
          <Alert variant="info" className="rounded-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>管理員提示</AlertTitle>
            <AlertDescription>
              本系統僅處理文本內容的惡意檢測，不會保存或分析用戶的個人數據。系統的目的是維護健康的對話環境，而非限制正常的表達。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
