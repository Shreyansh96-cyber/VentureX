import "./CreateStartup.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../api/startup";

export default function CreateStartup() {
  const navigate = useNavigate();

  const [coverImage, setCoverImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [pitchDeck, setPitchDeck] = useState("");
  const [gallery, setGallery] = useState([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    startupName: "",
    tagline: "",
    description: "",
    industry: "Technology",
    stage: "Idea",
    location: "",
    country: "India",
    foundedYear: new Date().getFullYear(),
    website: "",
    officialEmail: "",
    teamSize: "",
    fundingGoal: "",
    valuation: "",
    equity: "",
    monthlyRevenue: "",
    activeUsers: "",
    growthRate: "",
    runway: "",
    customers: "",
    problem: "",
    solution: "",
    businessModel: "",
    targetMarket: "",
    competitors: "",
  });

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // LOGO
  // =========================

  const handleLogo = (e) => {
    const file = e.target.files[0];

    if (file) {
      setLogoImage(URL.createObjectURL(file));
    }
  };

  // =========================
  // COVER
  // =========================

  const handleCover = (e) => {
    const file = e.target.files[0];

    if (file) {
      setCoverImage(URL.createObjectURL(file));
    }
  };

  // =========================
  // PITCH DECK
  // =========================

  const handlePitch = (e) => {
    if (e.target.files.length) {
      setPitchDeck(e.target.files[0].name);
    }
  };

  // =========================
  // GALLERY
  // =========================

  const handleGallery = (e) => {
    const files = [...e.target.files];

    const images = files.map((file) =>
      URL.createObjectURL(file)
    );

    setGallery(images);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      // Check logged-in user
      if (!user?._id) {
        alert("User information not found. Please login again.");
        return;
      }

      // Required fields
      if (
        !formData.startupName ||
        !formData.tagline ||
        !formData.description ||
        !formData.location ||
        !formData.fundingGoal
      ) {
        alert("Please fill all required fields.");
        return;
      }

      // Data sent to backend
      const startupData = {
        ...formData,

        founderId: user._id,

        // Convert number fields from strings to numbers
        foundedYear: Number(formData.foundedYear),
        teamSize: Number(formData.teamSize) || 1,
        fundingGoal: Number(formData.fundingGoal),

        valuation: Number(formData.valuation) || 0,
        equity: Number(formData.equity) || 0,
        monthlyRevenue: Number(formData.monthlyRevenue) || 0,
        activeUsers: Number(formData.activeUsers) || 0,
        growthRate: Number(formData.growthRate) || 0,
        runway: Number(formData.runway) || 0,
        customers: Number(formData.customers) || 0,

        // Currently these are preview-only
        logo: logoImage || "",
      };

      const response = await API.post("/", startupData);

      alert("Startup Created Successfully 🚀");

      // Go back to Founder Dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("CREATE STARTUP FAILED:", error.response?.status || "network");

      alert(
        error.response?.data?.message ||
        "Failed to create startup. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="startupBuilder">

      <form onSubmit={handleSubmit}>

        {/* =========================
            COVER
        ========================= */}

        <div className="coverSection">

          <label htmlFor="cover">

            {coverImage ? (
              <img
                src={coverImage}
                alt="cover"
              />
            ) : (
              <div className="coverPlaceholder">
                Upload Company Cover
              </div>
            )}

          </label>

          <input
            hidden
            id="cover"
            type="file"
            accept="image/*"
            onChange={handleCover}
          />

        </div>

        {/* =========================
            LOGO
        ========================= */}

        <div className="logoWrapper">

          <label htmlFor="logo">

            <div className="logoCircle">

              {logoImage ? (
                <img
                  src={logoImage}
                  alt="logo"
                />
              ) : (
                <span>+</span>
              )}

            </div>

          </label>

          <input
            hidden
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogo}
          />

        </div>

        {/* =========================
            HERO
        ========================= */}

        <div className="heroContent">

          <h1>Startup Profile</h1>

          <p>
            Build your company's public profile exactly
            like LinkedIn and AngelList.
          </p>

        </div>

        {/* =========================
            COMPLETION
        ========================= */}

        <div className="completionCard">

          <h3>Profile Completion</h3>

          <div className="completionBar">
            <div className="completionProgress"></div>
          </div>

          <span>76%</span>

        </div>

        {/* =========================
            COMPANY INFORMATION
        ========================= */}

        <section className="profileCard">

          <h2>Company Information</h2>

          <div className="grid2">

            <div>
              <label>Startup Name</label>

              <input
                type="text"
                name="startupName"
                value={formData.startupName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Tagline</label>

              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Industry</label>

              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              >
                <option value="Technology">Technology</option>
                <option value="Artificial Intelligence">
                  Artificial Intelligence
                </option>
                <option value="Healthcare">
                  Healthcare
                </option>
                <option value="FinTech">
                  FinTech
                </option>
                <option value="Education">
                  Education
                </option>
                <option value="E-Commerce">
                  E-Commerce
                </option>
                <option value="Gaming">
                  Gaming
                </option>
                <option value="Cyber Security">
                  Cyber Security
                </option>
              </select>
            </div>

            <div>
              <label>Startup Stage</label>

              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
              >
                <option value="Idea">Idea</option>
                <option value="MVP">MVP</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
              </select>
            </div>

            <div>
              <label>Location</label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Country</label>

              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Founded Year</label>

              <input
                type="number"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Team Size</label>

              <input
                type="number"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Website</label>

              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Official Email</label>

              <input
                type="email"
                name="officialEmail"
                value={formData.officialEmail}
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* =========================
            FUNDING
        ========================= */}

        <section className="profileCard">

          <h2>Funding & Traction</h2>

          <div className="metricGrid">

            <div className="metricCard">
              <label>Funding Goal (₹)</label>

              <input
                type="number"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleChange}
                required
              />
            </div>

            <div className="metricCard">
              <label>Current Valuation ($)</label>

              <input
                type="number"
                name="valuation"
                value={formData.valuation}
                onChange={handleChange}
              />
            </div>

            <div className="metricCard">
              <label>Equity Offered (%)</label>

              <input
                type="number"
                name="equity"
                value={formData.equity}
                onChange={handleChange}
              />
            </div>

            <div className="metricCard">
              <label>Monthly Revenue ($)</label>

              <input
                type="number"
                name="monthlyRevenue"
                value={formData.monthlyRevenue}
                onChange={handleChange}
              />
            </div>

            <div className="metricCard">
              <label>Active Users</label>

              <input
                type="number"
                name="activeUsers"
                value={formData.activeUsers}
                onChange={handleChange}
              />
            </div>

            <div className="metricCard">
              <label>Growth Rate (%)</label>

              <input
                type="number"
                name="growthRate"
                value={formData.growthRate}
                onChange={handleChange}
              />
            </div>

            <div className="metricCard">
              <label>Runway (Months)</label>

              <input
                type="number"
                name="runway"
                value={formData.runway}
                onChange={handleChange}
              />
            </div>

            <div className="metricCard">
              <label>Current Customers</label>

              <input
                type="number"
                name="customers"
                value={formData.customers}
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* =========================
            DESCRIPTION
        ========================= */}

        <section className="profileCard">

          <h2>About Startup</h2>

          <textarea
            rows="7"
            name="description"
            value={formData.description}
            placeholder="Describe your startup, vision and mission..."
            onChange={handleChange}
            required
          />

        </section>

        {/* =========================
            PROBLEM
        ========================= */}

        <section className="profileCard">

          <h2>Problem Statement</h2>

          <textarea
            rows="6"
            name="problem"
            value={formData.problem}
            placeholder="What problem are you solving?"
            onChange={handleChange}
          />

        </section>

        {/* =========================
            SOLUTION
        ========================= */}

        <section className="profileCard">

          <h2>Our Solution</h2>

          <textarea
            rows="6"
            name="solution"
            value={formData.solution}
            placeholder="Explain your solution."
            onChange={handleChange}
          />

        </section>

        {/* =========================
            BUSINESS MODEL
        ========================= */}

        <section className="profileCard">

          <h2>Business Model</h2>

          <textarea
            rows="6"
            name="businessModel"
            value={formData.businessModel}
            placeholder="Subscription, SaaS, Marketplace..."
            onChange={handleChange}
          />

        </section>

        {/* =========================
            TARGET MARKET
        ========================= */}

        <section className="profileCard">

          <h2>Target Market</h2>

          <textarea
            rows="6"
            name="targetMarket"
            value={formData.targetMarket}
            placeholder="Who are your customers?"
            onChange={handleChange}
          />

        </section>

        {/* =========================
            COMPETITORS
        ========================= */}

        <section className="profileCard">

          <h2>Competitors</h2>

          <textarea
            rows="5"
            name="competitors"
            value={formData.competitors}
            placeholder="Who are your competitors?"
            onChange={handleChange}
          />

        </section>

        {/* =========================
            FOUNDER TEAM
        ========================= */}

        <section className="profileCard">

          <h2>Founder Team</h2>

          <div className="founderGrid">

            <div className="founderCard">

              <div className="founderAvatar">
                👤
              </div>

              <input
                type="text"
                placeholder="Founder Name"
              />

              <input
                type="text"
                placeholder="Role (CEO / CTO)"
              />

              <input
                type="text"
                placeholder="LinkedIn Profile"
              />

            </div>

            <div className="founderCard">

              <div className="founderAvatar">
                👤
              </div>

              <input
                type="text"
                placeholder="Co-Founder"
              />

              <input
                type="text"
                placeholder="Role"
              />

              <input
                type="text"
                placeholder="LinkedIn Profile"
              />

            </div>

          </div>

          <button
            type="button"
            className="addFounderBtn"
          >
            + Add Founder
          </button>

        </section>

        {/* =========================
            TECH STACK
        ========================= */}

        <section className="profileCard">

          <h2>Technology Stack</h2>

          <div className="techGrid">
            <span>React</span>
            <span>Node.js</span>
            <span>Express</span>
            <span>MongoDB</span>
            <span>JavaScript</span>
            <span>Python</span>
            <span>AWS</span>
            <span>Docker</span>
            <span>AI</span>
            <span>Firebase</span>
            <span>Stripe</span>
            <span>Socket.io</span>
          </div>

        </section>

        {/* =========================
            GALLERY
        ========================= */}

        <section className="profileCard">

          <h2>Product Gallery</h2>

          <label htmlFor="gallery">

            <div className="galleryUpload">

              📸

              <h3>
                Upload Product Images
              </h3>

              <p>
                Upload screenshots of your product
              </p>

            </div>

          </label>

          <input
            hidden
            multiple
            id="gallery"
            type="file"
            accept="image/*"
            onChange={handleGallery}
          />

          <div className="galleryGrid">

            {gallery.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
              />
            ))}

          </div>

        </section>

        {/* =========================
            PITCH DECK
        ========================= */}

        <section className="profileCard">

          <h2>Pitch Deck</h2>

          <label htmlFor="pitch">

            <div className="dropArea">

              ☁️

              <h3>
                Drag & Drop Pitch Deck
              </h3>

              <p>
                PDF Only
              </p>

              {pitchDeck && (
                <h4>
                  {pitchDeck}
                </h4>
              )}

            </div>

          </label>

          <input
            hidden
            id="pitch"
            accept=".pdf"
            type="file"
            onChange={handlePitch}
          />

        </section>

        {/* =========================
            DEMO VIDEO
        ========================= */}

        <section className="profileCard">

          <h2>Demo Video</h2>

          <input
            type="text"
            placeholder="YouTube Demo Link"
          />

        </section>

        {/* =========================
            SOCIAL LINKS
        ========================= */}

        <section className="profileCard">

          <h2>Social Links</h2>

          <div className="grid2">

            <input placeholder="LinkedIn" />
            <input placeholder="GitHub" />
            <input placeholder="Twitter / X" />
            <input placeholder="Instagram" />

          </div>

        </section>

        {/* =========================
            SUBMIT
        ========================= */}

        <button
          className="launchBtn"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Launching..."
            : "🚀 Launch Startup"}
        </button>

      </form>

    </div>
  );
}