import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCodeIcon } from 'components/Icons';

interface Props {
  url: string;
  size?: number;
  className?: string;
  logo?: boolean;
  title?: string;
}

export function QrCode({ 
  url, 
  size = 200, 
  className = '',
  logo = true,
  title = '掃描加入LINE好友'
}: Props) {
  const qrSize = size * 0.8; // QR code size slightly smaller than container
  
  return (
    <div 
      className={`flex flex-col items-center justify-center bg-white p-6 rounded-xl border shadow-md ${className}`}
      style={{ width: size, height: 'auto', minHeight: size }}
    >
      <div className="relative flex items-center justify-center">
        {url ? (
          <QRCodeSVG 
            value={url}
            size={qrSize}
            bgColor={"#FFFFFF"}
            fgColor={"#000000"}
            level={"M"}
            includeMargin={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <QrCodeIcon className="w-12 h-12 text-primary/40" />
            <p className="text-muted-foreground text-sm">QR碼生成中...</p>
          </div>
        )}
      </div>
      {title && (
        <div className="mt-4 flex flex-col items-center">
          <span className="text-sm text-center text-muted-foreground">
            {title}
          </span>
          <span className="text-xs mt-1 text-center text-muted-foreground/80">
            或點擊下方按鈕加入
          </span>
        </div>
      )}
    </div>
  );
}
