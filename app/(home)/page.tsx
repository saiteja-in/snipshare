import React from "react";
import NavBar from "../_components/navbar";
import { currentUser } from "@/lib/auth";

const Home = async () => {
  const user = await currentUser();

  return (
    <div className="">
      <NavBar/>
    </div>
  );
};

export default Home;