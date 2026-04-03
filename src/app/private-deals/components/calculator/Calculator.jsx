"use client";
import React, { useState, useEffect } from "react";
import styles from "./Calculator.module.css";
import { CircleMinus, CirclePlus } from "lucide-react";
import Link from "next/link";
import PrivateQuestion from "../private-questions/PrivateQuestion";
import Chatbot from "@/app/deals/components/ask-ai-section/chatbot/chatbot";
import { useRouter, useSearchParams } from "next/navigation";
import ShowInterestModal from "./ShowInterestModal";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { showErrorToast, showSuccessToast } from "@/app/components/ToastProvider";
import GetInvite from "./GetInvite";

const Calculator = ({ dealDetails, onBack, handleAskAI, isPrivateDeal, deal_id, limit, qaCount, replies, isccps, authToken, isShowInterest, fetchDealDetails}) => {

  const isPrivateLike = isPrivateDeal || isccps;
  console.log("The Details i got here", dealDetails );

  // default value
  const minLots = Number(dealDetails?.deal_setpData?.min_investment?.data?.lot_size) || 1;
  const pricePerLot = dealDetails?.deal_type == "ccps" ? dealDetails?.deal_setpData?.price_per_ccps?.data * dealDetails?.deal_setpData?.lot_size?.data * minLots : dealDetails?.deal_setpData?.per_share_price?.data * dealDetails?.deal_setpData?.lot_size?.data * minLots;  // ₹20,00,000

  const sharesPerLot = dealDetails?.deal_setpData?.lot_size?.data;

 const pricePerSingleLot =
  dealDetails?.deal_type === "ccps"
    ? dealDetails?.deal_setpData?.price_per_ccps?.data *
      dealDetails?.deal_setpData?.lot_size?.data
    : dealDetails?.deal_setpData?.per_share_price?.data *
      dealDetails?.deal_setpData?.lot_size?.data;

const isOfs = dealDetails?.deal_type === "ofs";

const maxLots =
  isOfs ? Infinity :
  (limit && limit > 0
    ? Math.floor(limit / pricePerSingleLot)
    : minLots);

  const [lots, setLots] = useState(minLots);

  const [showQnA, setShowQnA] = useState(false);
  const [showchatbot, setShowChatBot] = useState(false);
  const [showInterestSuccessModal, setShowInterestModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window != "undefined") {
      const step = Number(Cookies.get("currentStep") || "1");
      if (searchParams.get("code") && searchParams.get("state")) {
        setCurrentStep(step);
        setShowInterestModal(Cookies.get("showinterest") == "true");
      }
    }
  }, [])

  // Slider states (for mobile)
  const [isMobile, setIsMobile] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

const handleIncrement = () => {
  if (lots < maxLots) {
    setLots(prev => prev + 1);
  } else {
    showErrorToast(
      `You can invest up  to ₹${limit.toLocaleString("en-IN")} only.`
    );
  }
};

const handleLotsChange = (e) => {
  const digitsOnly = e.target.value.replace(/\D/g, "");
  if (!digitsOnly) {
    setLots(0);
    return;
  }

  const nextLots = Number(digitsOnly);
  if (nextLots > maxLots) {
    setLots(maxLots);
    showErrorToast(
      `You can invest up to ₹${limit.toLocaleString("en-IN")} only.`
    );
    return;
  }

  setLots(nextLots);
};

