import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Controller, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import {
  Container,
  DesktopImageWrapper,
  DesktopSwiperWrapper,
  LoadingMessage,
  MobileContainer,
  MobileImageWrapper,
  StyledImage,
  Title,
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
  const [allImages, setAllImages] = useState<LoadedImage[]>([]);
  const [firstSwiper, setFirstSwiper] = useState<any>(null);
  const [secondSwiper, setSecondSwiper] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Trạng thái loading

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRandomResolution = () => {
    //random tỷ lệ ảnh để test
    const aspectRatios = [
      { width: 1200, height: 800 }, // 3:2
      { width: 1200, height: 1200 }, // 1:1
      { width: 800, height: 1200 }, // 2:3
      { width: 1200, height: 675 }, // 16:9
    ];
    return aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
  };

  const loadImages = async () => {
    const imageUrls = Array.from({ length: 30 }, (_, index) => {
      const { width, height } = getRandomResolution();
      return `https://picsum.photos/${width}/${height}?random=${index}`;
    });
    // set width và height của image từ image fetch
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

    // chia ảnh làm 2 phần để đẩy vào 2 swiper
    const shuffledImages = loadedImages.sort(() => Math.random() - 0.5);
    const midPoint = Math.ceil(shuffledImages.length / 2);

    setFirstSwiperImages(shuffledImages.slice(0, midPoint));
    setSecondSwiperImages(shuffledImages.slice(midPoint));
    setAllImages(shuffledImages);
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);
  //loading
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
              {allImages.map((image, index) => (
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
      <DesktopSwiperWrapper>
        <Swiper
          modules={[Controller]}
          onSwiper={setFirstSwiper}
          controller={{ control: secondSwiper }}
          slidesPerView="auto"
          spaceBetween={24}
        >
          {firstSwiperImages.map((image, index) => (
            <SwiperSlide key={`first-${index}`}>
              <DesktopImageWrapper
                $width={
                  (image.dimensions.width / image.dimensions.height) * 366 // tính chiều rộng cố định của 1 ảnh từ chiều cao mặc định (366px)
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

      <DesktopSwiperWrapper>
        <Swiper
          modules={[Controller]}
          onSwiper={setSecondSwiper}
          controller={{ control: firstSwiper }}
          slidesPerView="auto"
          spaceBetween={24}
        >
          {secondSwiperImages.map((image, index) => (
            <SwiperSlide key={`second-${index}`}>
              <DesktopImageWrapper
                $width={
                  (image.dimensions.width / image.dimensions.height) * 333 // tính chiều rộng cố định của 1 ảnh từ chiều cao mặc định (333px)
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
