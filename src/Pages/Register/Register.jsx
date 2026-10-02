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

  } catch {
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