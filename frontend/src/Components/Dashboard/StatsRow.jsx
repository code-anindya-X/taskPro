// components/dashboard/StatsRow.jsx
// Renders a row of 4 StatCards.
// Computes counts from the tasks array passed in as a prop.

import { Box } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  HourglassEmpty as HourglassIcon,
  Autorenew as InProgressIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import StatCard from "./StatCard";

export default function StatsRow({ tasks }) {
  // Count tasks by status
  const total      = tasks.length;
  const pending    = tasks.filter((t) => t.status === "Pending").length;
  const inProgress = tasks.filter((t) => t.status === "In progress").length;
  const completed  = tasks.filter((t) => t.status === "Completed").length;

  // Config for each card: label, count, icon, icon background color
  const stats = [
    {
      label: "Total",
      count: total,
      icon: <DashboardIcon sx={{ color: "#1C3E38", fontSize: "1.2rem" }} />,
      iconBgColor: "#DDE8E6",
    },
    {
      label: "Pending",
      count: pending,
      icon: <HourglassIcon sx={{ color: "#C8860A", fontSize: "1.2rem" }} />,
      iconBgColor: "#FDF3E3",
    },
    {
      label: "In Progress",
      count: inProgress,
      icon: <InProgressIcon sx={{ color: "#2563EB", fontSize: "1.2rem" }} />,
      iconBgColor: "#EEF2FF",
    },
    {
      label: "Completed",
      count: completed,
      icon: <CheckIcon sx={{ color: "#16A34A", fontSize: "1.2rem" }} />,
      iconBgColor: "#DCFCE7",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 4,
        // Stack vertically on mobile, row on tablet+
        flexDirection: { xs: "column", sm: "row" },
        flexWrap: { sm: "wrap", md: "nowrap" },
      }}
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          count={stat.count}
          icon={stat.icon}
          iconBgColor={stat.iconBgColor}
        />
      ))}
    </Box>
  );
}