"use client";

import { createContext, useContext, useEffect, useState } from "react";

const DealsContext = createContext(null);

export const DealsProvider = ({ children }) => {
  const [allDeals, setAllDeals] = useState([]);
  const [totalDeals, setTotalDeals] = useState(0);
  const [currPage, setCurrPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDeals() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=50&page=${currPage}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const responseData = await res.json();

        const deals = responseData.data || [];
        const pagination = responseData.pagination || {};

        setAllDeals(deals);
        setTotalDeals(pagination.totalRecords || 0);

        setHasMore(
          pagination.totalRecords >
            (currPage - 1) * 50 + deals.length
        );
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [currPage]);

  return (
    <DealsContext.Provider
      value={{
        allDeals,
        totalDeals,
        currPage,
        setCurrPage,
        hasMore,
        loading,
        error,
      }}
    >
      {children}
    </DealsContext.Provider>
  );
};

export const useDeals = () => {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error("useDeals must be used within a DealsProvider");
  }
  return context;
};
