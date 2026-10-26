import "./Login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/auth";
import HomeButton from "../../Components/HomeButton";

import { GoogleLogin } from "@react-oauth/google";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

function Login() {

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const beginEmailVerification = (pendingEmail) => {
    sessionStorage.setItem("pendingEmailVerification", pendingEmail);
    sessionStorage.setItem(
      "pendingEmailVerificationResendAt",
      String(Date.now() + 60 * 1000)
    );
    navigate("/verify-otp", { state: { email: pendingEmail } });
  };

  // ==========================
  // Normal Login
  // ==========================

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const response = await API.post("/login", {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert("Login Successful");

      const role = response.data.user.role;

      if (role === "Founder") {

        navigate("/dashboard");

      }

      else if (role === "Investor") {

        navigate("/investor-dashboard");

      }

      else if (role === "Mentor") {

        navigate("/mentor-dashboard");

      }

    }

    catch (error) {

      if (error.response?.data?.requiresEmailVerification) {
        beginEmailVerification(error.response.data.email || email);
        return;
      }

      alert(
        error.response?.data?.message ||
        "Login Failed"
      );

    }

    finally {

      setLoading(false);

    }

  };

  // ==========================
  // Google Login
  // ==========================

  const handleGoogleSuccess = async (credentialResponse) => {

  try {
    const response = await API.post("/google-login", {
      credential: credentialResponse.credential,
    });
    localStorage.setItem("token", response.data.token);

    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

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
      beginEmailVerification(error.response.data.email || "");
      return;
    }
    alert("Google Login Failed");

  }

};

  return (

<div className="loginPage">

<HomeButton className="homeButton--auth" />

<div className="backgroundCircle one"></div>

<div className="backgroundCircle two"></div>

<div className="backgroundCircle three"></div>

<div className="loginLeft">

<div className="brand_log">

<h1>VentureX</h1>

<p>Build. Fund. Grow.</p>

<h2>Turning Ideas into Startups</h2>

<span>

Connect with investors,

collaborate with experienced mentors,

and grow your business on one unified platform.

</span>

<div className="featureCards">

<div className="featureCard">

<h3>Launch Startup</h3>

<p>

Create your startup profile and showcase your vision.

</p>

</div>

<div className="featureCard">

<h3>Find Investors</h3>

<p>

Connect with investors looking for innovative ideas.

</p>

</div>

<div className="featureCard">

<h3>Get Mentorship</h3>

<p>

Learn from experienced founders and industry experts.

</p>

</div>

</div>

</div>

</div>

<div className="loginRight">

<div className="loginCard">

<h2>Login</h2>

<p>

Access your VentureX account.

</p>

<form onSubmit={handleLogin}>

<div className="inputGroup">

<label>Email Address</label>

<div className="inputIcon">

<FaEnvelope />

<input

type="email"

placeholder="Enter your email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>

</div>

</div>

<div className="inputGroup">

<label>Password</label>

<div className="inputIcon">

<FaLock />

<input

type={showPassword ? "text" : "password"}

placeholder="Enter your password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

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

<div className="loginOptions">

<label>

<input type="checkbox"/>

Remember Me

</label>

<div className="forgotPassword">

<Link to="/forgot-password">

Forgot Password?

</Link>

</div>

</div>

<button

type="submit"

className="loginBtnn"

disabled={loading}

>

{

loading ?

"Logging In..."

:

"Login"

}

</button>

<div className="divider">

<span>OR</span>

</div>

<div className="googleBtn">

<GoogleLogin

onSuccess={handleGoogleSuccess}

onError={() => alert("Google Login Failed")}

/>

</div>

<p className="register">

Don't have an account?

<Link to="/register">

Create Account

</Link>

</p>

</form>

</div>

</div>

</div>

  );

}

export default Login;