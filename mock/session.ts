import type { AuthMeResponse } from "@app/api/auth/me/route";
import type { Profile } from "@/types/user";
import type { MockUser } from "./users";

function fullProfileFor(user: MockUser): Profile {
  return {
    id: user.profileId,
    user_id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    avatar_url: user.avatarUrl,
    phone: null,
    location: "Berlin, Germany",
    normalized_location: null,
    latitude: null,
    longitude: null,
    linkedin_url: null,
    portfolio_url: null,
    github_url: null,
    cv_file_path: null,
    cv_analysis: null,
    available_start_date: null,
    salary_lower_bound: null,
    payout_currency: null,
    role: "member",
    subscription: null,
    source: null,
    utm: null,
    roles: [],
    willingness_to_relocate: [],
    job_types: [],
    preferred_work_environment: [],
    other_links: [],
    jobs_interest: [],
    updated_at: "2026-09-01T00:00:00.000Z",
    job_recommendations: null,
    show_hotkey_tooltips: true,
    notify_pending_reviews: true,
    sidebar_mode: "full",
    open_for_opportunities: null,
  };
}

export function authMeFor(user: MockUser | null): AuthMeResponse {
  if (!user) return { authenticated: false, user: null, profile: null, fullProfile: null, session: null };
  return {
    authenticated: true,
    user: { id: user.id, email: user.email, emailVerified: true, createdAt: "2026-03-02T09:14:00.000Z" },
    profile: { id: user.profileId, role: "member", firstName: user.firstName, lastName: user.lastName },
    fullProfile: fullProfileFor(user),
    session: { expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString() },
  };
}
