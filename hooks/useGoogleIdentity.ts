"use client";

import { useEffect, useState } from "react";

export function useGoogleIdentity() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Kiểm tra xem Google SDK đã load chưa
    if (window.google?.accounts?.id) {
      setReady(true);
      return;
    }

    const id = "google-identity-sdk";
    // Nếu script đã tồn tại, đợi nó load
    if (document.getElementById(id)) {
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          setReady(true);
          clearInterval(checkGoogle);
        }
      }, 100);
      
      return () => clearInterval(checkGoogle);
    }

    // Tạo và load script mới
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    
    s.onload = () => {
      // Đợi một chút để Google SDK khởi tạo hoàn toàn
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          setReady(true);
        } else {
          console.error("Google SDK loaded but window.google is not available");
        }
      }, 100);
    };
    
    s.onerror = () => {
      console.error("Failed to load Google Identity SDK");
      setReady(false);
    };
    
    document.body.appendChild(s);

    return () => {
      // Không remove script để tránh re-load
    };
  }, []);

  return ready;
}