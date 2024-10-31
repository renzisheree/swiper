import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Controller, FreeMode, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import leftArrow from "./images/arrow-left.svg";
import rightArrow from "./images/arrow-right.svg";

import {
  Container,
  Title,
  LoadingMessage,
  DesktopSwiperWrapper,
  DesktopImageWrapper,
  MobileContainer,
  MobileImageWrapper,
  StyledImage,
  CircleButton,
  SwiperContainer,
  LeftArrow,
  RightArrow,
  Text,
  DragArea,
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
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [firstSwiper, setFirstSwiper] = useState<SwiperType | null>(null);
  const [secondSwiper, setSecondSwiper] = useState<SwiperType | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiperPosition, setSwiperPosition] = useState<
    "start" | "end" | "between"
  >("start");
  const [isDragging, setIsDragging] = useState(false);
  const DRAG_AREA_SIZE = 400; // Kích thước drag area
  const DRAG_AREA_PADDING = 20; // Padding từ mép drag area
  const [buttonPosition, setButtonPosition] = useState(() => ({
    x: DRAG_AREA_SIZE / 2,
    y: DRAG_AREA_SIZE / 2,
  }));
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastDragX = useRef(0);
  const dragAnimationRef = useRef<number>();
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
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
      console.error("Failed to load images:", err);
    } finally {
      setLoading(false);
    }
  }, [getRandomResolution, loadImage]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true);
      isDraggingRef.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      dragStartPosition.current = {
        x: clientX - buttonPosition.x,
        y: DRAG_AREA_SIZE / 2, // lock vị trí y
      };

      lastDragX.current = clientX;
      e.preventDefault();
    },
    [buttonPosition]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;

      const clientX =
        "touches" in e
          ? (e as TouchEvent).touches[0].clientX
          : (e as MouseEvent).clientX;

      // Tính toán vị trí mới, chỉ theo trục X
      let newX = clientX - dragStartPosition.current.x;

      // Giới hạn trong phạm vi cho phép + thêm padding
      newX = Math.max(
        DRAG_AREA_PADDING,
        Math.min(newX, DRAG_AREA_SIZE - DRAG_AREA_PADDING)
      );

      setButtonPosition({
        x: newX,
        y: DRAG_AREA_SIZE / 2,
      });

      if (firstSwiper) {
        const totalSlides = firstSwiper.slides.length - 1;
        const moveRatio = Math.min(
          1,
          (newX - DRAG_AREA_PADDING) / (DRAG_AREA_SIZE - 2 * DRAG_AREA_PADDING)
        );
        const targetIndex = Math.floor(moveRatio * totalSlides);

        // Di chuyển firstSwiper đến vị trí tương ứng
        firstSwiper.slideTo(targetIndex, 300);
      }

      e.preventDefault();
    },
    [firstSwiper]
  );
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;

    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
    }

    // Animate back to initial position
    setButtonPosition({
      x: DRAG_AREA_SIZE / 2,
      y: DRAG_AREA_SIZE / 2,
    });
  }, []);
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const position = swiper.isBeginning
      ? "start"
      : swiper.isEnd
      ? "end"
      : "between";
    setSwiperPosition(position);
  }, []);
  const { firstSwiperImages, secondSwiperImages } = useMemo(() => {
    const midPoint = Math.ceil(images.length / 2);
    return {
      firstSwiperImages: images.slice(0, midPoint),
      secondSwiperImages: images.slice(midPoint),
    };
  }, [images]);
  useEffect(() => {
    console.log(swiperPosition);
  }, [swiperPosition]);
  const swiperConfig: SwiperOptions = useMemo(
    () => ({
      modules: [Controller, Mousewheel, FreeMode, Autoplay],
      spaceBetween: 24,
      slidesPerView: "auto",
      mousewheel: {
        releaseOnEdges: true,
        sensitivity: 1.5,
        thresholdDelta: 50,
        thresholdTime: 100,
      },
      freeMode: {
        enabled: true,
        sticky: false,
        momentumBounce: true,
        momentumRatio: 0.5,
        momentumVelocityRatio: 0.5,
      },
      speed: 600,
      onSlideChange: handleSlideChange,
      onReachBeginning: () => setSwiperPosition("start"),
      onReachEnd: () => setSwiperPosition("end"),
    }),
    [handleSlideChange]
  );

  const firstSwiperConfig: SwiperOptions = useMemo(
    () => ({
      ...swiperConfig,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
    }),
    [swiperConfig]
  );

  if (loading) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

  if (isMobile) {
    return (
      <MobileContainer>
        <Title $ismobile>Image Gallery</Title>
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
      <Title $ismobile={false}>Image Gallery</Title>
      <SwiperContainer $scrollPosition={swiperPosition}>
        {[firstSwiperImages, secondSwiperImages].map((swiperImages, index) => (
          <DesktopSwiperWrapper $scrollPosition={swiperPosition} key={index}>
            <Swiper
              {...(index === 0 ? firstSwiperConfig : swiperConfig)}
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
        <DragArea $size={DRAG_AREA_SIZE}>
          <CircleButton
            $isDragging={isDragging}
            $x={buttonPosition.x}
            $y={buttonPosition.y}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <LeftArrow src={leftArrow} alt="Left Arrow" />
            <Text>Kéo</Text>
            <RightArrow src={rightArrow} alt="Right Arrow" />
          </CircleButton>
        </DragArea>
      </SwiperContainer>
    </Container>
  );
};

export default ImageGallery;
