import React, { useRef, useState, useEffect } from "react";
import useStore from "../store/main";
import { useNavigate } from "react-router-dom";

const Login = ({socket}) => {
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const [error, setError] = useState("");
    const { setUser } = useStore((state) => state);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        if (!username || !password) {
            setError("All fields are required");
            return;
        }

        try {
            const response = await fetch("http://localhost:2002/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                socket.emit("login", username, data.id);
                localStorage.setItem("token", data.token);
                setUser({
                    username,
                    image: data.image,
                    _id: data.id,
                    online: true,
                });

                console.log(data);
                navigate('/posts');

            } else {
                setError(data.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        }
    };


    return (
        <div className='container'>
            <div className="d-flex justify-content-center mt-5 ">
                <div className='card1 cb1 '>
                <div className="card-body shadow-sm p-5" style={{width: "400px"}}>
                    <h2 className="text-center mb-4 text-capitalize">Login</h2>
                    {error && <div className="alert alert-danger fs-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className='d-flex flex-column gap-3'>
                        <div className="form-group">
                            <input
                                ref={usernameRef}
                                type="text"
                                className="form-control"
                                placeholder="Username"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                ref={passwordRef}
                                type="password"
                                className="form-control"
                                placeholder="Password"
                            />
                        </div>
                        <button type="submit" className="btn btn-light btn-block">
                            Login
                        </button>
                    </form>
                </div></div>
            </div></div>
            );
            };

            export default Login;
