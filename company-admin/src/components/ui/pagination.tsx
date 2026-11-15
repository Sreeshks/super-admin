import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, total_pages, total_items, page_size, has_previous, has_next } = meta;

  const startItem = total_items === 0 ? 0 : (page - 1) * page_size + 1;
  const endItem = Math.min(page * page_size, total_items);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-700">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-700">{total_items}</span> results
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!has_previous}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <span className="text-xs text-slate-600 font-medium px-2">
          Page {page} of {Math.max(total_pages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!has_next}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

