import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DocumentPreview } from "@/components/DocumentPreview";
import { getTemplateById } from "@/data/templates";

vi.mock("@/data/templates", () => ({
  getTemplateById: vi.fn(),
}));

const mockTemplate = {
  id: "resume-modern-001",
  name: "Modern Professional",
  category: "Resume",
  accent: "#4f46e5",
  sections: ["Personal Information", "Summary"],
  fields: [
    { key: "fullName", label: "Full Name", section: "Personal Information", type: "text" },
    { key: "email", label: "Email", section: "Personal Information", type: "email" },
    { key: "summary", label: "Professional Summary", section: "Summary", type: "textarea" },
  ],
};

const mockData = {
  fullName: "Aarav Sharma",
  email: "aarav@example.com",
  summary: "Product manager with 5+ years experience",
};

describe("DocumentPreview", () => {
  it("renders template name and category", () => {
    render(<DocumentPreview template={mockTemplate} data={mockData} />);
    
    expect(screen.getByText("Modern Professional — Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Resume")).toBeInTheDocument();
  });

  it("renders contact information", () => {
    render(<DocumentPreview template={mockTemplate} data={mockData} />);
    
    expect(screen.getByText("aarav@example.com")).toBeInTheDocument();
  });

  it("renders sections with field values", () => {
    render(<DocumentPreview template={mockTemplate} data={mockData} />);
    
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("aarav@example.com")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Professional Summary")).toBeInTheDocument();
    expect(screen.getByText("Product manager with 5+ years experience")).toBeInTheDocument();
  });

  it("does not render empty fields", () => {
    const dataWithEmpty = { ...mockData, email: "" };
    render(<DocumentPreview template={mockTemplate} data={dataWithEmpty} />);
    
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("renders category badge with template accent color", () => {
    render(<DocumentPreview template={mockTemplate} data={mockData} />);
    
    const badge = screen.getByText("Resume");
    expect(badge).toHaveStyle({ backgroundColor: "#4f46e5" });
  });

  it("shows role when present in data", () => {
    const dataWithRole = { ...mockData, role: "Product Manager" };
    render(<DocumentPreview template={mockTemplate} data={dataWithRole} />);
    
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
  });

  it("shows location when present in data", () => {
    const dataWithLocation = { ...mockData, location: "Bengaluru, India" };
    render(<DocumentPreview template={mockTemplate} data={dataWithLocation} />);
    
    expect(screen.getByText("Bengaluru, India")).toBeInTheDocument();
  });

  it("handles template with many sections", () => {
    const complexTemplate = {
      ...mockTemplate,
      sections: ["Personal Information", "Summary", "Experience", "Education", "Skills"],
      fields: [
        { key: "fullName", label: "Full Name", section: "Personal Information", type: "text" },
        { key: "summary", label: "Summary", section: "Summary", type: "textarea" },
        { key: "experience", label: "Experience", section: "Experience", type: "textarea" },
        { key: "education", label: "Education", section: "Education", type: "textarea" },
        { key: "skills", label: "Skills", section: "Skills", type: "textarea" },
      ],
    };
    
    const complexData = {
      fullName: "Test User",
      summary: "Summary text",
      experience: "Experience text",
      education: "Education text",
      skills: "Skills text",
    };
    
    render(<DocumentPreview template={complexTemplate} data={complexData} />);
    
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });
});