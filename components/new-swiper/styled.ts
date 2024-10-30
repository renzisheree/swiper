import styled from "styled-components";
export interface PaginationDotProps {
  $isActive: boolean;
}

export interface ContainerProps {
  $isMobile: boolean;
}

export interface TitleProps {
  $isMobile: boolean;
}

export interface DesktopImageWrapperProps {
  $width: number;
}

export interface MobileImageWrapperProps {
  $aspectRatio: number;
}

export type ScrollPosition = "start" | "end" | "between";

export interface DesktopSwiperWrapperProps {
  $scrollPosition: ScrollPosition;
}

export const Container = styled.div<ContainerProps>`
  ${(props) =>
    props.$isMobile
      ? `
    height: 100vh;
    width: 100%;
    padding: 16px;
  `
      : `
    margin: 0 48px;
    padding: 16px;
  `}
`;

export const Title = styled.h1<TitleProps>`
  color: #e87722;
  font-size: ${(props) => (props.$isMobile ? "20px" : "39px")};
  font-weight: 700;
  line-height: ${(props) => (props.$isMobile ? "25px" : "48.75px")};
  text-align: center;
  margin-bottom: ${(props) => (props.$isMobile ? "16px" : "32px")};
`;

export const LoadingMessage = styled.div`
  text-align: center;
  font-size: 24px;
  color: #e87722;
  margin-top: 20px;
`;

export const DesktopSwiperWrapper = styled.div<DesktopSwiperWrapperProps>`
  position: relative;
  margin-bottom: 20px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    height: 100%;
    width: 96px;
    pointer-events: none;
    z-index: 10;
    transition: opacity 0.3s ease;
  }

  &::before {
    left: 0;
    background: linear-gradient(
      to left,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 1)
    );
    opacity: ${(props) => {
      switch (props.$scrollPosition) {
        case "end":
          return 1;
        case "between":
          return 1;
        case "start":
        default:
          return 0;
      }
    }};
  }

  &::after {
    right: 0;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 1)
    );
    opacity: ${(props) => {
      switch (props.$scrollPosition) {
        case "start":
          return 1;
        case "between":
          return 1;
        case "end":
        default:
          return 0;
      }
    }};
  }

  .swiper {
    width: 100%;
  }

  .swiper-slide {
    width: auto;
  }
`;

export const DesktopImageWrapper = styled.div<DesktopImageWrapperProps>`
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  width: ${(props) => props.$width}px;
`;

export const MobileContainer = styled.div`
  height: 100vh;
  width: 100%;
  padding: 0 16px;

  .mobile-swiper {
    height: calc(100vh - 30px);
    width: 100%;
  }

  .swiper-slide {
    height: auto;
  }
`;

export const MobileImageWrapper = styled.div<MobileImageWrapperProps>`
  position: relative;
  width: 100%;
  padding-top: ${(props) => 100 / props.$aspectRatio}%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: #f5f5f5;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const StyledImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
  object-position: center;
`;
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

export const PaginationWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const PaginationDot = styled.button<PaginationDotProps>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => (props.$isActive ? "#e87722" : "#D9D9D9")};
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.$isActive ? "#e87722" : "#BFBFBF")};
  }
`;
