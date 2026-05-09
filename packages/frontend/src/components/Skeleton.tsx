interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  circle?: boolean;
}

export default function Skeleton({ width = "100%", height = "20px", className = "", circle = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? "50%" : "8px",
      }}
    />
  );
}
