import { render, screen } from "@testing-library/react";
import userEvent, { Options } from "@testing-library/user-event";

import Carousel from "../index.tsx";

function renderCarousel(isInfinite: boolean) {
    render(
        <Carousel
            ariaLabel="random"
            isInfinite={isInfinite}
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
                    draggable={false}
                    alt={obj.desc}
                    src={`https://picsum.photos/id/${obj.id}/500/300`}
                />
            ))}
        </Carousel>,
    );
}

// jsdom doesn't yet implement 'animate' method of the web animations api
function mockWebAnimationsApi() {
    Element.prototype.animate = vi.fn().mockImplementation(() => ({
        finish: Promise.resolve(),
        commitStyles: vi.fn(),
        cancel: vi.fn(),
    }));
}

function setup(fakeTimers: boolean, isInfinite: boolean) {
    const options: Options | undefined = fakeTimers
        ? { advanceTimers: vi.advanceTimersByTime }
        : undefined;

    const user = userEvent.setup(options);
    renderCarousel(isInfinite);

    return user;
}

// Tests start here //////////////////////////////////////////////////////////

test("First slide is active when carousel first mounts", () => {
    const isInfinite = false;
    renderCarousel(isInfinite);

    const carouselDots = screen.getAllByRole("tab");
    // First slide is visible
    carouselDots.forEach((dot, index) => {
        if (index === 0) expect(dot).toHaveAttribute("aria-selected", "true");
        else expect(dot).toHaveAttribute("aria-selected", "false");
    });
});

describe("Carousel navigation with mouse", () => {
    test("Navigating between different slides when infinite navigation is not used", async () => {
        const fakeTimers = false;
        const isInfinite = false;
        const user = setup(fakeTimers, isInfinite);

        const prevBtn = screen.getByRole("button", { name: "Previous slide" });
        const nextBtn = screen.getByRole("button", { name: "Next slide" });
        const carouselDots = screen.getAllByRole("tab");

        // When on first slides, prev btn should be disabled with aria attribute
        expect(prevBtn).toHaveAttribute("aria-disabled", "true");

        await user.click(nextBtn);
        // Second slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 1)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        await user.click(nextBtn);
        // third/last slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 2)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        // When on last slides, prev btn should be disabled with aria attribute
        expect(nextBtn).toHaveAttribute("aria-disabled", "true");

        await user.click(prevBtn);
        // Second slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 1)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        await user.click(prevBtn);
        // First slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 0)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });
    });

    test("Going from first slide to last slide and vice versa when infinite navigation is used", async () => {
        mockWebAnimationsApi();

        const fakeTimers = false;
        const isInfinite = true;
        const user = setup(fakeTimers, isInfinite);

        const slidesTrack = screen.getByTestId("slidesTrack");
        const carouselDots = screen.getAllByRole("tab");
        const prevBtn = screen.getByRole("button", { name: /previous slide/i });
        const nextBtn = screen.getByRole("button", { name: /next slide/i });

        // Previous button should not be disabled when on first slide
        expect(prevBtn).toHaveAttribute("aria-disabled", "false");

        await user.click(prevBtn);

        // Check that animate method (waapi) on slides track is called
        expect(slidesTrack.animate).toHaveBeenCalled();

        // // Third slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 2)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        // Next button should not be disabled when on last slide
        expect(nextBtn).toHaveAttribute("aria-disabled", "false");

        await user.click(nextBtn);

        // Check that animate method (waapi) on slides track is called
        expect(slidesTrack.animate).toHaveBeenCalled();

        // First slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 0)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });
    });
});

describe("Carousel navigation with keyboard", () => {
    // Using fake timers as keyboard events are throttled
    beforeEach(() => {
		// Vitest fake timers workaround
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    test("Navigating between different slides when infinite navigation is not used", async () => {
        const fakeTimers = true;
        const isInfinite = false;
        const user = setup(fakeTimers, isInfinite);

        const carouselDots = screen.getAllByRole("tab");
        const prevBtn = screen.getByRole("button", { name: /previous slide/i });
        const nextBtn = screen.getByRole("button", { name: /next slide/i });

        await user.tab();
        // First carousel dot should be focused
        expect(carouselDots[0]).toHaveFocus();

        await user.keyboard("{ArrowRight}");
        // Second carousel dot should be focused
        expect(carouselDots[1]).toHaveFocus();
        // Second slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 1)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        // Allow next call to happen without throttling
        vi.runAllTimers();

        await user.keyboard("{ArrowRight}");
        // third/last carousel dot should be focused
        expect(carouselDots[2]).toHaveFocus();
        // third/last slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 2)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        // Allow next call to happen without throttling
        vi.runAllTimers();

        await user.keyboard("{ArrowLeft}");
        // Second carousel dot should still be focused
        expect(carouselDots[1]).toHaveFocus();
        // Second slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 1)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        await user.tab();
        // prev btn should be focused
        expect(prevBtn).toHaveFocus();

        await user.keyboard(" "); // space key
        // First slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 0)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        await user.tab();
        // next btn should be focused
        expect(nextBtn).toHaveFocus();

        await user.keyboard(" "); // space key
        // Second slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 1)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });
    });

    test("Going from first slide to last slide and vice versa when infinite navigation is used", async () => {
        mockWebAnimationsApi();

        const fakeTimers = true;
        const isInfinite = true;
        const user = setup(fakeTimers, isInfinite);

        const carouselDots = screen.getAllByRole("tab");
        const prevBtn = screen.getByRole("button", { name: /previous slide/i });
        const nextBtn = screen.getByRole("button", { name: /next slide/i });

        await user.tab();
        // First carousel dot should be focused
        expect(carouselDots[0]).toHaveFocus();

        await user.keyboard("{ArrowLeft}");
        // third/last carousel dot should still be focused
        expect(carouselDots[2]).toHaveFocus();
        // third/last slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 2)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        // Allow next call to happen without throttling
        vi.runAllTimers();

        await user.keyboard("{ArrowRight}");
        // First carousel dot should still be focused
        expect(carouselDots[0]).toHaveFocus();
        // First slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 0)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        await user.tab();
        // prev btn should be focused
        expect(prevBtn).toHaveFocus();

        await user.keyboard(" "); // space key
        // third/last slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 2)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });

        await user.tab();
        // next btn should be focused
        expect(nextBtn).toHaveFocus();

        await user.keyboard(" "); // space key
        // First slide should be visible
        carouselDots.forEach((dot, index) => {
            if (index === 0)
                expect(dot).toHaveAttribute("aria-selected", "true");
            else expect(dot).toHaveAttribute("aria-selected", "false");
        });
    });
});
