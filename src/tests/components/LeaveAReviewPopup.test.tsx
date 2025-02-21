import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import LeaveAReviewPopup from "@/components/LeaveAReviewPopup";
import { REVIEW_PAGE } from "@/constants";

type StorageCallback = (result: {
  reviewPopupClosed?: boolean;
  pomodoroHistory?: string[];
}) => void;

describe("LeaveAReviewPopup", () => {
  beforeEach(() => {
    // Mock chrome.storage.local
    global.chrome = {
      storage: {
        local: {
          get: vi.fn(),
          set: vi.fn(),
        },
      },
    } as any;
  });

  afterEach(() => {
    cleanup();
  });

  it("should not render when storage indicates popup was closed", () => {
    (chrome.storage.local.get as any).mockImplementation(
      (_keys: string[], callback: StorageCallback) => {
        callback({
          reviewPopupClosed: true,
          pomodoroHistory: ["session1", "session2"],
        });
      }
    );

    render(<LeaveAReviewPopup />);

    const popup = screen.queryByText(/Your thoughts matter!/i);
    expect(popup).not.toBeInTheDocument();
  });

  it("should render when user has pomodoro history and popup was not closed", () => {
    (chrome.storage.local.get as any).mockImplementation(
      (_keys: string[], callback: StorageCallback) => {
        callback({
          reviewPopupClosed: false,
          pomodoroHistory: ["session1", "session2"],
        });
      }
    );

    render(<LeaveAReviewPopup />);

    const popup = screen.getByText(/Your thoughts matter!/i);
    expect(popup).toBeInTheDocument();

    const reviewLink = screen.getByText(/Share a quick review/i);
    expect(reviewLink).toHaveAttribute("href", REVIEW_PAGE);
  });

  it("should not render when user has insufficient pomodoro history", () => {
    (chrome.storage.local.get as any).mockImplementation(
      (_keys: string[], callback: StorageCallback) => {
        callback({ reviewPopupClosed: false, pomodoroHistory: ["session1"] });
      }
    );

    render(<LeaveAReviewPopup />);

    const popup = screen.queryByText(/Your thoughts matter!/i);
    expect(popup).not.toBeInTheDocument();
  });

  it("should close popup and update storage when close button is clicked", async () => {
    (chrome.storage.local.get as any).mockImplementation(
      (_keys: string[], callback: StorageCallback) => {
        callback({
          reviewPopupClosed: false,
          pomodoroHistory: ["session1", "session2"],
        });
      }
    );

    render(<LeaveAReviewPopup />);

    const closeButton = screen.getByTestId("close-review-popup");
    fireEvent.click(closeButton);

    await waitFor(() => {
      const popup = screen.queryByText(/Your thoughts matter!/i);
      expect(popup).not.toBeInTheDocument();
    });

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      reviewPopupClosed: true,
    });
  });
});
