import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as React from "react";

type ChipProps = {
  label: string;
  className?: string;
  textClassName?: string;
  variant?: BadgeProps["variant"];
};

export default function Chip({
  label,
  className,
  textClassName,
  variant = "secondary",
}: ChipProps) {
  return (
    <Badge
      variant={variant}
      className={cn("rounded-full px-2.5 py-1", className)}
    >
      <Text className={cn("text-[11px] font-semibold", textClassName)}>
        {label}
      </Text>
    </Badge>
  );
}

