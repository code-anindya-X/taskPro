// components/dashboard/TaskToolbar.jsx
// Search bar + status filter chips + priority dropdown
// All values and handlers come from DashboardPage (parent)

import {
    Box,
    TextField,
    InputAdornment,
    Chip,
    Select,
    MenuItem,
    FormControl,
    Paper,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const TEAL = "#1C3E38";
const CREAM = "#F5F0E8";
const BORDER = "#D6CFC4";

// Status filter options
const STATUS_FILTERS = ["All", "Pending", "In progress", "Completed"];

// Priority dropdown options
const PRIORITY_OPTIONS = ["All priorities", "High", "Medium", "Low"];

export default function TaskToolbar({
    search,
    onSearch,
    filter,       // currently active status filter string
    onFilter,
    priority,
    onPriority,
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2.5,
                py: 1.5,
                borderRadius: "16px",
                border: "1px solid #E8E2D9",
                bgcolor: "#FFFFFF",
                mb: 4,
                // Stack on mobile, row on larger screens
                flexDirection: { xs: "column", sm: "row" },
                flexWrap: "wrap",
            }}
        >
            {/* ── Search field ── */}
            <TextField
                placeholder="Search tasks..."
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#9CA3A0", fontSize: "1.1rem" }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    width: { xs: "100%", sm: 240 },
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        bgcolor: CREAM,
                        "& fieldset": { borderColor: BORDER },
                        "&:hover fieldset": { borderColor: TEAL },
                        "&.Mui-focused fieldset": { borderColor: TEAL },
                    },
                }}
            />

            {/* ── Status filter chips ── */}
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    flex: 1,                  // take remaining space
                }}
            >
                {STATUS_FILTERS.map((option) => {
                    const isActive = filter === option;
                    return (
                        <Chip
                            key={option}
                            label={option}
                            onClick={() => onFilter(option)}
                            variant={isActive ? "filled" : "outlined"}
                            sx={{
                                borderRadius: "20px",
                                fontWeight: isActive ? 600 : 400,
                                fontSize: "0.82rem",
                                bgcolor: isActive ? TEAL : "transparent",
                                color: isActive ? "#fff" : "#1C2B28",
                                borderColor: "#D6CFC4",
                                "&:hover": {
                                    bgcolor: isActive ? "#15302B" : "#F0EDE8",
                                },
                                cursor: "pointer",
                            }}
                        />
                    );
                })}
            </Box>

            {/* ── Priority dropdown ── */}
            <FormControl size="small">
                <Select
                    value={priority}
                    onChange={(e) => onPriority(e.target.value)}
                    sx={{
                        borderRadius: "10px",
                        minWidth: 150,
                        bgcolor: CREAM,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: TEAL },
                    }}
                >
                    {PRIORITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                            {opt}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Paper>
    );
}