import React from 'react';

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
};

type ReusableTableProps<T> = {
  columns: any;
  data: T[];
  className?: string;
};

export function ReusableTable<T extends object>({
  columns,
  data,
  className = '',
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
          {data.map((row, ridx) => (
            <tr key={ridx} className="hover:bg-gray-50 border">
              {columns.map((col: any, cidx: number) => (
                <td
                  key={cidx}
                  className={`px-4 py-3 text-sm ${col.className || ''}`}
                >
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row as any)[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
