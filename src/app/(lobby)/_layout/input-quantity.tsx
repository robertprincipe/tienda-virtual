"use client";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useState, useEffect } from "react";

interface QuantityInputBasicProps {
  quantity: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (quantity: number) => void;
  className?: string;
}

export const QuantityInputBasic = ({
  className,
  disabled = false,
  max = 9,
  min = 1,
  onChange,
  quantity,
  step = 1,
}: QuantityInputBasicProps) => {
  // Internal state to handle input field text during editing
  const [inputValue, setInputValue] = useState(quantity.toString());

  // Update internal input value when external quantity prop changes
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleDecrease = () => {
    if (quantity - step >= min) {
      onChange(quantity - step);
    }
  };

  const handleIncrease = () => {
    if (quantity + step <= max) {
      onChange(quantity + step);
    }
  };

  const onChangeInput = (val: string) => {
    const value = parseInt(val);
    if (isNaN(value) || value < min) {
      // If invalid or below min, reset to min
      setInputValue(min.toString());
      onChange(min);
    } else if (value > max) {
      // If above max, reset to max
      setInputValue(max.toString());
      onChange(max);
    } else {
      // Ensure the displayed value matches the actual value
      setInputValue(value.toString());
      onChange(value);
    }
  };

  const handleInputChange = (val: string) => {
    onChangeInput(val);
  };

  const handleBlur = () => {
    // When the field loses focus, ensure we have a valid value

    onChangeInput(inputValue);
  };

  return (
    <div
      className={cn(
        "inline-flex cursor-pointer rounded-lg shadow-xs shadow-black/5",
        className
      )}
    >
      <button
        className={cn(
          "hover:bg-muted-foreground/10 flex cursor-pointer items-center justify-center rounded-s-lg border-2 border-black disabled:border-black/60 px-3 py-1 focus-visible:z-10 disabled:cursor-not-allowed",
          disabled && "pointer-events-none"
        )}
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <input
        type="number"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleInputChange(inputValue);
          }
        }}
        onBlur={handleBlur}
        className="w-12 border-y-2 border-y-black px-2 py-1 text-center font-mono outline-none appearance-none text-lg"
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Quantity"
      />
      <button
        className={cn(
          "hover:bg-muted-foreground/10 flex cursor-pointer items-center justify-center rounded-e-lg border-2 border-black disabled:border-black/60 px-3 py-1 focus-visible:z-10 disabled:cursor-not-allowed",
          disabled && "pointer-events-none"
        )}
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
};
