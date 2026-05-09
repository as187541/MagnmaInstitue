import { ReactNode } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-in" | "slide-scale";
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 800,
  threshold = 0.1,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold });

  const getInitialTransform = () => {
    switch (animation) {
      case "fade-up": return "translateY(40px)";
      case "fade-down": return "translateY(-30px)";
      case "fade-left": return "translateX(-40px)";
      case "fade-right": return "translateX(40px)";
      case "scale-in": return "scale(0.9)";
      case "slide-scale": return "translateY(30px) scale(0.95)";
      default: return "translateY(40px)";
    }
  };

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "none" : getInitialTransform(),
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
