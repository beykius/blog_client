import React, { useState } from "react";
import useStore from "../store/main";
import BackButton from "../components/BackButton";

const CreatePost = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [postImage, setPostImage] = useState("");
    const { setPosts, user } = useStore();
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const fetchPosts = async () => {
        try {
            const res = await fetch("http://localhost:2002/allposts");
            const data = await res.json();
            if (data.success) {
                setPosts(data.posts);
            } else {
                console.error("Failed to load posts");
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
        }
    };

    // In your CreatePost component, explicitly pass user._id and user.username
    const handleSubmit = async () => {
        if (!title || !description) {
            setMessage("Please fill in both fields.");
            setMessageType("danger");
            return;
        }

        // Ensure user data is correctly captured
        const postData = {
            title,
            description,
            postImage,
            time: new Date().toLocaleString("en-GB"),
            userId: user?._id,  // Ensure this is correctly capturing the logged-in user's ID
            username: user?.username,  // Ensure this is correctly capturing the logged-in user's username
            userImage: user?.image || "default-image.jpg",
        };

        const token = localStorage.getItem("token");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(postData),
        };

        try {
            const res = await fetch("http://localhost:2002/create", options);
            const data = await res.json();

            setMessage(data.message);
            setMessageType(data.success ? "success" : "danger");

            if (data.success) {
                fetchPosts();
                setTitle("");
                setDescription("");
                setPostImage("");

                setTimeout(() => {
                    setMessage("");
                }, 3000);
            }
        } catch (err) {
            console.log("Error:", err);
        }
    };



    return (
        <div className="container">
            <BackButton/>
            <div className="d-flex justify-content-center mt-3">
                <div className="card shadow-sm p-4" style={{width: "400px", borderRadius: '0',}}>
                    <h2 className="text-center mb-4">Create a Post</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }} className="d-flex flex-column gap-3">
                        {message && <div className={`alert alert-${messageType} text-center`}>{message}</div>}

                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Image URL (optional)"
                                value={postImage}
                                onChange={(e) => setPostImage(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-light btn-block">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
