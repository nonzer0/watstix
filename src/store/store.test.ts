import { describe, it, expect, beforeEach, vi } from "vitest";
import { useStore } from "./store";
import type { JobApplication } from "../lib/supabase";

describe("useStore", () => {
  beforeEach(() => {
    useStore.setState({ jobs: [] });
  });

  const mockJobs: JobApplication[] = [
    {
      id: "1",
      user_id: "user1",
      company_name: "Company A",
      position_title: "Developer",
      application_date: "2023-01-01",
      status: "applied",
      created_at: "2023-01-01",
      updated_at: "2023-01-01",
    } as JobApplication,
    {
      id: "2",
      user_id: "user2",
      company_name: "Company B",
      position_title: "Designer",
      application_date: "2023-02-01",
      status: "interviewing",
      created_at: "2023-02-01",
      updated_at: "2023-02-01",
    } as JobApplication,
  ];

  describe("setJobs", () => {
    it("should set jobs in the store", () => {
      useStore.getState().setJobs(mockJobs);

      expect(useStore.getState().jobs).toEqual(mockJobs);
    });

    it("should replace existing jobs", () => {
      const initialJobs: JobApplication[] = mockJobs;
      const newJobs: JobApplication[] = [
        {
          id: "2",
          user_id: "user2",
          company_name: "Company B",
          position_title: "Designer",
          application_date: "2023-02-01",
          status: "interviewing",
          created_at: "2023-02-01",
          updated_at: "2023-02-01",
        } as JobApplication,
      ];

      useStore.getState().setJobs(initialJobs);
      useStore.getState().setJobs(newJobs);

      expect(useStore.getState().jobs).toEqual(newJobs);
    });
  });

  describe("deleteJob", () => {
    it("should delete a job by id", () => {
      useStore.getState().setJobs(mockJobs);
      useStore.getState().deleteJob("1");

      expect(useStore.getState().jobs).toHaveLength(1);
      expect(useStore.getState().jobs[0].id).toBe("2");
    });

    it("should not modify state when deleting non-existent job", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      useStore.getState().setJobs(mockJobs);
      useStore.getState().deleteJob("non-existent");

      expect(useStore.getState().jobs).toEqual(mockJobs);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Cannot delete: Job with id non-existent not found",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("updateJob", () => {
    it("should update a job by id", () => {
      useStore.getState().setJobs(mockJobs);
      useStore.getState().updateJob("1", { company_name: "Updated Company" });

      expect(useStore.getState().jobs[0].company_name).toBe("Updated Company");
      expect(useStore.getState().jobs[0].position_title).toBe("Developer");
    });

    it("should not modify state when updating non-existent job", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      useStore.getState().setJobs(mockJobs);
      useStore
        .getState()
        .updateJob("non-existent", { company_name: "Updated" });

      expect(useStore.getState().jobs).toEqual(mockJobs);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Cannot update: Job with id non-existent not found",
      );

      consoleSpy.mockRestore();
    });

    it("should update multiple fields", () => {
      useStore.getState().setJobs(mockJobs);
      useStore
        .getState()
        .updateJob("1", {
          company_name: "New Company",
          position_title: "Senior Developer",
        });

      expect(useStore.getState().jobs[0].company_name).toBe("New Company");
      expect(useStore.getState().jobs[0].position_title).toBe(
        "Senior Developer",
      );
    });
  });
});
