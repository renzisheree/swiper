import React, { useState, useEffect } from "react";
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
  ScrollPosition,
} from "./styled";

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
  const [firstSwiperPosition, setFirstSwiperPosition] =
    useState<ScrollPosition>("start");
  const [secondSwiperPosition, setSecondSwiperPosition] =
    useState<ScrollPosition>("start");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSlideChange = (
    swiper: SwiperType,
    setPosition: (pos: ScrollPosition) => void
  ) => {
    const isStart = swiper.isBeginning;
    const isEnd = swiper.isEnd;

    if (isStart) {
      setPosition("start");
    } else if (isEnd) {
      setPosition("end");
    } else {
      setPosition("between");
    }
  };

  const getRandomResolution = () => {
    const aspectRatios = [
      { width: 1200, height: 800 },
      { width: 1200, height: 1200 },
      { width: 800, height: 1200 },
      { width: 1200, height: 675 },
    ];
    return aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
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
      <DesktopSwiperWrapper $scrollPosition={firstSwiperPosition}>
        <Swiper
          modules={[Controller]}
          onSwiper={setFirstSwiper}
          controller={{ control: secondSwiper }}
          slidesPerView="auto"
          spaceBetween={24}
          onSlideChange={(swiper) =>
            handleSlideChange(swiper, setFirstSwiperPosition)
          }
          onReachBeginning={() => setFirstSwiperPosition("start")}
          onReachEnd={() => setFirstSwiperPosition("end")}
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

      <DesktopSwiperWrapper $scrollPosition={secondSwiperPosition}>
        <Swiper
          modules={[Controller]}
          onSwiper={setSecondSwiper}
          controller={{ control: firstSwiper }}
          slidesPerView="auto"
          spaceBetween={24}
          onSlideChange={(swiper) =>
            handleSlideChange(swiper, setSecondSwiperPosition)
          }
          onReachBeginning={() => setSecondSwiperPosition("start")}
          onReachEnd={() => setSecondSwiperPosition("end")}
        >
          {secondSwiperImages.map((image, index) => (
            <SwiperSlide key={`second-${index}`}>
              <DesktopImageWrapper
                $width={
                  (image.dimensions.width / image.dimensions.height) * 333
                }
              >
                <StyledImage
                  src={image.src}
                  alt={`Image ${index + firstSwiperImages.length}`}
                  loading="lazy"
                />
              </DesktopImageWrapper>
            </SwiperSlide>
          ))}
        </Swiper>
      </DesktopSwiperWrapper>
    </Container>
  );
};

export default ImageGallery;
