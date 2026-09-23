export const ORG_ID = "7d3f5c1e-2b4a-4c8e-9f10-5a6b7c8d9e01";

export function talentUuid(key: string): string {
  return `a1b2c3d4-0000-4000-8000-0000000000${key.slice(1).padStart(2, "0")}`;
}

export const ROLE_IDS = {
  backend: "5e0b1c2d-1111-4a00-8000-000000000001",
  design: "5e0b1c2d-2222-4a00-8000-000000000002",
  ml: "5e0b1c2d-3333-4a00-8000-000000000003",
  growth: "5e0b1c2d-4444-4a00-8000-000000000004",
  productEng: "5e0b1c2d-5555-4a00-8000-000000000005",
} as const;
