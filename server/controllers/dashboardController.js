import Investment from "../models/Investment.js";
import MentorSession from "../models/MentorSession.js";
import Startup from "../models/Startup.js";

const investmentSummaryPipeline = (startupIds) => [
  { $match: { startupId: { $in: startupIds } } },
  {
    $addFields: {
      normalizedStatus: { $toLower: { $ifNull: ["$status", ""] } },
    },
  },
  {
    $group: {
      _id: "$startupId",
      investmentRequests: { $sum: 1 },
      raisedAmount: {
        $sum: {
          $cond: [
            { $eq: ["$normalizedStatus", "accepted"] },
            { $ifNull: ["$amount", 0] },
            0,
          ],
        },
      },
      acceptedInvestments: {
        $sum: { $cond: [{ $eq: ["$normalizedStatus", "accepted"] }, 1, 0] },
      },
      pendingInvestments: {
        $sum: { $cond: [{ $eq: ["$normalizedStatus", "pending"] }, 1, 0] },
      },
      investorIds: { $addToSet: "$investorId" },
      acceptedInvestorIds: {
        $addToSet: {
          $cond: [
            { $eq: ["$normalizedStatus", "accepted"] },
            "$investorId",
            null,
          ],
        },
      },
    },
  },
];

const makeFundingSummary = (fundingGoal, raisedAmount) => {
  const goal = Math.max(0, Number(fundingGoal) || 0);
  const raised = Math.max(0, Number(raisedAmount) || 0);

  return {
    fundingGoal: goal,
    raisedAmount: raised,
    remainingAmount: Math.max(goal - raised, 0),
    fundingPercentage: goal > 0 ? Math.min((raised / goal) * 100, 100) : 0,
  };
};

const buildDashboardData = (startups, investmentGroups) => {
  const groupByStartup = new Map(
    investmentGroups.map((group) => [String(group._id), group])
  );
  const investorIds = new Set();
  let investmentRequests = 0;
  let acceptedInvestments = 0;
  let pendingInvestments = 0;
  let totalRaised = 0;
  let totalGoal = 0;

  const startupSummaries = startups.map((startup) => {
    const group = groupByStartup.get(String(startup._id));
    const goal = Number(startup.fundingGoal) || 0;
    const raised = Number(group?.raisedAmount) || 0;

    investmentRequests += Number(group?.investmentRequests) || 0;
    acceptedInvestments += Number(group?.acceptedInvestments) || 0;
    pendingInvestments += Number(group?.pendingInvestments) || 0;
    totalRaised += raised;
    totalGoal += goal;

    for (const investorId of group?.investorIds || []) {
      if (investorId) investorIds.add(String(investorId));
    }

    const acceptedInvestorIds = (group?.acceptedInvestorIds || [])
      .filter(Boolean)
      .map(String);

    return {
      ...startup,
      ...makeFundingSummary(goal, raised),
      investmentRequests: Number(group?.investmentRequests) || 0,
      acceptedInvestments: Number(group?.acceptedInvestments) || 0,
      pendingInvestments: Number(group?.pendingInvestments) || 0,
      uniqueAcceptedInvestors: new Set(acceptedInvestorIds).size,
    };
  });

  return {
    startupSummaries,
    investmentRequests,
    interestedInvestors: investorIds.size,
    acceptedInvestments,
    pendingInvestments,
    ...makeFundingSummary(totalGoal, totalRaised),
  };
};

export const getFounderDashboardStats = async (req, res) => {
  try {
    const founderId = req.authenticatedUser._id;

    const [startups, upcomingSessions] = await Promise.all([
      Startup.find({ founderId })
        .select("_id startupName tagline industry stage description fundingGoal")
        .lean(),
      MentorSession.countDocuments({
        requesterId: founderId,
        requestedDate: { $gt: new Date() },
        status: { $in: ["Pending", "Accepted"] },
      }),
    ]);

    const startupIds = startups.map((startup) => startup._id);
    const investmentGroups = startupIds.length
      ? await Investment.aggregate(investmentSummaryPipeline(startupIds))
      : [];
    const dashboardData = buildDashboardData(startups, investmentGroups);

    return res.json({
      totalStartups: startups.length,
      investmentRequests: dashboardData.investmentRequests,
      interestedInvestors: dashboardData.interestedInvestors,
      upcomingSessions,
      funding: {
        fundingGoal: dashboardData.fundingGoal,
        raisedAmount: dashboardData.raisedAmount,
        remainingAmount: dashboardData.remainingAmount,
        fundingPercentage: dashboardData.fundingPercentage,
      },
      startups: dashboardData.startupSummaries,
    });
  } catch (error) {
    console.error("GET FOUNDER DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      message: "Unable to load founder dashboard statistics.",
    });
  }
};

