import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { OCRUpload } from "@/components/test/ocr-upload";
import { OCRProcessing } from "@/components/test/ocr-processing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OcrScan() {
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrConfidence, setOcrConfidence] = useState<number>(0);

  const handleOCRComplete = (text: string, confidence: number) => {
    setOcrText(text);
    setOcrConfidence(confidence);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <Sidebar />

      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <Header title="OCR Answer Scanning" />

        <div className="px-4 py-6 md:px-6 lg:px-8 pb-20 md:pb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">OCR Answer Scanning</h1>
            <p className="text-muted-foreground">
              Upload and process handwritten test answers with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OCR Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Answer Sheets</CardTitle>
              </CardHeader>
              <CardContent>
                <OCRUpload onOCRComplete={handleOCRComplete} />
              </CardContent>
            </Card>

            {/* OCR Processing Card */}
            <Card>
              <CardHeader>
                <CardTitle>OCR Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <OCRProcessing initialOCRText={ocrText} />
              </CardContent>
            </Card>
          </div>

          {/* OCR Confidence Indicator */}
          {ocrConfidence > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>OCR Confidence Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall Confidence</span>
                      <span className="font-medium">{ocrConfidence.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          ocrConfidence >= 90 
                            ? "bg-secondary" 
                            : ocrConfidence >= 70 
                            ? "bg-accent" 
                            : "bg-destructive"
                        }`}
                        style={{ width: `${ocrConfidence}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="mb-2 font-medium">Text Recognition Tips:</p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Ensure handwriting is clear and not too small</li>
                      <li>Use good lighting when taking photos of answer sheets</li>
                      <li>Avoid shadows and glare on the paper</li>
                      <li>Keep the camera perpendicular to the page</li>
                      <li>Review AI-recognized text and edit if necessary</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <MobileNav />
      </div>
    </div>
  );
}
