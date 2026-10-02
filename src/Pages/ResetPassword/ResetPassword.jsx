import "./ResetPassword.css";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/auth";

function ResetPassword() {

    const { token } = useParams();

    const navigate = useNavigate();

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if(password !== confirmPassword){

            alert("Passwords do not match.");

            return;

        }

        try{

            setLoading(true);

            const res = await API.post(

                `/reset-password/${token}`,

                {

                    password

                }

            );

            alert(res.data.message);

            navigate("/login");

        }

        catch(err){

            alert(

                err.response?.data?.message ||

                "Unable to reset password."

            );

        }

        finally{

            setLoading(false);

        }

    };

    return(

        <div className="resetPage">

            <div className="resetCard">

                <h2>Create New Password</h2>

                <p>

                    Your new password should be secure.

                </p>

                <form onSubmit={handleSubmit}>

                    <input

                        type="password"

                        placeholder="New Password"

                        value={password}

                        onChange={(e)=>setPassword(e.target.value)}

                        required

                    />

                    <input

                        type="password"

                        placeholder="Confirm Password"

                        value={confirmPassword}

                        onChange={(e)=>setConfirmPassword(e.target.value)}

                        required

                    />

                    <button>

                        {

                        loading

                        ?

                        "Updating..."

                        :

                        "Reset Password"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default ResetPassword;