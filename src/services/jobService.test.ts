import { describe, it, expect, vi, beforeEach } from "vitest";
import { jobService } from "./jobService";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
  JobApplication: {},
}));

describe("jobService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getJobs", () => {
    it("should return jobs when data is available", async () => {
      const mockJobs = [
        { id: "1", application_date: "2024-01-01" },
        { id: "2", application_date: "2024-01-02" },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockJobs, error: null }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await jobService.getJobs();

      expect(result).toEqual(mockJobs);
      expect(mockFrom).toHaveBeenCalledWith("job_applications");
    });

    it("should return empty array when data is null", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await jobService.getJobs();

      expect(result).toEqual([]);
    });

    it("should return empty array and log error on failure", async () => {
      const mockError = new Error("Database error");
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await jobService.getJobs();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch applications:",
        mockError,
      );
    });
  });

  describe("getJobById", () => {
    it("should return job when found", async () => {
      const mockJob = { id: "1", application_date: "2024-01-01" };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockJob, error: null }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await jobService.getJobById("1");

      expect(result).toEqual(mockJob);
      expect(mockFrom).toHaveBeenCalledWith("job_applications");
    });

    it("should return null and log error when job not found", async () => {
      const mockError = new Error("Not found");
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await jobService.getJobById("999");

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch application by ID:",
        mockError,
      );
    });

    describe("deleteJobById", () => {
      it("should return true when deletion is successful", async () => {
        const mockFrom = vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        });

        (supabase.from as any) = mockFrom;

        const result = await jobService.deleteJobById("1");

        expect(result).toBe(true);
        expect(mockFrom).toHaveBeenCalledWith("job_applications");
      });

      it("should return false and log error when deletion fails", async () => {
        const mockError = new Error("Delete failed");
        const mockFrom = vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: mockError }),
          }),
        });

        (supabase.from as any) = mockFrom;

        const result = await jobService.deleteJobById("1");

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(
          "Failed to delete application by ID:",
          mockError,
        );
      });
    });
  });
});
