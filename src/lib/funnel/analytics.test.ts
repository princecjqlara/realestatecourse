import { describe, expect, it } from "vitest";

import { buildAnalyticsSummary } from "./analytics";

describe("buildAnalyticsSummary", () => {
  it("aggregates lead, topic, and subtopic watch performance", () => {
    const summary = buildAnalyticsSummary({
      leads: [
        { id: "lead-1", fullName: "Jane Smith", email: "jane@example.com" },
        { id: "lead-2", fullName: "John Doe", email: "john@example.com" },
      ],
      topics: [
        { id: "topic-1", title: "Campaign Basics" },
        { id: "topic-2", title: "Creative System" },
      ],
      subtopics: [
        {
          id: "subtopic-1",
          topicId: "topic-1",
          title: "Audience setup",
          durationSeconds: 200,
        },
        {
          id: "subtopic-2",
          topicId: "topic-2",
          title: "Ad creative teardown",
          durationSeconds: 100,
        },
      ],
      authEvents: [
        { leadId: "lead-1", type: "resume-login" },
        { leadId: "lead-1", type: "resume-login" },
        { leadId: "lead-2", type: "resume-login" },
      ],
      watchEvents: [
        {
          leadId: "lead-1",
          subtopicId: "subtopic-1",
          sessionId: "session-1",
          watchedSeconds: 150,
        },
        {
          leadId: "lead-1",
          subtopicId: "subtopic-2",
          sessionId: "session-2",
          watchedSeconds: 100,
        },
        {
          leadId: "lead-2",
          subtopicId: "subtopic-1",
          sessionId: "session-3",
          watchedSeconds: 50,
        },
      ],
    });

    expect(summary.overview).toEqual({
      totalLeads: 2,
      totalWatchSeconds: 300,
      averageWatchSeconds: 150,
      averageCompletionRate: 50,
      totalResumeLogins: 3,
      totalViews: 3,
    });

    expect(summary.leads).toEqual([
      {
        leadId: "lead-1",
        fullName: "Jane Smith",
        email: "jane@example.com",
        resumeLogins: 2,
        totalWatchSeconds: 250,
        totalViews: 2,
        completionRate: 83.3,
      },
      {
        leadId: "lead-2",
        fullName: "John Doe",
        email: "john@example.com",
        resumeLogins: 1,
        totalWatchSeconds: 50,
        totalViews: 1,
        completionRate: 16.7,
      },
    ]);

    expect(summary.topics).toEqual([
      {
        topicId: "topic-1",
        title: "Campaign Basics",
        retentionRate: 50,
        averageWatchSeconds: 100,
      },
      {
        topicId: "topic-2",
        title: "Creative System",
        retentionRate: 100,
        averageWatchSeconds: 100,
      },
    ]);

    expect(summary.subtopics).toEqual([
      {
        subtopicId: "subtopic-1",
        topicId: "topic-1",
        title: "Audience setup",
        retentionRate: 50,
        averageWatchSeconds: 100,
      },
      {
        subtopicId: "subtopic-2",
        topicId: "topic-2",
        title: "Ad creative teardown",
        retentionRate: 100,
        averageWatchSeconds: 100,
      },
    ]);
  });

  it("caps completion and retention at 100 percent when a lesson is replayed", () => {
    const summary = buildAnalyticsSummary({
      leads: [{ id: "lead-1", fullName: "Replay Lead", email: "replay@example.com" }],
      topics: [{ id: "topic-1", title: "Campaign Basics" }],
      subtopics: [
        {
          id: "subtopic-1",
          topicId: "topic-1",
          title: "Audience setup",
          durationSeconds: 100,
        },
      ],
      authEvents: [],
      watchEvents: [
        {
          leadId: "lead-1",
          subtopicId: "subtopic-1",
          sessionId: "session-1",
          watchedSeconds: 100,
        },
        {
          leadId: "lead-1",
          subtopicId: "subtopic-1",
          sessionId: "session-2",
          watchedSeconds: 60,
        },
      ],
    });

    expect(summary.overview.totalWatchSeconds).toBe(160);
    expect(summary.leads[0]?.completionRate).toBe(100);
    expect(summary.subtopics[0]?.retentionRate).toBe(100);
  });
});
