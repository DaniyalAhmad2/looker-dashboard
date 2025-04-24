import { useEffect, useState } from "react";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  ExternalLink as LinkIcon,
} from "lucide-react";
import "./App.css"; // optional – only if you want extra custom styles

const LAMBDA_URL = process.env.REACT_APP_LAMBDA_URL;
function MyIframe({ src, title = "Client dashboard" }) {
  return (
    <iframe
      src={src}
      title={title}
      className="responsive-iframe"
      sandbox="allow-scripts allow-same-origin"
      allowFullScreen
    />
  );
}
export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [error, setError] = useState(null);

  /* ───────── Fetch once on mount ───────── */
  useEffect(() => {
    fetch(LAMBDA_URL)
      .then((r) => r.json())
      .then((payload) => setClients(JSON.parse(payload.body)))
      .catch((e) => setError(`Fetch error: ${e.message}`));
  }, []);

  const ToggleIcon = drawerOpen ? CloseIcon : MenuIcon;

  return (
    <div className="app-shell" data-bs-theme="dark">
      {/* ───────── Sidebar ───────── */}
      <aside className={`sidebar ${drawerOpen ? "open" : ""}`}>
        <h6 className="sidebar-title">Clients</h6>
        <ul className="list-unstyled sidebar-list">
          {clients.map((c) => (
            <li
              key={c.company_id}
              className={
                activeClient?.company_id === c.company_id ? "active" : ""
              }
              onClick={() => {
                setActiveClient(c);
                setDrawerOpen(false); // auto-close on mobile
              }}
            >
              {c.company_name}
            </li>
          ))}
        </ul>
      </aside>

      {/* ───────── Main ───────── */}
      <main className={drawerOpen ? "shifted" : ""}>
        <button
          className="toggle-btn btn btn-light shadow-sm"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="Toggle clients list"
        >
          <ToggleIcon size={20} />
        </button>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {!error && clients.length === 0 && (
          <p className="text-muted mt-3">Loading clients…</p>
        )}

        {activeClient ? (
          <div className="card glow mt-3">
            {/* <div className="card-body">
              <h4 className="card-title">{activeClient.company_name}</h4>
              
            </div> */}
            <div className="iframe-container">
            <MyIframe src={activeClient.looker_link.replace("/reporting/", "/embed/reporting/")} />
            </div>
            <div className="card-body">
              <a
                href={activeClient.looker_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light d-inline-flex align-items-center gap-1"
              >
                <LinkIcon size={16}  /> Open in Looker Studio
              </a>
              
            </div>
            
            {/* console.log(activeClient.looker_link); */}
          </div>
        ) : (
          clients.length > 0 && (
            <p className="text-muted mt-3">
              Select a client to see their Looker report.
            </p>
          )
        )}
      </main>
    </div>
  );
}