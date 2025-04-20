import { useState } from 'react';

// 定義可以將任何類型存儲到localStorage中的hook
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 獲取初始值函數
  const readValue = (): T => {
    // 防止SSR期間報錯
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // 嘗試從localStorage獲取值
      const item = window.localStorage.getItem(key);
      // 如果沒有值，返回初始值
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 使用useState存儲值
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 返回函數以更新localStorage和狀態
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允許相同的API作為useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // 保存到狀態
      setStoredValue(valueToStore);
      
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}