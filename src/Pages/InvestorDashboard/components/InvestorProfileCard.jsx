import "./InvestorProfileCard.css";

export default function InvestorProfileCard({ profile }) {
  return (
    <div className="investorProfileCard">

      <div className="profileHeader">

        <img
          src="https://i.pravatar.cc/150?img=15"
          alt={profile.name}
        />

        <h3>{profile.name}</h3>

        <p>{profile.company}</p>

      </div>

      <div className="profileStats">

        <div className="profileStat">
          <h4>{profile.investments}</h4>
          <span>Investments</span>
        </div>

        <div className="profileStat">
          <h4>{profile.followers}</h4>
          <span>Followers</span>
        </div>

        <div className="profileStat">
          <h4>{profile.rating} ⭐</h4>
          <span>Rating</span>
        </div>

      </div>

      <button className="profileBtn">
        View Profile
      </button>

    </div>
  );
}