import React, {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";


const Register = () => {
    const emailRef = useRef(null);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const email = emailRef.current.value;
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;

        if (!email || !username || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if ((password.length < 4 || password.length > 20) || (username.length < 4 || username.length > 20)) {
            setError("Username and password should be longer than 4 characters and shorter than 20.");
            return;
        }

        const response = await fetch("http://localhost:2002/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, username, password}),
        });

        const data = await response.json();
        if (!response.ok) {
            setError(data.message || "Something went wrong");
            return;
        }
        console.log(data.success);
        navigate("/login");

    };

    return (
        <div className='container'>
            <div className="d-flex justify-content-center mt-5">
                <div className='card1 cb1 '>
                    <div className="card-body shadow-sm p-5" style={{width: "400px"}}>
                        <h2 className="text-center mb-4 text-capitalize">Register</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit} className='d-flex flex-column gap-3'>
                            <div className="form-group">
                                <input
                                    ref={emailRef}
                                    type="email"
                                    className="form-control"
                                    placeholder="Email"
                                />
                            </div>
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
                            <div className="form-group">
                                <input
                                    ref={confirmPasswordRef}
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm Password"
                                />
                            </div>
                            <button type="submit" className="btn btn-light btn-block">
                                Register
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
