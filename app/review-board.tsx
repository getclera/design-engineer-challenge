"use client";

import { useEffect, useState } from "react";
import { PASS_CATEGORIES, STREAM_LABELS, streamOf } from "@/lib/categories";
import type { User } from "@/data/users";
import type { ReviewItem, ReviewListData, Role, TalentProfile } from "@/types";

export function ReviewBoard() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleId, setRoleId] = useState("");
  const [feed, setFeed] = useState<ReviewListData | null>(null);
  const [selected, setSelected] = useState<ReviewItem | null>(null);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [passReason, setPassReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then(setUser);
  }, []);

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then(setRoles);
  }, []);

  useEffect(() => {
    fetch(`/api/review${roleId ? `?roleId=${roleId}` : ""}`)
      .then((res) => res.json())
      .then(setFeed);
  }, [roleId]);

  useEffect(() => {
    if (!selected) return;
    setProfile(null);
    fetch(`/api/talents/${selected.talentId}`)
      .then((res) => res.json())
      .then(setProfile);
  }, [selected]);

  async function decide(action: "request_intro" | "pass") {
    if (!selected) return;
    const res = await fetch("/api/review/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        talentId: selected.talentId,
        jobId: selected.roleId,
        action,
        noFitCategories: passReason ? [passReason] : undefined,
      }),
    });
    const body = await res.json();
    setMessage(res.ok ? `Done: ${action}` : `Error: ${body.error}`);
    setSelected(null);
    setPassReason("");
    const refreshed = await fetch(`/api/review${roleId ? `?roleId=${roleId}` : ""}`);
    setFeed(await refreshed.json());
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="p-4">
      <div className="flex justify-end gap-2">
        {user && (
          <span>
            {user.name} ({user.companyName})
          </span>
        )}
        <button onClick={logout} className="border px-2">
          Log out
        </button>
      </div>
      <h1 className="text-2xl font-bold">Review</h1>
      <p>Everyone waiting on your decision</p>

      <div className="my-3">
        <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="border">
          <option value="">All roles ({feed?.totalCount})</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} {role.status === "paused" ? "(paused)" : ""} ({feed?.byRole[role.id]?.pending ?? 0})
            </option>
          ))}
        </select>
        {message && <span className="ml-3">{message}</span>}
      </div>

      <div className="flex gap-4">
        <ul className="w-1/3">
          {feed?.items.map((item) => (
            <li
              key={item.talentId}
              onClick={() => setSelected(item)}
              className="border p-2 cursor-pointer"
              style={{ background: selected === item ? "#eee" : "white" }}
            >
              <div className="flex gap-2">
                {item.talentAvatarUrl && <img src={item.talentAvatarUrl} width={32} height={32} alt="" />}
                <b>{item.talentName}</b>
              </div>
              <div>{item.talentOneliner}</div>
              <div>{STREAM_LABELS[streamOf(item.bucket)]} · {item.roleName}</div>
              <div>{item.companies.map((c) => c.name).join(", ")}</div>
              <div>{item.receivedAt}</div>
            </li>
          ))}
        </ul>

        <div className="w-2/3 border p-3">
          {!selected && <p>Select a candidate</p>}
          {selected && (
            <div>
              <h2 className="text-xl font-bold">{selected.talentName}</h2>
              <p>{selected.headline}</p>
              <p>Role: {selected.roleName}</p>
              <h3 className="font-bold mt-2">Why it&apos;s a match</h3>
              <p>{selected.fitReason}</p>

              {!profile && <p>Loading...</p>}
              {profile && (
                <div>
                  <p>
                    {profile.header.location} · {profile.header.yearsExperience} years
                  </p>
                  <a href={profile.header.linkedinUrl ?? ""}>LinkedIn</a>
                  <h3 className="font-bold mt-2">Experience</h3>
                  {profile.experiences.map((e) => (
                    <div key={e.company}>
                      {e.title} at {e.company} ({e.startDate} - {e.endDate ?? "now"})
                    </div>
                  ))}
                  <h3 className="font-bold mt-2">Education</h3>
                  {profile.education.map((e) => (
                    <div key={e.school}>{e.school}</div>
                  ))}
                  <h3 className="font-bold mt-2">Skills</h3>
                  <p>{profile.skills.join(", ")}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button onClick={() => decide("request_intro")} className="border px-2">
                  Request intro
                </button>
                <select value={passReason} onChange={(e) => setPassReason(e.target.value)} className="border">
                  <option value="">Pass reason...</option>
                  {PASS_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button onClick={() => decide("pass")} className="border px-2">
                  Pass
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
