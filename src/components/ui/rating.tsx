import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  precision?: number;
  max?: number;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({
  value,
  onChange,
  precision = 1,
  max = 5,
  readOnly = false,
  size = "md",
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const [displayValue, setDisplayValue] = React.useState(value);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleClick = (newValue: number) => {
    if (readOnly || !onChange) return;
    onChange(newValue);
    setDisplayValue(newValue);
  };

  const handleMouseEnter = (newValue: number) => {
    if (readOnly) return;
    setHoverValue(newValue);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  React.useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const currentValue = hoverValue ?? displayValue;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= currentValue;
        const isHalfFilled = precision === 0.5 && starValue - 0.5 <= currentValue && starValue > currentValue;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            className={cn(
              "transition-all disabled:cursor-default relative",
              !readOnly && "cursor-pointer hover:scale-110",
              sizeClasses[size]
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              )}
            />
            {isHalfFilled && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                <Star
                  className={cn(
                    sizeClasses[size],
                    "fill-yellow-400 text-yellow-400"
                  )}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

