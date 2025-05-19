import React from 'react';
import { classNames } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

function Table<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  onRowClick,
  className,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full py-10 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-10 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={classNames("overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg", className || "")}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={classNames(
                  "py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900",
                  column.className || ""
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column, colIndex) => {
                const key = column.key as string;
                return (
                  <td
                    key={colIndex}
                    className={classNames(
                      "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900",
                      column.className || ""
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : key.includes('.')
                      ? getNestedProperty(item, key)
                      : item[key as keyof T]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to get nested property values (e.g., 'user.name')
function getNestedProperty<T>(obj: T, path: string): any {
  return path.split('.').reduce((acc, part) => {
    return acc && typeof acc === 'object' ? acc[part as keyof object] : undefined;
  }, obj as any);
}

export default Table;