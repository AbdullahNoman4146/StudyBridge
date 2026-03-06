import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../api/auth";

export default function Dashboard() {

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        getCurrentUser().then(setUser);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // always clear the token and redirect, even if the API call fails
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Dashboard</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Logout
                </button>
            </div>
            <p>Welcome {user.name}!</p>
            <p>Email: {user.email}</p>
        </div>
    );
}

