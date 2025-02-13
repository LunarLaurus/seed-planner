import { useState } from "react";
import "../../styles/ClosableForm.css"; // Ensure styling is added

function ClosableFormWrapper({ title, children }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="closable-form-container">
            <button className="toggle-form-btn" onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? "Hide" : `${title}`}
            </button>

            {isVisible && (
                <div className="closable-form-content">
                    <h2>{title}</h2>
                    {children}
                </div>
            )}
        </div>
    );
}

export default ClosableFormWrapper;
