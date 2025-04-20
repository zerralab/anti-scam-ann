import * as React from "react"
import { toast } from "sonner";

interface TopUser {
  user_id: string;
  total_requests: number;
  total_tokens: number;
  is_cooling: boolean;
}

interface TopUsersTableProps {
  users: TopUser[];
  loading?: boolean;
  className?: string;
  onResetUser?: (userId: string) => void;
}

export function TopUsersTable({ users, loading = false, className, onResetUser }: TopUsersTableProps) {
  // Format user ID to show only the last 4 digits
  const formatUserId = (userId: string) => {
    if (!userId) return "";
    
    // Only display the last 4 characters of the user ID
    if (userId.length > 4) {
      return `...${userId.slice(-4)}`;
    }
    return userId;
  };
  
  // Copy user ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  };
  
  if (loading) {
    return (
      <div className={`rounded-md border ${className || ''}`}>
        <div className="p-4 text-center text-muted-foreground">
          載入中...
        </div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className={`rounded-md border ${className || ''}`}>
        <div className="p-4 text-center text-muted-foreground">
          尚無用戶數據
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-md border ${className || ''}`}>
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="[&>th]:p-2 [&>th]:text-left [&>th]:font-medium">
            <th>排名</th>
            <th>用戶ID</th>
            <th className="text-right">請求次數</th>
            <th className="text-right">Token使用量</th>
            <th className="text-center">狀態</th>
            {onResetUser && <th className="text-right"></th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user, index) => (
            <tr key={user.user_id} className="[&>td]:p-2 hover:bg-muted/30">
              <td className="font-medium">#{index + 1}</td>
              <td 
                className="font-mono text-xs truncate max-w-[200px] cursor-pointer text-blue-500 hover:underline" 
                title="點擊複製完整ID"
                onClick={() => copyToClipboard(user.user_id)}
              >
                {formatUserId(user.user_id)}
                {user.user_id.startsWith("web") && (
                  <span className="ml-1 text-xs text-gray-500">(web)</span>
                )}
              </td>
              <td className="text-right">{user.total_requests.toLocaleString()}</td>
              <td className="text-right">{user.total_tokens.toLocaleString()}</td>
              <td className="text-center">
                <span 
                  className={`inline-flex h-2 w-2 rounded-full ${user.is_cooling ? 'bg-red-500' : 'bg-green-500'}`} 
                  title={user.is_cooling ? '冷卻中' : '正常'}
                />
              </td>
              {onResetUser && (
                <td className="text-right">
                  <button 
                    onClick={() => onResetUser(user.user_id)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors hover:underline"
                    title="重置此用戶的使用記錄"
                  >
                    重置
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}