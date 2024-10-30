// useScrollbar.ts
import { useRef } from "react";
import { Swiper as SwiperType } from "swiper";

const useScrollbar = (
  firstSwiper: SwiperType | null,
  secondSwiper: SwiperType | null,
  setScrollPosition: (position: number) => void,
  scrollPosition: number,
  thumbSize: number
) => {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollPosition = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startScrollPosition.current = scrollPosition;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const delta = e.clientX - startX.current;
    const scrollbarWidth = document.body.clientWidth; // Adjust if needed
    const maxScroll = 100 - thumbSize;
    const movePercent = (delta / scrollbarWidth) * 100;
    const newPosition = Math.max(
      0,
      Math.min(maxScroll, startScrollPosition.current + movePercent)
    );

    setScrollPosition(newPosition);

    if (firstSwiper && secondSwiper) {
      const progress = newPosition / maxScroll;
      const firstMaxSlide = firstSwiper.slides.length - 1;
      const secondMaxSlide = secondSwiper.slides.length - 1;

      firstSwiper.slideTo(Math.round(progress * firstMaxSlide));
      secondSwiper.slideTo(Math.round(progress * secondMaxSlide));
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return {
    handleMouseDown,
  };
};

export default useScrollbar;