export const getFounderFundingAnalytics = async (req, res) => {
  try {
    const founderId = req.authenticatedUser._id;
    const startups = await Startup.find({ founderId })
      .select("_id startupName tagline fundingGoal")
      .lean();
    const startupIds = startups.map((startup) => startup._id);

    const investments = startupIds.length
      ? await Investment.find({ startupId: { $in: startupIds } })
          .select("investorId startupId amount status createdAt updatedAt")
          .populate("investorId", "name")
          .populate("startupId", "startupName")
          .sort({ createdAt: -1 })
          .lean()
      : [];

    const investmentsByStartup = new Map();
    const acceptedInvestorIds = new Set();
    let raisedAmount = 0;
    let acceptedInvestments = 0;
    let pendingInvestments = 0;

    for (const investment of investments) {
      const startupId = String(investment.startupId?._id || investment.startupId);
      const startupInvestments = investmentsByStartup.get(startupId) || [];
      startupInvestments.push(investment);
      investmentsByStartup.set(startupId, startupInvestments);

      const status = String(investment.status || "").toLowerCase();
      if (status === "accepted") {
        raisedAmount += Number(investment.amount) || 0;
        acceptedInvestments += 1;
        if (investment.investorId?._id) {
          acceptedInvestorIds.add(String(investment.investorId._id));
        }
      } else if (status === "pending") {
        pendingInvestments += 1;
      }
    }

    const totalGoal = startups.reduce(
      (total, startup) => total + (Number(startup.fundingGoal) || 0),
      0
    );
    const funding = makeFundingSummary(totalGoal, raisedAmount);
    const startupSummaries = startups.map((startup) => {
      const startupInvestments = investmentsByStartup.get(String(startup._id)) || [];
      const startupRaised = startupInvestments.reduce((total, investment) =>
        String(investment.status || "").toLowerCase() === "accepted"
          ? total + (Number(investment.amount) || 0)
          : total, 0);

      return {
        _id: startup._id,
        startupName: startup.startupName,
        tagline: startup.tagline,
        ...makeFundingSummary(startup.fundingGoal, startupRaised),
      };
    });

    const history = investments.map((investment) => ({
      id: String(investment._id),
      investorName: investment.investorId?.name || "Investor",
      startupName: investment.startupId?.startupName || "Startup",
      amount: Number(investment.amount) || 0,
      status: investment.status || "Unknown",
      date: investment.createdAt,
      activityDate:
        String(investment.status || "").toLowerCase() === "pending"
          ? investment.createdAt
          : investment.updatedAt || investment.createdAt,
    }));

    const recentActivity = [...history]
      .sort((first, second) => new Date(second.activityDate) - new Date(first.activityDate))
      .slice(0, 6)
      .map((investment) => {
        const status = String(investment.status).toLowerCase();
        const description = status === "accepted"
          ? "Investment accepted"
          : status === "rejected"
            ? "Investment rejected"
            : status === "pending"
              ? "Investment request received"
              : "Investment status updated";

        return {
          id: investment.id,
          description,
          investorName: investment.investorName,
          startupName: investment.startupName,
          date: investment.activityDate,
        };
      });

    const milestones = [
      { percentage: 25, label: "First milestone" },
      { percentage: 50, label: "Halfway" },
      { percentage: 75, label: "Almost there" },
      { percentage: 100, label: "Fully funded" },
    ].map((milestone) => ({
      ...milestone,
      status: funding.fundingPercentage >= milestone.percentage ? "Completed" : "Upcoming",
    }));

    return res.json({
      startups: startupSummaries,
      ...funding,
      uniqueInvestors: acceptedInvestorIds.size,
      acceptedInvestments,
      pendingInvestments,
      investments: history.map((investment) => {
        const publicInvestment = { ...investment };
        delete publicInvestment.activityDate;
        return publicInvestment;
      }),
      recentActivity,
      milestones,
    });
  } catch (error) {
    console.error("GET FOUNDER FUNDING ANALYTICS ERROR:", error);
    return res.status(500).json({
      message: "Unable to load funding analytics.",
    });
  }
};