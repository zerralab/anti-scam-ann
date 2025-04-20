import React from "react";
import { homepageHTML } from "utils/homepage-html";
import { homepageCSS } from "utils/homepage-css";
import { homepageJS } from "utils/homepage-js";
import { Button } from "./Button";

type FileType = {
  fileName: string;
  content: string;
  mimeType: string;
};

export function HomepageDownload() {
  const files: FileType[] = [
    {
      fileName: "index.html",
      content: homepageHTML,
      mimeType: "text/html"
    },
    {
      fileName: "styles.css",
      content: homepageCSS,
      mimeType: "text/css"
    },
    {
      fileName: "animations.js",
      content: homepageJS,
      mimeType: "text/javascript"
    }
  ];

  const downloadFile = (file: FileType) => {
    const blob = new Blob([file.content], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    files.forEach(file => {
      downloadFile(file);
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <h3 className="text-lg font-medium mb-4">下載首頁檔案</h3>
      <div className="flex flex-col space-y-3">
        {files.map((file) => (
          <div key={file.fileName} className="flex justify-between items-center">
            <span className="text-sm">{file.fileName}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadFile(file)}
            >
              下載
            </Button>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t">
          <Button 
            className="w-full" 
            onClick={downloadAll}
          >
            下載全部檔案
          </Button>
        </div>
      </div>
    </div>
  );
}
