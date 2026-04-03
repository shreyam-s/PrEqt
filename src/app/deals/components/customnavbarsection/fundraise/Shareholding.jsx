"use client";
import { useEffect, useState } from "react";
import Fundamentals from "../fundamentals/fundamentals";
import styles from "./Shareholding.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDealStore } from "@/store/dealStore";

export default function Shareholding({ isPrivateDeal}) {
  const [showshareholding, setShowshareholding] = useState(true);
  const [preprogressbar, setPreprogressbar] = useState(0);
  const [postprogressbar, setPostprogressbar] = useState(0);

  const dealDetails = useDealStore((state) => state.dealDetails);
  const shareholdingPattern =
    dealDetails?.data?.fundraise_future_plans?.shareholding_pattern || {};


  const promoters =
    shareholdingPattern?.data?.promoters?.data ||
    shareholdingPattern?.promoters?.data ||
    [];
  const additionalShareholders =
    shareholdingPattern?.data?.additional_shareholders?.data ||
    shareholdingPattern?.additional_shareholders?.data ||
    [];

  // calculate totals safely
  const totalPromoterPre = promoters.reduce(
    (acc, curr) => acc + parseFloat(curr.pre_issue_share || 0),
    0
  );
  const totalPromoterPost = promoters.reduce(
    (acc, curr) => acc + parseFloat(curr.post_issue_share || 0),
    0
  );

  const totalAdditionalPre = additionalShareholders.reduce(
    (acc, curr) => acc + parseFloat(curr.pre_issue_share || 0),
    0
  );
  const totalAdditionalPost = additionalShareholders.reduce(
    (acc, curr) => acc + parseFloat(curr.post_issue_share || 0),
    0
  );

  const totalPre = totalPromoterPre + totalAdditionalPre;
  const totalPost = totalPromoterPost + totalAdditionalPost;

  useEffect(() => {
    setTimeout(() => setPreprogressbar(totalPromoterPre || 100), 100);
    setTimeout(() => setPostprogressbar(totalPromoterPost || 80), 100);
  }, [totalPromoterPre, totalPromoterPost]);


  const isccps = dealDetails?.data?.deal_type === "ccps";
console.log("ccps true or false",isccps);
  // hide the whole section if not enabled
  if (!shareholdingPattern?.status) return null;

  return (
    <div className={isPrivateDeal ? styles.privateContainer : styles.container}>
      <div
        className={styles.title}
        onClick={() => setShowshareholding(!showshareholding)}
        style={{ cursor: "pointer" }}
      >
        <h3>Shareholding</h3>
        <div>
          {showshareholding ? (
            <ChevronUp color={isPrivateDeal ? "white" : "black"} />
          ) : (
            <ChevronDown color={isPrivateDeal ? "white" : "black"} />
          )}
        </div>
      </div>

      {showshareholding && (
        <>
          {/* Pre-Issue */}
          <div className={styles.section}>
            <h3>Pre-issue shareholding</h3>
            <p className={styles.progressLabel}>
              Promoter Holding <br className={styles.responsiveBr} />
              <strong>{preprogressbar?.toFixed(1)}%</strong>
            </p>
            <div className={styles.progressBar}>
              <div
                className={styles.actualprecentage}
                style={{ width: `${preprogressbar}%` }}
              ></div>
              <div
                className={styles.remaingpercentage}
                style={{ width: `${100 - preprogressbar}%` }}
              ></div>
            </div>
          </div>

          {/* Post-Issue */}
          {false  ? <>  <div className={styles.section}>
            <h3>Post-issue shareholding</h3>
            <p className={styles.progressLabel}>
              Promoter Holding <br className={styles.responsiveBr} />{" "}
              <strong>{postprogressbar?.toFixed(1)}%</strong>
            </p>
            <div className={styles.progressBar}>
              <div
                className={styles.actualprecentage}
                style={{ width: `${postprogressbar}%` }}
              ></div>
              <div
                className={styles.remaingpercentage}
                style={{ width: `${100 - postprogressbar}%` }}
              ></div>
            </div>
          </div></>
          : ""}
        

          {/* Table */}
          <div className={styles.table}>
            <div className={styles.header}>
              <span>Category</span>
              <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                <span className={styles.preIssue}>Pre-Issue%</span>
                {false && <span>Post-Issue%</span>}
              </div>
            </div>

            {/* Promoters Section */}
            {shareholdingPattern?.data?.promoters?.status &&
              promoters.length > 0 && (
                <>
                  <div className={styles.subHeader}>Promoters</div>
                  {promoters.map((promoter, index) => (
                    <div className={styles.row} key={index}>
                      <span className={styles.name}>
                        <span className={styles.square}></span>
                        {promoter.promoter_name}
                      </span>
                      <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                        <span>{promoter.pre_issue_share}%</span>
                        {false && <span>{promoter.post_issue_share}%</span>}
                      </div>
                    </div>
                  ))}
                  <div className={`${styles.row} ${styles.totalRow}`}>
                    <span>Total Promoter Holding</span>
                    <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                      <span>{totalPromoterPre.toFixed(1)}%</span>
                      {false && <span>{totalPromoterPost.toFixed(1)}%</span>}
                    </div>
                  </div>
                </>
              )}

            {/* Additional Shareholders Section */}
            {shareholdingPattern?.data?.additional_shareholders?.status &&
              additionalShareholders.length > 0 && (
                <>
                  <div className={styles.subHeader}>
                    Additional Shareholders
                  </div>
                  {additionalShareholders.map((holder, index) => (
                    <div className={styles.row} key={index}>
                      <span className={styles.name}>
                        <span className={styles.square}></span>
                        {holder.shareholder_name}
                      </span>
                      <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                        <span>{holder.pre_issue_share}%</span>
                        {false && <span>{holder.post_issue_share}%</span>}
                      </div>
                    </div>
                  ))}
                  <div className={`${styles.row} ${styles.totalRow}`}>
                    <span>Total Additional Holding</span>
                    <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                      <span>{totalAdditionalPre.toFixed(1)}%</span>
                      {false && <span>{totalAdditionalPost.toFixed(1)}%</span>}
                    </div>
                  </div>
                </>
              )}

            {/* Grand Total */}
            {(promoters.length > 0 || additionalShareholders.length > 0) && (
              <div className={`${styles.row} ${styles.grandTotal}`}>
                <span>Total Shareholding</span>
                <div className={`${isccps ? styles.ccpstableData : styles.tableData}`}>
                  <span>{totalPre.toFixed(1)}%</span>
                  {false && <span>{totalPost.toFixed(1)}%</span>}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!isPrivateDeal && <Fundamentals />}
    </div>
  );
}
