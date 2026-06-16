// components/dashboard/TaskCard.jsx
// Displays a single task with:
//   - Status, Priority, Overdue chips at the top
//   - Title + description
//   - Due date + View / Edit / Delete icon buttons

import { Box, Paper, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import {
    CalendarToday as CalendarIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";

// ── Chip color config ────────────────────────────────────────────
// Returns { bgcolor, color, borderColor } for each status
function getStatusStyle(status) {
    switch (status) {
        case "Pending":
            return { bgcolor: "#FDF3E3", color: "#C8860A", borderColor: "#F5D89A" };
        case "In progress":
            return { bgcolor: "#EEF2FF", color: "#2563EB", borderColor: "#BFDBFE" };
        case "Completed":
            return { bgcolor: "#DCFCE7", color: "#16A34A", borderColor: "#BBF7D0" };
        default:
            return { bgcolor: "#F3F4F6", color: "#6B7280", borderColor: "#E5E7EB" };
    }
}

// Returns chip style for priority
function getPriorityStyle(priority) {
    switch (priority) {
        case "High":
            return { bgcolor: "#FEE2E2", color: "#DC2626", borderColor: "#FCA5A5" };
        case "Medium":
            return { bgcolor: "#FEF9C3", color: "#854D0E", borderColor: "#FDE68A" };
        case "Low":
            return { bgcolor: "#DCFCE7", color: "#166534", borderColor: "#BBF7D0" };
        default:
            return { bgcolor: "#F3F4F6", color: "#6B7280", borderColor: "#E5E7EB" };
    }
}

// ── Helper: is the task overdue? ────────────────────────────────
function isOverdue(dueDateStr, status) {
    if (status === "Completed") return false;     // completed tasks aren't overdue
    if (!dueDateStr) return false;
    return new Date(dueDateStr) < new Date();
}

// ── Helper: format date as "May 6, 2026" ────────────────────────
function formatDate(dueDateStr) {
    if (!dueDateStr) return "";
    return new Date(dueDateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// ── Reusable small chip ──────────────────────────────────────────
function StatusChip({ label, style }) {
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                fontSize: "0.72rem",
                fontWeight: 500,
                height: 24,
                borderRadius: "6px",
                bgcolor: style.bgcolor,
                color: style.color,
                border: `1px solid ${style.borderColor}`,
                "& .MuiChip-label": { px: 1 },
            }}
        />
    );
}

// ── Main component ───────────────────────────────────────────────
export default function TaskCard({ task, onView, onEdit, onDelete }) {
    const overdue = isOverdue(task.dueDate, task.status);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: "14px",
                // Red-tinted border if overdue, normal border otherwise
                border: overdue ? "1.5px solid #FECACA" : "1px solid #E8E2D9",
                bgcolor: overdue ? "#FFFBFB" : "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                transition: "box-shadow 0.15s",
                "&:hover": {
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                },
            }}
        >
            {/* ── Top row: chips ── */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <StatusChip label={task.status} style={getStatusStyle(task.status)} />
                <StatusChip label={task.priority} style={getPriorityStyle(task.priority)} />
                {overdue && (
                    <StatusChip
                        label="Overdue"
                        style={{ bgcolor: "#FEE2E2", color: "#DC2626", borderColor: "#FCA5A5" }}
                    />
                )}
            </Box>

            {/* ── Title ── */}
            <Typography
                sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#1C2B28",
                    lineHeight: 1.3,
                }}
            >
                {task.title}
            </Typography>

            {/* ── Description (only shown if it exists) ── */}
            {task.description && (
                <Typography
                    sx={{
                        fontSize: "0.85rem",
                        color: "#6B7775",
                        lineHeight: 1.5,
                        // Limit to 2 lines with ellipsis
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {task.description}
                </Typography>
            )}

            {/* ── Bottom row: date + action buttons ── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 0.5,
                }}
            >
                {/* Due date */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarIcon
                        sx={{
                            fontSize: "0.9rem",
                            color: overdue ? "#DC2626" : "#6B7775",
                        }}
                    />
                    <Typography
                        sx={{
                            fontSize: "0.8rem",
                            color: overdue ? "#DC2626" : "#6B7775",
                            fontWeight: overdue ? 600 : 400,
                        }}
                    >
                        {formatDate(task.dueDate)}
                    </Typography>
                </Box>

                {/* Action buttons */}
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="View">
                        <IconButton
                            size="small"
                            onClick={() => onView(task)}
                            sx={{ color: "#9CA3A0", "&:hover": { color: "#1C3E38" } }}
                        >
                            <ViewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={() => onEdit(task)}
                            sx={{ color: "#9CA3A0", "&:hover": { color: "#1C3E38" } }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            onClick={() => onDelete(task.id)}
                            sx={{ color: "#9CA3A0", "&:hover": { color: "#DC2626" } }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Paper>
    );
}