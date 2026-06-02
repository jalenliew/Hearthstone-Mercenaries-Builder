import React from 'react';
import '../styles/pages/HomePage.scss';

const HomePage = () => {
    return(
        <div className="home">
            <h3 className="headers">
                About
            </h3>
            <p className="text">
                This app is meant to help build Hearthstone decks.  This app utilizes React, axios, Java Spring, Hearthstone API among other technologies to realize the project.
            </p>
            <h3 className="headers">
                Purpose
            </h3>
            <p className="text">
                This app is made for demonstration and learning purposes of my skills and abilities in web development and related ideas.  I have no affiliation with Hearthstone or the parent company.
            </p>
        </div>
    );
};

export default HomePage;