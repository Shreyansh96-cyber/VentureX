import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import API from "../../api/startup";

import "./EditStartup.css";

const emptyForm = {
  startupName: "",
  tagline: "",
  description: "",
  industry: "",
  stage: "",
  fundingGoal: "",
  website: "",
  location: "",
  logo: "",
  teamSize: "",
  foundedYear: "",
  status: "Active",
};

function getStartupFromResponse(data) {
  return data?.startup || data;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function EditStartup() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/${id}`);
        const startup = getStartupFromResponse(response.data);

        if (!startup || !startup._id) {
          throw new Error("Startup not found.");
        }

        const user = getStoredUser();
        const founderId =
          typeof startup.founderId === "object"
            ? startup.founderId?._id
            : startup.founderId;

        if (
          user?.role !== "Founder" ||
          founderId == null ||
          String(founderId) !== String(user?._id)
        ) {
          throw new Error("You can only edit startups owned by your founder account.");
        }

        setFormData({
          startupName: startup.startupName ?? "",
          tagline: startup.tagline ?? "",
          description: startup.description ?? "",
          industry: startup.industry ?? "",
          stage: startup.stage ?? "",
          fundingGoal: startup.fundingGoal ?? "",
          website: startup.website ?? "",
          location: startup.location ?? "",
          logo: startup.logo ?? "",
          teamSize: startup.teamSize ?? "",
          foundedYear: startup.foundedYear ?? "",
          status: startup.status ?? "Active",
        });
      } catch (fetchError) {
        setError(
          fetchError.response?.data?.message ||
            fetchError.message ||
            "Unable to load this startup. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const returnToDetails = () => {
    navigate(`/startup/${id}`, {
      state: location.state,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const updatedStartup = {
        startupName: formData.startupName.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        industry: formData.industry.trim(),
        stage: formData.stage,
        fundingGoal: Number(formData.fundingGoal),
        website: formData.website.trim(),
        location: formData.location.trim(),
        logo: formData.logo.trim(),
        status: formData.status,
      };

      if (String(formData.teamSize).trim()) {
        updatedStartup.teamSize = Number(formData.teamSize);
      }

      if (String(formData.foundedYear).trim()) {
        updatedStartup.foundedYear = Number(formData.foundedYear);
      }

      await API.put(`/${id}`, updatedStartup);

      navigate(`/startup/${id}`, {
        replace: true,
        state: location.state,
      });
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          "Unable to save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="editStartupPage">
        <section className="editStartupMessage" role="status">
          <span className="editStartupSpinner" aria-hidden="true" />
          <h1>Loading startup...</h1>
        </section>
      </main>
    );
  }

  if (error && !formData.startupName) {
    return (
      <main className="editStartupPage">
        <section className="editStartupMessage editStartupError" role="alert">
          <h1>Unable to edit startup</h1>
          <p>{error}</p>
          <button
            type="button"
            className="editStartupSecondaryButton"
            onClick={returnToDetails}
          >
            Cancel
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="editStartupPage">
      <div className="editStartupContainer">
        <Link
          to={`/startup/${id}`}
          state={location.state}
          className="editStartupBackLink"
        >
          ← Back to Startup Details
        </Link>

        <header className="editStartupHeader">
          <p className="editStartupEyebrow">FOUNDER WORKSPACE</p>
          <h1>Edit Startup</h1>
          <p>Update your startup profile and funding information.</p>
        </header>

        <form className="editStartupForm" onSubmit={handleSubmit}>
          <section className="editStartupSection">
            <div className="editStartupSectionHeading">
              <h2>Startup profile</h2>
              <p>Keep your public company information up to date.</p>
            </div>

            <div className="editStartupFields">
              <label className="editStartupField">
                <span>Startup name <b>*</b></span>
                <input
                  name="startupName"
                  value={formData.startupName}
                  onChange={handleChange}
                  required
                  maxLength={120}
                />
              </label>

              <label className="editStartupField">
                <span>Tagline <b>*</b></span>
                <input
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  required
                  maxLength={180}
                />
              </label>

              <label className="editStartupField editStartupFieldFull">
                <span>Description <b>*</b></span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                />
              </label>

              <label className="editStartupField">
                <span>Industry <b>*</b></span>
                <input
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="editStartupField">
                <span>Stage <b>*</b></span>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a stage</option>
                  <option value="Idea">Idea</option>
                  <option value="MVP">MVP</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                </select>
              </label>

              <label className="editStartupField">
                <span>Location <b>*</b></span>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="editStartupField">
                <span>Website</span>
                <input
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </label>

              <label className="editStartupField editStartupFieldFull">
                <span>Logo URL</span>
                <input
                  name="logo"
                  type="url"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </label>
            </div>
          </section>

          <section className="editStartupSection">
            <div className="editStartupSectionHeading">
              <h2>Company details</h2>
              <p>Set the current size, founding year, and availability.</p>
            </div>

            <div className="editStartupFields">
              <label className="editStartupField">
                <span>Funding goal (₹) <b>*</b></span>
                <input
                  name="fundingGoal"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.fundingGoal}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="editStartupField">
                <span>Team size</span>
                <input
                  name="teamSize"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.teamSize}
                  onChange={handleChange}
                />
              </label>

              <label className="editStartupField">
                <span>Founded year</span>
                <input
                  name="foundedYear"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  step="1"
                  value={formData.foundedYear}
                  onChange={handleChange}
                />
              </label>

              <label className="editStartupField">
                <span>Status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>
            </div>
          </section>

          {error && (
            <p className="editStartupSubmitError" role="alert">
              {error}
            </p>
          )}

          <div className="editStartupActions">
            <button
              type="button"
              className="editStartupSecondaryButton"
              onClick={returnToDetails}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="editStartupPrimaryButton"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}