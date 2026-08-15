import React from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
}

function Table<T extends { id?: number; product_id?: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
}: TableProps<T>) {
  const getId = (item: T) => item.id || item.product_id || 0;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-[#9FEDD7] rounded-lg shadow-sm">
        <thead className="bg-[#FEF9C7]">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-[#026670] uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete || onView) && (
              <th className="px-6 py-3 text-left text-xs font-medium text-[#026670] uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#9FEDD7]">
          {data.map((item) => (
            <tr key={getId(item)} className="hover:bg-[#FEF9C7] hover:bg-opacity-30">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-[#026670]"
                >
                  {column.render
                    ? column.render(item)
                    : String((item as any)[column.key] || "")}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="text-[#026670] hover:text-[#024d57] px-2 py-1 rounded hover:bg-[#9FEDD7]"
                      >
                        View
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-[#026670] hover:text-[#024d57] px-2 py-1 rounded hover:bg-[#FCE181]"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;