import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaTriangleExclamation } from "react-icons/fa6";
import { getMentorMeetingToken } from "../../api/mentorSession";
import "./MentorMeeting.css";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function MentorMeeting() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const roomContainerRef = useRef(null);
  const meetingRef = useRef(null);
  const [credentials, setCredentials] = useState(null);
  const [sessionError, setSessionError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [deviceMessage, setDeviceMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const [otherParticipantJoined, setOtherParticipantJoined] = useState(false);

  const user = getStoredUser();
  const backPath = user?.role === "Mentor"
    ? "/mentor-dashboard"
    : user?.role === "Founder"
      ? "/dashboard"
      : "/my-mentorship";

  useEffect(() => {
    let active = true;

    getMentorMeetingToken(sessionId)
      .then((result) => {
        if (active) setCredentials(result);
      })
      .catch((error) => {
        if (active) {
          setSessionError(
            error.response?.data?.message || "Unable to prepare this meeting. Check your connection and try again."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!credentials || !roomContainerRef.current) return undefined;

    let active = true;
    let meeting;
    let expressEngine;
    const handleRoomStateUpdate = (_roomId, state, errorCode) => {
      if (errorCode && errorCode !== 0) {
        setConnectionError("The connection to the meeting failed. Check your internet connection and try joining again.");
      } else if (state === 2) {
        setConnectionError("");
      }
    };
    const handlePublisherStateUpdate = (result, _state, callbackErrorCode) => {
      const errorCode = typeof result === "object" && result !== null
        ? result.errorCode
        : callbackErrorCode;
      if (errorCode && errorCode !== 0) {
        setDeviceMessage("Camera or microphone access failed. Allow access in your browser settings, or choose another device in the pre-join controls.");
      }
    };

    const startMeeting = async () => {
      const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");
      if (!active || !roomContainerRef.current) return;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        Number(credentials.appId),
        credentials.token,
        credentials.roomId,
        credentials.userId,
        credentials.userName
      );
      meeting = ZegoUIKitPrebuilt.create(kitToken);
      meetingRef.current = meeting;
      expressEngine = meeting.express;
      expressEngine?.on?.("roomStateUpdate", handleRoomStateUpdate);
      expressEngine?.on?.("publisherStateUpdate", handlePublisherStateUpdate);

      meeting.joinRoom({
        container: roomContainerRef.current,
        maxUsers: 2,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
          config: { role: ZegoUIKitPrebuilt.Host },
        },
        showPreJoinView: true,
        preJoinViewConfig: { title: "Join your mentoring session" },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showRoomTimer: true,
        showUserList: true,
        showTextChat: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showLeavingView: false,
        onJoinRoom: () => setJoined(true),
        onLeaveRoom: () => navigate(backPath, { replace: true }),
        onUserJoin: () => setOtherParticipantJoined(true),
        onUserLeave: () => setOtherParticipantJoined(false),
        onYouRemovedFromRoom: () => navigate(backPath, { replace: true }),
        onReturnToHomeScreenClicked: () => navigate(backPath, { replace: true }),
      });
    };

    startMeeting().catch(() => {
      if (active) {
        setConnectionError("The meeting could not start. Refresh this page or return to your dashboard and try again.");
      }
    });

    return () => {
      active = false;
      expressEngine?.off?.("roomStateUpdate", handleRoomStateUpdate);
      expressEngine?.off?.("publisherStateUpdate", handlePublisherStateUpdate);
      meetingRef.current?.destroy();
      meetingRef.current = null;
    };
  }, [credentials, navigate, backPath]);

  const leaveMeeting = () => {
    meetingRef.current?.hangUp();
    navigate(backPath, { replace: true });
  };

  return (
    <main className="mentorMeetingPage">
      <header className="mentorMeetingHeader">
        <Link to={backPath} className="mentorMeetingBrand" aria-label="Back to VentureX dashboard">
          <span className="mentorMeetingBrandMark">V</span>
          <span>Venture<span>X</span></span>
        </Link>
        <Link to={backPath} className="mentorMeetingBack">
          <FaArrowLeft aria-hidden="true" />
          <span>Back to VentureX</span>
        </Link>
      </header>

      <section className="mentorMeetingContent">
        <div className="mentorMeetingHeading">
          <div>
            <p className="mentorMeetingEyebrow">PRIVATE MENTOR SESSION</p>
            <h1>{credentials?.session.topic || "Mentor meeting"}</h1>
            <p className="mentorMeetingWith">
              {credentials
                ? `With ${credentials.session.otherParticipantName} · ${credentials.session.otherParticipantRole}`
                : "Verifying your session access"}
            </p>
          </div>
          {credentials && (
            <div className={`mentorMeetingStatus${joined ? " is-connected" : ""}`} role="status">
              <span />
              {joined
                ? otherParticipantJoined
                  ? `${credentials.session.otherParticipantName} is here`
                  : `Waiting for ${credentials.session.otherParticipantName}`
                : "Preparing meeting"}
            </div>
          )}
        </div>

        {sessionError ? (
          <div className="mentorMeetingMessage mentorMeetingMessage--error" role="alert">
            <FaTriangleExclamation aria-hidden="true" />
            <div>
              <h2>Meeting unavailable</h2>
              <p>{sessionError}</p>
              <Link to={backPath} className="mentorMeetingAction">Return to dashboard</Link>
            </div>
          </div>
        ) : (
          <>
            {connectionError && (
              <div className="mentorMeetingNotice" role="alert">
                <FaTriangleExclamation aria-hidden="true" />
                <span>{connectionError}</span>
              </div>
            )}
            {deviceMessage && (
              <div className="mentorMeetingNotice mentorMeetingNotice--device" role="alert">
                <FaTriangleExclamation aria-hidden="true" />
                <span>{deviceMessage}</span>
              </div>
            )}
            {!credentials && (
              <div className="mentorMeetingLoading" role="status">
                <span className="mentorMeetingSpinner" />
                <p>Verifying your session and preparing the meeting...</p>
              </div>
            )}
            {credentials && (
              <>
                <div className="mentorMeetingRoom" ref={roomContainerRef} aria-label="Live audio and video meeting" />
                <div className="mentorMeetingFooter">
                  <p>
                    Camera and microphone access is managed in the pre-join controls. If access is blocked or a device is unavailable, update your browser permissions or select another device there.
                  </p>
                  <button type="button" onClick={leaveMeeting} className="mentorMeetingLeave">
                    Leave meeting
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}