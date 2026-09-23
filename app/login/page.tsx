"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError((await res.json()).error);
      return;
    }
    window.location.href = new URLSearchParams(window.location.search).get("next") ?? "/";
  }

  return (
    <form onSubmit={submit} className="p-4 flex flex-col gap-2 w-80">
      <h1 className="text-2xl font-bold">Log in</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border" />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border"
      />
      <button type="submit" className="border">
        Log in
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
