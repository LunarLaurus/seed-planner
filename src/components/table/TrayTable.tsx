import { QueryClient, useMutation } from "@tanstack/react-query";
import { deleteTray } from "@/utils/api";
import { Tray } from "@/typings/types";
import SortableTable from "./SortableTable";
import TrayRow from "./row/TrayRow";

interface TrayTableProps {
    trays: Tray[];
    queryClient: QueryClient;
}

const TrayTable: React.FC<TrayTableProps> = ({ trays, queryClient }) => {
    const deleteTrayMutation = useMutation({
        mutationFn: (trayId: number) => deleteTray(trayId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trays"] }),
        onError: (error: any) => alert(`Failed to delete tray: ${error.message}`),
    });

    // Define Columns for SortableTable
    const columns = [
        { key: "name", label: "Name" },
        { key: "location", label: "Location" },
        { key: "notes", label: "Notes" },
        { key: "size", label: "Size" },
        { key: "actions", label: "Actions", disableSort: true },
        { key: "grid", label: "Grid", disableSort: true },
    ];

    // Convert Tray Data for `SortableTable`
    const tableData = trays?.map((tray) => ({
        name: tray.name,
        location: tray.location,
        notes: tray.notes || "—", // Handle possible `undefined` values
        size: `${tray.columns} x ${tray.rows}`,
        actions: (
            <TrayRow
                key={tray.id}
                tray={tray}
                deleteTrayMutation={deleteTrayMutation}
            />
        ),
        grid: <TrayRow key={`grid-${tray.id}`} tray={tray} isGridOnly={true} deleteTrayMutation={deleteTrayMutation} />,
    }));

    return <SortableTable title="Existing Trays" columns={columns} data={tableData} />;
};

export default TrayTable;
