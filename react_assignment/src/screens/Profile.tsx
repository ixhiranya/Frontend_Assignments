import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Profile: React.FC = () => {
  return (
    <div>
      <Header isBack={true} />

      <h1>Profile Screen</h1>

      <Footer />
    </div>
  );
};

export default Profile;