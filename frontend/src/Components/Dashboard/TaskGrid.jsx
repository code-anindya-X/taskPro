// components/dashboard/TaskGrid.jsx
// Renders a responsive grid of TaskCards.
// Also handles the empty state when no tasks match filters.

import { Box, Typography } from "@mui/material";
import TaskCard from "./TaskCard";

export default function TaskGrid({ tasks, onView, onEdit, onDelete }) {

    // ── Empty state ──────────────────────────────────────────────
    if (tasks.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: "center",
                    py: 10,
                    color: "#9CA3A0",
                }}
            >
                <Typography sx={{ fontSize: "2rem", mb: 1 }}>📭</Typography>
                <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#6B7775" }}>
                    No tasks found
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                    Try adjusting your filters or add a new task.
                </Typography>
            </Box>
        );
    }

    // ── Task grid ────────────────────────────────────────────────
    return (
        <Box
            sx={{
                display: "grid",
                // 1 col on mobile, 2 on tablet, 3 on desktop
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                },
                gap: 2.5,
            }}
        >
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </Box>
    );
}