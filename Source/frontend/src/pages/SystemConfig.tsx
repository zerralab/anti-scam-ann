import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle, Check, ChevronLeft, Edit, RefreshCw, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { AdminNav } from "components/AdminNav";
import brain from "brain";

export default function SystemConfig() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personality");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // AI人格設定
  const [personalityConfig, setPersonalityConfig] = useState<any>(null);
  const [personalitySaving, setPersonalitySaving] = useState(false);
  
  // 詐騙檢測配置
  const [scamConfig, setScamConfig] = useState<any>(null);
  const [scamSystemEnabled, setScamSystemEnabled] = useState(true);
  
  // 特殊回應配置
  const [specialResponseConfig, setSpecialResponseConfig] = useState<any>(null);
  const [specialResponseEnabled, setSpecialResponseEnabled] = useState(true);
  
  // 使用限制配置
  const [usageConfig, setUsageConfig] = useState<any>(null);
  const [usageLimitsEnabled, setUsageLimitsEnabled] = useState(true);
  
  // 濫用防護配置
  const [abuseConfig, setAbuseConfig] = useState<any>(null);
  const [abuseSystemEnabled, setAbuseSystemEnabled] = useState(true);
  
  // 加載配置數據
  useEffect(() => {
    loadAllConfigs();
  }, []);
  
  const loadAllConfigs = async () => {
    setLoading(true);
    try {
      // 加載AI人格設定
      const personalityResponse = await brain.get_personality_config();
      const personalityData = await personalityResponse.json();
      setPersonalityConfig(personalityData);

      // 加載特殊回應配置
      const specialResponseResponse = await brain.get_special_response_config();
      const specialResponseData = await specialResponseResponse.json();
      setSpecialResponseConfig(specialResponseData);
      setSpecialResponseEnabled(specialResponseData.system_enabled);
      
      // 加載使用限制配置
      const usageLimitsResponse = await brain.get_usage_config_endpoint();
      const usageLimitsData = await usageLimitsResponse.json();
      setUsageConfig(usageLimitsData);
      setUsageLimitsEnabled(usageLimitsData.system_enabled);
      
      // 加載濫用防護配置
      const abuseResponse = await brain.get_abuse_config_endpoint();
      const abuseData = await abuseResponse.json();
      setAbuseConfig(abuseData);
      setAbuseSystemEnabled(abuseData.system_enabled);
    } catch (error) {
      console.error("Error loading configs:", error);
      toast.error("載入設定時發生錯誤", {
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 更新特殊回應系統狀態
  const toggleSpecialResponseSystem = async () => {
    try {
      await brain.toggle_system2(!specialResponseEnabled);
      setSpecialResponseEnabled(!specialResponseEnabled);
      toast.success(`特殊回應系統已${!specialResponseEnabled ? '啟用' : '停用'}`);
    } catch (error) {
      console.error("Error toggling special response system:", error);
      toast.error("無法更新特殊回應系統狀態");
    }
  };
  
  // 更新使用限制系統狀態
  const toggleUsageLimitsSystem = async () => {
    try {
      await brain.toggle_usage_limits(!usageLimitsEnabled);
      setUsageLimitsEnabled(!usageLimitsEnabled);
      toast.success(`使用限制系統已${!usageLimitsEnabled ? '啟用' : '停用'}`);
    } catch (error) {
      console.error("Error toggling usage limits system:", error);
      toast.error("無法更新使用限制系統狀態");
    }
  };
  
  // 更新濫用防護系統狀態
  const toggleAbuseSystem = async () => {
    try {
      await brain.toggle_abuse_system(!abuseSystemEnabled);
      setAbuseSystemEnabled(!abuseSystemEnabled);
      toast.success(`濫用防護系統已${!abuseSystemEnabled ? '啟用' : '停用'}`);
    } catch (error) {
      console.error("Error toggling abuse system:", error);
      toast.error("無法更新濫用防護系統狀態");
    }
  };
  
  // 更新特殊回應配置
  const saveSpecialResponseConfig = async () => {
    setSaving(true);
    try {
      const updatedConfig = {
        ...specialResponseConfig,
        system_enabled: specialResponseEnabled
      };
      
      await brain.update_special_response_config(updatedConfig);
      toast.success("特殊回應配置已更新");
    } catch (error) {
      console.error("Error saving special response config:", error);
      toast.error("無法保存特殊回應配置");
    } finally {
      setSaving(false);
    }
  };
  
  // 更新使用限制配置
  const saveUsageConfig = async () => {
    setSaving(true);
    try {
      const updatedConfig = {
        ...usageConfig,
        system_enabled: usageLimitsEnabled
      };
      
      await brain.update_usage_config(updatedConfig);
      toast.success("使用限制配置已更新");
    } catch (error) {
      console.error("Error saving usage config:", error);
      toast.error("無法保存使用限制配置");
    } finally {
      setSaving(false);
    }
  };
  
  // 更新濫用防護配置
  const saveAbuseConfig = async () => {
    setSaving(true);
    try {
      const updatedConfig = {
        ...abuseConfig,
        system_enabled: abuseSystemEnabled
      };
      
      await brain.update_abuse_config(updatedConfig);
      toast.success("濫用防護配置已更新");
    } catch (error) {
      console.error("Error saving abuse config:", error);
      toast.error("無法保存濫用防護配置");
    } finally {
      setSaving(false);
    }
  };
  
  // 更新AI人格設定
  const savePersonalityConfig = async () => {
    setPersonalitySaving(true);
    try {
      if (!personalityConfig) {
        toast.error("沒有可保存的人格設定");
        return;
      }
      
      // 確保數值範圍在0-1之間
      const validatedConfig = {
        ...personalityConfig,
        personality_types: personalityConfig.personality_types.map((type: any) => ({
          ...type,
          weight: Math.min(1, Math.max(0, parseFloat(type.weight)))
        })),
        tones: personalityConfig.tones.map((tone: any) => ({
          ...tone,
          weight: Math.min(1, Math.max(0, parseFloat(tone.weight)))
        })),
        communication_styles: personalityConfig.communication_styles.map((style: any) => ({
          ...style,
          value: Math.min(1, Math.max(0, parseFloat(style.value)))
        }))
      };
      
      await brain.update_personality_config(validatedConfig);
      toast.success("小安人格設定已更新");
    } catch (error) {
      console.error("Error saving personality config:", error);
      toast.error("無法保存人格設定");
    } finally {
      setPersonalitySaving(false);
    }
  };
  
  // 更新特殊回應規則
  const updateSpecialResponseRule = (index: number, updatedRule: any) => {
    if (!specialResponseConfig || !specialResponseConfig.rules) return;
    
    const updatedRules = [...specialResponseConfig.rules];
    updatedRules[index] = updatedRule;
    
    setSpecialResponseConfig({
      ...specialResponseConfig,
      rules: updatedRules
    });
  };
  
  // 測試特殊回應規則
  const testSpecialResponseRule = async (rulePatterns: string[]) => {
    try {
      // 生成測試輸入
      const testPattern = rulePatterns[0].replace(/\\b|\\B|[\\(\\)\\[\\]\\{\\}\\?\\+\\*\\|]/g, '');
      
      // 測試偵測情境功能
      const response = await brain.detect_situation({
        text: testPattern,
        is_group: false,
        language: "zh"
      });
      
      const data = await response.json();
      if (data.situation_detected) {
        toast.success(`規則測試成功！偵測到：${data.situation_type}`);
      } else {
        toast.error("規則測試失敗，未偵測到匹配");
      }
    } catch (error) {
      console.error("Error testing rule:", error);
      toast.error("測試規則時發生錯誤");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 頁面標題與控制按鈕 */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> 返回
        </Button>
        <h1 className="text-2xl font-bold">系統設定管理</h1>
        <Button variant="outline" onClick={loadAllConfigs}>
          <RefreshCw className="mr-2 h-4 w-4" /> 重新載入
        </Button>
      </div>
      
      <AdminNav activePage="config" className="mb-6" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personality">人設與風格</TabsTrigger>
          <TabsTrigger value="linebot">小LINEBot設定</TabsTrigger>
          <TabsTrigger value="special-response">特殊回應設定</TabsTrigger>
          <TabsTrigger value="knowledge">綜合知識庫設定</TabsTrigger>
        </TabsList>
        
        {/* 特殊回應設定頁面 */}
        <TabsContent value="special-response" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>特殊回應系統設定</CardTitle>
                  <CardDescription>
                    管理特殊情境偵測與回應，例如自殺危機、詐騙受害者支援等。
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="special-response-enabled"
                    checked={specialResponseEnabled}
                    onCheckedChange={toggleSpecialResponseSystem}
                    disabled={loading}
                  />
                  <Label htmlFor="special-response-enabled">
                    {specialResponseEnabled ? "已啟用" : "已停用"}
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : specialResponseConfig ? (
                <div className="space-y-6">
                  <Accordion type="single" collapsible className="w-full">
                    {specialResponseConfig.rules.map((rule: any, index: number) => (
                      <AccordionItem key={rule.id} value={rule.id}>
                        <AccordionTrigger>
                          <div className="flex justify-between items-center w-full pr-4">
                            <div className="flex items-center space-x-2">
                              <span>{rule.name}</span>
                              {!rule.enabled && (
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                  已停用
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              緊急程度: {rule.emergency_level === "high" ? "高" : rule.emergency_level === "medium" ? "中" : "低"}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-2">
                            <div className="flex flex-col space-y-2">
                              <Label htmlFor={`rule-${index}-name`}>名稱</Label>
                              <Input
                                id={`rule-${index}-name`}
                                value={rule.name}
                                onChange={(e) => {
                                  const updatedRule = { ...rule, name: e.target.value };
                                  updateSpecialResponseRule(index, updatedRule);
                                }}
                              />
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <Label htmlFor={`rule-${index}-description`}>描述</Label>
                              <Textarea
                                id={`rule-${index}-description`}
                                value={rule.description}
                                onChange={(e) => {
                                  const updatedRule = { ...rule, description: e.target.value };
                                  updateSpecialResponseRule(index, updatedRule);
                                }}
                                rows={2}
                              />
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <div className="flex justify-between items-center">
                                <Label htmlFor={`rule-${index}-patterns`}>匹配模式 (正則表達式)</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testSpecialResponseRule(rule.patterns)}
                                >
                                  測試
                                </Button>
                              </div>
                              <Textarea
                                id={`rule-${index}-patterns`}
                                value={rule.patterns.join("\n")}
                                onChange={(e) => {
                                  const patterns = e.target.value.split("\n").filter(p => p.trim());
                                  const updatedRule = { ...rule, patterns };
                                  updateSpecialResponseRule(index, updatedRule);
                                }}
                                rows={3}
                              />
                              <p className="text-xs text-muted-foreground">每行一個匹配模式，使用正則表達式語法</p>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <Label htmlFor={`rule-${index}-responses-zh`}>中文回應範本</Label>
                              <Textarea
                                id={`rule-${index}-responses-zh`}
                                value={rule.response_templates.zh.join("\n\n")}
                                onChange={(e) => {
                                  const templates = e.target.value.split("\n\n").filter(t => t.trim());
                                  const updatedTemplates = { ...rule.response_templates, zh: templates };
                                  const updatedRule = { ...rule, response_templates: updatedTemplates };
                                  updateSpecialResponseRule(index, updatedRule);
                                }}
                                rows={4}
                              />
                              <p className="text-xs text-muted-foreground">每個回應範本間請用兩個換行分隔</p>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`rule-${index}-enabled`}
                                  checked={rule.enabled}
                                  onCheckedChange={(checked) => {
                                    const updatedRule = { ...rule, enabled: checked };
                                    updateSpecialResponseRule(index, updatedRule);
                                  }}
                                />
                                <Label htmlFor={`rule-${index}-enabled`}>
                                  {rule.enabled ? "啟用" : "停用"}
                                </Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Label htmlFor={`rule-${index}-emergency`}>緊急程度：</Label>
                                <select
                                  id={`rule-${index}-emergency`}
                                  value={rule.emergency_level}
                                  onChange={(e) => {
                                    const updatedRule = { ...rule, emergency_level: e.target.value };
                                    updateSpecialResponseRule(index, updatedRule);
                                  }}
                                  className="p-2 border rounded-md"
                                >
                                  <option value="low">低</option>
                                  <option value="medium">中</option>
                                  <option value="high">高</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  
                  <div className="flex justify-end">
                    <Button onClick={saveSpecialResponseConfig} disabled={saving}>
                      {saving ? "儲存中..." : "儲存變更"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center p-8">
                  <AlertCircle className="h-8 w-8 text-destructive mr-2" />
                  <p>無法載入配置資料</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 關鍵字設定已移至專門的管理頁面 */}
        
        {/* 人設與風格設定頁面 */}
        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>小安的人設與風格設定</CardTitle>
                  <CardDescription>
                    設定小安的人格特質、語氣風格與回應模式。
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="personality-type">小安的人格類型</Label>
                    <div className="space-y-3">
                      {loading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : personalityConfig ? (
                        personalityConfig.personality_types.map((type: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Input
                              placeholder="人格類型名稱"
                              value={type.name}
                              onChange={(e) => {
                                const newTypes = [...personalityConfig.personality_types];
                                newTypes[index].name = e.target.value;
                                setPersonalityConfig({
                                  ...personalityConfig,
                                  personality_types: newTypes
                                });
                              }}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={type.weight}
                              onChange={(e) => {
                                const newTypes = [...personalityConfig.personality_types];
                                newTypes[index].weight = parseFloat(e.target.value);
                                setPersonalityConfig({
                                  ...personalityConfig,
                                  personality_types: newTypes
                                });
                              }}
                              className="w-20"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-4">
                          <p>無法載入人格類型設定</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">小安的基礎人格類型及權重 (0-1)，影響整體互動風格</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone-settings">語氣風格</Label>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : personalityConfig ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {personalityConfig.tones.map((tone: any, index: number) => (
                            <div key={index} className="flex items-center justify-between space-x-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    checked={tone.enabled} 
                                    onCheckedChange={(checked) => {
                                      const newTones = [...personalityConfig.tones];
                                      newTones[index].enabled = checked;
                                      setPersonalityConfig({
                                        ...personalityConfig,
                                        tones: newTones
                                      });
                                    }}
                                  />
                                  <Input 
                                    value={tone.name} 
                                    onChange={(e) => {
                                      const newTones = [...personalityConfig.tones];
                                      newTones[index].name = e.target.value;
                                      setPersonalityConfig({
                                        ...personalityConfig,
                                        tones: newTones
                                      });
                                    }}
                                    className="flex-1" 
                                  />
                                </div>
                              </div>
                              <Input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={tone.weight}
                                onChange={(e) => {
                                  const newTones = [...personalityConfig.tones];
                                  newTones[index].weight = parseFloat(e.target.value);
                                  setPersonalityConfig({
                                    ...personalityConfig,
                                    tones: newTones
                                  });
                                }}
                                className="w-20"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <p>無法載入語氣風格設定</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">權重範圍為0-1，數值越高表示越常使用此語氣</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communication-style">溝通風格偏好</Label>
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : personalityConfig ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personalityConfig.communication_styles.map((style: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between">
                              <Label htmlFor={`style-${index}`}>{style.name}</Label>
                              <span className="text-xs text-muted-foreground">{style.description}</span>
                            </div>
                            <Input 
                              id={`style-${index}`} 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.1" 
                              value={style.value} 
                              onChange={(e) => {
                                const newStyles = [...personalityConfig.communication_styles];
                                newStyles[index].value = parseFloat(e.target.value);
                                setPersonalityConfig({
                                  ...personalityConfig,
                                  communication_styles: newStyles
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <p>無法載入溝通風格設定</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="response-templates">回應模板範例</Label>
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ) : personalityConfig ? (
                      <div className="space-y-4">
                        {personalityConfig.response_templates.map((template: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center">
                              <Label htmlFor={`template-${index}`} className="mr-2">{template.name}：</Label>
                            </div>
                            <Textarea
                              id={`template-${index}`}
                              placeholder={`${template.name}模板`}
                              value={template.content}
                              onChange={(e) => {
                                const newTemplates = [...personalityConfig.response_templates];
                                newTemplates[index].content = e.target.value;
                                setPersonalityConfig({
                                  ...personalityConfig,
                                  response_templates: newTemplates
                                });
                              }}
                              rows={3}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <p>無法載入回應模板設定</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={savePersonalityConfig}
                    disabled={personalitySaving}
                  >
                    {personalitySaving ? "儲存中..." : "儲存人設設定"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* LINE Bot特殊設定頁面 */}
        <TabsContent value="linebot" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>LINE Bot特殊設定</CardTitle>
                  <CardDescription>
                    設定小安在LINE上的特殊行為與回應方式。
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="line-greeting">新好友問候語</Label>
                    <Textarea
                      id="line-greeting"
                      placeholder="輸入新好友問候語"
                      defaultValue="你好！我是小安，你的防詐小助手。如果有任何可疑的訊息或電話，都可以傳給我協助判斷喔！"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="line-group-greeting">新加入群組問候語</Label>
                    <Textarea
                      id="line-group-greeting"
                      placeholder="輸入新加入群組問候語"
                      defaultValue="大家好！我是小安，很高興能加入這個群組。我能幫助大家辨識詐騙，保護每一個人的安全。可以直接傳送可疑訊息給我判斷喔！"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="line-message-limit">訊息長度設定</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="max-message-length">最長訊息字數</Label>
                        <Input
                          id="max-message-length"
                          type="number"
                          defaultValue="2000"
                        />
                        <p className="text-xs text-muted-foreground">LINE回應的最大字元數</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="default-message-length">預設回應字數</Label>
                        <Input
                          id="default-message-length"
                          type="number"
                          defaultValue="500"
                        />
                        <p className="text-xs text-muted-foreground">最理想的訊息長度</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="line-quick-replies">快速回覆選項</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="快速回覆選項名稱"
                          defaultValue="幫我防詐"
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">刪除</Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="快速回覆選項名稱"
                          defaultValue="顯示常見詐騙"
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">刪除</Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="快速回覆選項名稱"
                          defaultValue="防詐小知識"
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">刪除</Button>
                      </div>
                      <Button size="sm" variant="outline" className="mt-2">
                        + 新增快速回覆選項
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    儲存 LINE Bot 設定
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 綜合知識庫設定頁面 */}
        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>綜合知識庫設定</CardTitle>
                  <CardDescription>
                    管理小安的知識庫，包括詐騙類型、防護方法和資料庫。
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scam-categories">詐騙類型發生機率</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="scam-gov">政府機關模仿詐騙</Label>
                          <span className="text-xs text-muted-foreground">常見</span>
                        </div>
                        <Input id="scam-gov" type="range" min="1" max="10" defaultValue="9" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="scam-fishing">網路釣魚詐騙</Label>
                          <span className="text-xs text-muted-foreground">非常常見</span>
                        </div>
                        <Input id="scam-fishing" type="range" min="1" max="10" defaultValue="10" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="scam-romance">假裝親友或愛情詐騙</Label>
                          <span className="text-xs text-muted-foreground">常見</span>
                        </div>
                        <Input id="scam-romance" type="range" min="1" max="10" defaultValue="8" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label htmlFor="scam-investment">投資或工作詐騙</Label>
                          <span className="text-xs text-muted-foreground">越來越常見</span>
                        </div>
                        <Input id="scam-investment" type="range" min="1" max="10" defaultValue="7" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scam-keywords">常見詐騙關鍵詞</Label>
                    <Textarea
                      id="scam-keywords"
                      placeholder="輸入常見詐騙關鍵詞，每行一個"
                      defaultValue="我是警察
法院傳單
收到傳真
身份證過期
已連結到您的帳戶
清空帳戶
高利潤投資
免費給錢
隨機中獎
確認身份資訊
需要額外安全驗證
請動作迅速"
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protection-tips">防護提示範本</Label>
                    <Textarea
                      id="protection-tips"
                      placeholder="輸入防詐提示範本"
                      defaultValue="台灣警察影片或電話不會要求你轉帳。
將所有釣魚網頁連結輸入到網址安全檢查工具，如URL Void。
如果不確定來電是否合法，掛斷並直接據點身分證上的官方電話回撥。
大型買賣交易應用支付寶等第三方付款機制處理。
故意匯款光記錄清機時間、機用、從業人員姓名電話。
政府機關、銀行及電話公司不會要求您在電話中提供個人資料。
收到可疑新聞網址要發送到朋友，先檢查網址和查詢內容是否可靠。
釣魚網址往往和正版網址簡字既跟這類似，常見於變形的網址。"
                      rows={6}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    儲存知識庫設定
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
