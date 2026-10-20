import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getInvestorById } from "../../api/investor";
import { getProfileImageUrl } from "../../api/profile";
import "./InvestorProfile.css";

export default function InvestorProfile() {
  const { id } = useParams();
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getInvestorById(id)
      .then((profile) => {
        if (active) setInvestor(profile);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Unable to load investor profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  if (loading || error || !investor) {
    return (
      <main className="investorProfilePage investorProfileEmpty">
        {loading ? "Loading investor profile..." : error || "Investor not found."}
      </main>
    );
  }

  const skills = Array.isArray(investor.skills)
    ? investor.skills
    : typeof investor.skills === "string"
      ? investor.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
      : [];

  return (
    <main className="investorProfilePage">
      <header className="investorProfileHeader">
        <Link to="/dashboard" className="investorProfileBack">← Back to dashboard</Link>
      </header>
      <section className="investorProfileCard">
        <div className="investorProfileAvatarWrap">
          {investor.profileImage ? (
            <img src={getProfileImageUrl(investor.profileImage)} alt={`${investor.name}'s profile`} />
          ) : (
            <div className="investorProfileInitials" aria-hidden="true">
              {investor.name?.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "IN"}
            </div>
          )}
        </div>
        <div className="investorProfileBody">
          <p className="investorProfileEyebrow">INVESTOR PROFILE</p>
          <h1>{investor.name || "Investor"}</h1>
          <p className="investorProfileRole">{investor.expertise || "Investor"}</p>
          <div className="investorProfileFacts">
            {investor.location && <div><span>Location</span><strong>{investor.location}</strong></div>}
            {investor.experience && <div><span>Experience</span><strong>{investor.experience}</strong></div>}
            {investor.availability && <div><span>Availability</span><strong>{investor.availability}</strong></div>}
          </div>
          {investor.bio && <section className="investorProfileSection"><h2>About</h2><p>{investor.bio}</p></section>}
          {skills.length > 0 && <section className="investorProfileSection"><h2>Areas of interest</h2><div className="investorProfileSkills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
        </div>
      </section>
    </main>
  );
}
