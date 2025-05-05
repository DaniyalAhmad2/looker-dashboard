import { useEffect, useState,useRef } from "react";
import { ExternalLink as LinkIcon } from "lucide-react";
import "./App.css";




import {
  Box,
  CssBaseline,
  Typography,
  Alert,
  CircularProgress,
  Button,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  IconButton,
  Paper,
} from "@mui/material";

import { Menu as MenuIcon } from "@mui/icons-material";

import Sidebar from "./components/Sidebar";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2196f3", 
    },
  },
});


// API endpoint
const API_URL = process.env.API_URL;

// Upload logo endpoint
const UPLOAD_URL =process.env.UPLOAD_URL;

const createLookerStudioEmbedUrl = (url) => {
  try {
    if (!url) return "";

    if (url.includes("/embed/")) {
      return url;
    }

    return url.replace("/reporting/", "/embed/reporting/");
  } catch (error) {
    console.error("Error creating embed URL:", error);
    return url;
  }
};



// Looker Studio Embed Component
function LookerStudioEmbed({ lookerLink, title = "Client dashboard" }) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Embed URL
  const embedUrl = createLookerStudioEmbedUrl(lookerLink);

  // Handle iframe load events
  const handleIframeLoad = () => {
    console.log("Iframe loaded successfully");
    setIsLoading(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIsLoading(false);
    setErrorMessage("Failed to load the dashboard");
  };

  useEffect(() => {
    const handleSecurityPolicyViolation = (e) => {
      console.error("Content Security Policy Violation:", e);
      if (e.blockedURI?.includes("lookerstudio.google.com")) {
        setErrorMessage(
          "Content Security Policy blocked embedding Looker Studio"
        );
      }
    };

    document.addEventListener(
      "securitypolicyviolation",
      handleSecurityPolicyViolation
    );

    return () => {
      document.removeEventListener(
        "securitypolicyviolation",
        handleSecurityPolicyViolation
      );
    };
  }, []);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Loading Indicator */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 20,
            p: 3,
            textAlign: "center",
          }}
        >
          <Paper sx={{ p: 3, maxWidth: 500, bgcolor: "background.paper" }}>
            <Typography variant="h6" gutterBottom>
              Unable to Embed Dashboard
            </Typography>
            <Typography variant="body2" paragraph sx={{ mb: 2 }}>
              {errorMessage ||
                "Due to security restrictions, this Looker Studio dashboard cannot be embedded directly in the application."}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href={lookerLink}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<LinkIcon size={16} />}
            >
              Open in Looker Studio
            </Button>



          </Paper>
        </Box>
      )}

      <iframe
        src={embedUrl}
        title={title}
        width="100%"
        height="100%"
        style={{
          border: "none",
          width: "100%",
          height: "100%",
          display: "block",
          backgroundColor: "#fff", 
        }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        frameBorder="0"
        allowFullScreen
      />
    </Box>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
    // when a file is selected
    // const handleFileChange = async (e) => {
    //   const file = e.target.files?.[0];
    //   if (!file || !activeCompany) return;
  
    //   const formData = new FormData();
    //   // use company_id as user_id
    //   formData.append("user_id", activeCompany.company_id);
    //   formData.append("image", file, file.name);
  
    //   try {
    //     const res = await fetch(UPLOAD_URL, {
    //       method: "POST",
    //       body: formData,
    //     });
    //     if (!res.ok) throw new Error(`Status ${res.status}`);
    //     const body = await res.json();
    //     console.log("Logo upload success", body);
    //     // optionally refresh companies or update activeCompany.logo here
    //   } catch (err) {
    //     console.error("Logo upload failed", err);
    //   } finally {
    //     e.target.value = null;
    //   }
    // };
    // 1) when a file is picked, just save it
    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setSelectedFile(file);
      setUploadSuccess(false);
      setUploadError(null);
      e.target.value = null; // allow re-picking same file
    };
    
    // 2) on “Upload” click, do the POST
    const handleUpload = async () => {
      if (!selectedFile || !activeCompany) return;
      setUploading(true);
      setUploadSuccess(false);
      setUploadError(null);
    
      const formData = new FormData();
      formData.append("user_id", activeCompany.company_id);
      formData.append("image", selectedFile, selectedFile.name);
    
      try {
        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        await res.json();
        setUploadSuccess(true);
        setSelectedFile(null);
      } catch (err) {
        setUploadError(err.message);
      } finally {
        setUploading(false);
      }
    };
  const isMobile = useMediaQuery(darkTheme.breakpoints.down("sm"));

  /* ───────── Fetch API data on mount ───────── */
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);

        // Use GET request with appropriate headers
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse response properly
        const data = await response.json();

        // Handle the API response structure correctly
        const companiesData = Array.isArray(data)
          ? data
          : data.body
          ? typeof data.body === "string"
            ? JSON.parse(data.body)
            : data.body
          : [];

        setCompanies(companiesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError(`Failed to load companies: ${err.message}`);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const companyItems = companies.map((company) => ({
    id: company.company_id,
    name: company.company_name,
    data: company, 
  }));

  // Handle company selection
  const handleCompanyClick = (item) => {
    setActiveCompany(item.data);
    if (isMobile) {
      setSidebarOpen(false); 
    }
  };

  const handleOpenInNewTab = () => {
    if (activeCompany && activeCompany.looker_link) {
      window.open(activeCompany.looker_link, "_blank");
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          position: "relative",
        }}
      >
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={companyItems}
          title="Companies"
          onItemClick={handleCompanyClick}
          width={280}
          variant="temporary" 
        />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1,
              borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
              backgroundColor: "background.paper",
              zIndex: 10,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                aria-label="toggle sidebar"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{
                  mr: 2,
                }}
              >
                <MenuIcon />
              </IconButton>
              {activeCompany && (
                <Typography variant="h6" noWrap>
                  {activeCompany.company_name}
                </Typography>
              )}
            </Box>

            {activeCompany && (
              <>
              {/* 1) select */}
              <Button
                variant="outlined"
                size="small"
                sx={{ ml: 1 }}
                onClick={() => fileInputRef.current?.click()}
              >
                Select Logo
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {/* 2) show chosen file & confirm */}
              {selectedFile && (
                <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                  <Typography variant="body2">
                    {selectedFile.name}
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleUpload}
                    disabled={uploading}
                    sx={{ ml: 1 }}
                  >
                    {uploading ? "Uploading…" : "Upload"}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setSelectedFile(null)}
                    sx={{ ml: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
              {/* 3) feedback */}
              {uploadSuccess && (
                <Alert severity="success" sx={{ ml: 2 }}>
                  Logo uploaded!
                </Alert>
              )}
              {uploadError && (
                <Alert severity="error" sx={{ ml: 2 }}>
                  {uploadError}
                </Alert>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenInNewTab}
                startIcon={<LinkIcon size={16} />}
                size="small"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: "medium",
                  fontSize: "0.75rem",
                  backgroundColor: "#2196f3", 
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1976d2",
                  },
                }}
              >
                Open in Looker Studio
              </Button>

                </>
            )}
          </Box>

          {/* Content Area */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {activeCompany ? (
              <Box sx={{ height: "100%", width: "100%",  }}>
                <LookerStudioEmbed
                  lookerLink={activeCompany.looker_link}
                  title={`${activeCompany.company_name} Dashboard`}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "200px",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : companies.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No companies found.
                  </Alert>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Select a company from the sidebar
                    </Typography>
                    <Typography variant="body2">
                      {isMobile
                        ? "Click the menu button to choose a company"
                        : "Use the sidebar to choose a company"}
                    </Typography>
                    {isMobile && (
                      <Button
                        variant="outlined"
                        onClick={() => setSidebarOpen(true)}
                        sx={{ mt: 2 }}
                      >
                        Open Companies List
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </div>
    </ThemeProvider>
  );
}
