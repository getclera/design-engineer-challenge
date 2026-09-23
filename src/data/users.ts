export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: "owner" | "editor" | "viewer";
}

export const DEMO_PASSWORD = "review-demo";

export const USERS: User[] = [
  { id: "u_hm", name: "Robin Keller", email: "robin@tidewater.example", companyName: "Tidewater Labs", role: "owner" },
  { id: "u_viewer", name: "Sam Ortiz", email: "sam@tidewater.example", companyName: "Tidewater Labs", role: "viewer" },
];
