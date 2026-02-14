import { createContext, useContext, useState } from "react";

const API = "https://fsa-jwt-practice.herokuapp.com";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState();
  const [location, setLocation] = useState("GATE");

  // TODO: signup
  async function signup(username) {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      
      let msg = `Signup failed (${res.status})`;
      try {
        const data = await res.json();
        msg = data?.error ?? data?.message ?? msg;
      } catch (e){
        //ignorre
      }
      throw new Error(msg);
    }

    const data = await res.json();
    if (!data?.token) {
      throw new Error("Signup succeeded but no token was returned.");
    }

    setToken(data.token);
    setLocation("TABLET");
    return data.token;
  }



  // TODO: authenticate

  async function authenticate() {
    if (!token) {
      throw new Error("No token found. Please sign up first.");
    }

    const res = await fetch(`${API}/authenticate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let msg = `Authentication failed (${res.status})`;
      try {
        const data = await res.json();
        msg = data?.error ?? data?.message ?? msg;
      } catch (e) {
      //ignore 
      }
      throw new Error(msg);
    }

    setLocation("TUNNEL");
    return true;
  }

  const value = { location, setToken, token, setLocation, signup, authenticate, };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
}
