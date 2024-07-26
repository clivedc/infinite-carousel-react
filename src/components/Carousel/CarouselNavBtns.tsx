import { MouseEvent } from "react";
import styles from "./CarouselNavBtns.module.css";

interface CarouselNavBtnsProps {
    isInfinite: boolean;
    slideNo: number;
    totalSlides: number;
    setNextSlide: () => void;
    setPrevSlide: () => void;
}

function CarouselNavBtns({
    setNextSlide,
    setPrevSlide,
    isInfinite,
    slideNo,
    totalSlides,
}: CarouselNavBtnsProps) {
    function goToNextSlide(ev: MouseEvent) {
        const btn = ev.currentTarget as HTMLButtonElement;
        const isDisabled = btn.getAttribute("aria-disabled");

        if (isDisabled === "true") return;

        setNextSlide();
    }

    function goToPrevSlide(ev: MouseEvent) {
        const btn = ev.currentTarget as HTMLButtonElement;
        const isDisabled = btn.getAttribute("aria-disabled");

        if (isDisabled === "true") return;

        setPrevSlide();
    }

    return (
        <div className={styles["nav-btns-container"]} role="group">
            <button
                className={styles["prev-btn"]}
                type="button"
                aria-label="Previous slide"
                onClick={goToPrevSlide}
                aria-disabled={!isInfinite && slideNo === 0 ? true : false}
            >
                &lsaquo;
            </button>
            <button
                className={styles["next-btn"]}
                type="button"
                aria-label="Next slide"
                onClick={goToNextSlide}
                aria-disabled={
                    !isInfinite && slideNo === totalSlides - 1 ? true : false
                }
            >
                &rsaquo;
            </button>
        </div>
    );
}

export default CarouselNavBtns;
