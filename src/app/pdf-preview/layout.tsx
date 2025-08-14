import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Preview - Health Progress Report",
  description: "Preview and download your health progress report as PDF",
};

export default function PDFPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}