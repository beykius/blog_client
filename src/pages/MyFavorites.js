import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import useStore from "../store/main";
import BackButton from "../components/BackButton";

const MyFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const token = localStorage.getItem("token");
    const {user} = useStore();
    const navigate = useNavigate();

    const handleUserClick = (username) => {
        navigate(`/users/${username}`);
    };
    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}`);
    };


    const fetchFavorites = async () => {
        try {
            if (!user || !user._id || !token) {
                console.error("User not logged in or token missing");
                return;
            }

            const res = await fetch(`http://localhost:2002/posts/favorites/${user._id}`, {
                method: "GET",
                headers: {"Authorization": `Bearer ${token}`},
            });

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            if (data.success) {
                setFavorites(data.favorites);
            } else {
                console.error("Failed to fetch favorites:", data.message);
            }
        } catch (err) {
            console.error("Error fetching favorite posts:", err);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [token, user]);

    // Function to toggle like
    const toggleLike = async (postId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, user must log in");
            return;
        }

        const res = await fetch(`http://localhost:2002/posts/like/${postId}`, {
            method: "POST",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            body: JSON.stringify({user}),
        });

        const data = await res.json();
        if (data.success) {
            fetchFavorites();
        } else {
            console.error("Failed to toggle like:", data.message);
        }
    };

    return (
        <div className="container">
            <BackButton/>
            <h2 className="text-center mb-4">My Favorite Posts</h2>
            <div className="row">
                {favorites.length > 0 ? (
                    favorites.map(post => (
                        <div className="col-12  col-md-6 col-lg-4 col-xl-3 mb-4" key={post._id}>
                            <div
                                className="card"
                                style={{
                                    position: "relative",
                                    backgroundImage: `url(${post.postImage})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    minHeight: "400px",
                                    paddingTop: "200px", // Create padding space for the image
                                    border: 'none',
                                    borderRadius: '0',
                                    filter: "grayscale(100%)", // Set image to grayscale
                                    transition: "filter 0.5s ease", // Smooth transition effect
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.filter = "grayscale(0%)"; // Remove grayscale on hover
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.filter = "grayscale(100%)"; // Add grayscale back when hover ends
                                }}
                            >
                                <div
                                    className="card-body"
                                    style={{
                                        position: "absolute",
                                        bottom: "20px",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        width: "80%", // 80% width of the card
                                        backgroundColor: "white",
                                        padding: "15px",
                                        boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h5
                                                className="card-title text-capitalize"
                                                style={{
                                                    cursor: "pointer",
                                                    color: "#333",
                                                }}
                                                onClick={() => handlePostClick(post._id)}
                                            >
                                                {post.title}
                                            </h5>
                                            <p className="text-muted">
                                                <strong>Posted by: </strong>
                                                <span
                                                    style={{cursor: "pointer"}}
                                                    onClick={() => handleUserClick(post.username)}
                                                >
                                            {post.username}
                                        </span>
                                            </p>
                                        </div>
                                        <div>
                                            <div className="d-flex flex-column align-items-end">
                                                <button
                                                    className={`btn btn-sm ${post.likedBy.includes(user._id) ? "btn-outline-none" : ""}`}
                                                    onClick={() => toggleLike(post._id)}
                                                >
                                                    {post.likedBy.includes(user._id) ? "👎🏽" : "👍🏼"}({post.likedBy.length})
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center w-100">No favorite posts yet.</p>
                )}
            </div>
        </div>
    );
};

export default MyFavorites;

