import { useState } from "react";
import { login } from "../api/auth";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await login(email, password);

            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "/dashboard";
            } else {
                setError(data.message || "Invalid login credentials");
            }
        } catch (err: any) {
            setError("Login failed: " + (err.message || "Server error"));
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: "300px", margin: "100px auto" }}>
            <h2>Login</h2>

            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <br /><br />

                <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>

            <br />
            <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
    );
}