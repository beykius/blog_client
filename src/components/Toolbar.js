import React, {useState, useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import useStore from "../store/main";

const Toolbar = () => {
    const user = useStore((state) => state.user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, window.innerHeight);
    }, [location]); //

    return (
        <div className='toolbar container p-2 '>
            <div className='d-none d-lg-flex d-flex '> {!user && (
                <div className='d-flex gap-3'>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>


            )}
            {user && (
                <div className="d-flex gap-3  justify-content-between w-100">
                    <div className='d-flex gap-3'>
                        <span className='me-4'>Welcome, <b>{user.username}! </b></span>
                        <span><Link to="/posts">Posts</Link></span>
                        <span><Link to="/create-post">Create Post</Link></span>
                        <span><Link to="/favorites">Favorite Posts</Link></span>
                        <span><Link to="/profile/">My Profile</Link></span>
                        <span><Link to="/messages/">Messages</Link></span>
                    </div>
                    <div><Link to='/logout'>Logout</Link></div>
                </div>
            )}
        </div>

            {/* Mobile Menu (visible on smaller screens) */}
            <nav className="d-block d-lg-none">
                <div className="navbar d-flex justify-content-end">
                    <div
                        className="navbar-toggler"
                        type="button"
                        onClick={toggleMenu}
                        aria-expanded={isMenuOpen ? "true" : "false"}
                        aria-label="Toggle navigation"
                    >
                        <p className="navbar-toggler-icon"></p>
                    </div>
                </div>

                {/* Modal that opens on the right side */}
                <div
                    className={`menu-modal ${isMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMenuOpen(false)} // Close modal if clicked outside
                >
                    <div
                        className="menu-content"
                        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                    >
                        {/* Close Button (X) */}
                        <button className="close-btn" onClick={closeMenu}>
                            X
                        </button>

                        <ul className="navbar-nav">
                            {!user && (<>
                                <li className="nav-item">
                                <Link to="/login">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register">Register</Link>
                            </li></>)}
                            {user && (
                            <>
                                <li className="nav-item">
                                    <span className="me-4"><i>Welcome, <b>{user.username}!</b></i></span>
                                </li>
                                <li className="nav-item">
                                    <Link to="/posts">Posts</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/create-post">Create Post</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/favorites">Favorite Posts</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/profile/">My Profile</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/messages/">Messages</Link>
                                </li><li className="nav-item">
                                <Link to='/logout'>Logout</Link>
                                </li>
                            </>)}

                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Toolbar;