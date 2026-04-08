import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAdminAction } from "@/app/actions";
import { getAdminSessionId } from "@/lib/auth/cookies";
import { buildAnalyticsSummary } from "@/lib/funnel/analytics";
import { getAdminSnapshot } from "@/lib/funnel/repository";

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${String(remainder).padStart(2, "0")}s`;
}

export default async function AdminDashboardPage() {
  const adminSession = await getAdminSessionId();
  if (!adminSession) {
    redirect("/admin");
  }

  const snapshot = await getAdminSnapshot();
  const summary = buildAnalyticsSummary({
    leads: snapshot.leads,
    topics: snapshot.topics,
    subtopics: snapshot.subtopics,
    authEvents: snapshot.authEvents,
    watchEvents: snapshot.watchEvents,
  });

  const recentLeads = [...snapshot.leads].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );

  return (
    <main className="appShell pageStack">
      <header className="topbar">
        <div>
          <p className="eyebrow">Lead funnel admin</p>
          <h1>Dashboard</h1>
        </div>

        <div className="topbarActions">
          <Link className="buttonSecondary" href="/admin/content">
            Manage topics
          </Link>
          <form action={signOutAdminAction}>
            <button className="buttonGhost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="metricGrid">
        <article className="metricCard">
          <span>Total leads</span>
          <strong>{summary.overview.totalLeads}</strong>
        </article>
        <article className="metricCard">
          <span>Total views</span>
          <strong>{summary.overview.totalViews}</strong>
        </article>
        <article className="metricCard">
          <span>Resume logins</span>
          <strong>{summary.overview.totalResumeLogins}</strong>
        </article>
        <article className="metricCard">
          <span>Average watch</span>
          <strong>{formatSeconds(summary.overview.averageWatchSeconds)}</strong>
        </article>
        <article className="metricCard">
          <span>Average completion</span>
          <strong>{summary.overview.averageCompletionRate}%</strong>
        </article>
      </section>

      <div className="splitGrid">
        <section className="panel compactGap">
          <p className="eyebrow">Topic retention</p>
          <table className="dataTable">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Retention</th>
                <th>Avg watch</th>
              </tr>
            </thead>
            <tbody>
              {summary.topics.map((topic) => (
                <tr key={topic.topicId}>
                  <td>{topic.title}</td>
                  <td>{topic.retentionRate}%</td>
                  <td>{formatSeconds(topic.averageWatchSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel compactGap">
          <p className="eyebrow">Lesson retention</p>
          <table className="dataTable">
            <thead>
              <tr>
                <th>Subtopic</th>
                <th>Retention</th>
                <th>Avg watch</th>
              </tr>
            </thead>
            <tbody>
              {summary.subtopics.map((subtopic) => (
                <tr key={subtopic.subtopicId}>
                  <td>{subtopic.title}</td>
                  <td>{subtopic.retentionRate}%</td>
                  <td>{formatSeconds(subtopic.averageWatchSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="panel compactGap">
        <p className="eyebrow">Leads and answers</p>
        <table className="dataTable">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Property types</th>
              <th>Sales focus</th>
              <th>Watch time</th>
              <th>Views</th>
              <th>Resume logins</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map((lead) => {
              const leadSummary = summary.leads.find((item) => item.leadId === lead.id);

              return (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.fullName}</strong>
                    <small>{lead.email}</small>
                  </td>
                  <td>{lead.phone}</td>
                  <td>{lead.companies.join(", ")}</td>
                  <td>{lead.propertyTypes.join(", ")}</td>
                  <td>{lead.salesFocus}</td>
                  <td>{formatSeconds(leadSummary?.totalWatchSeconds ?? 0)}</td>
                  <td>{leadSummary?.totalViews ?? 0}</td>
                  <td>{leadSummary?.resumeLogins ?? 0}</td>
                  <td>{leadSummary?.completionRate ?? 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
