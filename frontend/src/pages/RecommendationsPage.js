import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://saikrishna471032-dream2plan-backend.hf.space";

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

      const response = await fetch(
        `${API_URL}/api/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investment_amount:
              inputData?.investment_amount,
            risk_level:
              inputData?.risk_level,
            location:
              inputData?.location,
            user_message:
              inputData?.user_message,
            business_domain:
              inputData?.business_domain,
          }),
        }
      );

      const result = await response.json();

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
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 40,
        color: "white",
      }}
    >
      <button onClick={onBack}>← Back</button>

      <h1>Recommended Business Domains</h1>

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
                  "0 0 20px rgba(0,0,0,0.5)",
              }}
            >
              <h2>
                {getDomainIcon(
                  item.domain
                )}{" "}
                {item.domain}
              </h2>

              <p>{item.why}</p>

              <button
                onClick={() =>
                  handleGenerate(
                    item.domain
                  )
                }
              >
                Generate Blueprint
              </button>
            </div>
          )
        )}
    </div>
  );
}