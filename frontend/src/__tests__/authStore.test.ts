import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../store/authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null });
  });

  it("starts with null user and token", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it("setAuth stores user and token", () => {
    const user = { id: "1", email: "a@b.com", firstName: "A", lastName: "B", phone: "123" };
    useAuthStore.getState().setAuth(user, "token-123");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe("token-123");
  });

  it("setAccessToken updates only the token", () => {
    const user = { id: "1", email: "a@b.com", firstName: "A", lastName: "B", phone: "123" };
    useAuthStore.getState().setAuth(user, "old-token");
    useAuthStore.getState().setAccessToken("new-token");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe("new-token");
  });

  it("logout clears user and token", () => {
    const user = { id: "1", email: "a@b.com", firstName: "A", lastName: "B", phone: "123" };
    useAuthStore.getState().setAuth(user, "token");
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});
