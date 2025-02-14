import { useState } from "react";
import "@/styles/SortableTable.css";

interface Column {
    key: string;
    label: string;
    disableSort?: boolean;
}

interface SortableTableProps {
    title: string;
    columns: Column[];
    data: Record<string, any>[];
}

const SortableTable: React.FC<SortableTableProps> = ({ title, columns, data }) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "",
        direction: "asc",
    });

    // Sorting logic
    const sortedData = [...data].sort((a, b) => {
        const { key, direction } = sortConfig;
        if (!key) return 0;

        const order = direction === "asc" ? 1 : -1;
        const column = columns.find(col => col.key === key);
        if (!column || column.disableSort) return 0;

        if (typeof a[key] === "number" && typeof b[key] === "number") {
            return order * (a[key] - b[key]);
        }
        return order * String(a[key]).localeCompare(String(b[key]));
    });

    // Handle sorting
    const handleSort = (key: string) => {
        const column = columns.find(col => col.key === key);
        if (column?.disableSort) return;

        setSortConfig(prev => ({
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
};

export default SortableTable;
