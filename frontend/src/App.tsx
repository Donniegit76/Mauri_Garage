import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Lockscreen from "./components/Lockscreen";
import { getAuthStatus, getToken, setToken } from "./api/client";
import Home from "./pages/Home";
import CarDetailing from "./pages/CarDetailing";
import BodyworkProducts from "./pages/BodyworkProducts";
import ItemDetail from "./pages/ItemDetail";
import ItemForm from "./pages/ItemForm";
import ScaffaliList from "./pages/ScaffaliList";
import ScaffaleView from "./pages/ScaffaleView";
import ScatolaView from "./pages/ScatolaView";

type AuthState = "checking" | "locked" | "unlocked";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    async function checkAuth() {
      try {
        const { auth_required } = await getAuthStatus();
        if (!auth_required || getToken()) {
          setAuthState("unlocked");
        } else {
          setAuthState("locked");
        }
      } catch {
        setAuthState("locked");
      }
    }
    checkAuth();

    const handleUnauthorized = () => setAuthState("locked");
    window.addEventListener("mg-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("mg-unauthorized", handleUnauthorized);
  }, []);

  if (authState === "checking") {
    return <div className="min-h-screen bg-gti-black" />;
  }

  if (authState === "locked") {
    return (
      <Lockscreen
        onUnlocked={(token) => {
          setToken(token);
          setAuthState("unlocked");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gti-black pb-8">
      <Header />
      <main className="max-w-3xl mx-auto px-3 py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/car-detailing" element={<CarDetailing />} />
          <Route path="/carrozzeria" element={<BodyworkProducts />} />
          <Route path="/scaffali" element={<ScaffaliList />} />
          <Route path="/scaffali/:scaffale" element={<ScaffaleView />} />
          <Route path="/scaffali/:scaffale/:scatola" element={<ScatolaView />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/items/:id/edit" element={<ItemForm />} />
        </Routes>
      </main>
    </div>
  );
}
