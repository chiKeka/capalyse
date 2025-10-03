'use client';

// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
import React from 'react';
import EmptyBox from '../sections/dashboardCards/emptyBox';
import { Loader2Icon } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
};

type ReusableTableProps<T> = {
  columns: any;
  data: T[];
  className?: string;
  rowsPerPage?: number;

  page?: number;
  setPage?: (page: number) => void;
  totalPages?: number;
  loading?: boolean;
  noDataText?: string;
  noDataCaption?: string;
};

export function ReusableTable<T extends object>({
  columns,
  data = [],
  className = '',
  page = 1,
  setPage,
  totalPages,
  loading,
  noDataText = 'No Programs found check back later, any new program added will be found here',
  noDataCaption = 'No Programs found check back later',
}: ReusableTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-lg  bg-white ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((col: any, idx: number) => (
              <th
                key={idx}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase ${
                  col.className || ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex items-center justify-center mt-6 min-h-40">
                  <Loader2Icon className="text-green animate-spin w-12 h-12" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyBox
                  showButton={false}
                  caption2={noDataText}
                  caption={noDataCaption}
                />
              </td>
            </tr>
          ) : null}

          {data &&
            data?.map((row, ridx) => (
              <tr key={ridx} className="hover:bg-gray-50 border">
                {columns.map((col: any, cidx: number) => (
                  <td
                    key={cidx}
                    className={`px-4 py-3 text-sm ${col.className || ''}`}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row as any)[col.accessor] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {totalPages && totalPages > 1 ? (
        <div className="pt-5">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage?.(page - 1);
                  }}
                  aria-disabled={page === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    href="#"
                    isActive={page === idx + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage?.(idx + 1);
                    }}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage?.(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
