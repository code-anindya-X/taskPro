// pages/DashboardPage.jsx
// The main dashboard page — owns all state and wires every component together.
// Think of this as the "brain" — it holds data and passes it down as props.

import { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { CircularProgress, Alert } from "@mui/material";

// Dashboard components
import GreetingSection from "../Components/Dashboard/GreetingSection";
import StatsRow from "../Components/Dashboard/StatsRow";
import TaskToolbar from "../Components/Dashboard/TaskToolbar";
import TaskGrid from "../Components/Dashboard/TaskGrid";
import { taskAPI } from "../apiClient";

// ── Color tokens ─────────────────────────────────────────────────
const TEAL = "#1C3E38";
const CREAM = "#F5F0E8";

const INITIAL_NEW_TASK = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  dueDate: "",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const PRIORITY_LABELS = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const STATUS_API_VALUES = {
  Pending: "PENDING",
  "In progress": "IN_PROGRESS",
  Completed: "COMPLETED",
};

const PRIORITY_API_VALUES = {
  High: "HIGH",
  Medium: "MEDIUM",
  Low: "LOW",
};

function normalizeEnumKey(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function normalizeStatus(status) {
  const normalizedKey = normalizeEnumKey(status);
  return STATUS_LABELS[normalizedKey] || status || "Pending";
}

function normalizePriority(priority) {
  const normalizedKey = normalizeEnumKey(priority);
  return PRIORITY_LABELS[normalizedKey] || priority || "Medium";
}

function normalizeTaskId(id) {
  if (id === null || id === undefined) {
    return crypto.randomUUID();
  }

  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }

  if (typeof id === "object" && "$oid" in id) {
    return String(id.$oid);
  }

  return JSON.stringify(id);
}

function normalizeTask(task) {
  return {
    ...task,
    id: normalizeTaskId(task?.id),
    title: task?.title || "",
    description: task?.description || "",
    status: normalizeStatus(task?.status),
    priority: normalizePriority(task?.priority),
    dueDate: task?.dueDate || "",
  };
}

function buildTaskPayload(task) {
  return {
    title: task.title.trim(),
    description: task.description.trim(),
    status: STATUS_API_VALUES[task.status] || "PENDING",
    priority: PRIORITY_API_VALUES[task.priority] || "MEDIUM",
    dueDate: task.dueDate ? `${task.dueDate}T00:00:00` : null,
  };
}

// ────────────────────────────────────────────────────────────────
// Navbar — kept here for simplicity.
// Once it grows (e.g. adds a dropdown menu), move it to
// components/layout/Navbar.jsx and import it.
// ────────────────────────────────────────────────────────────────
function Navbar({ username, onNewTask, onLogout }) {
  // First letter of username for the avatar
  const initial = username ? username[0].toUpperCase() : "?";

  return (
    <AppBar
      position="sticky"        // sticks to top while scrolling
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E8E2D9",
        color: "#1C2B28",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 4 } }}>

        {/* ── Left: logo + page title ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Logo circle */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: TEAL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
              t
            </Typography>
          </Box>

          {/* Brand name */}
          <Typography
            sx={{
              fontFamily: "'Georgia', serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#1C2B28",
            }}
          >
            TaskPro
          </Typography>

          {/* Divider between brand and page title */}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "#D6CFC4" }} />

          {/* Page title — hidden on very small screens */}
          <Typography
            sx={{
              fontSize: "0.9rem",
              color: "#6B7775",
              display: { xs: "none", sm: "block" },
            }}
          >
            My Tasks
          </Typography>
        </Box>

        {/* ── Right: New task button + avatar ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNewTask}
            sx={{
              bgcolor: TEAL,
              color: "#fff",
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              px: 2.5,
              py: 0.8,
              boxShadow: "none",
              "&:hover": { bgcolor: "#15302B", boxShadow: "none" },
            }}
          >
            {/* Hide label on mobile, keep icon */}
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              New task
            </Box>
          </Button>
          <Button
            variant="text"
            onClick={onLogout}
            sx={{
              color: "#1C3E38",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              minWidth: "fit-content",
            }}
          >
            Logout
          </Button>

          {/* User avatar */}
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#D4826A",   // coral accent
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {initial}
          </Avatar>
        </Box>

      </Toolbar>
    </AppBar>
  );
}

