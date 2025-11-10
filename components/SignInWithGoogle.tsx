// // components/SignInWithGoogle.tsx
// "use client";
// import { useEffect } from "react";

// declare global {
//   interface Window {
//     google: {
//       accounts: {
//         id: {
//           initialize: (config: {
//             client_id: string;
//             callback: (response: { credential?: string }) => void;
//           }) => void;
//           renderButton: (
//             element: HTMLElement | null,
//             options: { theme: string; size: string }
//           ) => void;
//           prompt: () => void;
//         };
//       };
//     };
//   }
// }
// export default function SignInWithGoogle() {
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
//     if (!clientId) {
//       console.error("Set NEXT_PUBLIC_GOOGLE_CLIENT_ID");
//       return;
//     }
//     const script = document.createElement("script");
//     script.src = "https://accounts.google.com/gsi/client";
//     script.async = true;
//     script.defer = true;
//     script.onload = () => {
//       if (!window.google) return;
//       window.google.accounts.id.initialize({
//         client_id: clientId,
//         callback: handleCredentialResponse,
//       });
//       window.google.accounts.id.renderButton(
//         document.getElementById("g_id_signin"),
//         { theme: "outline", size: "large" }
//       );
//       // Optional: one-tap:
//       // window.google.accounts.id.prompt();
//     };
//     document.body.appendChild(script);
//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   async function handleCredentialResponse(response: { credential?: string }) {
//     const idToken = response?.credential;
//     if (!idToken) {
//       console.error("No credential from Google");
//       return;
//     }
//     // Gửi idToken lên backend .NET để verify và tạo session/cookie
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/GoogleIdToken`,
//         {
//           method: "POST",
//           credentials: "include", // nếu backend set httpOnly cookie
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ idToken }),
//         }
//       );
//       if (!res.ok) throw new Error("Login thất bại");
//       const data = await res.json();
//       console.log("Đăng nhập thành công:", data);
//       // redirect hoặc update UI
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   return <div id="g_id_signin"></div>;
// }
