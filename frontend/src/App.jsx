import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [students, setStudents] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  const showMsg = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2500);
  };

  // AUTH
  const handleAuth = async () => {
    const url = page === "login" ? "/login" : "/register";

    const r = await fetch(API + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await r.json();

    if (data.error) return showMsg(data.error);

    if (page === "login") {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      showMsg("Registered! Please login.");
      setPage("login");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setStudents([]);
  };

  // STUDENTS
  const fetchStudents = async () => {
    const r = await fetch(`${API}/students`, {
      headers: { Authorization: token },
    });
    const data = await r.json();
    setStudents(data);
  };

  const addStudent = async () => {
    const name = prompt("Enter student name");
    if (!name) return;

    const r = await fetch(`${API}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ name }),
    });

    const s = await r.json();
    setStudents([...students, s]);
  };

  const deleteStudent = async (id) => {
    await fetch(`${API}/students/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });

    setStudents(students.filter((s) => s._id !== id));
  };

  // ---------------- LOGIN UI ----------------
  if (!token) {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2 style={styles.title}>
            {page === "login" ? "Welcome Back" : "Create Account"}
          </h2>

          {msg && <div style={styles.msg}>{msg}</div>}

          {page === "register" && (
            <input
              placeholder="Full Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              style={styles.input}
            />
          )}

          <input
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            style={styles.input}
          />

          {page === "register" && (
            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) =>
                setForm({ ...form, confirm: e.target.value })
              }
              style={styles.input}
            />
          )}

          <button onClick={handleAuth} style={styles.btn}>
            {page === "login" ? "Login" : "Register"}
          </button>

          <p style={styles.toggle}>
            {page === "login" ? "No account?" : "Already have account?"}
            <span
              style={styles.link}
              onClick={() =>
                setPage(page === "login" ? "register" : "login")
              }
            >
              {page === "login" ? " Register" : " Login"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ---------------- DASHBOARD ----------------
  return (
    <div style={styles.appBg}>
      <div style={styles.nav}>
        <h2>🎓 Student Manager</h2>
        <div>
          <span style={{ marginRight: 10 }}>{token}</span>
          <button onClick={logout} style={styles.logout}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.topBar}>
          <h3>Total Students: {students.length}</h3>
          <button onClick={addStudent} style={styles.addBtn}>
            + Add Student
          </button>
        </div>

        {students.length === 0 ? (
          <div style={styles.empty}>No students yet</div>
        ) : (
          <div style={styles.list}>
            {students.map((s) => (
              <div key={s._id} style={styles.row}>
                <span>{s.name}</span>
                <button onClick={() => deleteStudent(s._id)} style={styles.del}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const styles = {
  bg: {
    height: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#1e293b",
    padding: 30,
    borderRadius: 12,
    width: 320,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  title: { color: "#fff", marginBottom: 20, textAlign: "center" },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
  },
  btn: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  msg: {
    background: "#ef4444",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  toggle: { color: "#94a3b8", marginTop: 10, textAlign: "center" },
  link: { color: "#60a5fa", cursor: "pointer", marginLeft: 5 },

  appBg: { background: "#0f172a", minHeight: "100vh", color: "#fff" },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    background: "#1e293b",
  },
  logout: {
    padding: "6px 12px",
    background: "#ef4444",
    border: "none",
    color: "#fff",
    borderRadius: 6,
  },
  container: { padding: 20 },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  addBtn: {
    background: "#22c55e",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    color: "#fff",
  },
  list: { background: "#1e293b", borderRadius: 10, padding: 10 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderBottom: "1px solid #334155",
  },
  del: {
    background: "#ef4444",
    border: "none",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 5,
  },
  empty: { textAlign: "center", color: "#94a3b8" },
};

export default App;