import "./CreateStartup.css";
import logo from "../../assets/logo1.png";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../api/startup";

function CreateStartup() {
    const navigate = useNavigate();

    // const user = JSON.parse(localStorage.getItem("user"));

    const [formData, setFormData] = useState({
        startupName: "",
        tagline: "",
        description: "",
        industry: "",
        stage: "Idea",
        fundingGoal: "",
        website: "",
        location: "",
        logo: "",
        teamSize: "",
        foundedYear: new Date().getFullYear(),
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            const user = JSON.parse(localStorage.getItem("user"));

            const response = await API.post("/", {
                ...formData,
                founderId: user._id,
            });

            alert(response.data.message);
            navigate("/dashboard");

        } catch (error) {

    console.error("LEGACY STARTUP REQUEST FAILED:", error.response?.status || "network");

    alert(error.response?.data?.message || "Failed to create startup.");

}
    };
    return (
        <div className="createStartupPage1">

            <div className="startupCard">

                <div className="startupHeader">

  <div className="startupTitle">

    <img src={logo} alt="VentureX"  alt="VentureX Logo" className="startupLogo"/>

    <h1>Create Your Startup</h1>

  </div>

  <p>
    Showcase your startup to investors and mentors on VentureX.
  </p>

</div>

                <form className="startupForm" onSubmit={handleSubmit}>

                    <div className="formGrid">

                        <div className="inputGroup">
                            <label>Startup Name</label>
                            <input type="text" name="startupName" value={formData.startupName} onChange={handleChange} placeholder="Enter startup name" />
                        </div>

                        <div className="inputGroup">
                            <label>Industry</label>

                            <select
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                            >
                                <option value="">Select Industry</option>
                                <option value="AI">AI</option>
                                <option value="FinTech">FinTech</option>
                                <option value="EdTech">EdTech</option>
                                <option value="HealthTech">HealthTech</option>
                                <option value="E-Commerce">E-Commerce</option>
                                <option value="Cyber Security">Cyber Security</option>
                                <option value="SaaS">SaaS</option>
                                <option value="Clean Energy">Clean Energy</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="Other">Other</option>
                            </select>

                        </div>

                        <div className="inputGroup">
                            <label>Tagline</label>
                            <input
                                type="text"
                                name="tagline"
                                value={formData.tagline}
                                onChange={handleChange}
                                placeholder="One line about your startup"
                            />
                        </div>

                        <div className="inputGroup">
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

                        <div className="inputGroup">
                            <label>Funding Goal (₹)</label>

                            <input
                                type="number"
                                name="fundingGoal"
                                value={formData.fundingGoal}
                                onChange={handleChange}
                                placeholder="1000000"
                            />

                        </div>

                        <div className="inputGroup">
                            <label>Team Size</label>

                            <input
                                type="number"
                                name="teamSize"
                                value={formData.teamSize}
                                onChange={handleChange}
                                placeholder="5"
                            />

                        </div>

                        <div className="inputGroup">
                            <label>Location</label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                            />

                        </div>

                        <div className="inputGroup">
                            <label>Founded Year</label>

                            <input
                                type="number"
                                name="foundedYear"
                                value={formData.foundedYear}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <div className="inputGroup fullWidth">

                        <label>Website</label>

                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://yourstartup.com"
                        />

                    </div>

                    <div className="inputGroup fullWidth">

                        <label>Logo URL</label>

                        <input
                            type="text"
                            name="logo"
                            value={formData.logo}
                            onChange={handleChange}
                            placeholder="Paste logo image URL"
                        />

                    </div>

                    <div className="inputGroup fullWidth">

                        <label>Description</label>

                        <textarea
                            rows="6"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your startup..."
                        ></textarea>

                    </div>

                    <button type="submit" className="createBtn">
                        Create Startup
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateStartup;