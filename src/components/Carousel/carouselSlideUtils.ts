export async function animateFromLastToFirst(
    slidesTrack: HTMLDivElement,
    firstSlide: HTMLDivElement,
    totalSlides: number,
) {
    const slidesTrackStyles = getComputedStyle(slidesTrack);
    // This returns a matrix that needs to be parsed
    // The transformX property is the 5th element in the array after splitting the string
    const prevTransformX = slidesTrackStyles.transform.split(", ")[4];
    const animationEasing = slidesTrackStyles.getPropertyValue(
        "--transition-bezier",
    );
    // This always returns a duration in seconds eg. '0.5s'
    const animationDuration = slidesTrackStyles.transitionDuration;
    // split the string, this returns -> ['0.5', '']
    const animationDurationInSec = parseFloat(animationDuration.split('s')[0]);
    const animationDurationInMs = animationDurationInSec * 1000;

    const animation = slidesTrack.animate(
        {
            transform: [
                `translateX(${prevTransformX}px)`,
                `translateX(calc(${totalSlides} * -100%))`,
            ],
        },
        {
            duration: animationDurationInMs,
            easing: animationEasing,
        },
    );

    await animation.finished;
    // Add the waapi animation styles to the style tag and delete the keyframe
    animation.commitStyles();
    animation.cancel();

    // Reset styles set in js to make the track and the
    // first slide go back to their default positions
    firstSlide.dataset.appendedToEndOfTrack = "false";
    slidesTrack.removeAttribute("style");

    // After resetting styles, the track will go back to its original position
    // as specified in css (slideNo === 0)
    // We don't want to animate this to create the illusion of infinite slides
    slidesTrack.style.setProperty("--transition-duration", "0ms");

    // Reset styles (transition-duration set above) after browser
    // has finished painting the current frame. Nested raf waits until browser
    // paints the current frame and schedules the callback to be executed before
    // the next repaint (window between the next two paint cycles)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            slidesTrack.removeAttribute("style");
        });
    });
}

export async function animateFromFirstToLast(
    slidesTrack: HTMLDivElement,
    lastSlide: HTMLDivElement,
) {
    const slidesTrackStyles = getComputedStyle(slidesTrack);
    // This returns a matrix that needs to be parsed
    // The transformX property is the 5th element in the array after splitting the string
    const prevTransformX = slidesTrackStyles.transform.split(", ")[4];
    const animationEasing = slidesTrackStyles.getPropertyValue(
        "--transition-bezier",
    );
    // This always returns a duration in seconds eg. '0.5s'
    const animationDuration = slidesTrackStyles.transitionDuration;
    // split the string, this returns -> ['0.5', '']
    const animationDurationInSec = parseFloat(animationDuration.split('s')[0]);
    const animationDurationInMs = animationDurationInSec * 1000;

    const animation = slidesTrack.animate(
        {
            transform: [`translateX(${prevTransformX}px)`, `translateX(100%)`],
        },
        {
            duration: animationDurationInMs,
            easing: animationEasing,
        },
    );

    await animation.finished;
    // Add the waapi animation styles to the style tag and delete the keyframe
    animation.commitStyles();
    animation.cancel();

    // Reset styles set in js to make the track and the
    // last slide go back to their default positions
    lastSlide.dataset.prependedToStartOfTrack = "false";
    slidesTrack.removeAttribute("style");

    // After resetting styles, the track will go back to its original position
    // as specified in css (slideNo === totalSlides - 1)
    // We don't want to animate this to create the illusion of infinite slides
    slidesTrack.style.setProperty("--transition-duration", "0ms");

    // Reset styles (transition-duration set above) after browser
    // has finished painting the current frame. Nested raf waits until browser
    // paints the current frame and schedules the callback to be executed before
    // the next repaint (window between the next two paint cycles)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            slidesTrack.removeAttribute("style");
        });
    });
}
