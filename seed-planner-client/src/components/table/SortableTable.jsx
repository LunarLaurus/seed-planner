import { useState } from "react";
import "../../styles/SortableTable.css";

function SortableTable({ title, columns, data }) {
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

    // Sorting Logic
    const sortedData = data
        ? [...data].sort((a, b) => {
            const { key, direction } = sortConfig;
            if (!key) return 0; // No sorting applied yet

            const order = direction === "asc" ? 1 : -1;

            // Find the column definition
            const column = columns.find(col => col.key === key);
            if (!column || column.disableSort) return 0; // If sorting is disabled, don't change order

            if (typeof a[key] === "number" && typeof b[key] === "number") {
                return order * (a[key] - b[key]); // Numeric sort
            }
            return order * a[key].localeCompare(b[key]); // String sort
        })
        : [];

    // Handle Sorting on Click
    const handleSort = (key) => {
        const column = columns.find(col => col.key === key);
        if (column?.disableSort) return; // Prevent sorting if disabled

        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    return (
        <div className="table-container">
            <h2>{title}</h2>
            <table className="sortable-table">
                <thead>
                    <tr>
                        {columns.map(({ key, label, disableSort }) => (
                            <th
                                key={key}
                                data-sort={sortConfig.key === key ? sortConfig.direction : ""}
                                onClick={() => !disableSort && handleSort(key)}
                                className={disableSort ? "non-sortable" : ""}
                            >
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => (
                        <tr key={index}>
                            {columns.map(({ key }) => (
                                <td key={key}>{row[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default SortableTable;
