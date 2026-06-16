// components/dashboard/StatCard.jsx
// A single summary card: icon + label + count
// Used inside StatsRow — receives everything as props

import { Box, Paper, Typography } from "@mui/material";

export default function StatCard({ label, count, icon, iconBgColor }) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 3,
        py: 2.5,
        borderRadius: "16px",
        border: "1px solid #E8E2D9",
        bgcolor: "#FFFFFF",
        flex: 1,               // each card grows equally in the row
        minWidth: 0,           // allows shrinking on small screens
      }}
    >
      {/* Icon circle */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: iconBgColor || "#F0EDE8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      {/* Label + Count */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#6B7775",
            mb: 0.2,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#1C2B28",
            lineHeight: 1,
          }}
        >
          {count}
        </Typography>
      </Box>
    </Paper>
  );
}