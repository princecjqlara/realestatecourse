type LeadSummaryInput = {
  id: string;
  fullName: string;
  email: string;
};

type TopicSummaryInput = {
  id: string;
  title: string;
};

type SubtopicSummaryInput = {
  id: string;
  topicId: string;
  title: string;
  durationSeconds: number;
};

type AuthEventInput = {
  leadId: string;
  type: string;
};

type WatchEventInput = {
  leadId: string;
  subtopicId: string;
  sessionId: string;
  watchedSeconds: number;
};

type AnalyticsInput = {
  leads: LeadSummaryInput[];
  topics: TopicSummaryInput[];
  subtopics: SubtopicSummaryInput[];
  authEvents: AuthEventInput[];
  watchEvents: WatchEventInput[];
};

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function buildAnalyticsSummary(input: AnalyticsInput) {
  const authLoginsByLead = new Map<string, number>();
  const subtopicDurationById = new Map(
    input.subtopics.map((subtopic) => [subtopic.id, subtopic.durationSeconds] as const),
  );

  for (const event of input.authEvents) {
    if (event.type !== "resume-login") {
      continue;
    }

    authLoginsByLead.set(event.leadId, (authLoginsByLead.get(event.leadId) ?? 0) + 1);
  }

  const totalCourseDuration = input.subtopics.reduce(
    (total, subtopic) => total + subtopic.durationSeconds,
    0,
  );

  const watchTotalsByLead = new Map<string, number>();
  const watchSessionsByLead = new Map<string, Set<string>>();
  const watchTotalsBySubtopic = new Map<string, number>();
  const cappedWatchTotalsByLead = new Map<string, number>();
  const cappedWatchTotalsBySubtopic = new Map<string, number>();
  const watchTotalsByLeadSubtopic = new Map<string, number>();
  const viewersBySubtopic = new Map<string, Set<string>>();

  for (const event of input.watchEvents) {
    watchTotalsByLead.set(event.leadId, (watchTotalsByLead.get(event.leadId) ?? 0) + event.watchedSeconds);

    const leadSessions = watchSessionsByLead.get(event.leadId) ?? new Set<string>();
    leadSessions.add(event.sessionId);
    watchSessionsByLead.set(event.leadId, leadSessions);

    watchTotalsBySubtopic.set(
      event.subtopicId,
      (watchTotalsBySubtopic.get(event.subtopicId) ?? 0) + event.watchedSeconds,
    );

    const viewers = viewersBySubtopic.get(event.subtopicId) ?? new Set<string>();
    viewers.add(event.leadId);
    viewersBySubtopic.set(event.subtopicId, viewers);

    const compositeKey = `${event.leadId}:${event.subtopicId}`;
    watchTotalsByLeadSubtopic.set(
      compositeKey,
      (watchTotalsByLeadSubtopic.get(compositeKey) ?? 0) + event.watchedSeconds,
    );
  }

  for (const [compositeKey, rawWatchSeconds] of watchTotalsByLeadSubtopic.entries()) {
    const [leadId, subtopicId] = compositeKey.split(":");
    const durationSeconds = subtopicDurationById.get(subtopicId) ?? 0;
    const cappedWatchSeconds = durationSeconds
      ? Math.min(rawWatchSeconds, durationSeconds)
      : rawWatchSeconds;

    cappedWatchTotalsByLead.set(
      leadId,
      (cappedWatchTotalsByLead.get(leadId) ?? 0) + cappedWatchSeconds,
    );
    cappedWatchTotalsBySubtopic.set(
      subtopicId,
      (cappedWatchTotalsBySubtopic.get(subtopicId) ?? 0) + cappedWatchSeconds,
    );
  }

  const leads = input.leads
    .map((lead) => {
      const totalWatchSeconds = watchTotalsByLead.get(lead.id) ?? 0;
      const totalViews = watchSessionsByLead.get(lead.id)?.size ?? 0;
      const cappedWatchSeconds = cappedWatchTotalsByLead.get(lead.id) ?? 0;
      const completionRate = totalCourseDuration
        ? roundToSingleDecimal((cappedWatchSeconds / totalCourseDuration) * 100)
        : 0;

      return {
        leadId: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        resumeLogins: authLoginsByLead.get(lead.id) ?? 0,
        totalWatchSeconds,
        totalViews,
        completionRate,
      };
    })
    .sort((left, right) => right.totalWatchSeconds - left.totalWatchSeconds);

  const subtopics = input.subtopics.map((subtopic) => {
    const totalWatchSeconds = cappedWatchTotalsBySubtopic.get(subtopic.id) ?? 0;
    const viewerCount = viewersBySubtopic.get(subtopic.id)?.size ?? 0;
    const averageWatchSeconds = viewerCount
      ? roundToSingleDecimal(totalWatchSeconds / viewerCount)
      : 0;
    const retentionRate = viewerCount && subtopic.durationSeconds
      ? roundToSingleDecimal((averageWatchSeconds / subtopic.durationSeconds) * 100)
      : 0;

    return {
      subtopicId: subtopic.id,
      topicId: subtopic.topicId,
      title: subtopic.title,
      retentionRate,
      averageWatchSeconds,
    };
  });

  const topics = input.topics.map((topic) => {
    const topicSubtopics = subtopics.filter((subtopic) => subtopic.topicId === topic.id);
    const topicRetention = topicSubtopics.length
      ? roundToSingleDecimal(
          topicSubtopics.reduce((total, subtopic) => total + subtopic.retentionRate, 0) /
            topicSubtopics.length,
        )
      : 0;
    const topicWatchAverage = topicSubtopics.length
      ? roundToSingleDecimal(
          topicSubtopics.reduce((total, subtopic) => total + subtopic.averageWatchSeconds, 0) /
            topicSubtopics.length,
        )
      : 0;

    return {
      topicId: topic.id,
      title: topic.title,
      retentionRate: topicRetention,
      averageWatchSeconds: topicWatchAverage,
    };
  });

  const totalWatchSeconds = leads.reduce((total, lead) => total + lead.totalWatchSeconds, 0);
  const totalViews = leads.reduce((total, lead) => total + lead.totalViews, 0);
  const totalResumeLogins = leads.reduce((total, lead) => total + lead.resumeLogins, 0);

  return {
    overview: {
      totalLeads: input.leads.length,
      totalWatchSeconds,
      averageWatchSeconds: input.leads.length
        ? roundToSingleDecimal(totalWatchSeconds / input.leads.length)
        : 0,
      averageCompletionRate: leads.length
        ? roundToSingleDecimal(
            leads.reduce((total, lead) => total + lead.completionRate, 0) / leads.length,
          )
        : 0,
      totalResumeLogins,
      totalViews,
    },
    leads,
    topics,
    subtopics,
  };
}
