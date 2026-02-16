import { jsPDF } from "jspdf";
import {
  ASSESSMENT_CATEGORIES,
  AssessmentQuestion,
  type AssessmentCategory,
} from "@/hooks/useAssessmentQuestions";

interface QuestionsByCategory {
  category: AssessmentCategory;
  questions: AssessmentQuestion[];
}

const COLORS = {
  primary: [22, 119, 84] as [number, number, number], // #167754
  secondary: [40, 40, 40] as [number, number, number], // #282828
  lightGray: [232, 232, 232] as [number, number, number], // #E8E8E8
  white: [255, 255, 255] as [number, number, number],
  darkGray: [100, 100, 100] as [number, number, number],
};

const PAGE_CONFIG = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
  margin: 20,
  contentWidth: 170, // 210 - 20 - 20
};

/**
 * Generate a professional PDF document with assessment questions
 */
export function generateAssessmentQuestionsPDF(
  questionsByCategory: QuestionsByCategory[],
  companyName?: string,
): void {
  const doc = new jsPDF("p", "mm", "a4");

  let yPosition = PAGE_CONFIG.margin;

  // Helper function to add a new page if needed
  const checkAndAddPage = (spaceNeeded: number): void => {
    if (yPosition + spaceNeeded > PAGE_CONFIG.height - PAGE_CONFIG.margin) {
      doc.addPage();
      yPosition = PAGE_CONFIG.margin;
    }
  };

  // Helper function to draw the header
  const drawHeader = (): void => {
    // Header background
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, PAGE_CONFIG.width, 50, "F");

    // Company logo placeholder / Title
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Capalyze", PAGE_CONFIG.margin, 25);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Investment Readiness Assessment", PAGE_CONFIG.margin, 38);

    // Date on the right
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(10);
    doc.text(date, PAGE_CONFIG.width - PAGE_CONFIG.margin, 25, {
      align: "right",
    });

    if (companyName) {
      doc.setFontSize(12);
      doc.text(companyName, PAGE_CONFIG.width - PAGE_CONFIG.margin, 38, {
        align: "right",
      });
    }

    yPosition = 65;
  };

  // Helper function to draw section header
  const drawSectionHeader = (title: string): void => {
    checkAndAddPage(25);

    // Section header background
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(PAGE_CONFIG.margin, yPosition, PAGE_CONFIG.contentWidth, 12, 2, 2, "F");

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, PAGE_CONFIG.margin + 5, yPosition + 8);

    yPosition += 18;
  };

  // Helper function to draw a question
  const drawQuestion = (question: AssessmentQuestion, index: number): void => {
    const questionText = `${index + 1}. ${question.title}`;
    const requiredBadge = question.required ? " (Required)" : "";

    // Calculate text height
    doc.setFontSize(11);
    const textLines = doc.splitTextToSize(questionText, PAGE_CONFIG.contentWidth - 10);
    const textHeight = textLines.length * 5 + 15;

    checkAndAddPage(textHeight + 10);

    // Question number and text
    doc.setTextColor(...COLORS.secondary);
    doc.setFont("helvetica", "bold");
    doc.text(textLines, PAGE_CONFIG.margin + 5, yPosition);

    // Required badge
    if (question.required) {
      const textWidth = doc.getTextWidth(textLines[0]);
      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text(requiredBadge, PAGE_CONFIG.margin + 5 + textWidth + 2, yPosition);
    }

    yPosition += textLines.length * 5;

    // Description if available
    if (question.description) {
      doc.setTextColor(...COLORS.darkGray);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(question.description, PAGE_CONFIG.contentWidth - 15);
      doc.text(descLines, PAGE_CONFIG.margin + 8, yPosition + 3);
      yPosition += descLines.length * 4 + 2;
    }

    // Answer type hints
    const answerTypes = Array.isArray(question.answerType)
      ? question.answerType
      : [question.answerType];

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.darkGray);
    doc.setFont("helvetica", "italic");

    answerTypes.forEach((at) => {
      if (at.type === "file") {
        // Draw a small box indicator for file uploads
        doc.setFillColor(...COLORS.lightGray);
        doc.rect(PAGE_CONFIG.margin + 8, yPosition - 1, 3, 3, "F");
        doc.setDrawColor(...COLORS.darkGray);
        doc.rect(PAGE_CONFIG.margin + 8, yPosition - 1, 3, 3, "S");

        // Add the file upload label text
        const fileLabel = `[Document] ${at.label}`;
        doc.text(fileLabel, PAGE_CONFIG.margin + 14, yPosition + 2);
        yPosition += 6;
      }
    });

    // Answer line
    yPosition += 5;
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.5);
    doc.line(
      PAGE_CONFIG.margin + 5,
      yPosition,
      PAGE_CONFIG.width - PAGE_CONFIG.margin - 5,
      yPosition,
    );

    yPosition += 10;
  };

  // Helper function to draw footer
  const drawFooter = (pageNum: number, totalPages: number): void => {
    doc.setTextColor(...COLORS.darkGray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_CONFIG.width / 2, PAGE_CONFIG.height - 10, {
      align: "center",
    });

    doc.text(
      "Generated by Capalyze - Investment Readiness Platform",
      PAGE_CONFIG.margin,
      PAGE_CONFIG.height - 10,
    );
  };

  // Draw header
  drawHeader();

  // Introduction section
  doc.setTextColor(...COLORS.secondary);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const introText = doc.splitTextToSize(
    "This document contains assessment questions to help evaluate your business readiness for investment. Please review each section carefully and prepare your answers and supporting documents.",
    PAGE_CONFIG.contentWidth,
  );
  doc.text(introText, PAGE_CONFIG.margin, yPosition);
  yPosition += introText.length * 5 + 10;

  // Draw sections
  questionsByCategory.forEach(({ category, questions }) => {
    const categoryLabel = ASSESSMENT_CATEGORIES.find((c) => c.key === category)?.label || category;

    drawSectionHeader(categoryLabel);

    questions.forEach((question, index) => {
      drawQuestion(question, index);
    });

    yPosition += 5;
  });

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  // Download the PDF
  const filename = `Capalyze_Assessment_Questions_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
