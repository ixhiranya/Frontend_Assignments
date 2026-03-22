import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <div>
      <Header isBack={false} />

      <h1>Home Screen</h1>

      <Footer />
    </div>
  );
};

export default Home;