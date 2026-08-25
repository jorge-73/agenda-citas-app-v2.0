import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCalendar } from "../hooks/use-calendar";

describe("useCalendar navigation", () => {
  it("notifies the page when navigating to another period", () => {
    const onDateChange = vi.fn();
    const { result } = renderHook(() => useCalendar({ onDateChange }));

    act(() => result.current.navigateNext());

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange).toHaveBeenCalledWith(result.current.currentDate);
  });

  it("notifies the page when selecting a calendar day", () => {
    const onDateChange = vi.fn();
    const { result } = renderHook(() => useCalendar({ onDateChange }));
    const selectedDate = new Date(2026, 8, 1);

    act(() => result.current.selectDate(selectedDate));

    expect(onDateChange).toHaveBeenCalledWith(selectedDate);
    expect(result.current.currentDate).toBe(selectedDate);
  });
});
