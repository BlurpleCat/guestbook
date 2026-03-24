import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Home from "@/app/page";

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(entries: unknown[] = []) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => entries,
  } as Response);
}

describe("Guestbook page", () => {
  it("renders the heading and form inputs", async () => {
    mockFetch();
    render(<Home />);

    expect(screen.getByText("Guestbook")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign/i })).toBeInTheDocument();
  });

  it("shows empty state when there are no entries", async () => {
    mockFetch([]);
    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText("No entries yet. Be the first to sign!")
      ).toBeInTheDocument();
    });
  });

  it("displays entries returned from the API", async () => {
    mockFetch([
      {
        sk: "2026-01-01T00:00:00.000Z#abc",
        firstName: "Jane",
        lastName: "Doe",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });
  });

  it("shows an error when first name is empty on submit", async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByPlaceholderText("Last name"), "Smith");
    await user.click(screen.getByRole("button", { name: /sign/i }));

    expect(
      screen.getByText("Please enter both your first and last name.")
    ).toBeInTheDocument();
  });

  it("shows an error when last name is empty on submit", async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByPlaceholderText("First name"), "John");
    await user.click(screen.getByRole("button", { name: /sign/i }));

    expect(
      screen.getByText("Please enter both your first and last name.")
    ).toBeInTheDocument();
  });

  it("submits the form and refreshes the entry list", async () => {
    const fetchSpy = mockFetch([]);
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText("No entries yet. Be the first to sign!")
      ).toBeInTheDocument();
    });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sk: "2026-03-23T00:00:00.000Z#xyz",
        firstName: "Alice",
        lastName: "Johnson",
        createdAt: "2026-03-23T00:00:00.000Z",
      }),
    } as Response);

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          sk: "2026-03-23T00:00:00.000Z#xyz",
          firstName: "Alice",
          lastName: "Johnson",
          createdAt: "2026-03-23T00:00:00.000Z",
        },
      ],
    } as Response);

    await user.type(screen.getByPlaceholderText("First name"), "Alice");
    await user.type(screen.getByPlaceholderText("Last name"), "Johnson");
    await user.click(screen.getByRole("button", { name: /sign/i }));

    await waitFor(() => {
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("First name")).toHaveValue("");
    expect(screen.getByPlaceholderText("Last name")).toHaveValue("");
  });
});
