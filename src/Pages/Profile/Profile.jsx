import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaCamera,
  FaCalendarCheck,
  FaCheck,
  FaClock,
  FaGlobe,
  FaLightbulb,
  FaLock,
  FaMapMarkerAlt,
  FaRegBell,
  FaRegEdit,
  FaShieldAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

import DashboardLayout from "../../Components/DashboardLayout/DashboardLayout";
import {
  changeMyPassword,
  getMyProfile,
  getProfileImageUrl,
  updateMyProfile,
  uploadMyProfilePhoto,
} from "../../api/profile";
import { logout } from "../../utils/auth";
import "./Profile.css";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "VX";

const splitList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const createFormValues = (user) => ({
  name: user.name || "",
  email: user.email || "",
  bio: user.bio || "",
  location: user.location === "Remote" ? "" : user.location || "",
  website: user.website || "",
  experience: user.experience || "",
  skills: (user.skills || []).join(", "),
  industries: (user.industries || []).join(", "),
  investmentInterests: (user.investmentInterests || []).join(", "),
  expertise: user.expertise === "General Mentorship" ? "" : user.expertise || "",
  availability: user.availability === "Flexible" ? "" : user.availability || "",
});

const roleStats = {
  Founder: [
    ["startups", "Startups", FaBuilding],
    ["investmentRequests", "Investment requests", FaBriefcase],
    ["acceptedInvestments", "Accepted investments", FaCheck],
    ["mentorshipSessions", "Mentorship sessions", FaCalendarCheck],
  ],
  Investor: [
    ["investments", "Investments", FaBriefcase],
    ["savedStartups", "Saved startups", FaBuilding],
    ["acceptedInvestments", "Accepted investments", FaCheck],
    ["mentorshipSessions", "Mentorship sessions", FaCalendarCheck],
  ],
  Mentor: [
    ["sessions", "Sessions", FaCalendarCheck],
    ["pendingSessions", "Pending requests", FaClock],
    ["acceptedSessions", "Accepted sessions", FaCheck],
    ["completedSessions", "Completed sessions", FaBriefcase],
  ],
};

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);
  const [form, setForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const result = await getMyProfile();
        if (!active) return;
        setProfile(result.user);
        setStats(result.stats || {});
        setForm(createFormValues(result.user));
      } catch {
        if (active) {
          setLoadError("We couldn't load your profile. Check your connection and try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const role = profile?.role || readStoredUser()?.role || "Member";
  const statItems = roleStats[role] || [];
  const roleDetails = useMemo(() => {
    if (!profile) return [];

    const details = [
      ["Location", profile.location && profile.location !== "Remote" ? profile.location : "", FaMapMarkerAlt],
      ["Website", profile.website, FaGlobe],
      ["Experience", profile.experience, FaBriefcase],
    ];

    if (role === "Mentor" && profile.availability && profile.availability !== "Flexible") {
      details.push(["Availability", profile.availability, FaClock]);
    }

    if (role === "Founder" && profile.industries?.length) {
      details.push(["Industries", profile.industries.join(", "), FaBuilding]);
    }

    if (role === "Investor" && profile.industries?.length) {
      details.push(["Preferred industries", profile.industries.join(", "), FaBuilding]);
    }

    return details.filter(([, value]) => Boolean(value));
  }, [profile, role]);

  const expertise = useMemo(() => {
    if (!profile) return [];

    const roleTags = role === "Investor"
      ? [...(profile.investmentInterests || []), ...(profile.industries || [])]
      : role === "Founder"
        ? [...(profile.industries || [])]
        : profile.expertise && profile.expertise !== "General Mentorship"
          ? [profile.expertise]
          : [];

    return [...new Set([...(profile.skills || []), ...roleTags])];
  }, [profile, role]);

  const completeness = useMemo(() => {
    if (!profile) return { percent: 0, items: [] };

    const roleDetailComplete = role === "Mentor"
      ? Boolean(
          profile.expertise &&
          profile.expertise !== "General Mentorship" &&
          profile.availability &&
          profile.availability !== "Flexible"
        )
      : role === "Investor"
        ? Boolean(profile.investmentInterests?.length || profile.industries?.length)
        : Boolean(profile.industries?.length);
    const items = [
      ["Name", Boolean(profile.name)],
      ["Email", Boolean(profile.email)],
      ["Introduction", Boolean(profile.bio?.trim())],
      ["Location", Boolean(profile.location && profile.location !== "Remote")],
      ["Website", Boolean(profile.website)],
      ["Profile photo", Boolean(profile.profileImage)],
      [role === "Mentor" ? "Mentor details" : role === "Investor" ? "Investment interests" : "Industries", roleDetailComplete],
    ];
    const completed = items.filter(([, complete]) => complete).length;

    return { percent: Math.round((completed / items.length) * 100), items };
  }, [profile, role]);

  const beginEditing = () => {
    setNotice(null);
    setForm(createFormValues(profile));
    setEditing(true);
  };

  const updateFormField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotice({ type: "error", text: "Profile photos must be 2 MB or smaller." });
      return;
    }

    setUploadingPhoto(true);
    setNotice(null);

    try {
      const result = await uploadMyProfilePhoto(file);
      setProfile(result.user);
      setStats(result.stats || {});
      localStorage.setItem("user", JSON.stringify(result.user));
      window.dispatchEvent(new Event("venturex:user-updated"));
      setNotice({ type: "success", text: result.message || "Profile photo updated successfully." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.response?.data?.message || "We couldn't upload that photo. Please try again.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setNotice(null);

    const payload = {
      name: form.name,
      bio: form.bio,
      location: form.location,
      website: form.website,
      experience: form.experience,
      skills: splitList(form.skills),
    };

    if (role === "Founder") payload.industries = splitList(form.industries);
    if (role === "Investor") {
      payload.industries = splitList(form.industries);
      payload.investmentInterests = splitList(form.investmentInterests);
    }
    if (role === "Mentor") {
      payload.expertise = form.expertise;
      payload.availability = form.availability;
    }

    try {
      const result = await updateMyProfile(payload);
      setProfile(result.user);
      setStats(result.stats || {});
      localStorage.setItem("user", JSON.stringify(result.user));
      window.dispatchEvent(new Event("venturex:user-updated"));
      setForm(createFormValues(result.user));
      setEditing(false);
      setNotice({ type: "success", text: "Your profile is up to date." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.response?.data?.message || "We couldn't save your changes. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setNotice(null);

    try {
      const result = await changeMyPassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice({ type: "success", text: result.message || "Password updated successfully." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.response?.data?.message || "We couldn't update your password. Please try again.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="profile-loading" aria-live="polite">
          <span className="profile-loading-mark" />
          <p>Loading your profile</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loadError || !profile) {
    return (
      <DashboardLayout>
        <section className="profile-error" role="alert">
          <FaUser />
          <h1>Profile unavailable</h1>
          <p>{loadError || "We couldn't find your account."}</p>
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="profile-page-heading">
          <div>
            <p className="profile-eyebrow">YOUR ACCOUNT</p>
            <h1>Profile</h1>
          </div>
          {notice && (
            <div className={`profile-notice ${notice.type}`} role="status">
              {notice.text}
            </div>
          )}
        </div>

        <section className="profile-hero" aria-label="Profile overview">
          <div className="profile-hero-cover">
            <span>VENTUREX MEMBER</span>
            <span className="profile-hero-mark">VX</span>
          </div>
          <div className="profile-hero-body">
            <div className="profile-avatar">
              <span>{getInitials(profile.name)}</span>
              {profile.profileImage && (
                <img
                  src={getProfileImageUrl(profile.profileImage)}
                  alt=""
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                />
              )}
              <button
                type="button"
                className="profile-photo-edit"
                aria-label={uploadingPhoto ? "Uploading profile photo" : "Upload profile photo"}
                title={uploadingPhoto ? "Uploading..." : "Change profile photo"}
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <FaCamera />
              </button>
              <input
                ref={photoInputRef}
                className="profile-photo-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoUpload}
                aria-label="Choose profile photo"
              />
            </div>
            <div className="profile-identity">
              <div className="profile-role-label">{role} <span>·</span> VentureX</div>
              <h2>{profile.name}</h2>
              <p>{profile.bio || "Add a short introduction to tell the VentureX community what you do."}</p>
              <div className="profile-meta">
                {profile.location && profile.location !== "Remote" && (
                  <span><FaMapMarkerAlt />{profile.location}</span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer"><FaGlobe />Website <FaArrowRight /></a>
                )}
                {profile.experience && <span><FaBriefcase />{profile.experience}</span>}
              </div>
            </div>
            <button type="button" className="profile-edit-button" onClick={beginEditing}>
              <FaRegEdit /> Edit profile
            </button>
          </div>
        </section>

        <section className="profile-stats" aria-label={`${role} statistics`}>
          {statItems.map(([key, label, Icon]) => (
            <div className="profile-stat" key={key}>
              <span className="profile-stat-icon"><Icon /></span>
              <div><strong>{stats[key] ?? 0}</strong><span>{label}</span></div>
            </div>
          ))}
        </section>

        <div className="profile-content-grid">
          <div className="profile-main-column">
            <section className="profile-panel profile-about-panel">
              <div className="profile-panel-heading">
                <div><span className="profile-section-icon"><FaUser /></span><div><p>PROFILE</p><h2>About</h2></div></div>
                <button type="button" className="profile-icon-button" aria-label="Edit about section" onClick={beginEditing}><FaRegEdit /></button>
              </div>
              {profile.bio ? <p className="profile-about-copy">{profile.bio}</p> : (
                <button type="button" className="profile-empty-action" onClick={beginEditing}>Tell the VentureX community a little about yourself <FaArrowRight /></button>
              )}
            </section>

            <section className="profile-panel">
              <div className="profile-panel-heading">
                <div><span className="profile-section-icon"><FaBriefcase /></span><div><p>BACKGROUND</p><h2>Professional details</h2></div></div>
                <button type="button" className="profile-icon-button" aria-label="Edit professional details" onClick={beginEditing}><FaRegEdit /></button>
              </div>
              {roleDetails.length ? (
                <div className="profile-details-list">
                  {roleDetails.map(([label, value, Icon]) => (
                    <div className="profile-detail-row" key={label}>
                      <span className="profile-detail-icon"><Icon /></span>
                      <span>{label}</span>
                      {label === "Website" ? <a href={value} target="_blank" rel="noreferrer">{value.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a> : <strong>{value}</strong>}
                    </div>
                  ))}
                </div>
              ) : (
                <button type="button" className="profile-empty-action" onClick={beginEditing}>Add professional details to your profile <FaArrowRight /></button>
              )}
            </section>

            <section className="profile-panel">
              <div className="profile-panel-heading">
                <div><span className="profile-section-icon"><FaLightbulb /></span><div><p>YOUR FOCUS</p><h2>{role === "Investor" ? "Investment interests" : role === "Mentor" ? "Expertise & skills" : "Expertise"}</h2></div></div>
                <button type="button" className="profile-icon-button" aria-label="Edit expertise" onClick={beginEditing}><FaRegEdit /></button>
              </div>
              {expertise.length ? (
                <div className="profile-tags">
                  {expertise.map((item) => <span key={item}>{item}</span>)}
                </div>
              ) : (
                <button type="button" className="profile-empty-action" onClick={beginEditing}>{role === "Mentor" ? "Add your areas of expertise" : "Add your areas of focus"} <FaArrowRight /></button>
              )}
            </section>
          </div>

          <aside className="profile-side-column">
            <section className="profile-panel profile-strength-panel">
              <div className="profile-panel-heading">
                <div><span className="profile-section-icon strength-icon"><FaBriefcase /></span><div><p>MAKE A STRONG FIRST IMPRESSION</p><h2>Profile strength</h2></div></div>
              </div>
              <div className="profile-strength-score">
                <div className="profile-strength-ring" style={{ "--strength": `${completeness.percent}%` }}><span>{completeness.percent}%</span></div>
                <p>{completeness.percent === 100 ? "Your profile is complete." : "A complete profile helps people know who they’re working with."}</p>
              </div>
              <ul className="profile-checklist">
                {completeness.items.map(([label, complete]) => (
                  <li className={complete ? "complete" : ""} key={label}>
                    <span>{complete ? <FaCheck /> : ""}</span>{label}
                  </li>
                ))}
              </ul>
            </section>

            <section className="profile-panel profile-settings-panel">
              <div className="profile-panel-heading">
                <div><span className="profile-section-icon"><FaShieldAlt /></span><div><p>ACCOUNT</p><h2>Settings</h2></div></div>
              </div>
              <Link className="profile-setting-link" to="/notifications"><span><FaRegBell />Notifications</span><FaArrowRight /></Link>
              <a className="profile-setting-link" href="#security"><span><FaLock />Security</span><FaArrowRight /></a>
              <button type="button" className="profile-logout-button" onClick={() => logout(navigate)}><span><FaSignOutAlt />Log out</span><FaArrowRight /></button>
            </section>

            <section className="profile-panel profile-security-panel" id="security">
              <div className="profile-panel-heading">
                <div><span className="profile-section-icon"><FaLock /></span><div><p>ACCOUNT ACCESS</p><h2>Change password</h2></div></div>
              </div>
              <form className="profile-password-form" onSubmit={submitPasswordChange}>
                <label>Current password<input type="password" name="currentPassword" autoComplete="current-password" value={passwordForm.currentPassword} onChange={updatePasswordField} required /></label>
                <label>New password<input type="password" name="newPassword" autoComplete="new-password" minLength={10} value={passwordForm.newPassword} onChange={updatePasswordField} required /></label>
                <label>Confirm new password<input type="password" name="confirmPassword" autoComplete="new-password" minLength={10} value={passwordForm.confirmPassword} onChange={updatePasswordField} required /></label>
                <p className="profile-password-hint">Use 10+ characters with uppercase, lowercase, and a number.</p>
                <button type="submit" disabled={savingPassword}>{savingPassword ? "Updating..." : "Update password"}</button>
              </form>
            </section>
          </aside>
        </div>
      </div>

      {editing && form && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}>
          <section className="profile-edit-modal" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
            <div className="profile-modal-heading">
              <div><p>YOUR DETAILS</p><h2 id="profile-edit-title">Edit profile</h2></div>
              <button type="button" className="profile-icon-button" aria-label="Close edit profile" onClick={() => setEditing(false)}>×</button>
            </div>
            <form className="profile-edit-form" onSubmit={saveProfile}>
              <label>Full name<input name="name" value={form.name} onChange={updateFormField} minLength={2} maxLength={80} required /></label>
              <label>Email address<input name="email" value={form.email} readOnly /><small>Email changes are not available here.</small></label>
              <label className="profile-form-full">About<textarea name="bio" value={form.bio} onChange={updateFormField} maxLength={500} rows={4} placeholder="A few words about your work and what you're building" /></label>
              <label>Location<input name="location" value={form.location} onChange={updateFormField} maxLength={120} placeholder="City, Country" /></label>
              <label>Website<input name="website" value={form.website} onChange={updateFormField} maxLength={200} placeholder="yourwebsite.com" /></label>
              <label>Experience<input name="experience" value={form.experience} onChange={updateFormField} maxLength={120} placeholder="e.g. 8 years in product" /></label>
              <label>Skills<input name="skills" value={form.skills} onChange={updateFormField} placeholder="Comma-separated skills" /></label>
              {role === "Founder" && <label className="profile-form-full">Industries<input name="industries" value={form.industries} onChange={updateFormField} placeholder="Comma-separated industries" /></label>}
              {role === "Investor" && <>
                <label>Preferred industries<input name="industries" value={form.industries} onChange={updateFormField} placeholder="Comma-separated industries" /></label>
                <label>Investment interests<input name="investmentInterests" value={form.investmentInterests} onChange={updateFormField} placeholder="Comma-separated interests" /></label>
              </>}
              {role === "Mentor" && <>
                <label>Expertise<input name="expertise" value={form.expertise} onChange={updateFormField} maxLength={120} /></label>
                <label>Availability<input name="availability" value={form.availability} onChange={updateFormField} maxLength={120} placeholder="e.g. Weekday evenings" /></label>
              </>}
              <p className="profile-photo-note">Use the camera control on your avatar to upload a PNG, JPEG, or WebP image up to 2 MB.</p>
              <div className="profile-modal-actions">
                <button type="button" className="profile-cancel-button" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="profile-save-button" disabled={savingProfile}>{savingProfile ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Profile;