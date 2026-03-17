import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Profile() {
  return (
    <div>

      <Header isBack={true} />

      <h1>Profile Screen</h1>
      <p>User Profile Details</p>

      <Footer />

    </div>
  );
}

export default Profile;