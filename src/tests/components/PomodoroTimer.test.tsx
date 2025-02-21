import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import PomodoroTimer from "@/features/pomodoro/PomodoroTimer";
import { TimerContextProvider } from "@/context/TimerContext";
import { mockChrome } from "../../tests/setup";
import { Tabs, TabsContent } from "@/components/ui/tabs";

describe("PomodoroTimer", () => {
  const renderPomodoroTimer = async () => {
    let result;
    await act(async () => {
      result = render(
        <TimerContextProvider>
          <Tabs defaultValue="timer">
            <TabsContent value="timer">
              <PomodoroTimer />
            </TabsContent>
          </Tabs>
        </TimerContextProvider>
      );
    });
    return result!;
  };

  it("renders initial timer state correctly", async () => {
    await renderPomodoroTimer();
    await screen.findByText("25:00");
    expect(screen.getByText("Ready? Start! 🚀")).toBeInTheDocument();
  });

  it("handles start timer button click", async () => {
    await renderPomodoroTimer();

    const startButton = await screen.findByText("Start");
    fireEvent.click(startButton);

    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "start-timer",
    });
  });

  it("handles stop timer button click when timer is running", async () => {
    // Mock storage to simulate running timer
    mockChrome.storage.local.get.mockResolvedValue({
      time: 1500000,
      isRunning: true,
    });

    await renderPomodoroTimer();

    const stopButton = await screen.findByText("Stop");
    fireEvent.click(stopButton);

    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "stop-timer",
    });
  });

  it("shows break timer state correctly", async () => {
    // Mock storage to simulate break time
    mockChrome.storage.local.get.mockResolvedValue({
      time: 300000, // 5 minutes
      isRunning: true,
      isBreak: true,
    });

    await renderPomodoroTimer();

    await screen.findByText("Quick break! ☀️");
    const skipButton = screen.getByText("Skip");
    expect(skipButton).toBeInTheDocument();
  });

  it("handles storage changes correctly", async () => {
    await renderPomodoroTimer();

    // Simulate storage change
    const storageChangeHandler =
      mockChrome.storage.onChanged.addListener.mock.calls[0][0];

    act(() => {
      storageChangeHandler({
        time: { newValue: 1400000 },
        isRunning: { newValue: true },
        isBreak: { newValue: false },
        isLongBreak: { newValue: false },
        ultraFocusMode: { newValue: true },
      });
    });

    // Check if Ultra Focus Mode badge appears
    expect(screen.getByText("Ultra Focus Mode! 🔥")).toBeInTheDocument();
  });

  it("formats timer correctly for different durations", async () => {
    // Test with time > 1 hour
    mockChrome.storage.local.get.mockResolvedValue({ time: 3600001 }); // 1 hour + 1ms
    const { rerender } = await renderPomodoroTimer();
    await screen.findByText("01:00:00");

    // Test with time = 0
    mockChrome.storage.local.get.mockResolvedValue({ time: 0 });
    await act(async () => {
      rerender(
        <TimerContextProvider>
          <Tabs defaultValue="timer">
            <TabsContent value="timer">
              <PomodoroTimer />
            </TabsContent>
          </Tabs>
        </TimerContextProvider>
      );

      // Simulate storage change to force update
      const storageChangeHandler =
        mockChrome.storage.onChanged.addListener.mock.calls[0][0];
      storageChangeHandler({
        time: { newValue: 0 },
      });
    });

    await screen.findByText("00:00");
  });
});
