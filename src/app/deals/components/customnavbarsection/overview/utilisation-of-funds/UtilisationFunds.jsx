"use client";
import React from "react";
import styles from "./UtilisationFunds.module.css";
import { useDealStore } from "@/store/dealStore";

export default function UtilisationFunds({ isPrivateDeal }) {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data?.deal_overview;

  const utilisationFunds = dealData?.utilisation_of_funds;

  // If data is missing or status is false, return nothing
  if (!utilisationFunds?.status || !utilisationFunds?.data) return null;

  // Convert the object into an array for mapping
 

  const isEmptyHtml = (html = "") => {
  return !html || html.replace(/<[^>]*>/g, "").trim() === "";
};

const fundsArray = Object.entries(utilisationFunds.data)
  .filter(([_, value]) => {
    const amount = value?.amount_in_percent;
    const description = value?.description;

    // ❌ remove if BOTH amount is null AND description is empty
    return !(amount == null && isEmptyHtml(description));
  })
  .map(([key, value]) => ({
    label: key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    amount: value?.amount_in_percent,
    description: value?.description,
  }));

  if (!fundsArray.length) return null;



  return (
    <div className={`${styles.card} ${isPrivateDeal ? styles.privateDeal : ""}`}>
      <h3 className={styles.heading}>Utilisation of Funds
        <span className={styles.colAmount}>in (%)</span>
      </h3>

      <div className={styles.table}>
        {/* Table header */}
        <div className={styles.rowHeader}>
          <span className={styles.colPurpose}></span>

        </div>

        {/* Table body */}
        {fundsArray.map((item, index) => (
          <div key={index}>
            <div className={styles.row}>
              <div className={styles.purpose}>
                <span
                  className={styles.colorBox}
                  style={{
                    backgroundColor: [
                      "#927127",
                      "#E8E7EE",
                      "#D1BD56",
                      "#EF4444",
                    ][index % 4], // color rotation
                  }}
                ></span>
                {item.label}
              </div>
              <span className={styles.amount}>{item.amount}%</span>


              {/* Show description if available */}

            </div>

            {item.description && (
              <div
                className={styles.text}
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
