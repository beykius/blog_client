import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useStore from "../store/main";
import BackButton from "../components/BackButton";

const UserProfile = ({ socket }) => {
    const { username } = useParams();
    const { user } = useStore();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [messageStatus, setMessageStatus] = useState("");  // Track success/error message
    const inputRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        socket.on("allUsers", (users) => {
            console.log("Updated online users:", users);
            setProfile((prev) => {
                if (prev) {
                    return {
                        ...prev,
                        online: users.some(u => u.userId === prev.id),  // Check if this user's ID is in the online users list
                    };
                }
                return prev;
            });
        });

        return () => {
            socket.off("allUsers");
        };
    }, [socket]);



    const fetchUserProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, user must log in");
            return;
        }
        const res = await fetch(`http://localhost:2002/users/${username}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await res.json();
        if (data.success) {
            console.log("User fetched:", data.user);
            setProfile(data.user);
        } else {
            console.error("Failed to fetch profile:", data.message);
        }
    };

    const fetchUserPosts = async () => {
        const res = await fetch(`http://localhost:2002/posts/users/${username}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();

        if (data.success) {
            setUserPosts(data.posts);
        } else {
            console.error("Failed to load user posts");
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchUserPosts();
    }, [username]);

    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}`);
    };

    const toggleLike = async (postId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, user must log in");
            return;
        }

        const res = await fetch(`http://localhost:2002/posts/like/${postId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ user }),
        });

        const data = await res.json();
        if (data.success) {
            fetchUserPosts(); // Refresh posts after liking/unliking
        } else {
            console.error("Failed to toggle like:", data.message);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newMessage = {
            senderId: user?._id,
            receiverId: profile?._id,
            senderImage: user?.image || "default-image.jpg",
            receiverImage: profile?.image || "default-image.jpg",
            receiverUsername: profile?.username,
            text: message,
            senderUsername: user?.username,
            timestamp: new Date().toISOString(),
        };

        console.log("Sending message:", newMessage);

        // Emit the message via Socket.io (for real-time updates)
        socket.emit("sendMessage", newMessage); // Emit to server for real-time chat

        // Optionally, handle the backend response (status)
        socket.once("messageStatus", (status) => {
            if (status.success) {
                console.log("Message saved:", status.message);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    status.message,
                ]);
                setMessageStatus("Message sent successfully!");
            } else {
                console.error("Error saving message:", status.message);
                setMessageStatus("Error saving message.");
            }
        });

        setMessage(""); // Clear message input after sending

    };


    if (!profile) return <div>Loading...</div>;

    return (
        <div className="container">
            <BackButton/>
            <h4 className="text-center mb-3">{profile.username}'s Profile</h4>
            <div className="p-4 container mt-3">
                <div className="row align-items-center p-3">
                    <div className="col-md-4 d-flex justify-content-center align-items-center p-0"
                         style={{objectFit: 'cover', maxHeight: '300px', overflow: 'hidden'}}>
                        <img src={profile.image} alt="Profile" className="mb-3"
                             style={{width: '100%', height: 'auto'}}/>
                    </div>
                    <div className="col-md-8">
                        <p className='m-3'>{profile.online ? (
                            <p>{profile.username} is online <span style={{
                                marginLeft: '5px',
                                width: '10px',
                                height: '10px',
                                backgroundColor: 'green',
                                borderRadius: '50%',
                                display: 'inline-block'
                            }}></span></p>
                        ) : (
                            <p>{profile.username} is offline</p>
                        )}</p>
                        <div className="form-group mb-3 card p-4">
                            <i>Send {profile.username} a message:</i>
                            <div className="d-flex mt-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Message..."
                                    ref={inputRef}
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value); // Update message state
                                        setMessageStatus("");        // Reset message status when the user starts typing
                                    }}  />
                                <button className="btn btn-warning ms-2" onClick={handleSendMessage}>Send</button>
                            </div>
                            {messageStatus && (
                                <div className="mt-3">
                                    <p className={`alert ${messageStatus.includes("Error") ? "alert-danger" : "alert-light"}`}>{messageStatus}</p>
                                    {messageStatus.includes("successfully") && (
                                        <Link to={`/messages/my-messages/${profile._id}`}>
                                            Go to chat with {profile.username}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-3 mt-3">
                    <h3>{profile.username}'s Posts</h3>
                    <div className="row">
                        {userPosts.length === 0 ? (
                            <p>No posts by this user.</p>
                        ) : (
                            userPosts.map((post) => (
                                <div key={post._id} className='col-12  col-md-6 col-lg-4 col-xl-3 mb-4'>
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

                                                    {post.username}

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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;


