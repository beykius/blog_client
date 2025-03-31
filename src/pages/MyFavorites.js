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
        if (!user || !user._id || !token) {
            console.error("User not logged in or token missing");
            return;
        }

        console.log("Fetching favorites for userId:", user._id);

        const res = await fetch('http://localhost:2002/posts/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: user._id,
            }),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
            console.log('user', user);
            setFavorites(data.favorites);
        } else {
            console.error("Failed to fetch favorites:", data.message);
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

        if (!user || !user._id) {
            console.error("User ID is missing");
            return;
        }

        const res = await fetch(`http://localhost:2002/posts/like/${postId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: user._id,
            }),
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
                                    paddingTop: "200px",
                                    border: 'none',
                                    borderRadius: '0',
                                    filter: "grayscale(100%)",
                                    transition: "filter 0.5s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.filter = "grayscale(0%)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.filter = "grayscale(100%)";
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

