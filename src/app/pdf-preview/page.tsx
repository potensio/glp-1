"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HealthCharts } from "@/components/dashboard/health-charts";
import { ProgressOverview } from "@/components/progress/progress-overview";
import {
  DateFilterProvider,
  useDateFilter,
} from "@/contexts/date-filter-context";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

function PreviewPageContent() {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { getDateRangeForAPI } = useDateFilter();

  const dateRange = getDateRangeForAPI();

  const generatePDF = async () => {
    if (!contentRef.current) return;

    setIsGenerating(true);

    try {
      // Wait a bit for any animations to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(contentRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 816, // Legal width in pixels at 96 DPI (8.5 inches)
        height: 1344, // Legal height in pixels at 96 DPI (14 inches)
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "legal",
      });

      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate scaling to fit width
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image
      const x = (pdfWidth - scaledWidth) / 2;
      const y = 10; // Small top margin

      // If content is too tall, split into multiple pages
      if (scaledHeight > pdfHeight - 20) {
        const pageHeight = pdfHeight - 20;
        const totalPages = Math.ceil(scaledHeight / pageHeight);

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();

          const sourceY = (i * pageHeight) / ratio;
          const sourceHeight = Math.min(
            pageHeight / ratio,
            imgHeight - sourceY
          );

          // Create a temporary canvas for this page
          const pageCanvas = document.createElement("canvas");
          const pageCtx = pageCanvas.getContext("2d");
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;

          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0,
              sourceY,
              imgWidth,
              sourceHeight,
              0,
              0,
              imgWidth,
              sourceHeight
            );

            const pageImgData = pageCanvas.toDataURL("image/png");
            pdf.addImage(
              pageImgData,
              "PNG",
              x,
              y,
              scaledWidth,
              sourceHeight * ratio
            );
          }
        }
      } else {
        pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);
      }

      // Generate filename with date
      const today = new Date().toISOString().split("T")[0];
      const filename = `health-report-${today}.pdf`;

      // Download the PDF
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-500">
      {/* PDF Viewer Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-gray-700 flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <span className="text-sm text-gray-300">Health Progress Report</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* PDF Viewer Content */}
      <div className="flex justify-center p-8 min-h-[calc(100vh-60px)]">
        {/* PDF Page Container */}
        <div
          className="bg-white shadow-2xl"
          style={{ width: "216mm", minHeight: "356mm" }}
        >
          <div
            ref={contentRef}
            className="p-4 space-y-8"
            style={{ width: "216mm", minHeight: "356mm" }}
          >
            {/* Report Header */}
            <div className="text-center border-b border-gray-300 pb-6">
              <h1 className="text-lg font-bold text-gray-900 mb-2">
                Health Progress Report
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Report Period:{" "}
                {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
                {new Date(dateRange.endDate).toLocaleDateString()}
              </p>
            </div>

            {/* Progress Overview */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Overview
              </h2>
              <ProgressOverview />
            </div>

            {/* Health Charts */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detailed Charts
              </h2>
              <HealthCharts />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Parse URL parameters for initial date range
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const initialDateRange = startDate && endDate
    ? {
        from: new Date(startDate),
        to: new Date(endDate),
      }
    : undefined;

  return (
    <DateFilterProvider initialDateRange={initialDateRange}>
      <PreviewPageContent />
    </DateFilterProvider>
  );
}
