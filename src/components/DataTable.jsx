export default function DataTable({ columns, rows, keyField = "id" }) {
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((c) => (
              <th key={c.field} className="text-left p-2">{c.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[keyField]} className="border-t">
              {columns.map((c) => (
                <td key={c.field} className="p-2">
                  {c.render ? c.render(r) : r[c.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
