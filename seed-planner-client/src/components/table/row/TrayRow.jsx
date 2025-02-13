import { useState } from "react";
import TrayGrid from "../../display/TrayGrid";
import DeleteButton from "../../button/DeleteButton";
import EditTrayModal from "../../modal/EditTrayModal";

function TrayRow({ tray, deleteTrayMutation, isGridOnly = false }) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    if (isGridOnly) {
        return <TrayGrid trayId={tray.id} />;
    }

    return (
        <div className="button-group">
            <button className="edit" onClick={() => setIsEditOpen(true)}>Edit</button>
            <DeleteButton entityName={tray.name} entityId={tray.id} deleteMutation={deleteTrayMutation} />
            {isEditOpen && <EditTrayModal trayId={tray.id} onClose={() => setIsEditOpen(false)} />}
        </div>
    );
}

export default TrayRow;
