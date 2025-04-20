import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Clock, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DetectionTestProps {
  onCheck: (message: string) => void;
  loading: boolean;
  result: any;
  className?: string;
}

export function DetectionTest({ onCheck, loading, result, className }: DetectionTestProps) {
  const [message, setMessage] = React.useState("");

  const handleCheck = () => {
    if (message.trim()) {
      onCheck(message);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="border-b pb-3">
        <div className="text-lg font-medium flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          您想測試的訊息
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="輸入訊息來測試是否包含惡意内容..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] mb-4"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleCheck} 
            disabled={!message.trim() || loading}
          >
            {loading ? "測試中..." : "測試訊息"}
          </Button>
        </div>

        {result && (
          <div className="mt-4">
            <Card className={`border ${result.is_abusive ? "border-red-300" : "border-green-300"}`}>
              <CardHeader className={`py-4 border-b ${result.is_abusive ? "bg-red-50" : "bg-green-50"}`}>
                <div className="flex justify-between items-center">
                  <div className="font-medium flex items-center">
                    {result.is_abusive ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                        測試結果
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        測試結果
                      </>
                    )}
                  </div>
                  <Badge variant={result.is_abusive ? "destructive" : "success"}>
                    {result.is_abusive ? "包含惡意內容" : "正常訊息"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {result.is_abusive ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">採取行動:</span>{" "}
                        <span className="font-medium">
                          {result.action === "warn" ? "警告" : result.action === "block" ? "封禁" : "無"}
                        </span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">違規次數:</span>{" "}
                        <span className="font-medium">{result.violation_count}</span>
                      </div>
                    </div>
                    
                    {result.block_duration > 0 && (
                      <Alert className="mt-3" variant="warning">
                        <AlertCircle className="h-4 w-4" />
                        <div className="flex items-center ml-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>封禁時長: {Math.floor(result.block_duration / 60)} 分鐘</span>
                        </div>
                      </Alert>
                    )}
                    
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium mb-1">回應訊息:</div>
                      <div className="text-sm p-2 bg-white rounded border">{result.message}</div>
                    </div>
                  </div>
                ) : (
                  <Alert className="mt-2">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>檢測通過</AlertTitle>
                    <AlertDescription>
                      訊息已通過檢測，未發現惡意内容
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}