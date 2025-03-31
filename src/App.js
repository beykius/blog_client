import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import {useEffect, useState} from "react";
import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import useStore from "./store/main";
import Register from "./components/Register";
import Logout from "./components/Logout";
import CreatePosts from "./pages/CreatePosts";
import AllPosts from "./pages/AllPosts";
import SinglePost from "./components/SinglePost";
import MyFavorites from "./pages/MyFavorites";
import UserProfile from "./pages/UserProfile";
import MyProfile from "./pages/MyProfile";
import Messages from "./pages/Messages";
import Logo from './components/Logo'
import {socket} from "./socket"
import Footer from "./components/Footer";
import Login from './components/Login'

function App() {
const user = useStore((state) => state.user);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className='min-vh-100'>
            <button
                onClick={scrollToTop}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    display: visible ? "block" : "none",
                    background: "#c0b2a0",
                    color: "#000",
                    border: "none",
                    borderRadius: "50%",
                    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                    padding: "15px 25px",
                    cursor: "pointer",
                    fontSize: "20px",
                    zIndex: '999',
                    opacity: '0.8',
                }}
            >
                ↑
            </button>
            <BrowserRouter>
                <Logo socket={socket}/>
                {user && (<>
                    <div className="d-flex p-5">
                        <Routes>
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path='/logout' element={<Logout socket={socket}/>}/>
                            <Route path='/create-post' element={<CreatePosts/>}/>
                            <Route path='/posts' element={<AllPosts/>}/>
                            <Route path='/posts/:postId' element={<SinglePost/>}/>
                            <Route path='/favorites' element={<MyFavorites/>}/>
                            <Route path='/users/:username' element={<UserProfile socket={socket}/>}/>
                            <Route path='/profile/' element={<MyProfile/>}/>
                            <Route path="/messages" element={<Messages socket={socket}/>}/>
                            <Route path="/messages/my-messages/:receiverId" element={<Messages socket={socket}/>}/>
                        </Routes>
                    </div>
                    <div><Footer/></div>
                </>)}
            </BrowserRouter>


        </div>
    );
}

export default App;
