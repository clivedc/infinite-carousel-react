import { Children, ReactElement, useRef, useState } from "react";
import CarouselSlides, { SlidesRefHandle } from "./CarouselSlides";
import CarouselDots from "./CarouselDots";
import CarouselNavBtns from "./CarouselNavBtns";

import styles from "./index.module.css";

interface CarouselProps {
    width?: string;
    height?: string;
    animationDuration?: number;
    ariaLabel: string;
    isInfinite: boolean;
    children: ReactElement[];
}

export default function Carousel({
    width = "100%",
    height = "100%",
    animationDuration = 500,
    ariaLabel = "Image slider",
    isInfinite,
    children,
}: CarouselProps) {
    // 0 based, 0 -> 1st slide
    const [slideNo, setSlideNo] = useState(0);
    const slidesRef = useRef<null | SlidesRefHandle>(null);
    const totalSlides = Children.count(children);

    function setNextSlide() {
        if (slideNo + 1 >= totalSlides) {
            if (!isInfinite) return;
            if (!slidesRef.current) return;

            slidesRef.current.appendFirstSlideToEndOfTrack();
            slidesRef.current.animateFromLastToFirst();
            setSlideNo(0);
            return;
        }

        setSlideNo((prevSlideNo) => prevSlideNo + 1);
    }

    function setPrevSlide() {
        if (slideNo - 1 < 0) {
            if (!isInfinite) return;
            if (!slidesRef.current) return;

            slidesRef.current.prependLastSlideToStartOfTrack();
            slidesRef.current.animateFromFirstToLast();
            setSlideNo(totalSlides - 1);
            return;
        }

        setSlideNo((prevSlideNo) => prevSlideNo - 1);
    }

    return (
        <section
            style={
                {
                    "--slide-no": slideNo,
                    "--transition-duration": `${animationDuration}ms`,
                    "--total-slides": totalSlides,
                    "--width": width,
                    "--height": height,
                } as React.CSSProperties
            }
            className={styles["carousel-container"]}
            aria-roledescription="carousel"
            aria-label={ariaLabel}
        >
            <CarouselDots
                slideNo={slideNo}
                totalSlides={totalSlides}
                setSlideNo={setSlideNo}
                setNextSlide={setNextSlide}
                setPrevSlide={setPrevSlide}
            />
            <CarouselNavBtns
            	slideNo={slideNo}
            	totalSlides={totalSlides}
            	isInfinite={isInfinite}
                setNextSlide={setNextSlide}
                setPrevSlide={setPrevSlide}
            />
            <CarouselSlides
                ref={slidesRef}
                slideNo={slideNo}
                totalSlides={totalSlides}
                isInfinite={isInfinite}
                setNextSlide={setNextSlide}
                setPrevSlide={setPrevSlide}
            >
                {children}
            </CarouselSlides>
        </section>
    );
}
