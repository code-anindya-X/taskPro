// components/dashboard/GreetingSection.jsx
// Shows "TODAY", "Hello, {username}." and a subtitle

import { Box, Typography } from "@mui/material";

// COLORS (same tokens used across all dashboard components)
const TEXT_MAIN = "#1C2B28";
const TEXT_MUTED = "#6B7775";

export default function GreetingSection({ username }) {
    return (
        <Box sx={{ mb: 4 }}>

            {/* Eyebrow label — "TODAY" */}
            <Typography
                sx={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: TEXT_MUTED,
                    mb: 0.5,
                }}
            >
                Today
            </Typography>

            {/* Main greeting */}
            <Typography
                variant="h4"
                sx={{
                    fontFamily: "'Georgia', serif",
                    fontWeight: 700,
                    color: TEXT_MAIN,
                    fontSize: { xs: "1.8rem", sm: "2.2rem" },
                    mb: 0.5,
                }}
            >
                Hello, {username}.
            </Typography>

            {/* Subtitle */}
            <Typography sx={{ color: TEXT_MUTED, fontSize: "0.95rem" }}>
                Here's what your day looks like.
            </Typography>

        </Box>
    );
}