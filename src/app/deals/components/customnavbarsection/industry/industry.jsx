"use client";
import React, { useState } from "react";
import styles from "./industry.module.css";
import { useDealStore } from "@/store/dealStore";
import { ChevronDown, ChevronUp } from "lucide-react";

// 🔹 UNIVERSAL SAFE DATA EXTRACTOR
const getValue = (value) => {
  // ✅ Case 1 — object with {status,data}
  if (
    value &&
    typeof value === "object" &&
    "data" in value
  ) {
    const data = value.data;

    // null, undefined, empty array → return "-"
    if (data === null || data === undefined) return "-";

    // array or stringified JSON array
    if (Array.isArray(data)) return data;

    // primitive
    if (typeof data === "string" || typeof data === "number") return data;

    return "-";
  }

  // ✅ Case 2 — stringified JSON array
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // ✅ Case 3 — direct primitive
  if (value === null || value === undefined) return "-";

  return value;
};


// 🔹 NORMALIZE PEER COMPARISON INTO ALWAYS AN ARRAY
// Always return a valid peer comparison array
const getPeerArray = (peer) => {
  const extracted = getValue(peer);

  // Case 1 — Already array
  if (Array.isArray(extracted)) return extracted;

  // Case 2 — { status, data: [...] }
  if (
    extracted &&
    typeof extracted === "object" &&
    "status" in extracted &&
    extracted.status === true &&
    Array.isArray(extracted.data)
  ) {
    return extracted.data;
  }

  // Fallback → avoid crash
  return [];
};


const Industry = ({ isPrivateDeal }) => {
  const [showGrowth, setShowGrowth] = useState(true);
  const [showPolicy, setShowPolicy] = useState(true);
  const [showPeer, setShowPeer] = useState(true);

  const dealDetails = useDealStore((state) => state.dealDetails);
  const overview = dealDetails?.data?.industry_overview ?? {};
  const isOfs = dealDetails?.data?.deal_type === "ofs";

  // ----- INDUSTRY DRIVERS -----
  const industryDriver = getValue(overview?.industry_drivers?.data) || [];

  // ----- GOVERNMENT POLICY -----
  const governmentPolicy = getValue(overview?.government_policy_support?.data);

  // ----- PEER COMPARISON -----
  const peerRaw = overview?.peer_comparison?.data; // may be array or object
  const peerData = getPeerArray(peerRaw); // ALWAYS returns array

  // Format numbers safely
  const asFixed = (value, digits = 1) => {
    const num = Number(getValue(value));
    return Number.isFinite(num) ? num.toFixed(digits) : "-";
  };

  // Prepare Company Data (Safe Peer Comparison)
  const companies = (peerData || []).map((item) => {
    let rawLogo = item?.company_logo?.data || item?.company_logo;

    // Try JSON.parse if it's a stringified array
    let logoArray = [];
    try {
      if (typeof rawLogo === "string" && rawLogo.trim().startsWith("[")) {
        logoArray = JSON.parse(rawLogo);
      } else if (Array.isArray(rawLogo)) {
        logoArray = rawLogo;
      }
    } catch (e) {
      console.warn("Invalid logo JSON:", rawLogo);
    }

    let logo = "/assets/pictures/default.png";

    if (Array.isArray(logoArray) && logoArray.length > 0) {
      const file = logoArray[0];
      const cleanPath = file?.path?.replace("public", "") || "";

      if (cleanPath) {
        logo = `${process.env.NEXT_PUBLIC_USER_BASE}/admin${cleanPath}`;
      }
    }


    return {
      name: getValue(item.company_name),
      logo,
      revenue: asFixed(item.revenue_in_cr),
      profit: asFixed(item.net_profit_in_cr),
      ebitda: asFixed(item.ebitda_margin_percent),
      roce: asFixed(item.roce_percent),
      roe: asFixed(item.roe_percent),
      pe: asFixed(item.pe_ratio),
    };
  });

  const metrics = [
    { label: "Revenue (₹ Cr)", key: "revenue" },
    { label: "Net Profit (₹ Cr)", key: "profit" },
    { label: "EBITDA Margin (%)", key: "ebitda" },
    { label: "ROE (%)", key: "roe" },
    { label: "ROCE (%)", key: "roce" },
    { label: "P/E Ratio", key: "pe" },
  ];

  return (
    <div className={isPrivateDeal ? styles.privateIndustryContainer : styles.industryContainer}>
      {/* INDUSTRY DRIVERS */}
      {!isOfs && overview?.industry_drivers?.status && (
        <>
          <section className={styles.growthSection}>
            <h2 className={styles.growthHeading} onClick={() => setShowGrowth(!showGrowth)}>
              {overview?.industry_drivers?.label_name}
              <div>{showGrowth ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
            </h2>

            {showGrowth && (
              <div>
                {industryDriver?.length > 0 ? (
                  industryDriver.map((item, idx) => (
                    <div key={idx} className={styles.growthItem}>
                      <h3 className={styles.subTitle}>{getValue(item.label_name)}</h3>
                      <div
                        className={styles.p}
                        dangerouslySetInnerHTML={{ __html: getValue(item.description) }}
                      />
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No data available</p>
                )}
              </div>
            )}
          </section>
          <hr className={styles.seperator} />
        </>
      )}


      {!isOfs && overview?.government_policy_support?.status && (
        <>
          <section className={styles.growthSection}>
            <h2 className={styles.growthHeading} onClick={() => setShowPolicy(!showPolicy)}>
              {overview?.government_policy_support?.label_name}
              <div>{showPolicy ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
            </h2>

            {showPolicy && (
              <div>
                {governmentPolicy ? (
                  <div
                    className={styles.growthItem}
                    dangerouslySetInnerHTML={{ __html: governmentPolicy }}
                  />
                ) : (
                  <p className={styles.noData}>No data available</p>
                )}
              </div>
            )}
          </section>
          <hr className={styles.seperator} />
        </>
      )}

      {/* PEER COMPARISON */}
      {overview?.peer_comparison?.status && (
        <section className={styles.peerSection}>
          <h2 className={styles.PeerHeading} onClick={() => setShowPeer(!showPeer)}>
            <div>Peer Comparison</div>
            <div>{showPeer ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
          </h2>

          {showPeer && (
            <div className={styles.tableWrapper}>
              <table className={styles.PeerTable}>
                <thead>
                  <tr>
                    <th className={styles.firstHeading}>Metric</th>
                    {companies.map((company, i) => (
                      <th key={i}>
                        <div className={styles.tableHeading}>
                          <span>{company.name}</span>
                          <img src={company.logo} alt={company.name} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {metrics.map((metric, idx) => (
                    <tr key={idx}>
                      <td>{metric.label}</td>
                      {companies.map((c, i) => (
                        <td key={i}>{c[metric.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Industry;
