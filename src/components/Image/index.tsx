import { ComponentPropsWithoutRef, useState } from "react";
import ImgLoaderSVG from "./ImgLoaderSVG";
import styles from "./index.module.css";

interface ImageTypeProps extends ComponentPropsWithoutRef<"img"> {
    src: string;
    alt: string;
    width: string;
    height: string;
}

function Image({
    width = "100%",
    height = "100%",
    ...restProps
}: ImageTypeProps) {
    const [imgLoaded, setImgLoaded] = useState(false);

    function handleOnLoad() {
        setImgLoaded(true);
    }

    return (
        <div
            className={styles.imgWrapper}
            style={{ width: width, height: height }}
        >
            <img
                className={styles.imgWrapper__img}
                onLoad={handleOnLoad}
                draggable={false}
                {...restProps}
            />
            <ImgLoaderSVG imgLoaded={imgLoaded} />
        </div>
    );
}

export default Image;
