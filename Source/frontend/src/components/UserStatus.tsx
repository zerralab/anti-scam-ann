import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, User, AlertTriangle, Clock, AlertCircle } from "lucide-react";
import { formatDuration } from "utils/formatTime";

interface UserStatusProps {
  userId: string;
  onChangeUserId: (userId: string) => void;
  onCheckStatus: () => void;
  onResetUser: () => void;
  userStatus: any | null;
  loading: boolean;
  className?: string;
}

export function UserStatus({
  userId,
  onChangeUserId,
  onCheckStatus,
  onResetUser,
  userStatus,
  loading,
  className
}: UserStatusProps) {
  const handleGenerate = () => {
    onChangeUserId(`test-user-${Math.floor(Math.random() * 1000)}`);
  };

  return (
    <Card className={className}>
      <CardHeader className="border-b pb-3">
        <div className="text-lg font-medium flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-500" />
          用戶狀態
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="user_id" className="block text-sm font-medium mb-1">用戶ID</label>
            <Input
              id="user_id"
              placeholder="輸入用戶ID"
              value={userId}
              onChange={(e) => onChangeUserId(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            className="mb-px"
          >
            生成隨機ID
          </Button>
          <Button
            onClick={onCheckStatus}
            disabled={!userId.trim() || loading}
            size="sm"
            className="mb-px"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            查詢狀態
          </Button>
        </div>

        {userStatus ? (
          <Card className={`border ${userStatus.is_blocked ? "border-red-300" : "border-green-300"}`}>
            <CardHeader className={`py-4 ${userStatus.is_blocked ? "bg-red-50" : "bg-green-50"} border-b`}>
              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold">ID: {userId}</div>
                <Badge variant={userStatus.is_blocked ? "destructive" : "success"}>
                  {userStatus.is_blocked ? "已封禁" : "正常"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium">違規次數</div>
                    <div className="text-xl font-semibold">{userStatus.violation_count}</div>
                  </div>

                  {userStatus.is_blocked && (
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">封禁時長</div>
                      <div className="text-xl font-semibold">{userStatus.block_duration_text}</div>
                    </div>
                  )}
                </div>

                {userStatus.is_blocked && (
                  <Alert variant="warning" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <div className="flex items-center ml-2">
                      <Clock className="w-4 h-4 mr-2 text-amber-500" />
                      <span>封禁至: {new Date(userStatus.block_until * 1000).toLocaleString()}</span>
                    </div>
                  </Alert>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onResetUser}
                  disabled={loading}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  重置用戶記錄
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-md">
            <User className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>輸入用戶ID並查詢狀態</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}