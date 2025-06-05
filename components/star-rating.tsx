"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
    value?: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
}

export const StarRating = ({ 
    value = 0, 
    onChange, 
    readonly = false,
    size = "md" 
}: StarRatingProps) => {
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    const sizeClasses = {
        sm: "h-3 w-3",
        md: "h-4 w-4", 
        lg: "h-5 w-5"
    };

    const handleStarClick = (rating: number) => {
        if (readonly) return;
        onChange?.(rating);
    };

    const handleStarHover = (rating: number) => {
        if (readonly) return;
        setHoveredStar(rating);
    };

    const handleMouseLeave = () => {
        if (readonly) return;
        setHoveredStar(null);
    };

    return (
        <div 
            className="flex items-center gap-1"
            onMouseLeave={handleMouseLeave}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoveredStar !== null ? hoveredStar : value) >= star;
                
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        disabled={readonly}
                        className={cn(
                            "transition-colors",
                            !readonly && "hover:scale-110 cursor-pointer",
                            readonly && "cursor-default"
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                "transition-colors",
                                isFilled 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-gray-300 hover:text-yellow-400"
                            )}
                        />
                    </button>
                );
            })}
            {value > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                    ({value}/5)
                </span>
            )}
        </div>
    );
};