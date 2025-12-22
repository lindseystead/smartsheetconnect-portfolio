/**
 * Schema Validation Tests
 * 
 * Tests for Zod validation schemas in shared/schema.ts.
 * Ensures data validation works correctly for lead submissions.
 * 
 * @fileoverview
 * These tests validate:
 * - Email validation (format, length)
 * - Name validation (required, length, trimming)
 * - Phone validation (optional, format)
 * - Message validation (required, length, trimming)
 */

import { describe, it, expect } from "vitest";
import { leadSubmissionSchema } from "./schema";

describe("leadSubmissionSchema", () => {
  describe("valid submissions", () => {
    it("should accept valid lead submission with all fields", () => {
      const validLead = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        message: "I'm interested in your services",
      };

      const result = leadSubmissionSchema.safeParse(validLead);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("john.doe@example.com");
        expect(result.data.phone).toBe("(555) 123-4567");
        expect(result.data.message).toBe("I'm interested in your services");
      }
    });

    it("should accept valid lead submission without phone (optional field)", () => {
      const validLead = {
        name: "Jane Smith",
        email: "jane@example.com",
        message: "Please contact me",
      };

      const result = leadSubmissionSchema.safeParse(validLead);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBeUndefined();
      }
    });

    it("should trim whitespace from name and message, and lowercase email", () => {
      // Note: Zod validates email format before trimming, so email must be valid format
      // However, we can test that valid emails with uppercase get lowercased
      const leadWithWhitespace = {
        name: "  John Doe  ",
        email: "JOHN@EXAMPLE.COM", // Valid email format, will be lowercased
        message: "  I'm interested  ",
      };

      const result = leadSubmissionSchema.safeParse(leadWithWhitespace);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("john@example.com"); // Lowercased
        expect(result.data.message).toBe("I'm interested");
      }
    });

    it("should convert email to lowercase", () => {
      const leadWithUppercaseEmail = {
        name: "John Doe",
        email: "JOHN.DOE@EXAMPLE.COM",
        message: "Test message",
      };

      const result = leadSubmissionSchema.safeParse(leadWithUppercaseEmail);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john.doe@example.com");
      }
    });

    it("should accept various phone number formats", () => {
      const phoneFormats = [
        "(555) 123-4567",
        "555-123-4567",
        "555 123 4567",
        "5551234567",
      ];

      phoneFormats.forEach((phone) => {
        const lead = {
          name: "John Doe",
          email: "john@example.com",
          phone,
          message: "Test message",
        };

        const result = leadSubmissionSchema.safeParse(lead);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("invalid submissions", () => {
    it("should reject submission without name", () => {
      const invalidLead = {
        email: "john@example.com",
        message: "Test message",
      };

      const result = leadSubmissionSchema.safeParse(invalidLead);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("name");
      }
    });

    it("should reject submission with empty name", () => {
      const invalidLead = {
        name: "",
        email: "john@example.com",
        message: "Test message",
      };

      const result = leadSubmissionSchema.safeParse(invalidLead);
      
      expect(result.success).toBe(false);
    });

    it("should reject submission with name longer than 100 characters", () => {
      const invalidLead = {
        name: "A".repeat(101),
        email: "john@example.com",
        message: "Test message",
      };

      const result = leadSubmissionSchema.safeParse(invalidLead);
      
      expect(result.success).toBe(false);
    });

    it("should reject submission without email", () => {
      const invalidLead = {
        name: "John Doe",
        message: "Test message",
      };

      const result = leadSubmissionSchema.safeParse(invalidLead);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("should reject submission with invalid email format", () => {
      const invalidEmails = [
        "notanemail",
        "missing@domain",
        "@example.com",
        "test@",
        "test..test@example.com",
      ];

      invalidEmails.forEach((email) => {
        const lead = {
          name: "John Doe",
          email,
          message: "Test message",
        };

        const result = leadSubmissionSchema.safeParse(lead);
        expect(result.success).toBe(false);
      });
    });

    it("should reject submission with email longer than 255 characters", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      const invalidLead = {
        name: "John Doe",
        email: longEmail,
        message: "Test message",
      };

      const result = leadSubmissionSchema.safeParse(invalidLead);
      
      expect(result.success).toBe(false);
    });

    it("should reject submission with invalid phone format", () => {
      const invalidPhones = [
        "123", // Too short
        "abc-def-ghij", // Non-numeric
        "555-123", // Incomplete
        "+1-555-123-456-7890", // Too long
      ];

      invalidPhones.forEach((phone) => {
        const lead = {
          name: "John Doe",
          email: "john@example.com",
          phone,
          message: "Test message",
        };

        const result = leadSubmissionSchema.safeParse(lead);
        expect(result.success).toBe(false);
      });
    });

    it("should reject submission without message", () => {
      const invalidLead = {
        name: "John Doe",
        email: "john@example.com",
      };

      const result = leadSubmissionSchema.safeParse(invalidLead);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("message");
      }
    });

    it("should reject submission with empty message", () => {
      const invalidLead = {
        name: "John Doe",
        email: "john@example.com",
        message: "",
      };

      const result = leadSubmissionSchema.safeParse(invalidLead);
      
      expect(result.success).toBe(false);
    });

    it("should reject submission with message longer than 1000 characters", () => {
      const invalidLead = {
        name: "John Doe",
        email: "john@example.com",
        message: "A".repeat(1001),
      };

      const result = leadSubmissionSchema.safeParse(invalidLead);
      
      expect(result.success).toBe(false);
    });
  });
});

