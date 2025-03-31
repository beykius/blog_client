import { useLocation } from "react-router-dom";
import Toolbar from "./Toolbar";
import Login from "./Login";
import Register from "./Register";

const Logo = ({ socket }) => {
    const location = useLocation();

    return (
        <div className="logo d-flex flex-column position-relative">
            {/* Toolbar at the top */}
            <div className="w-100">
                <Toolbar />
            </div>

            {/* Main content of logo */}
            <div className="container text-2xl d-flex flex-column justify-content-center flex-grow-1 align-items-center text-center">
                {/* Show Login or Register only when on their respective routes */}
                {location.pathname === "/login" && <Login socket={socket} />}
                {location.pathname === "/register" && <Register />}


                {!(location.pathname === "/login" || location.pathname === "/register") && (
                    <>
                        <div className="d-flex align-items-center text-center">
                            Let your imagination
                            <div className="ms-1 dropping-texts">
                                <div>flow</div>
                                <div>shine</div>
                                <div>motivate</div>
                                <div>inspire</div>
                            </div>
                        </div>
                        <div className="fs-5"><i>Your everyday blog page</i></div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Logo;
