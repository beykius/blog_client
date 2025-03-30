import useStore from "../store/main";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

const Logout = ({socket}) => {
    const navigate = useNavigate();
    const setUser = useStore((state) => state.setUser);
    const user = useStore((state) => state.user);

    useEffect(() => {
        if (user) {
            socket.emit("userOffline", user._id);

            setUser((prevState) => ({
                ...prevState,
                user: { ...prevState.user, online: false },
            }));
            setUser(null);
            navigate('/login');
        }
    }, [user, navigate, setUser, socket]);

    return <p>Logging out...</p>;

};

export default Logout;
