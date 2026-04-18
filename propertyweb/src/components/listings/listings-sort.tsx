"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ListingsSort({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const sp = new URLSearchParams(params.toString());
        if (next === "relevance") sp.delete("sort");
        else sp.set("sort", next);
        sp.delete("page");
        router.push(`${pathname}?${sp.toString()}`);
      }}
    >
      <SelectTrigger className="h-10 w-[190px]">
        <SelectValue placeholder="Relevance" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">Relevance</SelectItem>
        <SelectItem value="price_low">Price: Low to High</SelectItem>
        <SelectItem value="price_high">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  );
}

