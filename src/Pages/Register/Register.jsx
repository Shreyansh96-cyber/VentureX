import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/auth";
import HomeButton from "../../Components/HomeButton";

import { GoogleLogin } from "@react-oauth/google";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
} from "react-icons/fa";


function Register() {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Founder",
  });

  const beginEmailVerification = (email, retryAfterSeconds = 60) => {
    sessionStorage.setItem("pendingEmailVerification", email);
    sessionStorage.setItem(
      "pendingEmailVerificationResendAt",
      String(Date.now() + retryAfterSeconds * 1000)
    );
    navigate("/verify-otp", { state: { email } });
  };

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async (e) => {

  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {

    alert("Passwords do not match!");

    return;

  }

  try {

    setLoading(true);

    const response = await API.post("/register", {

      name: formData.name,

      email: formData.email,

      password: formData.password,

      role: formData.role,

    });

    if (response.data.requiresEmailVerification) {
      beginEmailVerification(response.data.email || formData.email);
      return;
    }

    localStorage.setItem("token", response.data.token);

    localStorage.setItem(

      "user",

      JSON.stringify(response.data.user)

    );

    alert("Registration Successful!");

    const role = response.data.user.role;

    if (role === "Founder") {

      navigate("/dashboard");

    }

    else if (role === "Investor") {

      navigate("/investor-dashboard");

    }

    else {

      navigate("/mentor-dashboard");

    }

  }

  catch (error) {

    if (error.response?.data?.requiresEmailVerification) {
      beginEmailVerification(
        error.response.data.email || formData.email,
        error.response.data.retryAfterSeconds || 60
      );
      return;
    }

    alert(

      error.response?.data?.message ||

      "Registration Failed"

    );

  }

  finally {

    setLoading(false);

  }

};

const handleGoogleRegister = async (credentialResponse) => {
  try {
    const response = await API.post("/google-login", {
      credential: credentialResponse.credential,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    alert("Registration Successful");

    const role = response.data.user.role;

    if (role === "Founder") {
      navigate("/dashboard");
    } else if (role === "Investor") {
      navigate("/investor-dashboard");
    } else {
      navigate("/mentor-dashboard");
    }

  } catch (error) {
    if (error.response?.data?.requiresEmailVerification) {
      beginEmailVerification(error.response.data.email || formData.email);
      return;
    }
    alert("Google Registration Failed");
  }
};
  return (

<div className="registerPage">

<HomeButton className="homeButton--auth" />

<div className="backgroundCircle one"></div>
<div className="backgroundCircle two"></div>
<div className="backgroundCircle three"></div>

<div className="registerLeft">

<div className="brand">

<h1>VentureX</h1>

<p>Build. Fund. Grow.</p>

<h2>

Create Your Startup Journey

</h2>

<span>

Join India's modern startup ecosystem where founders,
investors, and mentors collaborate to build the future.

</span>

<div className="networkScene" aria-hidden="true">
<svg className="networkGraphic" viewBox="0 0 600 250" fill="none">
<path className="networkLine" d="M44 172 136 126 220 166 300 91 376 132 468 76 558 113" />
<path className="networkLine" d="M136 126 154 54 300 91 326 203 468 76 478 196" />
<path className="networkLine" d="M44 172 113 218 220 166 326 203 424 225 478 196 558 113" />
<path className="networkLine networkLine--soft" d="M154 54 248 30 300 91 412 34 468 76 558 48" />
<circle className="networkNode networkNode--large" cx="300" cy="91" r="7" />
<circle className="networkNode" cx="136" cy="126" r="5" />
<circle className="networkNode" cx="220" cy="166" r="5" />
<circle className="networkNode" cx="376" cy="132" r="5" />
<circle className="networkNode networkNode--large" cx="468" cy="76" r="7" />
<circle className="networkNode" cx="154" cy="54" r="4" />
<circle className="networkNode" cx="326" cy="203" r="4" />
<circle className="networkNode" cx="478" cy="196" r="4" />
</svg>

<div className="networkCard networkCard--discovery">
<span className="networkCardIcon networkCardIcon--spark">✦</span>
<span className="networkCardCopy">
<strong>Startup discovery</strong>
<small>Ideas ready to grow</small>
</span>
</div>

<div className="networkCard networkCard--connection">
<span className="networkCardIcon networkCardIcon--link">
<svg viewBox="0 0 24 24" fill="none">
<path d="M9.5 14.5 14.5 9.5M7.5 16.5l-1 1a4.24 4.24 0 0 1-6-6l4-4a4.24 4.24 0 0 1 6 0M16.5 7.5l1-1a4.24 4.24 0 0 1 6 6l-4 4a4.24 4.24 0 0 1-6 0" />
</svg>
</span>
<span className="networkCardCopy">
<strong>Investor connection</strong>
<small>Better things, together</small>
</span>
</div>
</div>

</div>

</div>

<div className="registerRight">

<div className="registerCard">

<h2>Create Account</h2>

<p>

Join VentureX today.

</p>

<form onSubmit={handleSubmit}><div className="inputGroup">

<label>Full Name</label>

<div className="inputIcon">

<FaUser/>

<input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required/>

</div>

</div>

<div className="inputGroup">

<label>Email Address</label>

<div className="inputIcon">

<FaEnvelope/>

<input

type="email"

name="email"

placeholder="Enter your email"

value={formData.email}

onChange={handleChange}

required

/>

</div>

</div>

<div className="inputGroup">

<label>Password</label>

<div className="inputIcon">

<FaLock/>

<input

type={showPassword ? "text":"password"}

name="password"

placeholder="Create password"

value={formData.password}

onChange={handleChange}

required

/>

<div

className="eye"

onClick={()=>setShowPassword(!showPassword)}

>

{showPassword ?

<FaEyeSlash/>

:

<FaEye/>

}

</div>

</div>

</div>

<div className="inputGroup">

<label>Confirm Password</label>

<div className="inputIcon">

<FaLock/>

<input

type={showConfirmPassword ? "text":"password"}

name="confirmPassword"

placeholder="Confirm password"

value={formData.confirmPassword}

onChange={handleChange}

required

/>

<div

className="eye"

onClick={()=>setShowConfirmPassword(!showConfirmPassword)}

>

{showConfirmPassword ?

<FaEyeSlash/>

:

<FaEye/>

}

</div>

</div>

</div><div className="inputGroup">

<label>Select Role</label>

<select

name="role"

value={formData.role}

onChange={handleChange}

className="roleSelect"

>

<option>Founder</option>

<option>Investor</option>

<option>Mentor</option>

</select>

</div>

<button

className="registerBtn"

type="submit"

disabled={loading}

>

{

loading

?

"Creating Account..."

:

"Create Account"

}

</button>

<div className="divider">

<span>OR</span>

</div>

<div className="googleLoginContainer">
  <GoogleLogin
    onSuccess={handleGoogleRegister}
    onError={() => {
      alert("Google Register Failed");
    }}
  />
</div>

<p className="loginLink">

Already have an account?

<Link to="/login">

 Login

</Link>

</p>

</form>

<div className="secure">

🔒 Your information is securely encrypted.

</div>

</div>

</div>

</div>

  );

}

export default Register;