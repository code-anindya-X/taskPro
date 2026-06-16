
import { useState } from "react";
import {
    Box,
    Button,
    Alert,
    IconButton,
    InputAdornment,
    Link,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { authAPI } from "../apiClient";

// ─── Color Tokens ────────────────────────────────────────────────
const TEAL_DARK = "#1C3E38";      // left panel background
const TEAL_BTN = "#1C3E38";      // primary button
const CORAL = "#D4826A";      // accent / highlight text
const CREAM = "#F5F0E8";      // right panel background
const TEXT_MAIN = "#1C2B28";      // headings
const TEXT_MUTED = "#6B7775";      // subtext / labels
const BORDER = "#D6CFC4";      // input borders

// ─── Left Branding Panel ─────────────────────────────────────────
function BrandPanel() {
    return (
        <Box
            sx={{
                width: { xs: "100%", md: "48%" },
                minHeight: { xs: "220px", md: "100vh" },
                bgcolor: TEAL_DARK,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                px: { xs: 4, md: 6 },
                py: { xs: 4, md: 5 },
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "1.5px solid rgba(255,255,255,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                        t
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1.05rem",
                        letterSpacing: "0.02em",
                        fontFamily: "'Georgia', serif",
                    }}
                >
                    TaskPro
                </Typography>
            </Box>

            {/* Hero Text (hidden on xs) */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Typography
                    variant="h2"
                    sx={{
                        color: "#fff",
                        fontFamily: "'Georgia', serif",
                        fontWeight: 700,
                        fontSize: { md: "2.8rem", lg: "3.4rem" },
                        lineHeight: 1.15,
                        mb: 2.5,
                    }}
                >
                    A calmer way
                    <br />
                    to{" "}
                    <Box
                        component="span"
                        sx={{ color: CORAL, fontStyle: "italic" }}
                    >
                        get things
                        <br />
                        done.
                    </Box>
                </Typography>
                <Typography
                    sx={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "0.95rem",
                        lineHeight: 1.7,
                        maxWidth: 380,
                    }}
                >
                    TaskPro is your personal task companion. Capture, organise, and
                    finish what matters — without the team-tool noise.
                </Typography>
            </Box>

            {/* Footer tagline */}
            <Typography
                sx={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "0.8rem",
                    display: { xs: "none", md: "block" },
                }}
            >
                Designed for focus. Built for one.
            </Typography>
        </Box>
    );
}

// ─── Login Form Panel ─────────────────────────────────────────────
export default function Login({
    onNavigateToSignup,
    onAuthSuccess,
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!username.trim() || !password) {
            setError("Please enter both username and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authAPI.login({
                userName: username.trim(),
                password: password,
            });

            // Store token and user info
            localStorage.setItem("token", response.token);
            localStorage.setItem("userName", response.userName);

            setLoading(false);
            onAuthSuccess({
                userName: response.userName,
                token: response.token,
            });
        } catch (err) {
            setLoading(false);
            setError(err.message || "Login failed. Please check your credentials.");
        }
    };

    // ── Shared input styles ──────────────────────────────────────────
    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: CREAM,
            "& fieldset": { borderColor: BORDER },
            "&:hover fieldset": { borderColor: TEAL_DARK },
            "&.Mui-focused fieldset": { borderColor: TEAL_DARK, borderWidth: "1.5px" },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: TEAL_DARK },
        "& .MuiFormHelperText-root": { mx: 0 },
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                minHeight: "100vh",
                bgcolor: CREAM,
            }}
        >
            {/* Left panel */}
            <BrandPanel />

            {/* Right form panel */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: { xs: 3, sm: 6, md: 8 },
                    py: { xs: 6, md: 10 },
                    bgcolor: CREAM,
                }}
            >
                <Box sx={{ width: "100%", maxWidth: 460 }}>

                    {/* Eyebrow label */}
                    <Typography
                        sx={{
                            fontSize: "0.72rem",
                            letterSpacing: "0.12em",
                            fontWeight: 600,
                            color: TEXT_MUTED,
                            textTransform: "uppercase",
                            mb: 1.5,
                        }}
                    >
                        Welcome Back
                    </Typography>

                    {/* Heading */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: "'Georgia', serif",
                            fontWeight: 700,
                            color: TEXT_MAIN,
                            fontSize: { xs: "2rem", sm: "2.4rem" },
                            lineHeight: 1.2,
                            mb: 1,
                        }}
                    >
                        Sign in to keep going.
                    </Typography>

                    {/* Subheading */}
                    <Typography
                        sx={{
                            color: TEXT_MUTED,
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                            mb: 2,
                        }}
                    >
                        Pick up exactly where you left off. Your tasks are waiting.
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2.5 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Username field */}
                    <TextField
                        fullWidth
                        label="Username"
                        placeholder="your_username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                        }}
                        sx={{ ...inputSx, mb: 2.5 }}
                    />

                    {/* Password field */}
                    <TextField
                        fullWidth
                        label="Password"
                        placeholder="••••••••"
                        variant="outlined"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        sx={{ color: TEXT_MUTED }}
                                    >
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ ...inputSx, mb: 3.5 }}
                    />

                    {/* Sign in button */}
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSignIn}
                        disabled={loading}
                        sx={{
                            bgcolor: TEAL_BTN,
                            color: "#fff",
                            borderRadius: "10px",
                            py: 1.7,
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            letterSpacing: "0.02em",
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                bgcolor: "#15302B",
                                boxShadow: "none",
                            },
                            "&:active": { transform: "scale(0.99)" },
                            mb: 3,
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} sx={{ color: "#fff" }} />
                        ) : (
                            "Sign in"
                        )}
                    </Button>

                    {/* Link to signup */}
                    <Typography
                        align="center"
                        sx={{ color: TEXT_MUTED, fontSize: "0.9rem" }}
                    >
                        Don't have an account?{" "}
                        <Link
                            component="button"
                            onClick={onNavigateToSignup}
                            underline="always"
                            sx={{
                                color: TEXT_MAIN,
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                textDecorationColor: TEXT_MAIN,
                                cursor: "pointer",
                            }}
                        >
                            Create one
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
