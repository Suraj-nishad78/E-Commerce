import { assets } from "../../assets/assets";
import "./footer.css";

import React from "react";


const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-left">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm3nxihNakgVW-ajUlSa55fuOrnhmwPsR4qA&s"
          alt="footer"
        />
        <h1>Busy-Buy</h1>
        <span> | </span>
        <p>©Busy-Buy™ | All rights reserved by Suraj Nishad.</p>
      </div>
      <div className="footer-right">
        <img src={assets.facebook_icon} alt="facebook" />
        <img src={assets.twitter_icon} alt="twitter" />
        <img src={assets.instagram_icon} alt="instagram" />
      </div>
    </div>
  );
};

export default Footer;
