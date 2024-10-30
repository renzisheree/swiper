// Scrollbar.tsx
import React, { forwardRef } from "react";
import styled from "styled-components";

const ScrollbarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-top: 24px;
  overflow: hidden;
`;

const ScrollbarThumb = styled.div<{ position: number; size: number }>`
  position: absolute;
  height: 100%;
  width: ${(props) => props.size}%;
  left: ${(props) => props.position}%;
  background-color: #e87722;
  border-radius: 4px;
  transition: left 0.1s ease, background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: #e87722;
  }

  &:active {
    background-color: #e87722;
  }
`;

interface ScrollbarProps {
  position: number;
  size: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(
  ({ position, size, onMouseDown }, ref) => (
    <ScrollbarContainer ref={ref}>
      <ScrollbarThumb
        position={position}
        size={size}
        onMouseDown={onMouseDown}
      />
    </ScrollbarContainer>
  )
);

export default Scrollbar;
