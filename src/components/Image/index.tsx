import { ComponentPropsWithoutRef, useState } from "react";
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
    width = "initial",
    height = "initial",
    lazy,
    src,
    ...restProps
}: ImageTypeProps) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgContainerRef, isImgContainerVisible] =
        useIntersectionObserver<HTMLDivElement>({
            threshold: 0.2,
        });

    function handleOnLoad() {
        setImgLoaded(true);
    }

    return (
        <div
            className={styles.imgWrapper}
            style={{ width: width, height: height }}
            ref={lazy ? imgContainerRef : undefined}
        >
            {(!lazy || (lazy && isImgContainerVisible)) && (
                <img
                    src={src}
                    className={styles.imgWrapper__img}
                    onLoad={handleOnLoad}
                    draggable={false}
                    {...restProps}
                />
            )}
            <ImgLoaderSVG imgLoaded={imgLoaded} />
        </div>
    );
}

export default Image;
