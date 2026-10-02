import "./WelcomeCard.css";

export default function WelcomeCard() {
  return (
    <div className="mentorWelcomeCard">

      <div>

        <h2>Welcome Back, Mentor 👋</h2>

        <p>
          You have <strong>2 mentorship sessions</strong> today and
          <strong> 7 pending requests</strong> waiting for your response.
        </p>

        <button>View Schedule</button>

      </div>

    </div>
  );
}