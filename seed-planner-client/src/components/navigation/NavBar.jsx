import { Link } from "react-router-dom";
import "../../styles/NavBar.css";
import logo from "/seed-planner.png"; // Adjust path as needed

function NavBar() {
    return (
        <nav>
            <div className="nav-container">
                <Link to="/">
                    <img src={logo} alt="Logo" className="nav-logo" />
                </Link>
                <Link to="/">Dashboard</Link>
                <Link to="/trays">Trays</Link>
                <Link to="/plants">Plants</Link>
                <Link to="/species">Species</Link>
                <Link to="/calendar">Seeding Calendar</Link>
            </div>
        </nav>
    );
}

export default NavBar;
