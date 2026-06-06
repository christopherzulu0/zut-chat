import { afterEach, describe, expect, it } from "vitest";
import {
  getRoleFromClaims,
  getRoleFromPublicMetadata,
  isAdminUserId,
} from "./roles";

describe("roles", () => {
  afterEach(() => {
    delete process.env.ADMIN_USER_IDS;
  });

  it("reads admin from session metadata", () => {
    expect(
      getRoleFromClaims({ metadata: { role: "admin" } }, "user_1")
    ).toBe("admin");
  });

  it("falls back to ADMIN_USER_IDS", () => {
    process.env.ADMIN_USER_IDS = "user_admin,user_other";
    expect(getRoleFromClaims({}, "user_admin")).toBe("admin");
    expect(isAdminUserId("user_other")).toBe(true);
    expect(isAdminUserId("user_guest")).toBe(false);
  });

  it("reads admin from public metadata on client", () => {
    process.env.ADMIN_USER_IDS = "user_dev";
    expect(getRoleFromPublicMetadata({ role: "admin" }, "user_1")).toBe(
      "admin"
    );
    expect(getRoleFromPublicMetadata({}, "user_dev")).toBe("admin");
    expect(getRoleFromPublicMetadata({}, "user_1")).toBe("student");
  });
});
