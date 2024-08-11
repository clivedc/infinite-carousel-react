import {
    Children,
    ReactElement,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    animateFromFirstToLast,
    animateFromLastToFirst,
} from "./carouselSlideUtils";
import styles from "./CarouselSlides.module.css";
import CarouselDragEvtHandlers from "./carouselDragEvtHandlers";

// for forwarededRef, needed for useImperativeHandle
export type SlidesRefHandle = {
    appendFirstSlideToEndOfTrack: () => void;
    prependLastSlideToStartOfTrack: () => void;
    animateFromFirstToLast: () => void;
    animateFromLastToFirst: () => void;
};

export interface SlideProps {
    slideNo: number;
    totalSlides: number;
    isInfinite: boolean;
    setNextSlide: () => void;
    setPrevSlide: () => void;
    children: ReactElement[];
}

const CarouselSlides = forwardRef<SlidesRefHandle, SlideProps>(function Slides(
    { slideNo, totalSlides, isInfinite, setNextSlide, setPrevSlide, children },
    ref,
) {
    const slidesTrackRef = useRef<HTMLDivElement>(null);
    const firstSlideRef = useRef<HTMLDivElement>(null);
    const lastSlideRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<"true" | "false">("false");
    const [dragEvtHandlers] = useState(() => new CarouselDragEvtHandlers(isInfinite));

    // Ref thats forwarded from parent
    // This allows the 2 functions to be used in parent
    useImperativeHandle(ref, () => {
        return {
            appendFirstSlideToEndOfTrack: () => {
                const firstSlide = firstSlideRef.current;
                if (!firstSlide) return;
                if (firstSlide.dataset.appendedToEndOfTrack === "true") return;

                // This is not animated so the change is instant
                // Styles for this are set in css
                firstSlide.dataset.appendedToEndOfTrack = "true";
            },
            prependLastSlideToStartOfTrack: () => {
                const lastSlide = lastSlideRef.current;
                if (!lastSlide) return;
                if (lastSlide.dataset.prependedToStartOfTrack === "true")
                    return;

                // This is not animated so the change is instant
                // Styles for this are set in css
                lastSlide.dataset.prependedToStartOfTrack = "true";
            },
            animateFromFirstToLast: () => {
                const slidesTrack = slidesTrackRef.current;
                const lastSlide = lastSlideRef.current;
                if (!slidesTrack || !lastSlide) return;

                animateFromFirstToLast(slidesTrack, lastSlide);
            },
            animateFromLastToFirst: () => {
                const slidesTrack = slidesTrackRef.current;
                const firstSlide = firstSlideRef.current;
                if (!slidesTrack || !firstSlide) return;

                animateFromLastToFirst(slidesTrack, firstSlide, totalSlides);
            },
        };
    });

    return (
        <div
            className={styles["carousel-track"]}
            data-is-dragging={isDragging}
            ref={slidesTrackRef}
            data-testid="slidesTrack"
            role="group"
            aria-live="polite"
            aria-atomic="true"
            onPointerDown={(ev) => dragEvtHandlers.onPointerDown(ev, setIsDragging, slideNo, totalSlides)}
            onPointerMove={(ev) => dragEvtHandlers.onPointerMove(ev, slideNo)}
            onPointerUp={() => dragEvtHandlers.onPointerUp(setIsDragging, setNextSlide, setPrevSlide)}
        >
            {Children.map(children, (child, index) => (
                <div
                    id={`carouselSlide-${index + 1}`}
                    className={styles["carousel-track__slide"]}
                    ref={
                        (index === 0 && firstSlideRef) ||
                        (index === totalSlides - 1 && lastSlideRef) ||
                        undefined
                    }
                    role="tabpanel"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${totalSlides}`}
                >
                    {child}
                </div>
            ))}
        </div>
    );
});

export default CarouselSlides;
