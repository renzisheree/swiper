import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Controller, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

import {
  Container,
  Title,
  LoadingMessage,
  DesktopSwiperWrapper,
  DesktopImageWrapper,
  MobileContainer,
  MobileImageWrapper,
  StyledImage,
} from "./styled";
import Scrollbar from "../scrollbar";
import useScrollbar from "../../hooks/useScrollbar";

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface LoadedImage {
  src: string;
  dimensions: ImageDimensions;
}

const ImageGallery: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [firstSwiperImages, setFirstSwiperImages] = useState<LoadedImage[]>([]);
  const [secondSwiperImages, setSecondSwiperImages] = useState<LoadedImage[]>(
    []
  );
  const [firstSwiper, setFirstSwiper] = useState<SwiperType | null>(null);
  const [secondSwiper, setSecondSwiper] = useState<SwiperType | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiperPosition, setSwiperPosition] = useState<
    "start" | "end" | "between"
  >("start");

  const [scrollPosition, setScrollPosition] = useState(0);
  const [thumbSize, setThumbSize] = useState(20);

  const scrollbarRef = useRef<HTMLDivElement>(null);
  const { handleMouseDown } = useScrollbar(
    firstSwiper,
    secondSwiper,
    setScrollPosition,
    scrollPosition,
    thumbSize
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateScrollbar = (swiper: SwiperType) => {
    const progress = swiper.progress;
    const maxSlides = swiper.slides.length;
    const visibleSlides =
      swiper.params.slidesPerView === "auto"
        ? Math.ceil(swiper.slides.length / 2)
        : (swiper.params.slidesPerView as number);

    const thumbSizePercent = Math.min((visibleSlides / maxSlides) * 100, 100);
    const maxScrollPosition = 100 - thumbSizePercent;
    const currentPosition = progress * maxScrollPosition;

    setThumbSize(thumbSizePercent);
    setScrollPosition(currentPosition);
  };

  const loadImages = async () => {
    const imageUrls = Array.from({ length: 30 }, (_, index) => {
      const { width, height } = getRandomResolution();
      return `https://picsum.photos/${width}/${height}?random=${index}`;
    });

    const loadedImages = await Promise.all(
      imageUrls.map((url) => {
        return new Promise<LoadedImage>((resolve) => {
          const img = new Image();
          img.src = url;

          img.onload = () => {
            resolve({
              src: url,
              dimensions: {
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight,
              },
            });
          };

          img.onerror = () => {
            resolve({
              src: url,
              dimensions: {
                width: 400,
                height: 300,
                aspectRatio: 4 / 3,
              },
            });
          };
        });
      })
    );

    const shuffledImages = loadedImages.sort(() => Math.random() - 0.5);
    const midPoint = Math.ceil(shuffledImages.length / 2);

    setFirstSwiperImages(shuffledImages.slice(0, midPoint));
    setSecondSwiperImages(shuffledImages.slice(midPoint));
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleSlideChange = (swiper: SwiperType) => {
    updateScrollbar(swiper);
    const isStart = swiper.isBeginning;
    const isEnd = swiper.isEnd;

    if (isStart) setSwiperPosition("start");
    else if (isEnd) setSwiperPosition("end");
    else setSwiperPosition("between");
  };

  if (loading) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

  if (isMobile) {
    return (
      <MobileContainer>
        <Title $isMobile={true}>Thư viện hình ảnh</Title>
        <Swiper
          direction="vertical"
          className="mobile-swiper"
          slidesPerView="auto"
          spaceBetween={16}
          freeMode={true}
          modules={[FreeMode]}
        >
          <SwiperSlide>
            <div>
              {firstSwiperImages
                .concat(secondSwiperImages)
                .map((image, index) => (
                  <MobileImageWrapper
                    key={`mobile-image-${index}`}
                    $aspectRatio={image.dimensions.aspectRatio}
                  >
                    <StyledImage
                      src={image.src}
                      alt={`Image ${index}`}
                      loading="lazy"
                    />
                  </MobileImageWrapper>
                ))}
            </div>
          </SwiperSlide>
        </Swiper>
      </MobileContainer>
    );
  }

  return (
    <Container $isMobile={false}>
      <Title $isMobile={false}>Thư viện hình ảnh</Title>
      <DesktopSwiperWrapper $scrollPosition={swiperPosition}>
        <Swiper
          modules={[Controller]}
          onSwiper={setFirstSwiper}
          controller={{ control: secondSwiper }}
          slidesPerView="auto"
          spaceBetween={24}
          onSlideChange={handleSlideChange}
        >
          {firstSwiperImages.map((image, index) => (
            <SwiperSlide key={`first-${index}`}>
              <DesktopImageWrapper
                $width={
                  (image.dimensions.width / image.dimensions.height) * 366
                }
              >
                <StyledImage
                  src={image.src}
                  alt={`Image ${index}`}
                  loading="lazy"
                />
              </DesktopImageWrapper>
            </SwiperSlide>
          ))}
        </Swiper>
      </DesktopSwiperWrapper>

      <DesktopSwiperWrapper $scrollPosition={swiperPosition}>
        <Swiper
          modules={[Controller]}
          onSwiper={setSecondSwiper}
          controller={{ control: firstSwiper }}
          slidesPerView="auto"
          spaceBetween={24}
          onSlideChange={handleSlideChange}
        >
          {secondSwiperImages.map((image, index) => (
            <SwiperSlide key={`second-${index}`}>
              <DesktopImageWrapper
                $width={
                  (image.dimensions.width / image.dimensions.height) * 366
                }
              >
                <StyledImage
                  src={image.src}
                  alt={`Image ${index}`}
                  loading="lazy"
                />
              </DesktopImageWrapper>
            </SwiperSlide>
          ))}
        </Swiper>
      </DesktopSwiperWrapper>

      <Scrollbar
        ref={scrollbarRef}
        position={scrollPosition}
        size={thumbSize}
        onMouseDown={handleMouseDown}
      />
    </Container>
  );
};

export default ImageGallery;

const getRandomResolution = () => {
  const aspectRatios = [
    { width: 1200, height: 800 },
    { width: 1200, height: 1200 },
    { width: 800, height: 1200 },
    { width: 1200, height: 675 },
  ];
  return aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
};
