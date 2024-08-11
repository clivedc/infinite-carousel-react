import { PointerEvent } from "react";

class CarouselDragEvtHandlers {
    #slidesTrack: HTMLDivElement | undefined;
    #firstSlide: HTMLDivElement | undefined;
    #lastSlide: HTMLDivElement | undefined;
    #isInfinite: boolean;
    #initialCursorX = 0;
    #dragDeltaX = 0;
    #slidesTrackDimensions: DOMRect | undefined;
    #pointerMoveActive = false;
    #isOnFirstSlide = true;
    #isOnLastSlide = false;
    #isGoingFromFirstSlideToLastSlide = false;
    #isGoingFromLastSlideToFirstSlide = false;
    // Needed to avoid quering the DOM on every pointer move instance
    #firstSlideHasBeenAppendedToEndOfTrack = false;
    #lastSlideHasBeenPrependedToStartOfTrack = false;

    constructor(isInfinite: boolean) {
        this.#isInfinite = isInfinite;
    }

    #getSlidesTrack = (ev: PointerEvent) => {
        return ev.currentTarget as HTMLDivElement;
    };

    #getFirstSlide = (slidesTrack: HTMLDivElement) => {
        return slidesTrack.firstElementChild as HTMLDivElement;
    };

    #getLastSlide = (slidesTrack: HTMLDivElement) => {
        return slidesTrack.lastElementChild as HTMLDivElement;
    };

    #resetFirstSlideStylesAfterDrag = (
        slidesTrack: HTMLDivElement,
        firstSlide: HTMLDivElement,
    ) => {
        // first slide styles need to be reset after the track
        // finishes animating in order to prevent a visual glitch
        // otherwise the slide 'disappears' immediately
        slidesTrack.addEventListener(
            "transitionend",
            () => {
                if (
                    this.#pointerMoveActive ||
                    this.#isGoingFromLastSlideToFirstSlide
                )
                    return;
                firstSlide.dataset.appendedToEndOfTrack = "false";
                this.#firstSlideHasBeenAppendedToEndOfTrack = false;
                this.#isGoingFromLastSlideToFirstSlide = false;
            },
            { once: true },
        );
    };

    #resetLastSlideStylesAfterDrag = (
        slidesTrack: HTMLDivElement,
        lastSlide: HTMLDivElement,
    ) => {
        // ditto but for last slide instead
        slidesTrack.addEventListener(
            "transitionend",
            () => {
                if (
                    this.#pointerMoveActive ||
                    this.#isGoingFromFirstSlideToLastSlide
                )
                    return;
                lastSlide.dataset.prependedToStartOfTrack = "false";
                this.#lastSlideHasBeenPrependedToStartOfTrack = false;
                this.#isGoingFromFirstSlideToLastSlide = false;
            },
            { once: true },
        );
    };

    onPointerDown = (
        ev: PointerEvent,
        setIsDragging: React.Dispatch<React.SetStateAction<"true" | "false">>,
        slideNo: number,
        totalSlides: number,
    ) => {
        this.#slidesTrack = this.#getSlidesTrack(ev);
        this.#firstSlide = this.#getFirstSlide(this.#slidesTrack);
        this.#lastSlide = this.#getLastSlide(this.#slidesTrack);

        this.#slidesTrackDimensions = this.#slidesTrack.getBoundingClientRect();
        // Get initial pos relative to carousel
        this.#initialCursorX = ev.clientX - this.#slidesTrackDimensions.left;
        this.#pointerMoveActive = true;

        // Reset some vars
        this.#isOnFirstSlide = slideNo === 0;
        this.#isOnLastSlide = slideNo === totalSlides - 1;
        this.#firstSlideHasBeenAppendedToEndOfTrack =
            this.#firstSlide.dataset.appendedToEndOfTrack === "true";
        this.#lastSlideHasBeenPrependedToStartOfTrack =
            this.#lastSlide.dataset.prependedToStartOfTrack === "true";
        this.#isGoingFromFirstSlideToLastSlide = false;
        this.#isGoingFromLastSlideToFirstSlide = false;

        setIsDragging("true");
    };

    onPointerMove = (
        ev: PointerEvent,
        slideNo: number,
    ) => {
        // If left mouse btn isn't being clicked while dragging then do nothing
        if (ev.buttons !== 1) return;
        if (!this.#slidesTrackDimensions || !this.#slidesTrack) return;

        // Allow pointermove to continue outside bounds
        // This allows pointerup to fire even if cursor is outside bounds
        // once user finishes dragging
        this.#slidesTrack.setPointerCapture(ev.pointerId);

        this.#dragDeltaX = Math.round(
            ev.clientX -
                this.#slidesTrackDimensions.left -
                this.#initialCursorX,
        );

        requestAnimationFrame(() => {
            if (!this.#slidesTrack || !this.#firstSlide || !this.#lastSlide)
                return;

            const isDraggingToTheLeft = this.#dragDeltaX < 0;
            const isDraggingToTheRight = this.#dragDeltaX > 0;

            if (this.#isOnLastSlide && isDraggingToTheLeft) {
                if (!this.#isInfinite) return;
                if (!this.#firstSlideHasBeenAppendedToEndOfTrack) {
                    this.#firstSlide.dataset.appendedToEndOfTrack = "true";
                    this.#firstSlideHasBeenAppendedToEndOfTrack = true;
                }
            } else if (this.#isOnFirstSlide && isDraggingToTheRight) {
                if (!this.#isInfinite) return;
                if (!this.#lastSlideHasBeenPrependedToStartOfTrack) {
                    this.#lastSlide.dataset.prependedToStartOfTrack = "true";
                    this.#lastSlideHasBeenPrependedToStartOfTrack = true;
                }
            }

            const previousTransformAmount = `${slideNo} * -100%`;
            this.#slidesTrack.style.transform = `translateX(calc(${previousTransformAmount} + ${this.#dragDeltaX}px))`;
        });
    };

    onPointerUp = (
        setIsDragging: React.Dispatch<React.SetStateAction<"true" | "false">>,
        setNextSlide: () => void,
        setPrevSlide: () => void,
    ) => {
        if (!this.#slidesTrack || !this.#firstSlide || !this.#lastSlide) return;

        setIsDragging("false");
        this.#pointerMoveActive = false;

        // Reset track styles set in pointer move
        requestAnimationFrame(() => {
            if (!this.#slidesTrack) return;
            this.#slidesTrack.removeAttribute("style");
        });

        // if users dragged more than 100px in either direction
        // then change slide
        if (Math.abs(this.#dragDeltaX) > 100) {
            if (this.#dragDeltaX < 0) {
                // This needs to fire after isDragging state changes
                // so that the right animation duration is returned when queried
                // (animation duration is set to 100ms when dragging) in the functions
                // animateFromFirstToLast and animateFromLastToFirst.
                // This is done by introducing a little delay by executing it as a microtask
                queueMicrotask(() => setNextSlide());
                if (this.#isInfinite && this.#isOnLastSlide) {
                    this.#isGoingFromLastSlideToFirstSlide = true;
                }
            } else {
                // Same as comment above
                queueMicrotask(() => setPrevSlide());
                if (this.#isInfinite && this.#isOnFirstSlide) {
                    this.#isGoingFromFirstSlideToLastSlide = true;
                }
            }
        }

        if (!this.#isInfinite) return;

        if (this.#firstSlideHasBeenAppendedToEndOfTrack) {
            this.#resetFirstSlideStylesAfterDrag(
                this.#slidesTrack,
                this.#firstSlide,
            );
        } else if (this.#lastSlideHasBeenPrependedToStartOfTrack) {
            this.#resetLastSlideStylesAfterDrag(
                this.#slidesTrack,
                this.#lastSlide,
            );
        }
    };
}

export default CarouselDragEvtHandlers;
