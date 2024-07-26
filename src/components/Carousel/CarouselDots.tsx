import { KeyboardEvent, MouseEvent, useEffect, useRef } from "react";
import styles from "./CarouselDots.module.css";
import useThrottledEventHandler from "../../hooks/useThrottledEventHandler";

interface CarouselDotsProps {
    slideNo: number;
    totalSlides: number;
    setSlideNo: React.Dispatch<React.SetStateAction<number>>;
    setNextSlide: () => void;
    setPrevSlide: () => void;
}

function CarouselDots({
    slideNo,
    totalSlides,
    setSlideNo,
    setNextSlide,
    setPrevSlide,
}: CarouselDotsProps) {
    const activeDotRef = useRef<null | HTMLButtonElement>(null);
    const dotsContainerRef = useRef<null | HTMLDivElement>(null);
    const throttledKeyDownHandler = useThrottledEventHandler(handleKeyDown, 600);

    // Needed for focusing activeDot when using keyboard navigation
    useEffect(() => {
        const activeDot = activeDotRef.current;
        const dotsContainer = dotsContainerRef.current;

        if (!activeDot || !dotsContainer) return;

        const focusedElement = document.activeElement;

        if (
            dotsContainer.contains(focusedElement) &&
            focusedElement !== activeDot
        ) {
            activeDot.focus();
        }
    }, [slideNo]);

    function handleClick(ev: MouseEvent) {
        const input = ev.currentTarget as HTMLButtonElement;
        setSlideNo(Number(input.dataset.index));
    }

    function handleKeyDown(ev: KeyboardEvent) {
        const key = ev.key.toLowerCase();

        switch (key) {
            case "arrowright":
                setNextSlide();
                // focusing is handled in useEffect since state isn't
                // set immediately
                break;
            case "arrowleft":
                setPrevSlide();
                // focusing is handled in useEffect
                break;
            case "home":
                setSlideNo(0);
                // focusing is handled in useEffect
                break;
            case "end":
                setSlideNo(totalSlides - 1);
                // focusing is handled in useEffect
                break;
            default:
                break;
        }
    }

    return (
        <div
            ref={dotsContainerRef}
            role="tablist"
            aria-label="Slides"
            className={styles["carousel-dots-container"]}
            onKeyDown={throttledKeyDownHandler}
        >
            {range(1, totalSlides).map((value, index) => (
                <button
                    type="button"
                    className={styles["carousel-dot"]}
                    key={value}
                    role="tab"
                    aria-label={`Slide ${value}`}
                    aria-controls={`carouselSlide-${value}`} // id of slide, carouselSlide-1 -> id of 1st slide
                    data-index={index}
                    tabIndex={slideNo === index ? undefined : -1} // undefined since default tabindex for a button is 0 ie. focusable
                    aria-selected={slideNo === index}
                    ref={slideNo === index ? activeDotRef : null}
                    onClick={handleClick}
                ></button>
            ))}
        </div>
    );
}

function range(start: number, end: number) {
    const result = [];

    for (let i = start; i <= end; i++) {
        result.push(i);
    }

    return result;
}

export default CarouselDots;
