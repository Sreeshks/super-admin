import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { TenantProvider } from "@/providers/tenant-provider";
import { publicApi } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  publicApi: {
    submitEnquiry: vi.fn(),
  },
}));

describe("Public Enquiry Form", () => {
  const mockCompany = {
    id: "comp-1",
    name: "Luxe Salon",
    slug: "luxe-salon",
    website_status: "active" as const,
    account_status: "active" as const,
  };

  it("renders enquiry input fields properly", () => {
    render(
      <TenantProvider slug="luxe-salon" company={mockCompany}>
        <EnquiryForm />
      </TenantProvider>
    );

    expect(screen.getByPlaceholderText(/Eleanor Vance/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+91 98765 43210/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/eleanor@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Appointment Enquiry/i })).toBeInTheDocument();
  });

  it("submits the enquiry to the public backend API with verified tenant slug", async () => {
    vi.mocked(publicApi.submitEnquiry).mockResolvedValueOnce({
      success: true,
      message: "Enquiry submitted successfully",
    });

    render(
      <TenantProvider slug="luxe-salon" company={mockCompany}>
        <EnquiryForm />
      </TenantProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Eleanor Vance/i), {
      target: { value: "Eleanor Vance" },
    });
    fireEvent.change(screen.getByPlaceholderText(/\+91 98765 43210/i), {
      target: { value: "+919876543210" },
    });
    fireEvent.change(screen.getByPlaceholderText(/eleanor@example.com/i), {
      target: { value: "eleanor@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/preferred dates/i), {
      target: { value: "I would like to book a keratin hair treatment this Saturday." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit Appointment Enquiry/i }));

    await waitFor(() => {
      expect(publicApi.submitEnquiry).toHaveBeenCalledWith(
        "luxe-salon",
        expect.objectContaining({
          customer_name: "Eleanor Vance",
          email: "eleanor@example.com",
          phone: "+919876543210",
        })
      );
    });

    // Confirmation message shown
    await waitFor(() => {
      expect(screen.getByText(/Thank You for Reaching Out/i)).toBeInTheDocument();
    });
  });
});

