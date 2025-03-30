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

    const handleSubmit = async () => {
        if (!title || !description) {
            setMessage("Please fill in both fields.");
            setMessageType("danger");
            return;
        }

        const postData = {
            title,
            description,
            postImage,
            time: new Date().toLocaleString("en-GB"),
            user: user,
        };

        const token = localStorage.getItem("token");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Ensure token is included with "Bearer"
            },
            body: JSON.stringify(postData),
        };

        fetch("http://localhost:2002/create", options)
            .then(res => res.json())
            .then(data => {
                setMessage(data.message); // Show backend message
                setMessageType(data.success ? "success" : "danger");

                if (data.success) {
                    fetchPosts(); // Refresh posts
                    setTitle("");
                    setDescription("");
                    setPostImage("");

                    // Clear message after 3 seconds
                    setTimeout(() => {
                        setMessage("");
                    }, 3000);
                }
            })
            .catch(err => {
                console.log("Error:", err); // Log any network errors
            });
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
