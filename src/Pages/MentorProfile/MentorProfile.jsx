import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StartupAPI from "../../api/startup";
import { getProfileImageUrl } from "../../api/profile";
import { getMentorById } from "../../api/mentor";
import { createMentorSession } from "../../api/mentorSession";
import "./MentorProfile.css";

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const normalizeDateInput = (value) => {
  if (!value) return "";

  const trimmed = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const europeanMatch = /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.exec(trimmed);
  if (europeanMatch) {
    const [day, month, year] = trimmed.split(/[/-]/).map((part) => Number(part));
    if (year && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  const parsedDate = new Date(trimmed);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().slice(0, 10);
  }

  return "";
};

const normalizeTimeInput = (value) => {
  if (!value) return "";

  const trimmed = String(value).trim();

  if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed)) {
    return trimmed;
  }

  const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minutes = twelveHourMatch[2];
    const meridiem = twelveHourMatch[3].toUpperCase();

    if (meridiem === "AM") {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }

    return `${String(hour).padStart(2, "0")}:${minutes}`;
  }

  return "";
};

const getMentorRequestErrorMessage = (error) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return serverMessage || "You are not authorized to send this request.";
  if (status === 404) return serverMessage || "The selected mentor or startup could not be found.";
  if (status === 409) return serverMessage || "A pending request already exists for this mentor, date, and time.";
  if (status === 400) return serverMessage || "Please check the request details and try again.";
  if (status >= 500) return "Server error while creating the mentoring request. Please try again.";
  if (!status) return "Unable to reach the server. Check your connection and try again.";
  return serverMessage || "Unable to create mentoring session request.";
};

export default function MentorProfile() {
  const { id } = useParams();
  const user = getCurrentUser();
  const userId = user?._id || user?.id;
  const [mentor, setMentor] = useState(null);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    topic: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
    startupId: "",
  });

  useEffect(() => {
    let active = true;

    const loadMentor = async () => {
      try {
        const mentorData = await getMentorById(id);
        if (active) {
          setMentor(mentorData);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.response?.data?.message || "Unable to load mentor profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMentor();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== "Founder") return;

    const loadFounderStartups = async () => {
      try {
        const response = await StartupAPI.get("/");
        const founderStartups = Array.isArray(response.data)
          ? response.data.filter((startup) => String(startup.founderId) === String(userId))
          : [];
        setStartups(founderStartups);
      } catch {
        setStartups([]);
      }
    };

    loadFounderStartups();
  }, [user, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      setFormError("Please sign in to request a mentoring session.");
      return;
    }

    if (!mentor || !mentor._id) {
      setFormError("Please select a valid mentor.");
      return;
    }

    if (!form.topic.trim()) {
      setFormError("Topic is required.");
      return;
    }

    const normalizedDate = normalizeDateInput(form.preferredDate);
    const normalizedTime = normalizeTimeInput(form.preferredTime);

    if (!normalizedDate) {
      setFormError("Please choose a valid preferred date.");
      return;
    }

    if (!normalizedTime) {
      setFormError("Please choose a valid preferred time.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      await createMentorSession({
        mentorId: mentor._id,
        startupId: form.startupId || undefined,
        topic: form.topic.trim(),
        message: form.message.trim(),
        requestedDate: normalizedDate,
        requestedTime: normalizedTime,
      });

      setSuccess("Mentoring session request sent successfully.");
      setForm({
        topic: "",
        message: "",
        preferredDate: "",
        preferredTime: "",
        startupId: "",
      });
      setShowRequestModal(false);
    } catch (submitError) {
      if (import.meta.env.DEV) {
        console.error("Mentorship request failed:", {
          status: submitError.response?.status ?? null,
          message: submitError.response?.data?.message || "No response message",
          debug: submitError.response?.data?.debug,
        });
      }

      setFormError(getMentorRequestErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mentorProfilePage empty">Loading mentor profile...</div>;
  }

  if (error || !mentor) {
    return <div className="mentorProfilePage empty">{error || "Mentor not found."}</div>;
  }

  return (
    <main className="mentorProfilePage">
      <div className="mentorProfileHeader">
        <Link to="/mentors" className="backLink">← Back to mentors</Link>
      </div>

      <section className="mentorProfileCard">
        <div className="mentorProfileImageWrap">
          <img
            src={getProfileImageUrl(mentor.profileImage) || "https://i.pravatar.cc/200?img=12"}
            alt={mentor.name}
            className="mentorProfileImage"
          />
        </div>

        <div className="mentorProfileBody">
          <p className="mentorProfileEyebrow">MENTOR PROFILE</p>
          <h1>{mentor.name}</h1>
          <p className="mentorProfileRole">{mentor.expertise || "General Mentorship"}</p>

          <div className="mentorSummaryGrid">
            <div>
              <span className="summaryLabel">Experience</span>
              <strong>{mentor.experience || "Experienced mentor"}</strong>
            </div>
            <div>
              <span className="summaryLabel">Location</span>
              <strong>{mentor.location || "Remote"}</strong>
            </div>
            <div>
              <span className="summaryLabel">Availability</span>
              <strong>{mentor.availability || "Flexible"}</strong>
            </div>
          </div>

          <div className="mentorBioBox">
            <h3>About</h3>
            <p>{mentor.bio || "This mentor supports founders with practical guidance around product strategy, fundraising, business growth, and decision-making."}</p>
          </div>

          <div className="mentorSkillBox">
            <h3>Skills</h3>
            <div className="mentorSkillList">
              {(mentor.skills && mentor.skills.length > 0 ? mentor.skills : ["Startup Strategy", "Growth", "Leadership"]).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="requestSessionButton"
            onClick={() => {
              setSuccess("");
              setFormError("");
              setShowRequestModal(true);
            }}
          >
            Request Session
          </button>

          {success && <p className="mentorSuccessMessage">{success}</p>}
        </div>
      </section>

      {showRequestModal && (
        <div className="mentorRequestModalBackdrop" onClick={() => setShowRequestModal(false)}>
          <div className="mentorRequestModal" onClick={(event) => event.stopPropagation()}>
            <div className="mentorRequestHeader">
              <h2>Request a session</h2>
              <button type="button" className="closeModalButton" onClick={() => setShowRequestModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mentorRequestForm">
              {user?.role === "Founder" && startups.length > 0 && (
                <div className="formField">
                  <label htmlFor="startupId">Startup</label>
                  <select id="startupId" name="startupId" value={form.startupId} onChange={handleChange}>
                    <option value="">Select startup (optional)</option>
                    {startups.map((startup) => (
                      <option key={startup._id} value={startup._id}>
                        {startup.startupName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="formField">
                <label htmlFor="topic">Topic</label>
                <input
                  id="topic"
                  name="topic"
                  type="text"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="Product roadmap, fundraising, growth strategy..."
                />
              </div>

              <div className="formField">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell the mentor what you want help with..."
                />
              </div>

              <div className="mentorRequestGrid">
                <div className="formField">
                  <label htmlFor="preferredDate">Preferred Date</label>
                  <input
                    id="preferredDate"
                    name="preferredDate"
                    type="date"
                    value={form.preferredDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="formField">
                  <label htmlFor="preferredTime">Preferred Time</label>
                  <input
                    id="preferredTime"
                    name="preferredTime"
                    type="time"
                    value={form.preferredTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formError && <p className="mentorFormError">{formError}</p>}

              <div className="mentorRequestActions">
                <button type="button" className="secondaryButton" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primaryButton" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
