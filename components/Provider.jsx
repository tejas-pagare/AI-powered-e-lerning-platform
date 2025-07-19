"use client";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { userContextProvider } from "@/context/userContext";
import { SelectedChapter } from "@/context/SelectedChapterContext";
function Provider({ children }) {
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  useEffect(() => {
    user && createUser();
  }, [user]);
  const createUser = async () => {
    try {
      const response = await axios.post("/api/user", {
        name: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
      });
      setUserDetails(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <userContextProvider.Provider value={{ userDetails, setUserDetails }}>
        <SelectedChapter.Provider
          value={{ selectedChapter, setSelectedChapter }}
        >
          {children}
        </SelectedChapter.Provider>
      </userContextProvider.Provider>
    </div>
  );
}

export default Provider;
