import React, { useEffect, useState } from 'react';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://saikrishna471032-dream2plan-backend.hf.space';


export default function RecommendationsPage({
  inputData,
  onGenerate,
  onBack
}) {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [generatingDomain, setGeneratingDomain] = useState(null);


  useEffect(() => {
    fetchRecommendations();
  }, []);


  // ✅ FIXED HERE
  const fetchRecommendations = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
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
              inputData?.business_domain || null
          })
        }
      );


      const result = await response.json();


      if (result.status === "success") {

        setData(result);

      } else {

        setError("Failed to get recommendations");

      }

    } catch (err) {

      setError("Could not connect to server");

    } finally {

      setLoading(false);

    }

  };


  const handleGenerate = (domain) => {

    setGeneratingDomain(domain);

    onGenerate({
      ...inputData,
      business_domain: domain
    });

  };


  return (

    <div style={{ padding: 40 }}>

      <button onClick={onBack}>
        Back
      </button>


      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}


      {!loading && data && (

        <div>

          {data.recommendations?.top_3?.map((item, i) => (

            <div
              key={i}
              style={{
                border: "1px solid #ccc",
                marginTop: 10,
                padding: 10
              }}
            >

              <h3>{item.domain}</h3>

              <p>{item.why}</p>

              <button
                onClick={() =>
                  handleGenerate(item.domain)
                }
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