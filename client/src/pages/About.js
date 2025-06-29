// client/src/pages/About.js
import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-page__container">
        <h1 className="about-page__title">About Moon People</h1>
        
        <section className="about-page__section">
          <h2 className="about-page__section-title">Our Vision</h2>
          <p className="about-page__text">
            Moon People is a digital sanctuary for those navigating the complexities of cancer diagnoses and treatment. 
            Our platform bridges the gap between those seeking support and those offering it, creating a warm, 
            accessible community where no one faces cancer alone.
          </p>
          <p className="about-page__text">
            By connecting patients with volunteers, resources, and peer support, we aim to transform 
            the cancer journey from one of isolation to one of connection and hope. Our ultimate vision 
            is to create pathways for support recipients to eventually become support providers, 
            completing a cycle of healing and empowerment.
          </p>
        </section>
        
        <section className="about-page__section">
          <h2 className="about-page__section-title">Our Approach</h2>
          <p className="about-page__text">
            We believe in the power of community, shared experience, and practical support. 
            Our platform offers:
          </p>
          <ul className="about-page__list">
            <li className="about-page__list-item">Connections to local volunteers who can offer practical support</li>
            <li className="about-page__list-item">Curated resources providing reliable information about cancer treatment and support</li>
            <li className="about-page__list-item">A community forum where people can share experiences and find comfort</li>
            <li className="about-page__list-item">Easy-to-book services like therapy, beauty services, and physical activities adapted for cancer patients</li>
          </ul>
        </section>
        
        <section className="about-page__section">
          <h2 className="about-page__section-title">Our Story</h2>
          <p className="about-page__text">
            Moon People was founded by a group of cancer survivors and caregivers who experienced 
            firsthand the challenges of navigating a cancer diagnosis. Through their own journeys, 
            they identified gaps in support systems and created Moon People to address these needs.
          </p>
          <p className="about-page__text">
            The name "Moon People" represents our community - just as the moon reflects light in darkness, 
            our members reflect hope and guidance to each other during difficult times.
          </p>
        </section>
        
        <section className="about-page__section">
          <h2 className="about-page__section-title">Join Us</h2>
          <p className="about-page__text">
            Whether you're seeking support or want to offer it, Moon People welcomes you. 
            Together, we can transform the cancer experience and create a community where 
            everyone finds the support they need.
          </p>
          <div className="about-page__cta">
            <a 
              href="/register" 
              className="about-page__btn about-page__btn--primary"
            >
              Join Our Community
            </a>
            <a 
              href="/contact" 
              className="about-page__btn about-page__btn--outline"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;