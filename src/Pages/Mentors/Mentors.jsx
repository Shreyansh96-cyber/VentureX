import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMentors } from "../../api/mentor";
import "./Mentors.css";

export default function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMentors = async () => {
      try {
        const result = await getMentors();
        if (active) {
          setMentors(Array.isArray(result) ? result : []);
          setError("");
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.response?.data?.message || "Unable to load mentors.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMentors();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mentorsPage">
      <header className="mentorsPageHeader">
        <div className="mentorsTopRow">
          <div>
            <p className="mentorsEyebrow">DISCOVER</p>
            <h1>Find a Mentor</h1>
            <p>Connect with experienced mentors for product, funding, growth, and strategic guidance.</p>
          </div>
          <Link to="/dashboard" className="mentorBackButton">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {error && <div className="mentorsError">{error}</div>}

      {loading ? (
        <div className="mentorsEmptyState">Loading mentors...</div>
      ) : mentors.length === 0 ? (
        <div className="mentorsEmptyState">No mentors are available yet.</div>
      ) : (
        <section className="mentorGrid">
          {mentors.map((mentor) => (
            <article key={mentor._id} className="mentorCard">
              <div className="mentorAvatar">
                {mentor.name ? mentor.name.charAt(0).toUpperCase() : "M"}
              </div>

              <div className="mentorCardTop">
                <h2>{mentor.name}</h2>
                <span className="mentorBadge">{mentor.role}</span>
              </div>

              <p className="mentorExpertise">{mentor.expertise || "General Mentorship"}</p>
              <p className="mentorExperience">{mentor.experience || "Experienced mentor"}</p>
              <p className="mentorBio">{mentor.bio || "Helping founders accelerate learning and growth."}</p>

              <div className="mentorMeta">
                <span>{mentor.location || "Remote"}</span>
                <span>{mentor.availability || "Flexible"}</span>
              </div>

              <div className="mentorSkills">
                {(mentor.skills && mentor.skills.length > 0 ? mentor.skills : ["Strategy", "Growth", "Leadership"]).slice(0, 3).map((skill, index) => (
                  <span key={`${mentor._id}-${skill}-${index}`}>{skill}</span>
                ))}
              </div>

              <Link className="mentorProfileButton" to={`/mentor/${mentor._id}`}>
                View Profile
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
