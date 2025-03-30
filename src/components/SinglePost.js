import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import BackButton from '../components/BackButton';
import useStore from "../store/main";


const SinglePost = () => {
    const {postId} = useParams();
    const {user} = useStore();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState('');
const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`http://localhost:2002/posts/${postId}`);
                const data = await res.json();
                if (data.success) {
                    setPost(data.post); // Assuming response has the post data
                } else {
                    console.error("Post not found");
                }
            } catch (err) {
                console.error("Error fetching post:", err);
            }
        };

        fetchPost();
    }, [postId]);

    if (!post) {
        return <p>Loading...</p>;
    }

    const handleUserClick = (username) => {
        if (username === user.username) {
            navigate('/profile');
        } else {
            navigate(`/users/${username}`);
        }
    };


    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!comment.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`http://localhost:2002/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                username: user.username,
                message: comment,
            }),
        });

        const data = await res.json();
        if (data.success) {
            setPost(prevPost => ({
                ...prevPost,
                comments: [...prevPost.comments, data.comment], // Add the new comment
            }));
            setComment(""); // Clear the input field after posting
        } else {
            console.error("Failed to add comment:", data.message);
        }
    };


    const handleDelete = async (commentId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:2002/post/${postId}/comment/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (data.success) {
                // Remove the deleted comment from the post's comments array
                setPost(prevPost => ({
                    ...prevPost,
                    comments: prevPost.comments.filter(comment => comment.commentId !== commentId),
                }));
            } else {
                console.error("Failed to delete comment:", data.message);
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };


    return (
        <div className="container mt-3">
            <BackButton/><br/><br/>
            <div className="card">
                <div className="row g-0">
                    <div className="col-md-4">
                        <img
                            src={post.postImage}
                            alt="Post"
                            className="img-fluid rounded-start" // Ensures the image is responsive with rounded corners
                            style={{objectFit: "cover", height: "100%"}}
                        />
                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <h2 className="card-title">{post.title}</h2>
                            <p className="card-text">{post.description}</p>
                            <p className="card-text">Posted by: <b><span
                                style={{cursor: "pointer", color: "blue"}}
                                onClick={() => handleUserClick(post.username)}
                            >
                                            {post.username}
                                        </span></b></p>
                            <p className="card-text">
                                <strong>Posted at:</strong> {post.time}
                            </p>
                        </div>
                    </div>
                </div>
            </div>



            {/* Comment Section */}
            <div className="mt-4">
                <h4>Comments ({post.comments.length})</h4>
                {post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                        <div key={comment.commentId} className="card mb-3 w-100">
                            <div className="card-body d-flex w-100">
                                <img
                                    src={comment.userImage || `https://ui-avatars.com/api/?name=${comment.username}`}
                                    alt={comment.username}
                                    className="rounded-circle me-3"
                                    style={{width: "50px", height: "50px", objectFit: "cover"}}
                                />
                                <div className='w-100'>
                                    <h6 className="card-title mb-1">
                                        <strong>{comment.username}</strong> <small
                                        className="text-muted">({comment.time})</small>
                                    </h6>
                                    <p className="card-text">{comment.message}</p>

                                </div>
                                <div className="d-flex justify-content-end">
                                    {(comment.username === user.username || user.username === "beyka") && (
                                        <button
                                            className="btn btn-light btn-sm"
                                            onClick={() => handleDelete(comment.commentId)} // Pass the correct commentId
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="alert alert-light" role="alert">
                        No comments yet. Be the first to comment!
                    </div>
                )}
                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit}>
                    <div className="d-flex">
                        <div className="form-group flex-grow-1 me-2">
            <textarea
                className="form-control"
                rows="1"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-warning align-self-end">
                            Post Comment
                        </button>
                    </div>
                </form>
            </div>


        </div>
    );
};

export default SinglePost;