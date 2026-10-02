import "./CreateStartup.css";
import { useState } from "react";
import API from "../../api/auth";

function CreateStartup() {

    const [logo,setLogo]=useState(null);

const handleLogo=(e)=>{

    const file=e.target.files[0];

    if(file){

        setLogo(URL.createObjectURL(file));

    }

};

    const [formData, setFormData] = useState({

        startupName: "",

        industry: "",

        stage: "Idea",

        fundingNeeded: "",

        website: "",

        description: ""

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try{

            await API.post("/startups/create",formData);

            alert("Startup Created Successfully");

        }

        catch(err){

            console.error("LEGACY STARTUP REQUEST FAILED:", err.response?.status || "network");

            alert("Unable to create startup");

        }

    };

    return(

        <div className="createStartupPage">

            <div className="createCard">

    <div className="cardHeader">

        <div>

            <h1>🚀 Create Your Startup</h1>

            <p>
                Showcase your startup to investors, mentors and the VentureX community.
            </p>

        </div>

    </div>

    <form onSubmit={handleSubmit}>

        <div className="logoUpload">

    <label htmlFor="logoInput">

        <div className="logoCircle">

            {

                logo ?

                <img src={logo} alt="logo"/>

                :

                <span>+</span>

            }

        </div>

    </label>

    <input
        id="logoInput"
        type="file"
        hidden
        onChange={handleLogo}
    />

    <p>Upload Startup Logo</p>

</div>

        <div className="formGrid">

            <div className="inputBox">
                <label>Startup Name</label>
                <input type="text" name="startupName" onChange={handleChange}/>
            </div>

            <div className="inputBox">
                <label>Industry</label>
                <select name="industry" onChange={handleChange}>
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>E-Commerce</option>
                    <option>AI / ML</option>
                </select>
            </div>

            <div className="inputBox">
                <label>Location</label>
                <input type="text" name="location" onChange={handleChange}/>
            </div>

            <div className="inputBox">
                <label>Founded Year</label>
                <input type="number" name="year" onChange={handleChange}/>
            </div>

            <div className="inputBox">
                <label>Startup Stage</label>
                <select name="stage" onChange={handleChange}>
                    <option>Idea</option>
                    <option>Prototype</option>
                    <option>MVP</option>
                    <option>Early Revenue</option>
                    <option>Growth</option>
                    <option>Scaling</option>
                </select>
            </div>

            <div className="inputBox">
                <label>Team Size</label>
                <input type="number" name="teamSize" onChange={handleChange}/>
            </div>

            <div className="inputBox">
                <label>Website</label>
                <input type="text" name="website" onChange={handleChange}/>
            </div>

            <div className="inputBox">
                <label>Official Email</label>
                <input type="email" name="officialEmail" onChange={handleChange}/>
            </div>

            <div className="inputBox">
                <label>Funding Needed ($)</label>
                <input type="number" name="fundingNeeded" onChange={handleChange}/>
            </div>

            <div className="inputBox">
                <label>Current Valuation ($)</label>
                <input type="number" name="valuation" onChange={handleChange}/>
            </div>

            <div className="inputBox">
                <label>Equity Offered (%)</label>
                <input type="number" name="equity" onChange={handleChange}/>
            </div>

        </div>

        <div className="inputBox fullWidth">

            <label>About Startup</label>

            <textarea
                rows="6"
                name="description"
                onChange={handleChange}
            />

        </div>

        <div className="uploadBox">

            <h3>Pitch Deck</h3>

            <input type="file" />

        </div>

        <div className="formGrid">

            <div className="inputBox">
                <label>LinkedIn</label>
                <input type="text"/>
            </div>

            <div className="inputBox">
                <label>X (Twitter)</label>
                <input type="text"/>
            </div>

            <div className="inputBox">
                <label>GitHub</label>
                <input type="text"/>
            </div>

        </div>

        <button className="launchBtn">

            🚀 Launch Startup

        </button>

    </form>

</div>

        </div>

    );

}

export default CreateStartup;import "./CreateStartup.css";

// import { useState } from "react";
// // import { useNavigate } from "react-router-dom";

// // import API from "../../api/startup";

// function CreateStartup() {
//     // const navigate = useNavigate();

//     // const user = JSON.parse(localStorage.getItem("user"));

//     const [formData, setFormData] = useState({
//         startupName: "",
//         tagline: "",
//         description: "",
//         industry: "",
//         stage: "Idea",
//         fundingGoal: "",
//         website: "",
//         location: "",
//         logo: "",
//         teamSize: "",
//         foundedYear: new Date().getFullYear(),
//     });
//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {

//             const user = JSON.parse(localStorage.getItem("user"));

//             const response = await API.post("/", {
//                 ...formData,
//                 founderId: user._id,
//             });

//             alert(response.data.message);

//             console.log(response.data);

//         } catch (error) {

//             console.log(error);

//             alert(
//                 error.response?.data?.message ||
//                 "Failed to create startup."
//             );

//         }
//     };
//     return (
//         <div className="createStartupPage">

//             <div className="startupCard">

//                 <div className="startupHeader">
//                     <h1>Create Your Startup</h1>
//                     <p>
//                         Showcase your startup to investors and mentors on VentureX.
//                     </p>
//                 </div>

//                 <form className="startupForm">

//                     <div className="formGrid">

//                         <div className="inputGroup">
//                             <label>Startup Name</label>
//                             <input type="text" name="startupName" value={formData.startupName} onChange={handleChange} placeholder="Enter startup name" />
//                         </div>

//                         <div className="inputGroup">
//                             <label>Industry</label>

//                             <select
//                                 name="industry"
//                                 value={formData.industry}
//                                 onChange={handleChange}
//                             >
//                                 <option value="">Select Industry</option>
//                                 <option value="AI">AI</option>
//                                 <option value="FinTech">FinTech</option>
//                                 <option value="EdTech">EdTech</option>
//                                 <option value="HealthTech">HealthTech</option>
//                                 <option value="E-Commerce">E-Commerce</option>
//                                 <option value="Cyber Security">Cyber Security</option>
//                                 <option value="SaaS">SaaS</option>
//                                 <option value="Clean Energy">Clean Energy</option>
//                                 <option value="Agriculture">Agriculture</option>
//                                 <option value="Other">Other</option>
//                             </select>

//                         </div>

//                         <div className="inputGroup">
//                             <label>Tagline</label>
//                             <input
//                                 type="text"
//                                 name="tagline"
//                                 value={formData.tagline}
//                                 onChange={handleChange}
//                                 placeholder="One line about your startup"
//                             />
//                         </div>

//                         <div className="inputGroup">
//                             <label>Startup Stage</label>

//                             <select
//                                 name="stage"
//                                 value={formData.stage}
//                                 onChange={handleChange}
//                             >
//                                 <option value="Idea">Idea</option>
//                                 <option value="MVP">MVP</option>
//                                 <option value="Seed">Seed</option>
//                                 <option value="Series A">Series A</option>
//                             </select>

//                         </div>

//                         <div className="inputGroup">
//                             <label>Funding Goal (₹)</label>

//                             <input
//                                 type="number"
//                                 name="fundingGoal"
//                                 value={formData.fundingGoal}
//                                 onChange={handleChange}
//                                 placeholder="1000000"
//                             />

//                         </div>

//                         <div className="inputGroup">
//                             <label>Team Size</label>

//                             <input
//                                 type="number"
//                                 name="teamSize"
//                                 value={formData.teamSize}
//                                 onChange={handleChange}
//                                 placeholder="5"
//                             />

//                         </div>

//                         <div className="inputGroup">
//                             <label>Location</label>

//                             <input
//                                 type="text"
//                                 name="location"
//                                 value={formData.location}
//                                 onChange={handleChange}
//                                 placeholder="City, Country"
//                             />

//                         </div>

//                         <div className="inputGroup">
//                             <label>Founded Year</label>

//                             <input
//                                 type="number"
//                                 name="foundedYear"
//                                 value={formData.foundedYear}
//                                 onChange={handleChange}
//                             />

//                         </div>

//                     </div>

//                     <div className="inputGroup fullWidth">

//                         <label>Website</label>

//                         <input
//                             type="text"
//                             name="website"
//                             value={formData.website}
//                             onChange={handleChange}
//                             placeholder="https://yourstartup.com"
//                         />

//                     </div>

//                     <div className="inputGroup fullWidth">

//                         <label>Logo URL</label>

//                         <input
//                             type="text"
//                             name="logo"
//                             value={formData.logo}
//                             onChange={handleChange}
//                             placeholder="Paste logo image URL"
//                         />

//                     </div>

//                     <div className="inputGroup fullWidth">

//                         <label>Description</label>

//                         <textarea
//                             rows="6"
//                             name="description"
//                             value={formData.description}
//                             onChange={handleChange}
//                             placeholder="Describe your startup..."
//                         ></textarea>

//                     </div>

//                     <button type="submit" className="createBtn">
//                         Create Startup
//                     </button>

//                 </form>

//             </div>

//         </div>
//     );
// }

// export default CreateStartup;