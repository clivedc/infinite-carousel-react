import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import ImgLoaderSVG from "./ImgLoaderSVG";
import styles from "./index.module.css";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";

interface ImageTypeProps extends ComponentPropsWithoutRef<"img"> {
    src: string;
    alt: string;
    lazy: boolean;
    width: string;
    height: string;
}

function Image({
    width = "100%",
    height = "100%",
    lazy,
    src,
    ...restProps
}: ImageTypeProps) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState(lazy ? undefined : src);
    const [imgRef, isImgVisible] = useIntersectionObserver<HTMLImageElement>({
        threshold: 0.2,
    });

    useEffect(() => {
        if (!lazy) return;

        if (isImgVisible) {
            setImgSrc(src);
        }
    }, [isImgVisible, lazy, src]);

    function handleOnLoad() {
        setImgLoaded(true);
    }

    return (
        <div
            className={styles.imgWrapper}
            style={{ width: width, height: height }}
        >
            <img
                src={imgSrc}
                className={styles.imgWrapper__img}
                ref={lazy ? imgRef : undefined}
                onLoad={handleOnLoad}
                draggable={false}
                {...restProps}
            />
            <ImgLoaderSVG imgLoaded={imgLoaded} />
        </div>
    );
}

export default Image;
