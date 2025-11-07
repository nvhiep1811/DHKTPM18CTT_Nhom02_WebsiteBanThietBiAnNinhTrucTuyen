import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number; // Trang hiện tại (0-based)
  totalPages: number;
  totalElements?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const maxVisible = 5;
  const start = Math.max(0, Math.min(page - 2, totalPages - maxVisible));
  const end = Math.min(totalPages, start + maxVisible);

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-8">
      {/* Tổng sản phẩm */}
      {totalElements !== undefined && (
        <p className="text-gray-600 text-sm">
          Tổng cộng <span className="font-medium">{totalElements}</span> sản phẩm
        </p>
      )}

      {/* ======= Desktop / Tablet view ======= */}
      <div className="hidden sm:flex flex-wrap items-center justify-center gap-4">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Trang số */}
        <div className="flex gap-1">
          {Array.from({ length: end - start }, (_, i) => i + start).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1 rounded-md border text-sm ${
                p === page
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p + 1}
            </button>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Thông tin trang */}
        <span className="text-gray-700 text-sm">
          Trang <strong>{page + 1}</strong> / {totalPages || 1}
        </span>

        {/* Dropdown chọn số sản phẩm */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="pageSize" className="text-gray-600">
              Hiển thị:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:ring-2 focus:ring-purple-500"
            >
              {[12, 24, 48, 96].map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ======= Compact view (mobile) ======= */}
      <div className="flex sm:hidden items-center justify-center gap-4 w-full">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="flex-1 p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="inline h-4 w-4 mr-1" />
          Trước
        </button>

        <span className="text-gray-700 text-sm">
          {page + 1} / {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          className="flex-1 p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Sau
          <ChevronRight className="inline h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;