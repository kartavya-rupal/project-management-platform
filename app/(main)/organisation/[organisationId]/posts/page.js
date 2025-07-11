import React from "react";
import PostCreateButton from "./components/PostCreateButton";

const Page = async ({ params }) => {

  return (
    <div className="flex justify-center items-center h-screen">
      <PostCreateButton />
    </div>
  );
};

export default Page;
