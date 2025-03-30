import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1); // This takes the user to the previous page in history
    };

    return (
        <button onClick={goBack} className="btn btn-light" >
            Go Back
        </button>
    );
};

export default BackButton;