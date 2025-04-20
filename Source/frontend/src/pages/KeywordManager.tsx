import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import brain from "brain";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from "lucide-react";
import { AdminNav } from "components/AdminNav";
import { useNavigate } from "react-router-dom";

interface KeywordCategory {
  name: string;
  keywords: string[];
  responses: string[];
  threshold?: number; // 匹配閾值，範圍0.0-1.0
}

interface KeywordConfig {
  categories: Record<string, KeywordCategory>;
  enabled: boolean;
}

export default function KeywordManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<KeywordConfig | null>(null);
  const [isSystemEnabled, setIsSystemEnabled] = useState(true);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [editCategoryDialog, setEditCategoryDialog] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState("");
  
  // 新類別的表單狀態
  const [newCategoryForm, setNewCategoryForm] = useState({
    id: "",
    name: "",
    keywords: "",
    responses: "",
    threshold: 0.7,
  });
  
  // 編輯類別的表單狀態
  const [editCategoryForm, setEditCategoryForm] = useState({
    id: "",
    name: "",
    keywords: "",
    responses: "",
    threshold: 0.7,
  });

  // 加載關鍵詞配置
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await brain.get_config();
      const data = await response.json();
      console.log("Loaded keyword config:", data);
      setConfig(data);
      setIsSystemEnabled(data.enabled);
    } catch (error) {
      console.error("Error loading keyword config:", error);
      toast.error("無法加載關鍵詞配置");
    } finally {
      setLoading(false);
    }
  };

  // 啟用或禁用關鍵詞系統
  const toggleSystem = async (enabled: boolean) => {
    try {
      // 修正參數傳遞方式，將布爾值包裝在對象中作為查詢參數
      const response = await brain.toggle_system({ enabled });
      const data = await response.json();
      if (data.success) {
        setIsSystemEnabled(enabled);
        toast.success(`關鍵詞系統已${enabled ? "啟用" : "禁用"}`);
        fetchConfig(); // 重新加載配置
      }
    } catch (error) {
      console.error("Error toggling system:", error);
      toast.error("無法切換系統狀態");
    }
  };

  // 保存配置更改
  const saveConfig = async (updatedConfig: KeywordConfig) => {
    try {
      const response = await brain.update_config(updatedConfig);
      const data = await response.json();
      if (data.success) {
        setConfig(updatedConfig);
        toast.success("配置已更新");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("無法保存配置");
    }
  };

  // 添加新類別
  const addCategory = () => {
    // 驗證表單
    if (
      !newCategoryForm.id ||
      !newCategoryForm.name ||
      !newCategoryForm.keywords ||
      !newCategoryForm.responses
    ) {
      toast.error("所有欄位都必須填寫");
      return;
    }

    // 檢查ID是否已存在
    if (config && config.categories[newCategoryForm.id]) {
      toast.error("類別ID已存在");
      return;
    }

    // 創建新類別
    const newConfig = { ...config } as KeywordConfig;
    newConfig.categories[newCategoryForm.id] = {
      name: newCategoryForm.name,
      keywords: newCategoryForm.keywords.split("\n").map((k) => k.trim()).filter(k => k),
      responses: newCategoryForm.responses.split("\n").map((r) => r.trim()).filter(r => r),
      threshold: newCategoryForm.threshold,
    };

    // 保存新配置
    saveConfig(newConfig);
    setNewCategoryDialog(false);
    // 清空表單
    setNewCategoryForm({
      id: "",
      name: "",
      keywords: "",
      responses: "",
      threshold: 0.7,
    });
  };

  // 刪除類別
  const deleteCategory = (categoryId: string) => {
    if (!confirm(`確定要刪除「${config?.categories[categoryId].name}」類別嗎？`)) {
      return;
    }

    const newConfig = { ...config } as KeywordConfig;
    delete newConfig.categories[categoryId];

    // 保存新配置
    saveConfig(newConfig);
  };

  // 打開編輯對話框
  const openEditDialog = (categoryId: string) => {
    if (!config) return;

    const category = config.categories[categoryId];
    setEditCategoryForm({
      id: categoryId,
      name: category.name,
      keywords: category.keywords.join("\n"),
      responses: category.responses.join("\n"),
      threshold: category.threshold || 0.7,
    });
    setCurrentCategoryId(categoryId);
    setEditCategoryDialog(true);
  };

  // 保存編輯
  const saveEdit = () => {
    // 驗證表單
    if (
      !editCategoryForm.name ||
      !editCategoryForm.keywords ||
      !editCategoryForm.responses
    ) {
      toast.error("所有欄位都必須填寫");
      return;
    }

    // 更新類別
    const newConfig = { ...config } as KeywordConfig;
    newConfig.categories[currentCategoryId] = {
      name: editCategoryForm.name,
      keywords: editCategoryForm.keywords.split("\n").map((k) => k.trim()).filter(k => k),
      responses: editCategoryForm.responses.split("\n").map((r) => r.trim()).filter(r => r),
      threshold: editCategoryForm.threshold,
    };

    // 保存新配置
    saveConfig(newConfig);
    setEditCategoryDialog(false);
  };

  // 測試關鍵詞匹配
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<{ matched: boolean; response: string | null }>({ matched: false, response: null });

  const testKeyword = async () => {
    if (!testMessage) {
      toast.error("請輸入測試訊息");
      return;
    }

    try {
      const response = await brain.match_keyword({ message: testMessage });
      const data = await response.json();
      setTestResult(data);
      if (data.matched) {
        toast.success("匹配成功！");
      } else {
        toast.info("未匹配到關鍵詞");
      }
    } catch (error) {
      console.error("Error testing keyword:", error);
      toast.error("測試失敗");
    }
  };

  // 初始加載
  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-center" />
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">關鍵詞回覆管理</h1>
      </div>
      
      <AdminNav activePage="keywords" className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左側：系統控制 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>系統設置</CardTitle>
              <CardDescription>控制關鍵詞系統的啟用狀態</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="system-enabled">啟用關鍵詞系統</Label>
                <Switch
                  id="system-enabled"
                  checked={isSystemEnabled}
                  onCheckedChange={toggleSystem}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                啟用後，小安將自動回覆符合關鍵詞的訊息。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>測試關鍵詞</CardTitle>
              <CardDescription>測試訊息是否匹配關鍵詞</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-message">測試訊息</Label>
                <div className="flex space-x-2">
                  <Input
                    id="test-message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="輸入測試訊息..."
                  />
                  <Button onClick={testKeyword}>測試</Button>
                </div>
              </div>

              {testResult.matched && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">匹配結果：</p>
                  <p className="whitespace-pre-wrap text-sm break-words">{testResult.response}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>新增類別</CardTitle>
              <CardDescription>創建新的關鍵詞類別</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setNewCategoryDialog(true)}>
                添加新類別
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右側：類別列表 */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>關鍵詞類別</CardTitle>
              <CardDescription>
                目前有 {config ? Object.keys(config.categories).length : 0} 個類別
              </CardDescription>
            </CardHeader>
            <CardContent>
              {config && Object.keys(config.categories).length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(config.categories).map(([id, category]) => (
                    <AccordionItem key={id} value={id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center space-x-2 text-left">
                          <span>{category.name}</span>
                          {category.threshold && (
                            <Badge variant="secondary" className="ml-2">
                              匹配閾值: {(category.threshold * 100).toFixed(0)}%
                            </Badge>
                          )}
                          <Badge variant="outline" className="ml-2">
                            {category.keywords.length} 關鍵詞
                          </Badge>
                          <Badge variant="outline">
                            {category.responses.length} 回覆
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-1">關鍵詞列表：</h4>
                              <div className="bg-muted p-2 rounded-md">
                                <ul className="list-disc list-inside">
                                  {category.keywords.map((keyword, index) => (
                                    <li key={index} className="text-sm">
                                      {keyword}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">回覆列表：</h4>
                              <div className="bg-muted p-2 rounded-md">
                                <ul className="list-disc list-inside">
                                  {category.responses.map((response, index) => (
                                    <li key={index} className="text-sm">
                                      {response.length > 50
                                        ? `${response.substring(0, 50)}...`
                                        : response}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(id)}
                            >
                              編輯
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteCategory(id)}
                            >
                              刪除
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  目前沒有關鍵詞類別。點擊「添加新類別」開始創建。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 新增類別對話框 */}
      <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新關鍵詞類別</DialogTitle>
            <DialogDescription>
              創建一個新的關鍵詞類別，包含關鍵詞和對應的回覆。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-id">類別ID</Label>
                <Input
                  id="new-id"
                  value={newCategoryForm.id}
                  onChange={(e) =>
                    setNewCategoryForm({
                      ...newCategoryForm,
                      id: e.target.value,
                    })
                  }
                  placeholder="如: greeting, farewell"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-name">類別名稱</Label>
                <Input
                  id="new-name"
                  value={newCategoryForm.name}
                  onChange={(e) =>
                    setNewCategoryForm({
                      ...newCategoryForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="如: 問候, 告別"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-keywords">
                關鍵詞列表（一行一個）
              </Label>
              <Textarea
                id="new-keywords"
                value={newCategoryForm.keywords}
                onChange={(e) =>
                  setNewCategoryForm({
                    ...newCategoryForm,
                    keywords: e.target.value,
                  })
                }
                placeholder="你好\n哈囉\n嗨"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-threshold">
                匹配閾值 {((newCategoryForm.threshold || 0.7) * 100).toFixed(0)}%
              </Label>
              <div className="pt-2">
                <input
                  type="range"
                  id="new-threshold"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={newCategoryForm.threshold || 0.7}
                  onChange={(e) =>
                    setNewCategoryForm({
                      ...newCategoryForm,
                      threshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                較高的閾值要求更精確的匹配，較低的閾值允許更寬松的匹配
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-responses">
                回覆列表（一行一個，隨機選擇）
              </Label>
              <Textarea
                id="new-responses"
                value={newCategoryForm.responses}
                onChange={(e) =>
                  setNewCategoryForm({
                    ...newCategoryForm,
                    responses: e.target.value,
                  })
                }
                placeholder="嗨嗨～今天過得怎麼樣啊？😊\n安安～有什麼我能幫上忙的嗎？"
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1">
                每行代表一個獨立的回應，會隨機從中選一個使用。
                <br />
                如果需要在同一回應中顯示換行，請在回應中使用 <code className="bg-gray-100 px-1 py-0.5 rounded">\n</code>，例如：「第一行\n第二行」
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewCategoryDialog(false)}
            >
              取消
            </Button>
            <Button onClick={addCategory}>確認添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編輯類別對話框 */}
      <Dialog open={editCategoryDialog} onOpenChange={setEditCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯關鍵詞類別</DialogTitle>
            <DialogDescription>
              修改關鍵詞類別的名稱、關鍵詞和回覆。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">類別名稱</Label>
              <Input
                id="edit-name"
                value={editCategoryForm.name}
                onChange={(e) =>
                  setEditCategoryForm({
                    ...editCategoryForm,
                    name: e.target.value,
                  })
                }
                placeholder="如: 問候, 告別"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-threshold">
                匹配閾值 {((editCategoryForm.threshold || 0.7) * 100).toFixed(0)}%
              </Label>
              <div className="pt-2">
                <input
                  type="range"
                  id="edit-threshold"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={editCategoryForm.threshold || 0.7}
                  onChange={(e) =>
                    setEditCategoryForm({
                      ...editCategoryForm,
                      threshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                較高的閾值要求更精確的匹配，較低的閾值允許更寬松的匹配
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-keywords">
                關鍵詞列表（一行一個）
              </Label>
              <Textarea
                id="edit-keywords"
                value={editCategoryForm.keywords}
                onChange={(e) =>
                  setEditCategoryForm({
                    ...editCategoryForm,
                    keywords: e.target.value,
                  })
                }
                placeholder="你好\n哈囉\n嗨"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-responses">
                回覆列表（一行一個，隨機選擇）
              </Label>
              <Textarea
                id="edit-responses"
                value={editCategoryForm.responses}
                onChange={(e) =>
                  setEditCategoryForm({
                    ...editCategoryForm,
                    responses: e.target.value,
                  })
                }
                placeholder="嗨嗨～今天過得怎麼樣啊？😊\n安安～有什麼我能幫上忙的嗎？"
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1">
                每行代表一個獨立的回應，會隨機從中選一個使用。
                <br />
                如果需要在同一回應中顯示換行，請在回應中使用 <code className="bg-gray-100 px-1 py-0.5 rounded">\n</code>，例如：「第一行\n第二行」
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditCategoryDialog(false)}
            >
              取消
            </Button>
            <Button onClick={saveEdit}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
