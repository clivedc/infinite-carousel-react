import { useEffect, useRef } from "react";

function useThrottledEventHandler<T>(
    callback: (ev: T) => void,
    timeout: number,
) {
    const throttleId = useRef<ReturnType<typeof setTimeout> | undefined>();

    useEffect(() => {
        const id = throttleId.current;

        return () => {
            clearTimeout(id);
        };
    }, []);

    function throttledEventHandler(ev: T) {
        if (throttleId.current !== undefined) return;

        callback(ev);

        throttleId.current = setTimeout(() => {
            throttleId.current = undefined;
        }, timeout);
    }

    return throttledEventHandler;
}

export default useThrottledEventHandler;
