/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";
import { getResumeFingerprint } from "../utils/resumeAnalysis";

const ResumeContext = createContext();

const getInitialActiveResume = () => {
  try {
    const savedResume = localStorage.getItem("activeResume");
    return savedResume ? JSON.parse(savedResume) : null;
  } catch {
    return null;
  }
};

export function ResumeProvider({ children }) {
  const { user } = useAuth();
  const [activeResume, setActiveResume] = useState(getInitialActiveResume);

  const saveActiveResume = (resume) => {
    localStorage.removeItem("activeResumeAnalysis");
    localStorage.removeItem("activeMockInterviewQuestions");
    localStorage.setItem("activeResume", JSON.stringify(resume));
    setActiveResume(resume);

    if (localStorage.getItem("token") && resume?.text?.trim()) {
      API.post("/resumes/active", {
        ...resume,
        fingerprint: getResumeFingerprint(resume),
      }).catch((error) => {
        console.log(error.response?.data || error);
      });
    }
  };

  const clearActiveResume = () => {
    localStorage.removeItem("activeResumeAnalysis");
    localStorage.removeItem("activeMockInterviewQuestions");
    localStorage.removeItem("activeResume");
    setActiveResume(null);

    if (localStorage.getItem("token")) {
      API.delete("/resumes/active").catch((error) => {
        console.log(error.response?.data || error);
      });
    }
  };

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setActiveResume(null));
      return;
    }

    API.get("/resumes/active")
      .then((response) => {
        const resume = response.data.resume;

        if (!resume) return;

        const restoredResume = {
          fileName: resume.fileName,
          text: resume.text,
          uploadedAt: resume.uploadedAt,
        };

        localStorage.setItem("activeResume", JSON.stringify(restoredResume));
        setActiveResume(restoredResume);
      })
      .catch((error) => {
        console.log(error.response?.data || error);
      });
  }, [user]);

  return (
    <ResumeContext.Provider
      value={{ activeResume, saveActiveResume, clearActiveResume }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  return useContext(ResumeContext);
}
