import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DocumentEditor } from "@/components/DocumentEditor";
import { getTemplateById, defaultTemplateData } from "@/data/templates";

// Mock data
vi.mock("@/data/templates", () => ({
  getTemplateById: vi.fn(),
  defaultTemplateData: vi.fn(),
}));

const mockTemplate = {
  id: "resume-modern-001",
  name: "Modern Professional",
  category: "Resume",
  description: "Clean ATS-friendly layout",
  price: 5,
  premium: false,
  thumbnail: "https://example.com/thumb.jpg",
  accent: "#4f46e5",
  layout: "modern",
  sections: ["Personal Information", "Summary", "Experience"],
  fields: [
    { key: "fullName", label: "Full Name", section: "Personal Information", type: "text", placeholder: "Aarav Sharma" },
    { key: "email", label: "Email", section: "Personal Information", type: "email", placeholder: "aarav@email.com" },
    { key: "summary", label: "Professional Summary", section: "Summary", type: "textarea", placeholder: "Experienced product manager..." },
    { key: "experience", label: "Experience", section: "Experience", type: "textarea", placeholder: "Senior Product Manager..." },
  ],
};

const mockDefaultData = {
  fullName: "Aarav Sharma",
  email: "aarav@example.com",
  summary: "Product manager with 5+ years experience",
  experience: "Senior Product Manager • Company X",
};

describe("DocumentEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getTemplateById as any).mockReturnValue(mockTemplate);
    (defaultTemplateData as any).mockReturnValue(mockDefaultData);
  });

  it("renders template name and sections", () => {
    render(<DocumentEditor template={mockTemplate} />);
    
    expect(screen.getByText("Modern Professional")).toBeInTheDocument();
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
  });

  it("renders form fields with default values", () => {
    render(<DocumentEditor template={mockTemplate} />);
    
    expect(screen.getByPlaceholderText("Aarav Sharma")).toHaveValue("Aarav Sharma");
    expect(screen.getByPlaceholderText("aarav@email.com")).toHaveValue("aarav@example.com");
    expect(screen.getByPlaceholderText("Experienced product manager...")).toHaveValue("Product manager with 5+ years experience");
  });

  it("updates field values on input change", () => {
    render(<DocumentEditor template={mockTemplate} />);
    
    const nameInput = screen.getByPlaceholderText("Aarav Sharma");
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    
    expect(nameInput).toHaveValue("New Name");
  });

  it("shows save draft and export buttons", () => {
    render(<DocumentEditor template={mockTemplate} />);
    
    expect(screen.getByText("Save draft")).toBeInTheDocument();
    expect(screen.getByText("Pay to export")).toBeInTheDocument();
  });

  it("shows price badge correctly", () => {
    render(<DocumentEditor template={mockTemplate} />);
    
    expect(screen.getByText("Standard")).toBeInTheDocument();
  });

  it("shows premium badge for premium templates", () => {
    const premiumTemplate = { ...mockTemplate, price: 10, premium: true };
    render(<DocumentEditor template={premiumTemplate} />);
    
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });
});