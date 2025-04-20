import { useState, useEffect } from "react";
import { AdminNav } from "components/AdminNav";
import { Card, CardHeader, CardBody } from "components/Card";
import { Input } from "components/Input";
import { Button } from "components/Button";
import { Badge } from "components/Badge";
import { Switch } from "components/Switch";
import { Separator } from "components/Separator";
import { Alert, AlertIcon } from "components/Alert";
import { TopUsersTable } from "components/TopUsersTable";
import { ParameterDisplay } from "components/ParameterDisplay";
import { StatsCard } from "components/StatsCard";
import { formatDuration } from "utils/formatTime";
import { InfoIcon, CheckIcon, AlertTriangle, RefreshCw, BarChart4, Clock, Users, Activity } from "lucide-react";
import { Toaster, toast } from "sonner";
import brain from "brain";

export default function UsageManager() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  // 載入全局用量統計和配置
  const loadGlobalData = async () => {
    setDataLoading(true);
    try {
      const statsResp = await brain.get_usage_stats();
      const configResp = await brain.get_usage_config_endpoint();
      
      const statsData = await statsResp.json();
      const configData = await configResp.json();
      
      setGlobalStats(statsData);
      setConfig(configData);
      
      // 載入 Top 10 用戶
      await loadTopUsers();
    } catch (error) {
      console.error("Error loading global data:", error);
    } finally {
      setDataLoading(false);
    }
  };
  
  // 載入 Top 10 用戶
  const loadTopUsers = async () => {
    try {
      const response = await brain.get_top_users();
      const data = await response.json();
      setTopUsers(data.top_users || []);
    } catch (error) {
      console.error("Error loading top users:", error);
    }
  };
  
  // 重置使用者統計
  const resetUser = async (userId: string) => {
    if (!userId) return;
    
    if (!confirm(`確定要重置用戶 ${userId} 的使用記錄嗎？此操作無法撤銷。`)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await brain.reset_user_stats(userId);
      const data = await response.json();
      toast.success("用戶已重置", {
        description: data.message,
        duration: 3000,
      });
      loadTopUsers();
      // 重新載入全域數據以更新總用戶數等信息
      loadGlobalData();
    } catch (error) {
      console.error("Error resetting user stats:", error);
      toast.error("重置失敗", {
        description: "無法重置用戶數據，請稍後再試",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 切換系統開關
  const toggleSystem = async () => {
    setLoading(true);
    try {
      const response = await brain.toggle_usage_limits(!config.enabled);
      const data = await response.json();
      toast.info(config.enabled ? "系統已禁用" : "系統已啟用", {
        description: data.message,
        duration: 3000,
      });
      loadGlobalData();
    } catch (error) {
      console.error("Error toggling system:", error);
      toast.error("操作失敗", {
        description: "無法切換系統狀態，請稍後再試",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 更新配置
  const updateConfig = async () => {
    setLoading(true);
    try {
      const response = await brain.update_usage_config(config);
      const data = await response.json();
      toast.success("設定已更新", {
        description: data.message,
        duration: 3000,
      });
      setEditMode(false);
      loadGlobalData();
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("更新失敗", {
        description: "無法更新配置，請稍後再試",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadGlobalData();
    
    // 每60秒自動重新載入數據
    const interval = setInterval(() => {
      loadGlobalData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 準備系統參數顯示項目
  const getSingleUserParams = () => {
    if (!config) return [];
    return [
      {
        label: "請求數上限",
        value: `${config.session_limit} 次 / ${formatDuration(config.session_window)}`,
        description: "單一用戶在指定時間窗口內可發送的最大請求數"
      },
      {
        label: "Token上限",
        value: `${config.session_token_limit.toLocaleString()} tokens`,
        description: "單一用戶在時間窗口內可使用的最大Token數量"
      },
      {
        label: "冷卻時間",
        value: formatDuration(config.session_cooldown),
        description: "達到限制後，用戶需等待的時間才能繼續使用服務"
      }
    ];
  };
  
  const getGlobalParams = () => {
    if (!config) return [];
    return [
      {
        label: "每小時限制",
        value: `${config.global_hourly_limit.toLocaleString()} 次`,
        description: "系統每小時可處理的最大請求數"
      },
      {
        label: "每日限制",
        value: `${config.global_daily_limit.toLocaleString()} 次`,
        description: "系統每天可處理的最大請求數"
      }
    ];
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <Toaster position="top-center" richColors />
      
      {/* 頁面標題與控制按鈕 */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <h1 className="text-xl font-bold">API使用管理</h1>
          <Badge variant={config?.enabled ? "success" : "warning"} className="ml-2">
            {config?.enabled ? "系統已啟用" : "系統已禁用"}
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={config?.enabled ? "destructive" : "default"}
            size="sm"
            onClick={toggleSystem}
            disabled={loading || dataLoading}
          >
            {config?.enabled ? 
              <><AlertTriangle className="w-4 h-4 mr-1" />禁用系統</> : 
              <><CheckIcon className="w-4 h-4 mr-1" />啟用系統</>}
          </Button>
          
          {!editMode ? (
            <Button
              size="sm"
              onClick={() => setEditMode(true)}
              disabled={dataLoading}
            >
              編輯配置
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditMode(false)}
            >
              取消編輯
            </Button>
          )}
        </div>
      </div>
      
      <AdminNav activePage="usage" className="mb-6" />
      
      {/* 使用統計儀表板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {globalStats ? (
          <>
            <StatsCard
              title="本月請求"
              value={globalStats.global.monthly?.count.toLocaleString() || "0"}
              subvalue={`${globalStats.global.monthly?.tokens.toLocaleString() || "0"} tokens`}
              status="default"
              icon={<BarChart4 className="h-5 w-5" />}
            />
            
            <StatsCard
              title="累計請求"
              value={globalStats.global.all_time.count.toLocaleString()}
              subvalue={`${globalStats.global.all_time.tokens.toLocaleString()} tokens`}
              status="default"
              icon={<Activity className="h-5 w-5" />}
            />
            
            <StatsCard
              title="活躍用戶"
              value={globalStats.users.active.toLocaleString()}
              subvalue={`不重複用戶數量`}
              status="success"
              icon={<Users className="h-5 w-5" />}
            />
            
            <StatsCard
              title="當前狀態"
              value={config?.enabled ? "系統運行中" : "系統已停用"}
              subvalue={`總用戶: ${globalStats.users.total.toLocaleString()}`}
              status={config?.enabled ? "success" : "warning"}
              icon={<Clock className="h-5 w-5" />}
            />
          </>
        ) : (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-[105px] rounded-lg"></div>
          ))
        )}
      </div>
      
      {/* 系統配置與Top10用戶 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 系統配置區塊 */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center">
              <h2 className="text-lg font-medium">
                <InfoIcon className="inline w-5 h-5 mr-2 text-blue-500" />
                系統配置
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            {!editMode && config ? (
              <div className="space-y-4">
                <ParameterDisplay 
                  title="單一用戶限制" 
                  items={getSingleUserParams()} 
                />
                
                <ParameterDisplay 
                  title="全局系統限制" 
                  items={getGlobalParams()} 
                />
              </div>
            ) : editMode && config ? (
              <div className="space-y-4">
                <Alert variant="info" className="mb-6">
                  <AlertIcon variant="info" />
                  <div>
                    調整參數時請謹慎，過低的限制可能影響用戶體驗。
                    <ul className="mt-1 pl-6 list-disc space-y-1 text-sm">
                      <li>邊界建議：每天平均每個用戶約10-20次請求</li>
                      <li>Token限制可設為單次最大token數的10-20倍</li>
                    </ul>
                  </div>
                </Alert>
                
                <div>
                  <h3 className="text-sm font-semibold mb-3">單一用戶限制</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium" htmlFor="session_limit">請求次數上限</label>
                      <Input 
                        id="session_limit"
                        type="number" 
                        min={1} 
                        max={1000} 
                        value={config.session_limit}
                        onChange={(e) => setConfig({...config, session_limit: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium" htmlFor="session_token_limit">Token 使用上限</label>
                      <Input 
                        id="session_token_limit"
                        type="number" 
                        min={1000} 
                        max={100000} 
                        step={1000} 
                        value={config.session_token_limit}
                        onChange={(e) => setConfig({...config, session_token_limit: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium" htmlFor="session_window">時間窗口 (秒)</label>
                      <div className="relative" title="在這個時間窗口內計算用戶請求次數">
                        <Input 
                          id="session_window"
                          type="number" 
                          min={60} 
                          max={86400} 
                          step={300} 
                          value={config.session_window}
                          onChange={(e) => setConfig({...config, session_window: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium" htmlFor="session_cooldown">冷卻時間 (秒)</label>
                      <div className="relative" title="達到限制後的冷卻期，期間用戶無法使用服務">
                        <Input 
                          id="session_cooldown"
                          type="number" 
                          min={60} 
                          max={86400} 
                          step={60} 
                          value={config.session_cooldown}
                          onChange={(e) => setConfig({...config, session_cooldown: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-semibold mb-3">全局系統限制</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium" htmlFor="global_hourly_limit">每小時請求限制</label>
                      <Input 
                        id="global_hourly_limit"
                        type="number" 
                        min={10} 
                        max={10000} 
                        value={config.global_hourly_limit}
                        onChange={(e) => setConfig({...config, global_hourly_limit: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium" htmlFor="global_daily_limit">每日請求限制</label>
                      <Input 
                        id="global_daily_limit"
                        type="number" 
                        min={100} 
                        max={100000} 
                        value={config.global_daily_limit}
                        onChange={(e) => setConfig({...config, global_daily_limit: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={updateConfig} 
                    disabled={loading}
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    保存配置
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <span className="text-gray-500">載入配置中...</span>
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Top 10 用戶 */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">
                <BarChart4 className="inline w-5 h-5 mr-2 text-green-500" />
                使用量排行榜 (Top 10)
              </h2>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadTopUsers}
                disabled={dataLoading}
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <TopUsersTable 
              users={topUsers} 
              loading={dataLoading}
              onResetUser={resetUser}
            />
          </CardBody>
        </Card>
      </div>
      
      {/* 說明信息卡片 */}
      <Card className="bg-blue-50 shadow-sm">
        <CardHeader className="py-3">
          <h2 className="text-lg font-semibold text-blue-700">使用限制系統說明</h2>
        </CardHeader>
        <CardBody className="pt-0">
          <p className="mb-3 font-medium">本系統設計為兩層保護機制，用於合理分配資源並防止濫用:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <ParameterDisplay 
              title="單一用戶限制"
              className="bg-slate-50" 
              items={[
                {
                  label: "監控目標",
                  value: "個別用戶",
                  description: "針對每個用戶ID單獨計算使用頻率"
                },
                {
                  label: "限制方式",
                  value: `${config?.session_limit || 20}次/${formatDuration(config?.session_window || 3600)}`,
                  description: "在指定時間窗口內限制請求次數"
                },
                {
                  label: "限制效果",
                  value: `暫時冷卻${formatDuration(config?.session_cooldown || 600)}`,
                  description: "超過限制後，該用戶需等待冷卻時間才能繼續使用"
                }
              ]} 
            />
            
            <ParameterDisplay 
              title="全局系統限制"
              className="bg-slate-50" 
              items={[
                {
                  label: "監控目標",
                  value: "整個系統",
                  description: "針對所有用戶的總體請求量進行監控"
                },
                {
                  label: "限制方式",
                  value: `${config?.global_hourly_limit || 1000}次/小時, ${config?.global_daily_limit || 10000}次/天`,
                  description: "對系統總體請求量設置上限"
                },
                {
                  label: "限制效果",
                  value: "全局暫停服務",
                  description: "達到限制時，所有新請求均被拒絕，直到計數重置"
                }
              ]} 
            />
          </div>
          
          <Alert variant="info" className="rounded-md">
            <AlertIcon variant="info" />
            <div>
              <p className="font-medium">友善提示</p>
              <p>使用限制不是為了阻止用戶使用服務，而是為了確保系統資源的公平分配和長期可持續運行。活躍用戶指的是在過去24小時內有發送請求的不重複用戶數量。</p>
            </div>
          </Alert>
        </CardBody>
      </Card>
    </div>
  );
}