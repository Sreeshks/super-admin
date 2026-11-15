import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button UI Component", () => {
  it("renders with default props and text content", () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeInTheDocument();
  });

  it("triggers onClick callback when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    const btn = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when isLoading is true", () => {
    render(<Button isLoading>Processing</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("renders destructive variant correctly", () => {
    render(<Button variant="destructive">Delete Tenant</Button>);
    const btn = screen.getByRole("button", { name: /delete tenant/i });
    expect(btn.className).toContain("bg-red-600");
  });
});

