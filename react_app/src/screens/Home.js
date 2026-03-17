import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Home() {
  return (
    <div>

      <Header isBack={false} />

      <h1>Home Screen</h1>
      <p>Welcome to the Home Page</p>

      <Footer />

    </div>
  );
}

export default Home;