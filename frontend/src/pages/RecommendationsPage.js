import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://saikrishna471032-dream2plan-backend.hf.space";


const RISK_COLORS = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

const FIT_COLORS = {
  Perfect: "#14b8a6",
  Good: "#6366f1",
  Viable: "#f59e0b",
};

const DOMAIN_ICONS = {
  EdTech: "🎓",
  FinTech: "💳",
  HealthTech: "🏥",
  AgriTech: "🌾",
  ECommerce: "🛒",
  SaaS: "☁️",
  FoodTech: "🍔",
  CleanTech: "⚡",
  LogisticsTech: "🚚",
  Gaming: "🎮",
  MediaTech: "📱",
  Default: "💡",
};

function getDomainIcon(domain) {
  if (!domain) return "💡";

  for (const key in DOMAIN_ICONS) {
    if (domain.toLowerCase().includes(key.toLowerCase())) {
      return DOMAIN_ICONS[key];
    }
  }

  return "💡";
}


export default function RecommendationsPage({
  inputData,
  onGenerate,
  onBack,
}) {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [generatingDomain, setGeneratingDomain] =
    useState(null);


  useEffect(() => {
    fetchRecommendations();
// eslint-disable-next-line
  }, []);


  const fetchRecommendations = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inputData),
        }
      );

      const result = await res.json();

      if (result.status === "success") {
        setData(result);
      } else {
        setError("Failed");
      }

    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };


  const handleGenerate = (domain) => {

    setGeneratingDomain(domain);

    onGenerate({
      ...inputData,
      business_domain: domain,
    });
  };


  return (

    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 40 }}>

      <button onClick={onBack}>
        ← Back
      </button>

      <h1 style={{ marginBottom: 20 }}>
        Recommended Business Domains
      </h1>


      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}


      {!loading &&
        data?.recommendations?.top_3?.map(
          (item, i) => (

            <div
              key={i}
              style={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: 16,
                padding: 24,
                marginTop: 20,
                boxShadow:
                  "0 0 20px rgba(0,0,0,0.6)",
                transition: "0.25s",
              }}
            >

              <h2>
                {getDomainIcon(item.domain)}{" "}
                {item.domain}
              </h2>


              <p>{item.why}</p>


              <div
                style={{
                  marginTop: 10,
                  color:
                    RISK_COLORS[
                      item.risk
                    ] || "#aaa",
                  fontWeight: "bold",
                }}
              >
                {item.risk} Risk
              </div>


              {item.investment_fit && (
                <div
                  style={{
                    color:
                      FIT_COLORS[
                        item.investment_fit
                      ],
                  }}
                >
                  {item.investment_fit} Fit
                </div>
              )}


              <button
                onClick={() =>
                  handleGenerate(
                    item.domain
                  )
                }
                style={{
                  marginTop: 12,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#14b8a6",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {generatingDomain ===
                item.domain
                  ? "Generating..."
                  : "Generate Blueprint"}
              </button>

            </div>

          )
        )}

    </div>

  );

}