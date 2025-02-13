import "../../styles/modal/CommonModal.css";

function DeleteModal({ isOpen, onClose, onConfirm, entityName }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete "<strong>{entityName}</strong>"?</p>
                <div className="modal-actions">
                    <button className="delete" onClick={onConfirm}>Delete</button>
                    <button className="cancel" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;
