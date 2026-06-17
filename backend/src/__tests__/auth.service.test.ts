import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../services/auth.service";

describe("auth validation schemas", () => {
  describe("registerSchema", () => {
    const validInput = {
      email: "test@example.com",
      password: "Valid1234",
      firstName: "Juan",
      lastName: "Perez",
      phone: "+51999888777",
    };

    it("accepts valid registration input", () => {
      const result = registerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("lowercases email", () => {
      const result = registerSchema.parse({ ...validInput, email: "TEST@Example.COM" });
      expect(result.email).toBe("test@example.com");
    });

    it("trims first and last names", () => {
      const result = registerSchema.parse({ ...validInput, firstName: "  Juan  ", lastName: "  Perez  " });
      expect(result.firstName).toBe("Juan");
      expect(result.lastName).toBe("Perez");
    });

    it("rejects invalid email", () => {
      const result = registerSchema.safeParse({ ...validInput, email: "not-an-email" });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = registerSchema.safeParse({ ...validInput, password: "Ab1" });
      expect(result.success).toBe(false);
    });

    it("rejects password without uppercase", () => {
      const result = registerSchema.safeParse({ ...validInput, password: "nouppercase1" });
      expect(result.success).toBe(false);
    });

    it("rejects password without lowercase", () => {
      const result = registerSchema.safeParse({ ...validInput, password: "NOLOWERCASE1" });
      expect(result.success).toBe(false);
    });

    it("rejects password without number", () => {
      const result = registerSchema.safeParse({ ...validInput, password: "NoNumberHere" });
      expect(result.success).toBe(false);
    });

    it("rejects short first name", () => {
      const result = registerSchema.safeParse({ ...validInput, firstName: "J" });
      expect(result.success).toBe(false);
    });

    it("rejects short last name", () => {
      const result = registerSchema.safeParse({ ...validInput, lastName: "P" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid phone format", () => {
      const result = registerSchema.safeParse({ ...validInput, phone: "abc" });
      expect(result.success).toBe(false);
    });

    it("accepts various phone formats", () => {
      const phones = ["+1 555-123-4567", "(011) 4321-5678", "+51999888777", "123 456 7890"];
      phones.forEach((phone) => {
        const result = registerSchema.safeParse({ ...validInput, phone });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login input", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "anything" });
      expect(result.success).toBe(true);
    });

    it("lowercases email", () => {
      const result = loginSchema.parse({ email: "Test@Example.COM", password: "pwd" });
      expect(result.email).toBe("test@example.com");
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({ email: "bad", password: "pwd" });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
      expect(result.success).toBe(false);
    });
  });
});
