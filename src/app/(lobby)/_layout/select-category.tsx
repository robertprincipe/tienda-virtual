import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/services/categories/queries/category.query";

export default function SelectCategory({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { data } = useCategories();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-44 sm:w-[240px] h-11 bg-zinc-200 focus:ring-0 focus:ring-transparent focus:border-transparent rounded-none rounded-l-md border-none">
        <SelectValue placeholder="Todo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">Todo</SelectItem>
          {data?.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
