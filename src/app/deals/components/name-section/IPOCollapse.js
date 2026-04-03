import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { Collapse, Table } from "react-bootstrap";
import styles from './IPOCollapse.module.css'
import { useDealStore } from "@/store/dealStore";

const IPOCollapse = ({ isPrivateDeal, isccps, isofs }) => {
    const [open, setOpen] = useState(true);
    

    const dealDetails = useDealStore((state) => state.dealDetails);
    const dealData = dealDetails?.data?.deal_setpData;

    const formatNumber = (value) => {
        if (value === null || value === undefined || isNaN(Number(value))) return value ?? "-";
        return Number(value).toLocaleString("en-IN");
    };

    return (
        <div className={`${isPrivateDeal ? styles.privateipo : ''} ${styles.ipocllapseWrapper || ''}`}>
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className={styles.ipocollapseBtn}
            >
                <div className={styles.ipocollapseleft}>
                    <small className={styles.smallText}>
                        {/* {isPrivateDeal ? "Per Share Price" : "Issue Price (Per Share)"} */}
                        Issue Price (Per Share)
                    </small>

                    {/* For Private Deal */}
                    {isPrivateDeal && dealData?.price_per_ccps?.status ? (
                        <h5 className={styles.largeText}>
                            {isccps && dealData?.price_per_ccps?.data === 0 ? (
                                "TBD"
                            ) : (
                                <>
                                    ₹{formatNumber(dealData?.price_per_ccps?.data)} 
                                    <small className={styles.smll}> per CCPS</small>
                                </>
                            )}
                        </h5>
                    ) : (
                        dealData?.per_share_price?.status && (
                            <h5 className={styles.largeText}>
                                {dealData?.per_share_price?.data === "0" ? (
                                    "TBD"
                                ) : (
                                    <>
                                        ₹{dealData?.per_share_price?.data} 
                                        {/* <small className={styles.smll}></small> */}
                                    </>
                                )}
                            </h5>
                        )
                    )}

                </div>
               
                <div className={styles.ipocollapseCenter}>
                    {(dealData?.current_gmp?.status || true) && (
                        <div className={styles.ipocollapseCenterInner}>
                            <small className={styles.smallText}>Current GMP (Per share)</small>
                            <h5 className={styles.largeText}>
                                {dealData?.current_gmp?.data ? (
                                    <>₹{formatNumber(dealData?.current_gmp?.data)}</>
                                ) : (
                                    "₹120"
                                )}
                            </h5>
                        </div>
                    )}
                </div>

                <div className={styles.ipocollapseCenter}>
                    {(dealData?.estimated_gain?.status || true) && (
                        <div className={styles.ipocollapseCenterInner}>
                            <small className={styles.smallText}>Estimated Gain</small>
                            <h5 className={` ${styles.gainTextgreen}`} >
                                {dealData?.estimated_gain?.data ? (
                                    <>
                                        {dealData?.estimated_gain?.data}% 
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" tyle={{marginLeft: "8px", alignItems: "center", marginBottom: "3px"}}>
<path d="M6 11V1M6 1L1 6M6 1L11 6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
                                    </>
                                ) : (
                                    <>  
                                        15.5% 
                                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"  style={{marginLeft: "8px", alignItems: "center", marginBottom: "3px"}}>
<path d="M6 11V1M6 1L1 6M6 1L11 6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
                                    </>
                                )}
                            </h5>
                        </div>
                    )}
                </div>

                <div className={styles.ipocollapseright}>
                    <div className={styles.ipocollapserightInner}>
                        <small className={styles.smallText}>Lot Size</small>
                        {dealData?.lot_size?.status && (
                            <h5 className={styles.largeText}>
                                {formatNumber(dealData?.lot_size?.data) == 0
                                    ? "TBD"
                                    : `${formatNumber(dealData?.lot_size?.data)} Shares`}
                            </h5>
                        )}

                    </div>
                    {!isofs && (open ? <ChevronUp color={isPrivateDeal ? "white" : "black"} /> : <ChevronDown color={isPrivateDeal ? "white" : "black"} />)}
                </div>

            </button>

            <Collapse in={!isofs && open}>
                <div>
                    {dealData?.issue_size?.status && (
                        <Table className={`${styles.ipoCollapsetable} ${isPrivateDeal ? styles.privateTable : ""}`} borderless>
                            <thead>
                                <tr>
                                    <th className="">Issue size</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.overall?.label_name || "Overall")
                                            : "Overall"}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.overall?.data
                                                ? `₹${dealData?.issue_size.data.overall?.data} Cr`
                                                : "-")
                                            : (dealData.issue_size.data.overall
                                                ? `₹${dealData?.issue_size?.data?.overall} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.fresh_issue?.label_name || "Fresh Issue")
                                            : "Fresh Issue"}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.fresh_issue?.data
                                                ? `₹${dealData.issue_size.data.fresh_issue.data} Cr`
                                                : "-")
                                            : (dealData.issue_size.data.fresh_issue
                                                ? `₹${dealData.issue_size.data.fresh_issue} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.offer_for_sale?.label_name || "Offer for Sale")
                                            : "Offer for Sale"}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.offer_for_sale?.data
                                                ? `₹${dealData.issue_size.data.offer_for_sale.data} Cr`
                                                : "NIL")
                                            : (dealData.issue_size.data.offer_for_sale
                                                ? `₹${dealData.issue_size.data.offer_for_sale} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    )}

                </div>
            </Collapse>
        </div>
    );
};

export default IPOCollapse;