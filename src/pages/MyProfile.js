import React, { useState } from "react";
import useStore from "../store/main";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const MyProfile = () => {
    const { user, setUser } = useStore();
    const navigate = useNavigate();
    const [username, setUsername] = useState(user?.username || "");
    const [image, setImage] = useState(user?.image || "");
    const [newImage, setNewImage] = useState(user?.image || "");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [successMessage, setSuccessMessage] = useState(""); // State for success message
    const [errorMessage, setErrorMessage] = useState(""); // State for password error message


    const handleChangePassword = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, user must log in");
            return;
        }
        const res = await fetch("http://localhost:2002/profile/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ userId: user._id, oldPassword, newPassword, confirmPassword }),
        });
        const data = await res.json();
        if (data.success) {
            setSuccessMessage(data.message); // Show success message if password change is successful
            setErrorMessage(""); // Clear any previous error messages
            localStorage.removeItem("token");
            setUser(null);
            navigate("/login");
        } else {
            setSuccessMessage(""); // Clear any previous success messages
            setErrorMessage(data.message); // Set error message
        }
    };

    const handleSaveUsername = async () => {
        if (username === user.username) return;

        if (username.length < 4) {
            setErrorMessage("Username must be at least 4 characters.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:2002/profile/update", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ userId: user._id, username }),
        });

        const data = await res.json();
        if (data.success) {
            setUser(data.user); // Update Zustand state
            setSuccessMessage("Username updated successfully!");
            setUser(null);
            navigate("/login");
        } else {
            setErrorMessage(data.message);
        }
    };

    const handleImageChange = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:2002/profile/update", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ userId: user._id, image: newImage }),
        });

        const data = await res.json();
        if (data.success) {
            setUser(data.user);
            setImage(newImage);
            setSuccessMessage("Profile picture updated successfully!");
        } else {
            setErrorMessage(data.message);
        }
    };

    return (
        <div className="container mt-3">
            <BackButton/>
            {/* Success Message Box (for profile update) */}
            {successMessage && (
                <div className="alert alert-success" role="alert">
                    {successMessage}
                </div>
            )}

            <h2 className="mb-4 text-center">My Profile</h2>

            <div className="row justify-content-center mb-4">
                <div className="col-md-4 d-flex justify-content-center align-items-center p-0"
                     style={{objectFit: 'cover', maxHeight: '300px', overflow:'hidden'}}>
                    <img src={image} alt="Profile" className="mb-3" style={{width: '100%', height: 'auto'}} />
                </div>
                <div className="col-md-8">
                    <div className="form-group mb-3 card p-4">
                        <i>Change profile picture:</i>
                        <div className="d-flex mt-2">
                            <form autoComplete="off" style={{width: '100%'}}><input
                                type="text"
                                autoComplete="off"
                                className="form-control"
                                placeholder="Image URL"
                                onChange={(e) => setNewImage(e.target.value)}
                                onFocus={() => setErrorMessage("")}
                            /></form>
                            <button className="btn btn-warning ms-2" onClick={handleImageChange}>Change
                            </button>
                        </div>
                    </div>
                    <br/>

                    {/* Username Section */}
                    <div className="form-group mb-4 card p-4">
                        <i>Change username:</i>
                        <div className="d-flex align-items-center mt-2">
                            <form autoComplete="off" style={{width: '100%'}}><input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setErrorMessage("If you change your username, you will have to re-login.")}
                            /></form>
                            <button className="btn btn-warning ms-2" onClick={handleSaveUsername}>
                                Change
                            </button>
                        </div>
                    </div>

                </div>
            </div>


            {errorMessage && (
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            )}



            {/* Change Password Section */}
            <div className="container mt-5">
                <h2 className="text-center mb-4">Change Password</h2>

                <div className="border p-4 rounded mt-4">

                    <h4 className="mb-3">Change Password</h4>
                    <div className="form-group mb-3">
                        <label>Old Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={oldPassword || ""}
                            onChange={(e) => setOldPassword(e.target.value)}
                            onFocus={() => setErrorMessage("If you change your password, you will have to re-login.")}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword || ""}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword || ""}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-warning" onClick={handleChangePassword}>Change Password</button>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;


