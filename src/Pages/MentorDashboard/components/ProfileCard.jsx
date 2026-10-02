import "./ProfileCard.css";
import { FaStar, FaChalkboardTeacher, FaUserEdit } from "react-icons/fa";

export default function ProfileCard({ profile }) {
  return (
    <div className="profileCard">

      <img
        src={profile.image}
        alt={profile.name}
        className="mentorProfileImage"
      />

      <h3>{profile.name}</h3>

      <p>{profile.role}</p>

      <div className="profileStats">

        <div className="profileStat">
          <FaChalkboardTeacher />
          <span>{profile.sessions} Sessions</span>
        </div>

        <div className="profileStat">
          <FaStar />
          <span>{profile.rating} Rating</span>
        </div>

      </div>

      <button className="editProfileBtn">
        <FaUserEdit />
        Edit Profile
      </button>

    </div>
  );
}