import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../Components/DashboardLayout/DashboardLayout";
import { getFounderFundingAnalytics } from "../../api/dashboard";
import { formatRupees } from "../../utils/currency";
import "./FundingAnalytics.css";

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

const statusClass = (status) => String(status || "unknown").toLowerCase();

export default function FundingAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        const result = await getFounderFundingAnalytics();
        if (active) {
          setAnalytics(result);
          setError(false);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="fundingAnalyticsPage">
        <header className="fundingAnalyticsHeader">
          <Link to="/dashboard" className="fundingAnalyticsBack">
            ← Back to Dashboard
          </Link>
          <p className="fundingAnalyticsEyebrow">FUNDING ANALYTICS</p>
          <h1>Funding Analytics</h1>
          <p>Funding progress and investment activity across your startups.</p>
        </header>

        {loading && (
          <p className="fundingAnalyticsMessage" role="status">
            Loading funding analytics...
          </p>
        )}

        {error && (
          <p className="fundingAnalyticsError" role="alert">
            Unable to load funding analytics. Please try again.
          </p>
        )}

        {analytics && !loading && (
          <>
            <section className="fundingAnalyticsStartups" aria-labelledby="funding-startups-title">
              <div className="fundingAnalyticsSectionHeading">
                <div>
                  <p className="fundingAnalyticsEyebrow">PORTFOLIO</p>
                  <h2 id="funding-startups-title">Startups in this summary</h2>
                </div>
                <span>{analytics.startups.length} startups</span>
              </div>

              {analytics.startups.length > 0 ? (
                <div className="fundingAnalyticsStartupList">
                  {analytics.startups.map((startup) => (
                    <article className="fundingAnalyticsStartup" key={startup._id}>
                      <div>
                        <h3>{startup.startupName}</h3>
                        <p>{startup.tagline || "No tagline added."}</p>
                      </div>
                      <div className="fundingAnalyticsStartupNumbers">
                        <span>{formatRupees(startup.raisedAmount)} raised</span>
                        <span>of {formatRupees(startup.fundingGoal)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="fundingAnalyticsEmpty">
                  <p>No startups to analyze yet.</p>
                  <Link to="/create-startup">Create a startup</Link>
                </div>
              )}
            </section>

            <section className="fundingAnalyticsOverview" aria-label="Funding overview">
              <article className="fundingAnalyticsPanel fundingProgressPanel">
                <div className="fundingAnalyticsSectionHeading">
                  <div>
                    <p className="fundingAnalyticsEyebrow">OVERALL FUNDING</p>
                    <h2>Funding Progress</h2>
                  </div>
                  <strong className="fundingAnalyticsPercent">
                    {Number(analytics.fundingPercentage || 0).toFixed(0)}%
                  </strong>
                </div>

                <div
                  className="fundingAnalyticsProgressTrack"
                  role="progressbar"
                  aria-label="Overall funding progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={Math.round(analytics.fundingPercentage || 0)}
                >
                  <span style={{ width: `${analytics.fundingPercentage || 0}%` }} />
                </div>

                <div className="fundingAnalyticsTotals">
                  <div><span>Raised</span><strong>{formatRupees(analytics.raisedAmount)}</strong></div>
                  <div><span>Goal</span><strong>{formatRupees(analytics.fundingGoal)}</strong></div>
                  <div><span>Remaining</span><strong>{formatRupees(analytics.remainingAmount)}</strong></div>
                </div>
              </article>

              <article className="fundingAnalyticsPanel">
                <p className="fundingAnalyticsEyebrow">INVESTOR OVERVIEW</p>
                <h2>Investment activity</h2>
                <div className="fundingAnalyticsInvestorStats">
                  <div><strong>{analytics.uniqueInvestors}</strong><span>Unique investors</span></div>
                  <div><strong>{analytics.acceptedInvestments}</strong><span>Accepted investments</span></div>
                  <div><strong>{analytics.pendingInvestments}</strong><span>Pending requests</span></div>
                </div>
              </article>
            </section>

            <section className="fundingAnalyticsPanel fundingMilestones">
              <div className="fundingAnalyticsSectionHeading">
                <div>
                  <p className="fundingAnalyticsEyebrow">PROGRESS</p>
                  <h2>Funding milestones</h2>
                </div>
              </div>
              <div className="fundingMilestoneList">
                {analytics.milestones.map((milestone) => (
                  <div className="fundingMilestone" key={milestone.percentage}>
                    <strong>{milestone.percentage}%</strong>
                    <span>{milestone.label}</span>
                    <span className={`fundingMilestoneStatus ${statusClass(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="fundingAnalyticsPanel fundingHistorySection">
              <div className="fundingAnalyticsSectionHeading">
                <div>
                  <p className="fundingAnalyticsEyebrow">INVESTMENTS</p>
                  <h2>Investment history</h2>
                </div>
                <span>{analytics.investments.length} requests</span>
              </div>

              {analytics.investments.length === 0 ? (
                <p className="fundingAnalyticsMessage">No investment activity yet.</p>
              ) : (
                <>
                  <div className="fundingHistoryTableWrap">
                    <table className="fundingHistoryTable">
                      <thead>
                        <tr><th>Investor</th><th>Startup</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {analytics.investments.map((investment) => (
                          <tr key={investment.id}>
                            <td>{investment.investorName}</td>
                            <td>{investment.startupName}</td>
                            <td>{formatRupees(investment.amount)}</td>
                            <td><span className={`fundingStatus ${statusClass(investment.status)}`}>{investment.status}</span></td>
                            <td>{formatDate(investment.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="fundingHistoryCards">
                    {analytics.investments.map((investment) => (
                      <article className="fundingHistoryCard" key={investment.id}>
                        <div className="fundingHistoryCardHeading">
                          <strong>{investment.investorName}</strong>
                          <span className={`fundingStatus ${statusClass(investment.status)}`}>{investment.status}</span>
                        </div>
                        <p>{investment.startupName}</p>
                        <div><span>Amount</span><strong>{formatRupees(investment.amount)}</strong></div>
                        <div><span>Date</span><span>{formatDate(investment.date)}</span></div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="fundingAnalyticsPanel fundingActivitySection">
              <div>
                <p className="fundingAnalyticsEyebrow">LATEST UPDATES</p>
                <h2>Recent funding activity</h2>
              </div>
              {analytics.recentActivity.length > 0 ? (
                <ul className="fundingActivityList">
                  {analytics.recentActivity.map((activity) => (
                    <li key={activity.id}>
                      <span className={`fundingActivityDot ${statusClass(activity.description)}`} />
                      <div>
                        <strong>{activity.description}</strong>
                        <p>{activity.investorName} · {activity.startupName}</p>
                      </div>
                      <time dateTime={activity.date}>{formatDate(activity.date)}</time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="fundingAnalyticsMessage">No investment activity yet.</p>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}