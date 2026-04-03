"use client";
import React, { useEffect, useState } from "react";
import FirstCarousel from "./custom-carousel/customcarousel";
import LastCarousel from "./lastcarousel/lastcarousel";
import Bod from "./directors-section/bod";
import Pitchdeck from "./pitch-deck-section/pitchdeck";
import About from "./about-section/about";
import UtilisationFunds from "./utilisation-of-funds/UtilisationFunds";
import Shareholding from "../fundraise/Shareholding";
import { useDealStore } from "@/store/dealStore";




const Overview = ({ isPrivateDeal }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealType = dealDetails?.data?.deal_type;
  const isPrivateLike = isPrivateDeal || dealType === "ofs" || dealType === "ccps";
  const [pdfUrl, setPdfUrl] = useState("");

useEffect(() => {
  const pitch = dealDetails?.data?.deal_overview?.pitch_deck;

  if (!pitch?.status || !pitch?.data) return;

  const baseUrl = process.env.NEXT_PUBLIC_USER_BASE;

  let filePath = "";

  // Case 1: file array exists
  if (pitch.data.file && pitch.data.file.length > 0) {
    filePath = pitch.data.file[0].path;
  }
  // Case 2: file is directly stored in data.path
  else if (pitch.data.path) {
    filePath = pitch.data.path;
  }

  if (!filePath) return;

  const cleanedPath = filePath.replace("public", "");
  const fullUrl = `${baseUrl}admin/${cleanedPath}`;

  setPdfUrl(fullUrl);
}, [dealDetails]);

  return (
    <div className="overview-container">
      <FirstCarousel isPrivateDeal={isPrivateLike} />
      <About isPrivateDeal={isPrivateLike} />
      
      {/* ✅ Pass pdfUrl dynamically */}
      <Pitchdeck isPrivateDeal={isPrivateLike} pdfUrl={pdfUrl} />
      
      <Bod isPrivateDeal={isPrivateLike} />
      <LastCarousel isPrivateDeal={isPrivateLike} />
      <UtilisationFunds isPrivateDeal={isPrivateLike} />
    </div>
  );
};

export default Overview;
