import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://saikrishna471032-dream2plan-backend.hf.space";

export default function RecommendationsPage({
  inputData,
  onGenerate,
  onBack,
}) {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // eslint-disable-next-line
  const [generatingDomain, setGeneratingDomain] = useState(null);


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
              inputData?.investment_amount || null,

            risk_level:
              inputData?.risk_level || "Medium",

            location:
              inputData?.location || "India",

            user_message:
              inputData?.user_message || null,

            business_domain:
              inputData?.business_domain || null,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setData(result);
      } else {
        setError("Failed to get recommendations");
      }

    } catch {
      setError("Could not connect to server");
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

    <div style={{
      maxWidth: 900,
      margin: "0 auto",
      padding: 40,
      color: "white"
    }}>

      <button onClick={onBack}>
        ← Back
      </button>


      <h2 style={{ marginTop: 20 }}>
        Recommended Business Domains
      </h2>


      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}


      {!loading && data && (

        <div>

          {data.recommendations?.top_3?.map((item, i) => (

            <div
              key={i}
              style={{
                border: "1px solid #333",
                borderRadius: 10,
                padding: 20,
                marginTop: 20,
                background: "#111",
              }}
            >

              <h3>{item.domain}</h3>

              <p>{item.why}</p>

              <button
                onClick={() =>
                  handleGenerate(item.domain)
                }
                style={{
                  marginTop: 10,
                  padding: "8px 14px",
                  cursor: "pointer"
                }}
              >
                Generate Blueprint
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );
}