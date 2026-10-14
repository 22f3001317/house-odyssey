"use client";
import { useState } from "react";
import ApiForm from "./ApiForm";
export default function AuthPanel() {
  const [tab, setTab] = useState<"login" | "signup" | "resend">("login");
  const tabCls = (t: string) => `px-4 py-2 font-bold border-b-4 ${tab === t ? "border-compass" : "border-transparent"}`;
  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-2">
        <button role="tab" aria-selected={tab === "login"} className={tabCls("login")} onClick={() => setTab("login")}>Sign in</button>
        <button role="tab" aria-selected={tab === "signup"} className={tabCls("signup")} onClick={() => setTab("signup")}>Create account</button>
        <button role="tab" aria-selected={tab === "resend"} className={tabCls("resend")} onClick={() => setTab("resend")}>Resend link</button>
      </div>
      {tab === "resend" ? <ApiForm endpoint="/api/auth/resend" submitLabel="Resend confirmation email" fields={[{ name: "email", label: "College email", type: "email", autoComplete: "email" }]} />
        : tab === "login"
        ? <ApiForm endpoint="/api/auth/login" submitLabel="Sign in" fields={[{ name: "email", label: "College email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "current-password" }]} />
        : <ApiForm endpoint="/api/auth/signup" submitLabel="Create account" fields={[{ name: "name", label: "Name", autoComplete: "name" }, { name: "email", label: "College email", type: "email", autoComplete: "email" }, { name: "password", label: "Password (10+ characters)", type: "password", autoComplete: "new-password" }]} />}
    </div>
  );
}
