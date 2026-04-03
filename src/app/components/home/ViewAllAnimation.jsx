"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./viewAll.module.css";
import { useDeals } from "@/app/context/DealContext";

const ViewAllAnimation = () => {
  const router = useRouter();
  const { totalDeals } = useDeals();
  console.log("ViewAllAnimation totalDeals:", totalDeals);

  return (
    <div className={`${styles.card} ${styles.simple}`}>
      <div className={styles.newDeals}>
        <div className={styles.newDealsHeading}>
          <div className={styles.greenDot}></div>
          <div className={styles.plusDeals}>We have {totalDeals} new deals</div>
        </div>

        <div
          className={styles.viewAllBtnContainer}
          onClick={() => router.push("/deals")}
        >
          <p className={styles.ViewAllText}>View All</p>
          <img
            src="/assets/pictures/redirect.svg"
            alt="redirect"
            className={styles.upperRightArrow}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewAllAnimation;
