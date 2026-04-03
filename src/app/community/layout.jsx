"use client";
import React, { useState, useEffect } from "react";
import Styles from "./components/PostDealContainer/postDealContainer.module.css";
import TopDeal from "./components/TopDealSection/TopDeal";
import Loader from "../components/Loader";
import CommingSoon from "../components/CommingSoon";

const Layout = ({ children }) => {
  const [pageLoading, setPageLoading] = useState(true);
  const [emptyData, setEmptyData] = useState(false);

  // Option 1: Set a fallback timeout if children don't trigger loading completion
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPageLoading(false);
    }, 200); // Fallback after 5 seconds

    return () => clearTimeout(timeout);
  }, []);

  console.log("Is page loading reaching layout",pageLoading);

  return (
    <div>
      <div className={Styles.postDealInnerContainer}>

        {/* Loader */}
        {pageLoading && <Loader />}

        {emptyData ? (
          <CommingSoon />
        ) : (
          <>
            {/* Actual content */}
            <div style={{ display: pageLoading ? "none" : "block" , width:"100%"}}>
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, {
                    onLoadingChange: ({ isLoading, noPosts }) => {
                      
                      setPageLoading(isLoading);
                      setEmptyData(noPosts);
                    }
                  });
                }
                return child;
              })}
            </div>

            {/* TopDeal only when NOT loading AND NOT empty */}
            {!pageLoading  && (
              <div className={`${Styles.TopDealContainer} ${Styles.topDealPadding}`}>
                <TopDeal />
              </div>
            )}
          </>
        )}




      </div>
    </div>
  );
};

export default Layout;