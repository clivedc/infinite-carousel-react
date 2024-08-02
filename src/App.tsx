import Carousel from "./components/Carousel";
import Image from "./components/Image";

export default function App() {
    const slides = [
        { id: 237, desc: "black puppy" },
        { id: 238, desc: "Black and white cityscape" },
        { id: 239, desc: "Dandelion being held" },
    ].map((obj, index) => (
        <Image
            key={obj.id}
            src={`https://picsum.photos/id/${obj.id}/1600/900`}
            alt={obj.desc}
            lazy={index === 0 ? false : true}
            width="initial"
            height="initial"
        />
    ));

    return (
        <Carousel
            ariaLabel="demo"
            isInfinite={true}
            width="35rem"
            height="25rem"
        >
            {slides}
        </Carousel>
    );
}
