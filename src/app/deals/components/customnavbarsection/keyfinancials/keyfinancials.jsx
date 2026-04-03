"use client";
import React, { useState } from "react";
import Barchart from "../charts/barchart/barchart";
import PurpleBarchart from "../charts/barchartpurple/barchartpurple";
import { Collapse, Tabs, Tab, Fade } from "react-bootstrap";
import "./keyfinancials.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import DebtBarChart from "../charts/DebtBarchart";
import { useDealStore } from "@/store/dealStore";
// import { useSearchParams } from "next/navigation";

const Keyfinancials = ({ isPrivateDeal = false }) => {

  const dealDetails = useDealStore((state) => state.dealDetails);

  const transformFinancialData = (apiData) => {
    try {
      const perfArray = apiData?.financial_performance?.data;
      if (!Array.isArray(perfArray)) {
        console.warn("KeyFinancials: financial_performance.data is not an array");
        return [];
      }

      return perfArray
        .filter((yearObj) => yearObj?.status && yearObj?.data)
        .map((yearObj) => {
          const year = yearObj.value || "N/A";
          const yearData = yearObj.data || {};

          return {
            year: year.toString(),


            revenue: {
              status: yearData.revenue_in_cr?.status || false,
              value:
                typeof yearData.revenue_in_cr?.data === "number"
                  ? yearData.revenue_in_cr.data
                  : 0,
            },

            // growth
            growth: {
              status: yearData.topline_growth_percent?.status || false,
              value:
                typeof yearData.topline_growth_percent?.data === "number"
                  ? yearData.topline_growth_percent.data
                  : 0,
            },

            // earnings
            ebitda: {
              status: yearData.earnings?.ebitda_in_cr?.status || false,
              value: yearData.earnings?.ebitda_in_cr?.data || 0,
            },
            pat: {
              status: yearData.earnings?.pat_in_cr?.status || false,
              value: yearData.earnings?.pat_in_cr?.data || 0,
            },

            // valuation
            peratio: {
              status: yearData.valuation?.pe_ratio?.status || false,
              value: yearData.valuation?.pe_ratio?.data || 0,
            },

            // returns on capital
            roa: {
              status: yearData.returns_on_capital?.roa_percent?.status || false,
              value: yearData.returns_on_capital?.roa_percent?.data || 0,
            },
            roe: {
              status: yearData.returns_on_capital?.roe_percent?.status || false,
              value: yearData.returns_on_capital?.roe_percent?.data || 0,
            },
            roce: {
              status: yearData.returns_on_capital?.roce_percent?.status || false,
              value: yearData.returns_on_capital?.roce_percent?.data || 0,
            },

            // leverage and coverage
            debttoequity: {
              status:
                yearData.leverage_and_coverage?.debt_to_equity?.status || false,
              value:
                yearData.leverage_and_coverage?.debt_to_equity?.data || 0,
            },
            interestcoverage: {
              status:
                yearData.leverage_and_coverage?.interest_coverage_ratio?.status ||
                false,
              value:
                yearData.leverage_and_coverage?.interest_coverage_ratio?.data ||
                0,
            },

            // working capital
            debtordays: {
              status: yearData.working_capital?.debtor_days?.status || false,
              value: yearData.working_capital?.debtor_days?.data || 0,
            },
            creditordays: {
              status: yearData.working_capital?.creditor_days?.status || false,
              value: yearData.working_capital?.creditor_days?.data || 0,
            },
            inventorydays: {
              status: yearData.working_capital?.inventory_days?.status || false,
              value: yearData.working_capital?.inventory_days?.data || 0,
            },

            // asset efficiency
            longtermfundstofixed: {
              status:
                yearData.asset_efficiency?.lt_funds_to_fixed_assets?.status ||
                false,
              value:
                yearData.asset_efficiency?.lt_funds_to_fixed_assets?.data || 0,
            },

            // liquidity
            currentratio: {
              status: yearData.liquidity?.current_ratio?.status || false,
              value: yearData.liquidity?.current_ratio?.data || 0,
            },

            // cost structure
            cogs: {
              status:
                yearData.cost_structure?.cogs_percent_of_revenue?.status || false,
              value:
                yearData.cost_structure?.cogs_percent_of_revenue?.data || 0,
            },
          };
        });
    } catch (error) {
      console.error("KeyFinancials: Error transforming financial data", error);
      return [];
    }
  };



  const getFinancialData = () => {
    try {
      if (isPrivateDeal) {
        return dealDetails?.data?.financial_highlights?.financial_performance
          ? transformFinancialData(dealDetails.data.financial_highlights)
          : [];
      } else {
        return dealDetails?.data?.financial_highlights?.financial_performance
          ? transformFinancialData(dealDetails.data.financial_highlights)
          : [];
      }
    } catch (error) {
      console.error('KeyFinancials: Error getting financial data', error);
      return [];
    }
  };

  const financialData = getFinancialData();

  console.log("dealDetails?.data?.key_financials", dealDetails?.data?.financial_highlights);
  console.log("financialData", financialData);

  const data = financialData.length > 0 ? financialData : (isPrivateDeal ? [] : []);
  console.log("data", data);

  const showData = dealDetails?.data?.financial_highlights?.financial_performance?.data?.data?.revenue_in_cr?.status;
  console.log('Showing the data for Revenue', showData);

  const [activeTab, setActiveTab] = useState("ROE");

  const tabs = [
    { key: "ROE", label: "Return on Equity (ROE)" },
    { key: "DEBT", label: "Debt to Equity" },
  ];

  const formattedData = data.map((item) => ({
    ...item,
    debttoequity: {
      ...item.debttoequity,
      value:
        item?.debttoequity?.value != null && !Number.isNaN(Number(item.debttoequity.value))
          ? Number(item.debttoequity.value).toFixed(1)
          : item?.debttoequity?.value,
    },
    currentratio: {
      ...item.currentratio,
      value:
        item?.currentratio?.value != null && !Number.isNaN(Number(item.currentratio.value))
          ? Number(item.currentratio.value).toFixed(1)
          : item?.currentratio?.value,
    },
    cogs: {
      ...item.cogs,
      value:
        item?.cogs?.value != null && !Number.isNaN(Number(item.cogs.value))
          ? Number(item.cogs.value).toFixed(1)
          : item?.cogs?.value,
    },
  }));

  // Track open/close state for each main section
  const [openStates, setOpenStates] = useState({
    financialTrends: true,
    financialPerformance: true,
    financialRatios: true,
    documents: true,
  });

  // Track open/close state for nested yearly accordions
  const [nestedOpen, setNestedOpen] = useState(() => {
    const sorted = [...data].sort((a, b) => b.year - a.year);

    const initial = {};
    sorted.forEach((item, index) => {
      initial[item.year] = index === 0; // first year open, rest closed
    });
    return initial;
  });

  const toggleSection = (section) => {
    setOpenStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleYear = (year) => {
    setNestedOpen((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };
  return (
    // <div className="key-financials-container">
    <div
      className={`key-financials-container ${isPrivateDeal ? "private-deal" : ""
        }`}
    >
      {/* Financial Trends */}
      {dealDetails?.data?.financial_highlights?.financial_trends?.status && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("financialTrends")}
          >
            <h3>Financial Trends</h3>
            <span>
              {openStates.financialTrends ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>
          <Collapse in={openStates.financialTrends}>
            <div className="section-body">
              <h2 style={{ marginBottom: "20px" }}>
                Revenue growth with EBITDA and PAT margins
              </h2>
              <Barchart
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.financial_trends?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Financial Performance */}
      {dealDetails?.data?.financial_highlights?.financial_performance?.status && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("financialPerformance")}
          >
            <h3>Financial Performance</h3>
            <span>
              {openStates.financialPerformance ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>

          <Collapse in={openStates.financialPerformance}>
            <div className="section-body accordion-container financial-performance">
              {formattedData
                .sort((a, b) => Number(b.year) - Number(a.year))
                .map((item) => (
                  <div key={item.year} className="accordion-item">
                    {/* Year header */}
                    <div
                      className="accordion-header"
                      onClick={() => toggleYear(item.year)}
                    >
                      <span>{item.year}</span>
                      <div className="revenue-count">
                        {item.revenue?.status && (
                          <span className="s22">
                            Revenue (Cr){" "}
                            <span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="9"
                                viewBox="0 0 8 9"
                                fill="none"
                              >
                                <circle cx="4" cy="4.5" r="4" fill="#CBD5E1" />
                              </svg>
                            </span>{" "}
                            <strong>
                              {typeof item.revenue.value === "number"
                                ? item.revenue.value
                                : item.revenue.value}
                            </strong>
                          </span>
                        )}
                        <span className="arrow">
                          {nestedOpen[item.year] ? <ChevronUp /> : <ChevronDown />}
                        </span>
                      </div>
                    </div>

                    {/* Nested accordion body */}
                    <Collapse in={nestedOpen[item.year]}>
                      <div className="accordion-body">
                        {/* Top-line Growth */}
                        {item.growth?.status && (
                          <div className="metric-block">
                            <h4>Top-line Growth</h4>
                            <p>
                              <span>Growth (%)</span>
                              <span
                                className={
                                  (item.growth.value ?? 0) < 0 ? "negative" : "positive"
                                }
                              >
                                {item.growth.value === 0 || item.growth.value == null
                                  ? "-"
                                  : `${item.growth.value}%`}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Earnings */}
                        {(item.ebitda?.status || item.pat?.status) && (
                          <div className="metric-block">
                            <h4>Earnings</h4>

                            {item.ebitda?.status && (
                              <p>
                                <span>EBITDA (₹ Cr)</span>
                                <span
                                  className={
                                    (item.ebitda.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.ebitda.value === 0 || item.ebitda.value == null
                                    ? "-"
                                    : `${Number(item.ebitda.value)}`}
                                </span>
                              </p>
                            )}

                            {item.pat?.status && (
                              <p>
                                <span>PAT (₹ Cr)</span>
                                <span
                                  className={
                                    (item.pat.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.pat.value === 0 || item.pat.value == null
                                    ? "-"
                                    : `${Number(item.pat.value)}`}
                                </span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Valuation (P/E) */}
                        {item.peratio?.status && (
                          <div className="metric-block">
                            <h4>Valuation</h4>
                            <p>
                              <span>P/E Ratio</span>
                              <span
                                className={
                                  (item.peratio.value ?? 0) < 0 ? "negative" : "positive"
                                }
                              >
                                {item.peratio.value === 0 || item.peratio.value == null
                                  ? "-"
                                  : `${item.peratio.value}x`}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Returns on Capital */}
                        {(item.roa?.status || item.roe?.status || item.roce?.status) && (
                          <div className="metric-block">
                            <h4>Returns on Capital</h4>

                            {item.roa?.status && (
                              <p>
                                <span>ROA</span>
                                <span
                                  className={
                                    (item.roa.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.roa.value === 0 || item.roa.value == null
                                    ? "-"
                                    : `${item.roa.value}%`}
                                </span>
                              </p>
                            )}

                            {item.roe?.status && (
                              <p>
                                <span>ROE</span>
                                <span
                                  className={
                                    (item.roe.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.roe.value === 0 || item.roe.value == null
                                    ? "-"
                                    : `${item.roe.value}%`}
                                </span>
                              </p>
                            )}

                            {item.roce?.status && (
                              <p>
                                <span>ROCE</span>
                                <span
                                  className={
                                    (item.roce.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.roce.value === 0 || item.roce.value == null
                                    ? "-"
                                    : `${item.roce.value}%`}
                                </span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Leverage & Coverage */}
                        {(item.debttoequity?.status || item.interestcoverage?.status) && (
                          <div className="metric-block">
                            <h4>Leverage & Coverage</h4>

                            {item.debttoequity?.status && (
                              <p>
                                <span>Debt-to-Equity Ratio</span>
                                <span
                                  className={
                                    (item.debttoequity.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.debttoequity.value === 0 || item.debttoequity.value == null
                                    ? "-"
                                    : `${item.debttoequity.value}`}
                                </span>
                              </p>
                            )}

                            {item.interestcoverage?.status && (
                              <p>
                                <span>Interest Coverage Ratio</span>
                                <span
                                  className={
                                    (item.interestcoverage.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.interestcoverage.value === 0 || item.interestcoverage.value == null
                                    ? "-"
                                    : `${item.interestcoverage.value}`}
                                </span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Working Capital */}
                        {(item.debtordays?.status || item.creditordays?.status || item.inventorydays?.status) && (
                          <div className="metric-block">
                            <h4>Working Capital</h4>

                            {item.debtordays?.status && (
                              <p>
                                <span>Debtor Days</span>
                                <span
                                  className={
                                    (item.debtordays.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.debtordays.value === 0 || item.debtordays.value == null
                                    ? "-"
                                    : `${item.debtordays.value}`}
                                </span>
                              </p>
                            )}

                            {item.creditordays?.status && (
                              <p>
                                <span>Creditor Days</span>
                                <span
                                  className={
                                    (item.creditordays.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.creditordays.value === 0 || item.creditordays.value == null
                                    ? "-"
                                    : `${item.creditordays.value}`}
                                </span>
                              </p>
                            )}

                            {item.inventorydays?.status && (isPrivateDeal || item.inventorydays?.status) && (
                              <p>
                                <span>Inventory Days</span>
                                <span
                                  className={
                                    (item.inventorydays.value ?? 0) < 0 ? "negative" : "positive"
                                  }
                                >
                                  {item.inventorydays.value === 0 || item.inventorydays.value == null
                                    ? "-"
                                    : `${item.inventorydays.value}`}
                                </span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Asset Efficiency */}
                        {item.longtermfundstofixed?.status && (
                          <div className="metric-block">
                            <h4>Asset Efficiency</h4>
                            <p>
                              <span>Long-term Funds to Fixed Assets</span>
                              <span
                                className={
                                  (item.longtermfundstofixed.value ?? 0) < 0 ? "negative" : "positive"
                                }
                              >
                                {item.longtermfundstofixed.value === 0 || item.longtermfundstofixed.value == null
                                  ? "-"
                                  : `${item.longtermfundstofixed.value}x`}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Liquidity */}
                        {item.currentratio?.status && (
                          <div className="metric-block">
                            <h4>Liquidity</h4>
                            <p>
                              <span>Current Ratio</span>
                              <span
                                className={
                                  (item.currentratio.value ?? 0) < 0 ? "negative" : "positive"
                                }
                              >
                                {item.currentratio.value === 0 || item.currentratio.value == null
                                  ? "-"
                                  : `${Number(item.currentratio.value).toFixed(1)}`}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Cost Structure */}
                        {item.cogs?.status && (
                          <div className="metric-block">
                            <h4>Cost Structure</h4>
                            <p>
                              <span>COGS (% of Revenue)</span>
                              <span
                                className={
                                  (item.cogs.value ?? 0) < 0 ? "negative" : "positive"
                                }
                              >
                                {item.cogs.value === 0 || item.cogs.value == null
                                  ? "-"
                                  : `${item.cogs.value}%`}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </Collapse>
                  </div>
                ))}

            </div>
          </Collapse>
        </div>
      )}

      {/* Financial Ratios */}
      {dealDetails?.data?.financial_highlights?.financial_ratio?.status && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("financialRatios")}
          >
            <h3>Financial Ratios</h3>
            <span>
              {openStates.financialRatios ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>
          <Collapse in={openStates.financialRatios}>
            <div className="section-body">
              <div>
                {/* Tabs Header */}
                <div className="customTabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`customTab ${activeTab === tab.key ? "active" : ""
                        }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tabs Content */}
                <div className="tabContent">
                  {activeTab === "ROE" && (
                    <PurpleBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "DEBT" && (
                    <DebtBarChart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      )}


      {/* Documents */}
      {/* <div className="section">
        <div
          className="section-header"
          onClick={() => toggleSection("documents")}
        >
          <h3>Documents</h3>
          <span>{openStates.documents ? <ChevronUp /> : <ChevronDown />}</span>
        </div>
        <Collapse in={openStates.documents}>
          <div className="section-body">
           
          </div>
        </Collapse>
      </div> */}
    </div>
  );
};

export default Keyfinancials;
