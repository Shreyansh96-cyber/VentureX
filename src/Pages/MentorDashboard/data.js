import {
  FaUsers,
  FaCalendarCheck,
  FaClock,
  FaStar,
} from "react-icons/fa";

export const stats = [
  {
    title: "Active Startups",
    value: "18",
    icon: FaUsers,
    color: "#2563EB",
  },
  {
    title: "Sessions This Week",
    value: "12",
    icon: FaCalendarCheck,
    color: "#14B8A6",
  },
  {
    title: "Pending Requests",
    value: "7",
    icon: FaClock,
    color: "#F59E0B",
  },
  {
    title: "Average Rating",
    value: "4.9",
    icon: FaStar,
    color: "#22C55E",
  },
];

export const mentorProfile = {
  name: "Dr. Raj Sharma",
  role: "Product Strategy Mentor",
  sessions: 120,
  rating: 4.9,
  image: "https://i.pravatar.cc/150?img=12",
};

export const sessions = [
  {
    id: 1,
    startup: "AI Resume Builder",
    topic: "Product Strategy",
    time: "2:00 PM",
  },
  {
    id: 2,
    startup: "HealthSync",
    topic: "Funding Roadmap",
    time: "5:00 PM",
  },
];

export const requests = [
  {
    id: 1,
    startup: "AI Resume Builder",
    founder: "Shreyansh",
    category: "AI",
  },
  {
    id: 2,
    startup: "AgriTech Connect",
    founder: "Rahul",
    category: "Agriculture",
  },
];

export const startups = [
  {
    id: 1,
    name: "HealthSync",
    stage: "Growth",
    category: "Healthcare",
  },
  {
    id: 2,
    name: "FinWise",
    stage: "Prototype",
    category: "FinTech",
  },
];

export const activities = [
  {
    id: 1,
    title: "Completed Product Strategy Session",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Received a 5-star review",
    time: "Yesterday",
  },
  {
    id: 3,
    title: "New mentorship request received",
    time: "2 days ago",
  },
];