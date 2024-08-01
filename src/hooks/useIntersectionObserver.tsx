import { useEffect, useRef, useState } from "react";

function useIntersectionObserver<T extends Element>(options?: IntersectionObserverInit) {
	const eleRef = useRef<T>(null);
	const [ isVisible, setIsVisible ] = useState(false);
	const observerOptions = useRef(options ?? {});

	useEffect(() => {
		const ele = eleRef.current;
		const opts = observerOptions.current;
		if (!ele) return;

		const observer = new IntersectionObserver((entries, observer) => {
			if (entries[0].isIntersecting) {
				setIsVisible(true);
				observer.disconnect();
			}
		}, opts);

		observer.observe(ele);

		return () => {
			observer.disconnect();
		};
	}, []);

	return [eleRef, isVisible] as const;
}

export default useIntersectionObserver;