// ────────────────────────────────────────────────────────────────
// DashboardPage — main export
// ────────────────────────────────────────────────────────────────
export default function DashboardPage({ username, onLogout }) {

  // ── Task state ───────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Filter / search state ────────────────────────────────────
  const [search, setSearch] = useState("");           // text search
  const [filter, setFilter] = useState("All");        // status chip
  const [priority, setPriority] = useState("All priorities"); // dropdown
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState(INITIAL_NEW_TASK);
  const [creatingTask, setCreatingTask] = useState(false);

  // ── Fetch tasks from API ──────────────────────────────────────
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await taskAPI.getAllTasks();
        setTasks(Array.isArray(data) ? data.map(normalizeTask) : []);
      } catch (err) {
        setError("Failed to load tasks. Please try again.");
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // ── Derive filtered tasks (no extra state needed) ────────────
  // This runs every render — fast enough for typical task lists.
  const filteredTasks = tasks.filter((task) => {

    // 1. Text search — matches title or description
    const searchLower = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      task.title.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower));

    // 2. Status filter chip
    const matchesFilter =
      filter === "All" || task.status === filter;

    // 3. Priority dropdown
    const matchesPriority =
      priority === "All priorities" || task.priority === priority;

    return matchesSearch && matchesFilter && matchesPriority;
  });

  // ── Handlers ─────────────────────────────────────────────────

  // Called when user clicks "+ New task"
  // TODO: open a modal/dialog to create a task, then push to tasks[]
  const handleNewTask = () => {
    setNewTaskOpen(true);
  };

  // Called when user clicks the View icon on a card
  // TODO: open a read-only task detail dialog
  const handleView = (task) => {
    console.log("View task:", task);
  };

  // Called when user clicks the Edit icon on a card
  // TODO: open an edit dialog pre-filled with task data
  const handleEdit = (task) => {
    console.log("Edit task:", task);
  };

  // Called when user clicks the Delete icon on a card
  // Removes the task from local state immediately.
  // TODO: also call DELETE /api/tasks/:id before updating state
  const handleDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleTaskFieldChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || creatingTask) return;

    try {
      setCreatingTask(true);
      setError("");

      const createdTask = await taskAPI.createTask(buildTaskPayload(newTask));
      setTasks((prev) => [normalizeTask(createdTask), ...prev]);
      setNewTask(INITIAL_NEW_TASK);
      setNewTaskOpen(false);
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error("Error creating task:", err);
    } finally {
      setCreatingTask(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: CREAM }}>

      {/* Top navigation bar */}
      <Navbar username={username} onNewTask={handleNewTask} onLogout={onLogout} />

      {/* Page content */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",                        // center horizontally
          px: { xs: 2, sm: 4, md: 6 },      // responsive side padding
          py: { xs: 4, md: 5 },
        }}
      >
        {/* "Hello, anindya." */}
        <GreetingSection username={username} />

        {/* Total / Pending / In Progress / Completed cards */}
        <StatsRow tasks={tasks} />

        {/* Search + filter chips + priority dropdown */}
        <TaskToolbar
          search={search} onSearch={setSearch}
          filter={filter} onFilter={setFilter}
          priority={priority} onPriority={setPriority}
        />

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: TEAL }} />
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Task cards grid — receives FILTERED tasks */}
        {!loading && !error && (
          <TaskGrid
            tasks={filteredTasks}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Box>
      <Dialog open={newTaskOpen} onClose={() => setNewTaskOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create new task</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            required
            label="Task title"
            value={newTask.title}
            onChange={(e) => handleTaskFieldChange("title", e.target.value)}
          />
          <TextField
            label="Description"
            multiline
            minRows={3}
            value={newTask.description}
            onChange={(e) => handleTaskFieldChange("description", e.target.value)}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              label="Status"
              value={newTask.status}
              onChange={(e) => handleTaskFieldChange("status", e.target.value)}
              fullWidth
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In progress">In progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              value={newTask.priority}
              onChange={(e) => handleTaskFieldChange("priority", e.target.value)}
              fullWidth
            >
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>
          </Box>
          <TextField
            label="Due date"
            type="date"
            value={newTask.dueDate}
            onChange={(e) => handleTaskFieldChange("dueDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewTaskOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={!newTask.title.trim() || creatingTask}
            sx={{ bgcolor: TEAL, "&:hover": { bgcolor: "#15302B" } }}
          >
            {creatingTask ? "Adding..." : "Add task"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
