import Carousel from "./components/Carousel";

export default function App() {
    return (
        <Carousel
            ariaLabel="random"
            isInfinite={true}
            width="25rem"
            height="30rem"
        >
            {[
                { id: 237, desc: "black puppy" },
                { id: 238, desc: "Black and white cityscape" },
                { id: 239, desc: "Dandelion being held" },
            ].map((obj, index) => (
                <img
                    key={index}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                    draggable="false"
                    alt={obj.desc}
                    src={`https://picsum.photos/id/${obj.id}/500/300`}
                />
            ))}
        </Carousel>
    );
}
