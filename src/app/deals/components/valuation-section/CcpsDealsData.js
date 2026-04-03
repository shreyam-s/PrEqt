"use client";
import React, { useEffect, useState } from "react";
import "./ai-ipo-overview/ai-ipo-overview.css";
import Image from "next/image";
import { useDealStore } from "@/store/dealStore";
import Link from "next/link";
import { Valuation, RevenueIcon, PatIcon, PeMultiple } from "../name-section/svgicon";

const CcpsDealsData = () => {
    const [isMobile, setIsMobile] = useState(false);
    const dealDetails = useDealStore((state) => state.dealDetails);
    const dealData = dealDetails?.data?.deal_setpData || {};

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 920);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /** ✅ Utility Formatters */
    const formatNumber = (value) => {
        if (value === null || value === undefined || isNaN(Number(value))) return value ?? "-";
        return Number(value).toLocaleString("en-IN");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "TBD";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    /** ✅ Static Label Mapping — fallback labels when label_name is not available */
    const fieldLabelMap = {
        listing_timeline: "Listing Timeline",
        pre_money_valuation: "Pre Money Valuation",
        revenue_fy25_in_cr: "Revenue (FY'25)",
        pat_fy25_in_cr: "PAT (FY'25)",
        pe_trailing_forward: "P/E Trailing Forward",
        round_size: "Round Size",
        face_value: "Face Value",
        offer_price: "Offer Price",
        lot_size: "Lot Size",
        sale_type: "Sale Type",
        cagr_growth_3y_percent: "CAGR Growth 3Y",
        roe_fy25_percent: "ROE (FY'25)",
        pat_margin_percent: "PAT Margin (FY'25)",
        roce_fy25_percent: "ROCE (FY'25)",
        price_to_book_ratio: "Price to Book Ratio",
        debt_to_equity_fy25: "Debt/Equity (FY'25)",
        merchant_banker_appointed: "Merchant banker appointed",
        expecting_listing_date: "Expecting Listing Date",
        conversion_event: "Conversion Event",
        conversion_ratio: "Conversion Ratio",
        company_website: "Company Website",
    };

    /** ✅ Prefix/Suffix Mapping — extend as needed */
    const fieldFormatMap = {
        pre_money_valuation: { prefix: "₹", suffix: "Cr" },
        revenue_fy25_in_cr: { prefix: "₹", suffix: "Cr" },
        pat_fy25_in_cr: { prefix: "₹", suffix: "Cr" },
        round_size: { prefix: "₹", suffix: "Cr" },
        pe_trailing_forward: { suffix: "x" },

        roce_fy25_percent: { suffix: "%" },
        roe_fy25_percent: { suffix: "%" },
        cagr_growth_3y_percent: { suffix: "%" },
        pat_margin_percent: { suffix: "%" },
        // debt_to_equity_fy25: { suffix: "x" },
        offer_price: { prefix: "₹" },
        lot_size: { suffix: " Shares" },
        // face_value: { prefix: "₹" },
        min_investment: { prefix: "₹", suffix: " per lot" },
    };

    /** ✅ Generic dynamic renderer with static suffix/prefix logic */
    const renderField = (fieldKey, isDate = false, isCurrency = false, isLink = false) => {
        const field = dealData?.[fieldKey];
        if (!field?.status) return null;

        const label = field?.label_name || fieldLabelMap[fieldKey] || fieldKey;
        const tooltipData = field?.tool_tip?.data?.trim();
        const tooltipStatus = field?.tool_tip?.status;
        const value = field?.data;

        const formatConfig = fieldFormatMap[fieldKey] || {};
        let displayValue = "-";

        if (isDate) displayValue = formatDate(value);
        else if (typeof value === "boolean") displayValue = value ? "✅ Yes" : "❌ No";
        else if (typeof value === "object" && value?.data) displayValue = value.data;
        else displayValue = value ?? "-";

        // ✅ Convert numeric 0 → TBA
        if (!isNaN(Number(displayValue)) && Number(displayValue) === 0) {
            displayValue = "TBD";
        }

        // Apply static prefix/suffix formatting (skip if TBA)
        if (displayValue && displayValue !== "-" && displayValue !== "TBA" && displayValue !== "TBD") {
            const num = !isNaN(Number(displayValue)) ? formatNumber(displayValue) : displayValue;
            const prefix = formatConfig.prefix ? `${formatConfig.prefix} ` : "";
            const suffix =
                formatConfig.suffix
                    ? formatConfig.suffix === "x"
                        ? "x" // no space before x
                        : ` ${formatConfig.suffix}`
                    : "";

            displayValue = `${prefix}${num}${suffix}`;
        } else if (displayValue === "TBD") {
            // No prefix/suffix for TBD
            displayValue = "TBD";
        }

        const showTooltip =
            tooltipStatus &&
            tooltipData?.trim() !== "" &&
            displayValue !== null &&
            displayValue !== undefined;


        return (
            <section className="others" key={fieldKey}>
                <h6 className="label-with-tooltip">
                    {label}
                    {showTooltip && (
                        <div className="custom-tooltip-wrapper">
                            <span className="tooltip-icon">
                                <img src="/tooltip.svg" alt="info" />
                            </span>
                            <div className="custom-tooltip-box">{tooltipData}</div>
                        </div>
                    )}
                </h6>

                {isLink ? (
                    <Link href={displayValue} target="_blank" style={{ color: "#f9d65c" }}>
                        {displayValue}
                    </Link>
                ) : (
                    <span>{displayValue}</span>
                )}
            </section>
        );
    };

    const renderValueWithTooltip = (field, displayValue) => {
        const tooltipStatus = field?.tool_tip?.status;
        const tooltipData = field?.tool_tip?.data?.trim();

        return (
            <div className="value-with-tooltip">
                <span className="offer-day" style={{ color: "white" }}>
                    {displayValue}
                </span>

                {tooltipStatus && tooltipData && (
                    <div className="custom-tooltip-wrapper">
                        <span className="tooltip-icon">
                            <img src="/tooltip.svg" alt="info" />
                        </span>
                        <div className="custom-tooltip-box">
                            {tooltipData}
                        </div>
                    </div>
                )}
            </div>
        );
    };





    return (
        <div className="valuation-container">
            <section className="smallcards-section">
                {/* ---- TOP BOX SECTION ---- */}
                <div className="smallcard-section-subcontainer">
                    <section className="subs1-topp">
                        <div>
                            <p>{dealData?.listing_timeline?.label_name || "Listing Timeline"}</p>
                            <Image
                                src={"/assets/pictures/listing-timeline.svg"}
                                height={40}
                                width={40}
                                alt="timeline"
                            />
                        </div>
                        <span className="offer-day">
                            {renderValueWithTooltip(
                                dealData?.listing_timeline,
                                formatDate(dealData?.listing_timeline?.data)
                            )}
                        </span>
                    </section>

                    <div className="smallcard-section-subcontainer-div">

                        <section className="subs top">
                            {dealData?.pre_money_valuation?.status && (
                                <section>
                                    <div>
                                        <span className="data">{dealData?.pre_money_valuation?.label_name || "Pre Money Valuation"}</span>
                                        <span className="valuation-bg"><Valuation /></span>
                                    </div>
                                    {renderValueWithTooltip(
                                        dealData?.pre_money_valuation,
                                        (() => {
                                            const value = dealData?.pre_money_valuation?.data;
                                            if (!value || value === 0) return "TBD";
                                            return `₹${formatNumber(value)} Cr`;
                                        })()
                                    )}
                                </section>
                            )}
                            {dealData?.revenue_fy25_in_cr?.status && (
                                <section>
                                    <div>
                                        <span className="data">{dealData?.revenue_fy25_in_cr?.label_name || "Revenue (FY'25)"}</span>
                                        <span className="valuation-bg"><RevenueIcon /></span>
                                    </div>
                                    {renderValueWithTooltip(
                                        dealData?.revenue_fy25_in_cr,
                                        (() => {
                                            const value = dealData?.revenue_fy25_in_cr?.data;
                                            if (!value || value === 0) return "TBD";
                                            return `₹${formatNumber(value)} Cr`;
                                        })()
                                    )}
                                </section>
                            )}
                        </section>

                        {/* Second row (PAT + P/E) */}
                        <section className="subs top">
                            {dealData?.pat_fy25_in_cr?.status && (
                                <section>
                                    <div>
                                        <span className="data">{dealData?.pat_fy25_in_cr?.label_name || "PAT (FY'25)"}</span>
                                        <span className="valuation-bg"><PatIcon /></span>
                                    </div>
                                    {renderValueWithTooltip(
                                        dealData?.pat_fy25_in_cr,
                                        (() => {
                                            const value = dealData?.pat_fy25_in_cr?.data;
                                            if (!value || value === 0) return "TBD";
                                            return `₹${formatNumber(value)} Cr`;
                                        })()
                                    )}
                                </section>
                            )}
                            {dealData?.pe_trailing_forward?.status && (
                                <section>
                                    <div>
                                        <span className="data">{dealData?.pe_trailing_forward?.label_name || "P/E Trailing Forward"}</span>
                                        <span className="valuation-bg"><PeMultiple /></span>
                                    </div>
                                    {renderValueWithTooltip(
                                        dealData?.pe_trailing_forward,
                                        (() => {
                                            const value = dealData?.pe_trailing_forward?.data;
                                            if (!value || value === 0) return "TBD";
                                            return `${formatNumber(value)}x`;
                                        })()
                                    )}
                                </section>
                            )}
                        </section>
                        
                    </div>
                </div>

                {/* ---- BOTTOM DETAILED SECTION ---- */}
                <section className="main-other">
                    {renderField("round_size")}
                    {renderField("face_value")}
                    {renderField("offer_price")}
                    {renderField("lot_size")}
                    {renderField("sale_type")}
                    {/* {renderField("pe_trailing_forward")} */}
                    {renderField("cagr_growth_3y_percent")}
                    {renderField("roe_fy25_percent")}
                    {renderField("pat_margin_percent")}
                    {renderField("roce_fy25_percent")}
                    {renderField("price_to_book_ratio")}
                    {renderField("debt_to_equity_fy25")}
                    {renderField("merchant_banker_appointed")}
                    {renderField("expecting_listing_date", true)}
                    {renderField("conversion_event")}
                    {renderField("conversion_ratio")}
                    {renderField("company_website", false, false, true)}
                </section>
            </section>
        </div>
    );
};

export default CcpsDealsData;
