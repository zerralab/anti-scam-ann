import React from "react";
import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEO({
  title = "防詐小安 - 您的鄰家女孩防詐小助手",
  description = "防詐小安就像您身邊的鄰居妹妹，隨時幫您辨識詐騙、提供建議，並給予情感支持。透過 LINE 訊息，讓小安成為您的數位安全小幫手。",
  image = "/public/fe77384c-c5dc-46d4-96b1-951b9bd7b2b3/openart-image_4s_fnjsi_1740812391514_raw.jpg",
  url = window.location.href,
}: SEOProps) {
  return (
    <Helmet>
      {/* 基本 Meta 標籤 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />

      {/* Favicon */}
      <link
        rel="icon"
        href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>安</text></svg>"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* 其他相關 Meta 標籤 */}
      <meta name="theme-color" content="#0ea5e9" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* 關鍵字 */}
      <meta name="keywords" content="防詐騙,詐騙辨識,LINE防詐,詐騙分析,老人防詐,數位安全,防詐小安,網路詐騙,詐騙手法" />
      
      {/* 作者和版權 */}
      <meta name="author" content="防詐小安團隊" />
      <meta name="copyright" content="© 2025 防詐小安. All Rights Reserved." />
    </Helmet>
  );
}
