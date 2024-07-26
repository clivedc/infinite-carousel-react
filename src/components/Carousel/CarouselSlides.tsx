import {
    Children,
    PointerEvent,
    ReactElement,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    animateFromFirstToLast,
    animateFromLastToFirst,
    resetFirstSlideStylesSetInJsAfterDrag,
    resetLastSlideStylesSetInJsAfterDrag,
    resetTrackStylesSetInJsAfterDrag,
} from "./carouselSlideUtils";
import styles from "./CarouselSlides.module.css";

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
    // local vars to be used in event handlers
    const slidesTrackDimensions = useRef<DOMRect>();
    const initialCursorX = useRef(0);
    const dragDeltaX = useRef(0);
    const pointerMoveFirstIteration = useRef(true);
    const isOnFirstSlide = slideNo === 0;
    const isOnLastSlide = slideNo === totalSlides - 1;

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

    function handlePointerDown(ev: PointerEvent) {
        const slidesTrack = slidesTrackRef.current;
        if (!slidesTrack) return;

        slidesTrackDimensions.current = slidesTrack.getBoundingClientRect();
        // Get initial pos relative to carousel
        initialCursorX.current =
            ev.clientX - slidesTrackDimensions.current.left;

        setIsDragging("true");
    }

    function handlePointerMove(ev: PointerEvent) {
        // If left mouse btn isn't being clicked while dragging then do nothing
        if (ev.buttons !== 1) return;

        const slidesTrack = slidesTrackRef.current;
        const firstSlide = firstSlideRef.current;
        const lastSlide = lastSlideRef.current;
        if (
            !slidesTrack ||
            !firstSlide ||
            !lastSlide ||
            !slidesTrackDimensions.current
        )
            return;

        // Allow pointermove to continue outside bounds
        // This allows pointerup to fire even if cursor is outside bounds
        // once user finishes dragging
        slidesTrack.setPointerCapture(ev.pointerId);

        dragDeltaX.current = Math.round(
            ev.clientX -
                slidesTrackDimensions.current.left -
                initialCursorX.current,
        );

        if (pointerMoveFirstIteration.current) {
            const isDraggingToTheLeft = dragDeltaX.current < 0;
            const isDraggingToTheRight = dragDeltaX.current > 0;

            if (isOnLastSlide && isDraggingToTheLeft) {
                if (!isInfinite) return;
                firstSlide.dataset.appendedToEndOfTrack = "true";
            } else if (isOnFirstSlide && isDraggingToTheRight) {
                if (!isInfinite) return;
                lastSlide.dataset.prependedToStartOfTrack = "true";
            }

            pointerMoveFirstIteration.current = false;
        }

        requestAnimationFrame(() => {
            const previousTransformAmount = `${slideNo} * -100%`;
            slidesTrack.style.transform = `translateX(calc(${previousTransformAmount} + ${dragDeltaX.current}px))`;
        });
    }

    function handlePointerUp() {
        // Reset this var when pointer move ends
        pointerMoveFirstIteration.current = true;

        setIsDragging("false");

        const slidesTrack = slidesTrackRef.current;
        const firstSlide = firstSlideRef.current;
        const lastSlide = lastSlideRef.current;
        if (!slidesTrack || !firstSlide || !lastSlide) return;

        resetTrackStylesSetInJsAfterDrag(slidesTrack);
        // if users dragged more than 100px in either direction
        // then change slide
        if (Math.abs(dragDeltaX.current) > 100) {
            // This needs to fire after isDragging state changes
            // so that the right animation duration is returned when queried
            // in the functions animateFromFirstToLast and animateFromLastToFirst.
            // This is done by introducing a little delay by executing it as a microtask
            queueMicrotask(() => {
                dragDeltaX.current < 0 ? setNextSlide() : setPrevSlide();
            });
        } else {
            resetFirstSlideStylesSetInJsAfterDrag(slidesTrack, firstSlide);
            resetLastSlideStylesSetInJsAfterDrag(slidesTrack, lastSlide);
        }
    }

    return (
        <div
            className={styles["carousel-track"]}
            data-is-dragging={isDragging}
            ref={slidesTrackRef}
            data-testid="slidesTrack"
            role="group"
            aria-live="polite"
            aria-atomic="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {Children.map(children, (child, index) => (
                <div
                    id={`carouselSlide-${index + 1}`}
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
