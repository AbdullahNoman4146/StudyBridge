import { useState } from "react";
import { register } from "../api/auth";

export default function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: any) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await register(name, email, password);

            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "/dashboard";
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (err: any) {
            setError("Registration failed: " + (err.message || "Server error"));
            console.error("Registration error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: "300px", margin: "100px auto" }}>
            <h2>Register</h2>

            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

            <form onSubmit={handleRegister}>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <br /><br />

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

                <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>

            </form>

            <br />
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    );
}