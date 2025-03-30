import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import useStore from "../store/main";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackButton from "../components/BackButton";
import { v4 as uuidv4 } from 'uuid';

const Messages = ({ socket }) => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const { user } = useStore();
    const { receiverId } = useParams();



    // Listen for "allUsers" event to update online status
    useEffect(() => {
        if (!socket) return;
        const updateUsersOnline = (updatedUsers) => {
            setUsers(prevUsers => {
                return prevUsers.map(user => {
                    const onlineUser = updatedUsers.find(onlineUser => onlineUser.id === user._id);
                    if (onlineUser) {
                        return { ...user, online: true }; // Mark as online if the user is in the updated list
                    }
                    return { ...user, online: false }; // Mark as offline if the user is not in the updated list
                });
            });
        };

        socket.on("allUsers", updateUsersOnline);

        return () => {
            socket.off("allUsers", updateUsersOnline);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            // Ensure that you only add the message to the state if it's not the one the sender just sent
            setMessages((prevMessages) => [
                ...prevMessages,
                { ...newMessage, senderImage: newMessage.senderImage || "default-image.jpg", },
            ]);
        };


        // Listen for new messages
        socket.on("newMessage", handleNewMessage);

        //To make sure there are no duplicates
        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (receiverId && users.length > 0) {
            const selectedUser = users.find((user) => user._id === receiverId);
            console.log("Selected user:", selectedUser); // Debugging
            if (selectedUser) {
                setProfile(selectedUser);
                console.log(selectedUser);
            } else {
                console.error("User not found for receiverId:", receiverId);
            }
        }
    }, [receiverId, users]);

    // Fetch all users when the component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found, user must log in");
                    return;
                }

                const response = await fetch("http://localhost:2002/users", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (data.success) {
                    console.log("Fetched users:", data.users);  // Debugging
                    const filteredUsers = data.users.filter((u) => u._id !== user._id);
                    setUsers(filteredUsers);
                } else {
                    console.error("Failed to fetch users");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [user._id]);  // Re-fetch users when user._id changes

    // Fetch messages when receiverId or user._id changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!receiverId) return;

            setMessages([]); // Clear messages when switching chats

            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found, user must log in");
                return;
            }

            try {
                const response = await fetch(`http://localhost:2002/messages/mymessages/${receiverId}?senderId=${user._id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                console.log("Fetched messages:", data.messages); // Debugging

                if (data.success) {
                    const uniqueMessages = data.messages.map((msg) => ({
                        ...msg,
                        senderImage: msg.senderImage || "default-image.jpg", // Ensure image exists
                    }));
                    setMessages(uniqueMessages);
                } else {
                    console.error("Failed to fetch messages");
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [receiverId, user._id]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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

        // Emit the message via Socket.io (for real-time update)
        socket.emit("sendMessage", newMessage); // Emit to server (Socket.io)

        // Clear the message input after sending
        setMessage("");
    };

    const deleteMessages = async (messageId) => {
        // Check if messageId is available, if not show error toast
        if (!messageId) {
            toast.error("You cannot delete this message, please try again later.");
            return;
        }

        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:2002/messages/${messageId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        const data = await res.json();

        if (data.success) {
            setMessages(prevMessages => prevMessages.filter(message => message._id !== messageId));
        } else {
            console.error("Failed to delete message:", data.message);
        }
    };

    const deleteUser = async (userId) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:2002/users/delete/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        const data = await res.json();
        if (data.success) {
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        } else {
            console.error("Failed to delete user:", data.message);
        }
    };

    console.log(users);

    return (
        <div className="container mt-4">
            <BackButton/>
            <div className="row mt-3">
                {/* User List */}
                <div className="col-md-4">
                    <div className="list-group">
                        {users.map(x => (
                            <Link key={x._id} to={`/messages/my-messages/${x._id}`}
                                  className="list-group-item list-group-item-action d-flex align-items-center position-relative">
                                <img src={x.image || "default-image.jpg"} alt={x.username}
                                     className="rounded-circle me-3" style={{ width: 40, height: 40, objectFit: "cover" }} />

                                <span>{x.username}</span>

                                {/* Green Bubble for Online Users */}
                                {x.online && (
                                    <span style={{
                                        marginLeft: '5px',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: 'green',
                                        borderRadius: '50%',
                                        display: 'inline-block'
                                    }}></span>
                                )}

                                {/* Admin delete button */}
                                <div className="d-flex me-2">
                                    {(user.username === "beyka") && (
                                        <button className="btn btn-sm" onClick={() => deleteUser(x._id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px"
                                                 viewBox="0 -960 960 960" width="24px" fill="#8B1A10">
                                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Chat Section */}
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header bg-light  d-flex align-items-center">
                            <img
                                src={profile?.image || "https://static.thenounproject.com/png/1195135-200.png"}
                                alt={profile?.username || "No Image Available"}
                                className="rounded-circle mr-2"
                                style={{ width: 50, height: 50, objectFit: "cover" }}
                            />

                            <h5 className="mb-0 ms-1 p-3">
                                {profile?.username ? `Chat with ${profile.username}` : "Select a user to see chat"}
                            </h5>
                        </div>
                        <div className="card-body chat-box p-3" style={{ height: "400px", overflowY: "auto" }}>
                            {messages.map((msg, index) => (
                                <div key={index}
                                     className={`d-flex mb-3 align-items-center ${msg.senderId === user._id ? 'justify-content-end' : 'justify-content-start'}`}>

                                    <div className='d-flex flex-column align-items-center'>
                                        {msg.senderId !== user._id && (
                                            <img src={msg.senderImage} alt={msg.senderUsername}
                                                 className="rounded-circle mr-2 me-2"
                                                 style={{width: 30, height: 30, objectFit: "cover"}}/>
                                        )}
                                        <div className="d-flex me-2">
                                            {(msg.senderId === user._id || user.username === "beyka") && (
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={async () => {
                                                        console.log("Deleting message with ID:", msg._id); // Log message ID before deletion
                                                        await deleteMessages(msg._id); // Call deleteMessages and wait for it to complete
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px"
                                                         viewBox="0 -960 960 960" width="24px" fill="#8B1A10">
                                                        <path
                                                            d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className={`p-3  me-2 ${msg.senderId === user._id ? 'bg-primary text-white' : 'bg-light'}`}
                                        style={{maxWidth: "75%"}}>
                                        <p className="mb-1">{msg.text}</p>
                                        <small
                                            className="text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</small>
                                    </div>
                                    {msg.senderId === user._id && (
                                        <img src={msg.senderImage} alt={msg.senderUsername}
                                             className="rounded-circle ml-2" style={{width: 30, height: 30}}/>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>
                        <div className="card-footer">
                            <form onSubmit={handleSendMessage} className="d-flex">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Type a message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-warning ms-2">Send</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div><ToastContainer /></div>
        </div>
    );
};

export default Messages;