const handleLotsBlur = () => {
  if (!lots || Number(lots) < minLots) {
    showErrorToast(`Minimum lot should be ${minLots}.`);
    setLots(minLots);
  }
};


  const handleDecrement = () => {
    if (lots > minLots) setLots(lots - 1);
  };
  const liveAt = dealDetails?.deal_setpData?.live_at
  console.log("The Detail of Deals i got", liveAt)

  function daysUntilLive(liveAt) {
    const liveDate = new Date(liveAt);
    const today = new Date();
    // Convert to start of day to avoid time-zone partial day issues
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfLive = new Date(liveDate.getFullYear(), liveDate.getMonth(), liveDate.getDate());

    const diffTime = startOfToday - startOfLive; // milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays; // Could be 0 or negative
  }
  const getLatestReplyInitials = (questions = []) => {
    const allReplies = [];

    questions.forEach(q => {
      if (q.replies && q.replies.length > 0) {
        q.replies.forEach(r => {
          allReplies.push({
            solver: r.solver,
            createdAt: r.createdAt
          });
        });
      }
    });

    // Sort by newest first
    allReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Take top 5
    const latestFive = allReplies.slice(0, 5);

    // Convert name → initials
    return latestFive.map(r => {
      if (!r.solver) return "A"; // default like your old PNG  
      const parts = r.solver.trim().split(" ");
      let initials = parts[0][0];
      if (parts.length > 1) initials += parts[1][0];
      return initials.toUpperCase();
    });
  };
  const renderCalculatorContent = () => (
    <>
      {/* Minimum Investment */}
   
{isShowInterest == false ? 
(
  <>
   <div className={styles.minInvestment}>
        <div className={styles.div}>
          <p>Minimum Investment</p>
          <span>
            ₹{pricePerLot.toLocaleString("en-IN")} / {sharesPerLot * minLots}  share
          </span>
        </div>
        <img src="/assets/pictures/private-calculator-logo.svg" alt="private-calculator-logo" />
      </div>

      {/* Shares Lot Section */}
      <div className={styles.lotContainer}>
        <p>
          Shares Lot {sharesPerLot} X {lots}
        </p>
        <div className={styles.counter}>
          <button onClick={handleDecrement} className={styles.btn}>
            <CircleMinus />
          </button>
          <input
            className={styles.valueInput}
            value={lots}
            onChange={handleLotsChange}
            onBlur={handleLotsBlur}
            inputMode="numeric"
            min={minLots}
            max={maxLots}
          />
          <button onClick={handleIncrement} className={styles.btn}>
            <CirclePlus />
          </button>
        </div>
      </div>

      {/* Investment amount */}
      <div className={styles.amount}>
        <p>Investment amount </p>
        <h2>₹{((lots * pricePerLot) / minLots).toLocaleString("en-IN")}</h2>
      </div>
      
        <button
          className={styles.showBtn}
          onClick={() => {
            setShowSlider(false);
            if (lots < minLots) {
              showErrorToast(`Minimum lot should be ${minLots}.`);
              return;
            }
            if (!isOfs && lots > maxLots) {
              showErrorToast(`You can invest up to ₹${limit.toLocaleString("en-IN")} only.`);
              return;
            }
            if (isOfs || lots <= maxLots) {
              setShowInterestModal(true);
            }
          }}
          style={{ border: "unset" }}
        >
          Show Interest 
        </button>
        </>
 ): 
 (
  <Link href={`/account/transation?id=${dealDetails?.user_interest?.transaction_id}`} className={styles.transactionBtn}> Transaction</Link>
 )}
        {/* Optional Ask AI button only when chatbot is supported */}
        {!isMobile && dealDetails?.chat_bot_supported && <button
          className={styles.askAiButton}
          onClick={() => setShowChatBot(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.97075 5.57749L10.573 7.24999C11.242 9.10624 12.7037 10.568 14.56 11.237L16.2325 11.8392C16.3832 11.894 16.3832 12.1077 16.2325 12.1617L14.56 12.764C12.7037 13.433 11.242 14.8947 10.573 16.751L9.97075 18.4235C9.916 18.5742 9.70225 18.5742 9.64825 18.4235L9.046 16.751C8.377 14.8947 6.91525 13.433 5.059 12.764L3.3865 12.1617C3.23575 12.107 3.23575 11.8932 3.3865 11.8392L5.059 11.237C6.91525 10.568 8.377 9.10624 9.046 7.24999L9.64825 5.57749C9.70225 5.42599 9.916 5.42599 9.97075 5.57749Z" fill="#C9A74E" />
            <path d="M17.5013 1.55794L17.8065 2.40469C18.1455 3.34444 18.8857 4.08469 19.8255 4.42369L20.6722 4.72894C20.7487 4.75669 20.7487 4.86469 20.6722 4.89244L19.8255 5.19769C18.8857 5.53669 18.1455 6.27694 17.8065 7.21669L17.5013 8.06344C17.4735 8.13994 17.3655 8.13994 17.3378 8.06344L17.0325 7.21669C16.6935 6.27694 15.9532 5.53669 15.0135 5.19769L14.1667 4.89244C14.0903 4.86469 14.0903 4.75669 14.1667 4.72894L15.0135 4.42369C15.9532 4.08469 16.6935 3.34444 17.0325 2.40469L17.3378 1.55794C17.3655 1.48069 17.4743 1.48069 17.5013 1.55794Z" fill="#C9A74E" />
            <path d="M17.5013 15.9382L17.8065 16.785C18.1455 17.7247 18.8857 18.465 19.8255 18.804L20.6722 19.1092C20.7487 19.137 20.7487 19.245 20.6722 19.2727L19.8255 19.578C18.8857 19.917 18.1455 20.6572 17.8065 21.597L17.5013 22.4437C17.4735 22.5202 17.3655 22.5202 17.3378 22.4437L17.0325 21.597C16.6935 20.6572 15.9532 19.917 15.0135 19.578L14.1667 19.2727C14.0903 19.245 14.0903 19.137 14.1667 19.1092L15.0135 18.804C15.9532 18.465 16.6935 17.7247 17.0325 16.785L17.3378 15.9382C17.3655 15.8617 17.4743 15.8617 17.5013 15.9382Z" fill="#C9A74E" />
          </svg>
          Ask AI About This Deal
        </button>}

        {/* {!isMobile && <div className={styles.viewDetailsBtn}>
          <div className={styles.leftDiv}>
            <div className={styles.greenDot}></div>
            <p>We have 1+ new deals</p>
          </div>
          <Link className={styles.link} href="/deals">
            View All Deals
          </Link>
        </div>} */}

        

      <GetInvite  fetchDealDetails = {fetchDealDetails}/>

        <button className={`${styles.imageStack} ${styles.mobileStackImage} ${qaCount <= 0 ? styles.centeredImageStack : ''}`} onClick={() => setShowQnA(true)}>
          <>
            {qaCount > 0 && (
              <div>
                <div className="initialsContainer">
                  {getLatestReplyInitials(replies?.data?.questions_by || []).map((i, index) => (
                    <div key={index} className="initialBadge">
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <span className={styles.s1}>
             {qaCount > 0 ? `${qaCount} Q&A answered in last ${daysUntilLive(liveAt)} days`:  "Do you have any question? Ask now"} 
            </span>
              {/* <span className={styles.s2}>
              <img
                src="/assets/pictures/8e3073ca31264b3cb0bd9cb1e07af102b937cb5c.gif"
                alt="gif"
              />
            </span> */}
          </>
        </button>

        {/* {!isMobile && 
        <button className={styles.imageStack} onClick={() => setShowQnA(true)}>
          <>
            <div>
              <img src="/assets/pictures/1.png" alt="" />
              <img src="/assets/pictures/1.png" alt="" />
              <img src="/assets/pictures/1.png" alt="" />
              <img src="/assets/pictures/1.png" alt="" />
            </div>
            <span className={styles.s1}>
              23 Q&A answered in last 3 days{" "}
            </span>
          </>
        </button>
       } */}
      
    </>
  );

  return (
    <>
      {/* Desktop / Tablet View */}
      {!isMobile && (
        <div className={styles.card}>
          {showQnA ? (
            <PrivateQuestion onBack={() => setShowQnA(false)} qaCount={qaCount} replies={replies} />
          ) : showchatbot ? (
            <Chatbot
              onBack={() => setShowChatBot(false)}
              isPrivateDeal={isPrivateDeal}
              isPrivate={isPrivateDeal}
              isPrivateLike={isPrivateLike}
            />
          ) : (

            
            renderCalculatorContent()
          )}
        </div>
      )}

      {/* Mobile View with Slider */}
      {/* MOBILE VIEW — CALCULATOR + QnA SLIDER */}
      {authToken && isMobile && (
        <>
          {/* FIXED BOTTOM SHOW INTEREST BUTTON */}
          {isPrivateDeal && (
            <div className={styles.fixedBottomBtn}>
              <button onClick={() => setShowSlider(true)}>Show Interest</button>
            </div>
          )}

          {/* CALCULATOR SLIDER */}
          {showSlider && (
            <div
              className={styles.overlay}
              onClick={() => setShowSlider(false)}
            >
              <div
                className={styles.slider}
                onClick={(e) => e.stopPropagation()}
              >
                {renderCalculatorContent()}
              </div>
            </div>
          )}

          {/* QNA SLIDER */}
          {showQnA && (
            <div
              className={styles.overlay}
              onClick={() => setShowQnA(false)}
            >
              <div
                className={styles.qnaSlider}
                onClick={(e) => e.stopPropagation()}
              >
                <PrivateQuestion
                  onBack={() => setShowQnA(false)}
                  qaCount={qaCount}
                />
              </div>
            </div>
          )}
        </>
      )}


      {showInterestSuccessModal && (
        <ShowInterestModal lots={lots}
          deal_id={deal_id}
          fetchDealDetails = {fetchDealDetails}
          amount={((lots * pricePerLot) / minLots).toFixed(2)}
          show={showInterestSuccessModal}
          onClose={() => {
            setShowInterestModal(false);
          }}
          myStep={currentStep}
        />
      )}
    </>
  );
};

export default Calculator;
