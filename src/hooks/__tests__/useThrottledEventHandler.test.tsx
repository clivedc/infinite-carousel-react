import { renderHook, render, screen } from "@testing-library/react";
import useThrottledEventHandler from "../useThrottledEventHandler";
import userEvent from "@testing-library/user-event";

test('should throttle callback', async () => {
	const callbackMock = vi.fn();
	const timeout = 500;
	const { result } = renderHook(() => useThrottledEventHandler(callbackMock, timeout));

	expect(typeof result.current).toBe("function");

	// Render a dummy button to test whether the returned evt handler is throttled
	render(<button onClick={result.current}>Click Me</button>);
	const btn = screen.getByRole("button");

	await userEvent.click(btn);
	await userEvent.click(btn);
	await userEvent.click(btn);
	await userEvent.click(btn);

	expect(callbackMock).toHaveBeenCalledOnce();
});
