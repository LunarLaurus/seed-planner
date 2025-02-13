import { useMutation } from "@tanstack/react-query";
import { deleteTray } from "../../utils/api";
import SortableTable from "./SortableTable";
import TrayRow from "./row/TrayRow";

function TrayTable({ trays, navigate, queryClient }) {

    const deleteTrayMutation = useMutation({
        mutationFn: (trayId) => deleteTray(trayId),
        onSuccess: () => queryClient.invalidateQueries(["trays"]),
        onError: (error) => alert(`Failed to delete tray: ${error.message}`),
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

    // ✅ Convert Tray Data for `SortableTable`
    const tableData = trays?.map(tray => ({
        name: tray.name,
        location: tray.location,
        notes: tray.notes,
        size: `${tray.columns} x ${tray.rows}`,
        actions: (
            <TrayRow
                key={tray.id}
                tray={tray}
                navigate={navigate}
                deleteTrayMutation={deleteTrayMutation}
            />
        ),
        grid: <TrayRow key={`grid-${tray.id}`} tray={tray} isGridOnly={true} />,
    })) || [];

    return (
        <SortableTable title={'Existing Trays'} columns={columns} data={tableData} />
    );
}

export default TrayTable;
