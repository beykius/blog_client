import React, {useEffect, useRef, useState} from "react";
import useStore from "../store/main";
import {useNavigate} from "react-router-dom";


const AllPosts = () => {
    const {posts, setPosts} = useStore();
    const user = useStore((state) => state.user);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;
    const totalPages = Math.ceil(posts.length / postsPerPage);


    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const currentPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}`);
    };

    useEffect(() => {
        fetchPosts();
    }, [setPosts]);

    const handleUserClick = (username) => {
        if (username === user.username) {
            navigate('/profile');
        } else {
            navigate(`/users/${username}`);
        }
    };

    const fetchPosts = async () => {
        const res = await fetch("http://localhost:2002/allposts");
        const data = await res.json();
        if (data.success) {
            setPosts(data.posts);
        } else {
            console.error("Failed to load posts");
        }
    };

    const handleDelete = async (postId) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:2002/deletePost/${postId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await res.json();
        if (data.success) {
            setPosts(data.posts);

        } else {
            console.error("Failed to delete post:", data.message);
        }

    };

    const toggleLike = async (postId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, user must log in");
            return;
        }

        const res = await fetch(`http://localhost:2002/posts/like/${postId}`, {
            method: "POST",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            body: JSON.stringify({
                userId: user._id,
            }),
        });

        const data = await res.json();
        if (data.success) {
            fetchPosts();
        } else {
            console.error("Failed to toggle like:", data.message);
        }
    };

    return (
        <div className="container mt-3">
            <h2 className="text-center mb-4">All Posts</h2>
            <div className="row">
                {currentPosts.length === 0 ? (
                    <p className="text-center w-100">No posts available.</p>
                ) : (
                    currentPosts.map((post) => (
                        <div className="col-12 col-md-6 col-lg-4 col-xl-4 mb-4 " key={post._id}>
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
                                        width: "80%",
                                        backgroundColor: "white",
                                        padding: "15px",
                                        boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    <div className="d-flex justify-content-between ">
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
                                                <br/>
                                                <small>{post.time}</small>
                                            </p>
                                        </div>
                                        <div>
                                            <div className="">
                                                {(post.username === user.username || user.username === "beyka") && (
                                                    <button
                                                        className="btn btn-light btn-sm mb-2"
                                                        onClick={() => handleDelete(post._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                {post.username !== user.username && (
                                                    <button
                                                        className={`d-flex row btn btn-sm ${post.likedBy.includes(user._id) ? "btn-outline-none" : ""}`}
                                                        onClick={() => toggleLike(post._id)}
                                                    >
                                                        {post.likedBy.includes(user._id) ? "👎🏽" : "👍🏼"}({post.likedBy.length})
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-center mt-4">
                <nav>
                    <ul className="pagination">
                        {/* Previous Button */}
                        <li className="page-item">
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    border: "1px solid #ddd",
                                    outline: "none",
                                    boxShadow: "none",
                                    color: "#000",
                                }}
                            >
                                &lt;&lt;
                            </button>
                        </li>

                        {/* Page Number Buttons */}
                        {Array.from({length: totalPages}, (_, index) => (
                            <li key={index + 1} className="page-item">
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(index + 1)}
                                    style={{
                                        border: "1px solid #ddd",
                                        outline: "none",
                                        boxShadow: "none",
                                        color: "#000",
                                    }}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}

                        {/* Next Button */}
                        <li className="page-item">
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    border: "1px solid #ddd",
                                    outline: "none",
                                    boxShadow: "none",
                                    color: "#000",
                                }}
                            >
                                &gt;&gt;
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default AllPosts;