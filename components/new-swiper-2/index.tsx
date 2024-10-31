import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Controller, FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

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
import { SwiperOptions } from "swiper/types";

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

interface LoadedImage {
  src: string;
  dimensions: ImageDimensions;
}

const MOBILE_BREAKPOINT = 768;
const IMAGE_COUNT = 31;
const DEFAULT_DIMENSIONS = {
  width: 400,
  height: 300,
  aspectRatio: 4 / 3,
} as const;

const ASPECT_RATIOS = [
  { width: 1200, height: 800 }, // 3:2
  { width: 1200, height: 1200 }, // 1:1
  { width: 800, height: 1200 }, // 2:3
  { width: 1200, height: 675 }, // 16:9
] as const;

const ImageGallery: React.FC = () => {
  const [ismobile, setismobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [firstSwiper, setFirstSwiper] = useState<SwiperType | null>(null);
  const [secondSwiper, setSecondSwiper] = useState<SwiperType | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiperPosition, setSwiperPosition] = useState<
    "start" | "end" | "between"
  >("start");

  const handleResize = useCallback(() => {
    setismobile(window.innerWidth <= MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const getRandomResolution = useCallback(() => {
    return ASPECT_RATIOS[Math.floor(Math.random() * ASPECT_RATIOS.length)];
  }, []);

  const loadImage = useCallback((url: string): Promise<LoadedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;

      const handleLoad = () => {
        resolve({
          src: url,
          dimensions: {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
          },
        });
      };

      const handleError = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.addEventListener("load", handleLoad);
      img.addEventListener("error", handleError);
      return () => {
        img.removeEventListener("load", handleLoad);
        img.removeEventListener("error", handleError);
      };
    });
  }, []);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);

      const imageUrls = Array.from({ length: IMAGE_COUNT }, (_, index) => {
        const { width, height } = getRandomResolution();
        return `https://picsum.photos/${width}/${height}?random=${index}`;
      });

      const loadedImages = await Promise.all(
        imageUrls.map((url) =>
          loadImage(url).catch(() => ({
            src: url,
            dimensions: DEFAULT_DIMENSIONS,
          }))
        )
      );

      setImages(loadedImages.sort(() => Math.random() - 0.5));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [getRandomResolution, loadImage]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setSwiperPosition(
      swiper.isBeginning ? "start" : swiper.isEnd ? "end" : "between"
    );
  }, []);

  const { firstSwiperImages, secondSwiperImages } = useMemo(() => {
    const midPoint = Math.ceil(images.length / 2);
    return {
      firstSwiperImages: images.slice(0, midPoint),
      secondSwiperImages: images.slice(midPoint),
    };
  }, [images]);

  const swiperConfig: SwiperOptions = useMemo(
    () => ({
      modules: [Controller, Mousewheel, FreeMode, Autoplay],
      spaceBetween: 24,
      slidesPerView: "auto" as const,
      autoplay: {
        delay: 5000,
      },
      mousewheel: {
        // scroll
        releaseOnEdges: true,
        sensitivity: 1.5, // độ nhạy khi lăn chuột
        thresholdDelta: 50,
        thresholdTime: 100,
      },
      freeMode: {
        // kéo không đồng bộ giữa 2 swiper
        enabled: true,
        sticky: false,
        momentumBounce: true,
        momentumRatio: 0.8,
        momentumVelocityRatio: 0.8,
        minimumVelocity: 0.5,
      },
      speed: 600,
      resistance: true,
      resistanceRatio: 0.5,
      disableOnInteraction: true,
      preventInteractionOnTransition: true,
      onSlideChange: handleSlideChange,
      onReachBeginning: () => setSwiperPosition("start"),
      onReachEnd: () => setSwiperPosition("end"),
    }),
    [handleSlideChange]
  );

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;

  if (ismobile) {
    return (
      <MobileContainer>
        <Title $ismobile>Thư viện hình ảnh</Title>
        <Swiper
          {...swiperConfig}
          direction="vertical"
          className="mobile-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={`mobile-image-${index}`}>
              <MobileImageWrapper $aspectRatio={image.dimensions.aspectRatio}>
                <StyledImage
                  src={image.src}
                  alt={`Image ${index + 1}`}
                  loading="lazy"
                />
              </MobileImageWrapper>
            </SwiperSlide>
          ))}
        </Swiper>
      </MobileContainer>
    );
  }

  return (
    <Container $ismobile={false}>
      <Title $ismobile={false}>Thư viện hình ảnh</Title>
      {[firstSwiperImages, secondSwiperImages].map((swiperImages, index) => (
        <DesktopSwiperWrapper key={index} $scrollPosition={swiperPosition}>
          <Swiper
            {...swiperConfig}
            onSwiper={index === 0 ? setFirstSwiper : setSecondSwiper}
            controller={{
              control: index === 0 ? secondSwiper : firstSwiper,
              by: "container",
            }}
          >
            {swiperImages.map((image, imageIndex) => (
              <SwiperSlide key={`swiper-${index}-${imageIndex}`}>
                <DesktopImageWrapper
                  $width={
                    (image.dimensions.width / image.dimensions.height) * 366
                  }
                >
                  <StyledImage
                    src={image.src}
                    alt={`Image ${imageIndex + 1}`}
                    loading="lazy"
                  />
                </DesktopImageWrapper>
              </SwiperSlide>
            ))}
          </Swiper>
        </DesktopSwiperWrapper>
      ))}
    </Container>
  );
};

export default ImageGallery;
