import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button UI Component", () => {
  it("renders with default props and text content", () => {
    render(<Button>Save Service</Button>);
    const btn = screen.getByRole("button", { name: /save service/i });
    expect(btn).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    const btn = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button when isLoading is true", () => {
    render(<Button isLoading>Processing</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });
});

