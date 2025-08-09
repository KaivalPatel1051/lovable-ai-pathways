// src/components/TargetCursor.tsx
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import "./TargetCursor.css";

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
}

const TargetCursor: React.FC<TargetCursorProps> = ({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  const constants = useMemo(
    () => ({
      borderWidth: 3,
      cornerSize: 12,
      parallaxStrength: 0.00005,
    }),
    []
  );

  const moveCursor = useCallback((x: number, y: number) => {
    if (!cursorRef.current) return;
    cursorRef.current.style.transform = `translate(${x - 25}px, ${y - 25}px)`;
  }, []);

  useEffect(() => {
    if (!cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll<HTMLDivElement>(
      ".target-cursor-corner"
    );

    let activeTarget: Element | null = null;
    let currentTargetMove: ((ev: Event) => void) | null = null;
    let currentLeaveHandler: (() => void) | null = null;

    // Initial position
    cursor.style.transform = `translate(${window.innerWidth / 2 - 25}px, ${window.innerHeight / 2 - 25}px)`;

    const cleanupTarget = (target: Element) => {
      if (currentTargetMove) {
        target.removeEventListener("mousemove", currentTargetMove);
      }
      if (currentLeaveHandler) {
        target.removeEventListener("mouseleave", currentLeaveHandler);
      }
      currentTargetMove = null;
      currentLeaveHandler = null;
    };

    const moveHandler = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener("mousemove", moveHandler);

    const mouseDownHandler = (): void => {
      if (!dotRef.current || !cursorRef.current) return;
      dotRef.current.style.transform = 'scale(0.7)';
      cursorRef.current.style.transform += ' scale(0.9)';
    };

    const mouseUpHandler = (): void => {
      if (!dotRef.current || !cursorRef.current) return;
      dotRef.current.style.transform = 'scale(1)';
      cursorRef.current.style.transform = cursorRef.current.style.transform.replace(' scale(0.9)', '');
    };

    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    const enterHandler = (e: MouseEvent) => {
      const directTarget = e.target as Element;
      const target = directTarget.closest(targetSelector);
      
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      activeTarget = target;

      const updateCorners = (mouseX?: number, mouseY?: number) => {
        if (!cornersRef.current || !cursorRef.current) return;
        
        const rect = target.getBoundingClientRect();
        const cursorRect = cursorRef.current.getBoundingClientRect();

        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        const [tlc, trc, brc, blc] = Array.from(cornersRef.current);
        const { borderWidth, cornerSize } = constants;

        const tlOffset = {
          x: rect.left - cursorCenterX - borderWidth,
          y: rect.top - cursorCenterY - borderWidth,
        };
        const trOffset = {
          x: rect.right - cursorCenterX + borderWidth - cornerSize,
          y: rect.top - cursorCenterY - borderWidth,
        };
        const brOffset = {
          x: rect.right - cursorCenterX + borderWidth - cornerSize,
          y: rect.bottom - cursorCenterY + borderWidth - cornerSize,
        };
        const blOffset = {
          x: rect.left - cursorCenterX - borderWidth,
          y: rect.bottom - cursorCenterY + borderWidth - cornerSize,
        };

        tlc.style.transform = `translate(${tlOffset.x}px, ${tlOffset.y}px)`;
        trc.style.transform = `translate(${trOffset.x}px, ${trOffset.y}px)`;
        brc.style.transform = `translate(${brOffset.x}px, ${brOffset.y}px)`;
        blc.style.transform = `translate(${blOffset.x}px, ${blOffset.y}px)`;
      };

      updateCorners();

      const targetMove = (ev: Event) => {
        const mouseEvent = ev as MouseEvent;
        updateCorners(mouseEvent.clientX, mouseEvent.clientY);
      };

      const leaveHandler = () => {
        activeTarget = null;

        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
          ];

          corners.forEach((corner, index) => {
            corner.style.transform = `translate(${positions[index].x}px, ${positions[index].y}px)`;
          });
        }

        cleanupTarget(target);
      };

      currentTargetMove = targetMove;
      currentLeaveHandler = leaveHandler;

      target.addEventListener("mousemove", targetMove);
      target.addEventListener("mouseleave", leaveHandler);
    };

    window.addEventListener("mouseover", enterHandler);

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseover", enterHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      document.body.style.cursor = originalCursor;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor]);

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <motion.div 
        ref={dotRef} 
        className="target-cursor-dot"
        animate={{ rotate: 360 }}
        transition={{ duration: spinDuration, repeat: Infinity, ease: "linear" }}
      />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

export default TargetCursor;
