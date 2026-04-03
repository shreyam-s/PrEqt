"use client";
import { useDealStore } from "@/store/dealStore";
import Loader from "@/app/components/Loader";
import styles from "../../../components/home/DealsTalk/DealsTalk.module.css";
import stylesdeals from "./AllDeals.module.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Lock } from "lucide-react";
import SignupFormPopup from "@/app/signup-form/SignupFormPopup";
import SignupTypePopup from "@/app/signup/SignupTypePopup";
import OtpPopup from "@/app/otp/OtpPopup";
import SigninPopup from "@/app/sign-in/SigninPopup";
import { formatDate } from "@/app/utils/FormatDate";
import LoadMoreLoader from "@/app/components/LoadMore/LoadMoreLoader";

function AllDealsContent() {
    const [loading, setLoading] = useState(true);
    const [allDeals, setAllDeals] = useState([]);
    const [error, setError] = useState([]);
    const { setSelectedDeal } = useDealStore();
    const authToken = Cookies.get('accessToken'); // or from cookies
    const router = useRouter();
    const searchParams = useSearchParams();

    const [showBtn, setShowBtn] = useState(-1);

    const [showSignin, setShowSignin] = useState(false);
    const [showSignupType, setShowSignupType] = useState(false);
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [otpSource, setOtpSource] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signinEmail, setSigninEmail] = useState("");
    const [qaCounts, setQaCounts] = useState({});
    const [replies, setReplies] = useState({}); // Store replies per dealId: { [dealId]: data }
    const [countLoading, setCountLoading] = useState(false);
    const [countError, setCountError] = useState(false)
    const [redirectPath, setRedirectPath] = useState(null);

    function CompanyLogo({ path, alt, className }) {
        const [failed, setFailed] = useState(false);

        // IMPORTANT: fix your fallback path to a real existing file
        const fallback = "/logo-fallback.png";

        const src = failed
            ? fallback
            : path
                ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${path.replace("public/", "")}`
                : fallback;

        return (
            <img
                src={src}
                alt={alt}
                className={className}
                onError={() => setFailed(true)}
            />
        );
    }


    useEffect(() => {
        const shouldShowSignin = searchParams?.get("showSignin") === "true";
        if (!shouldShowSignin) return;

        // Capture redirect target (original deal page) if present
        const redirectParam = searchParams?.get("redirect");
        if (redirectParam) {
            setRedirectPath(redirectParam);
        }

        setShowSignin(true);

        const updatedParams = new URLSearchParams(searchParams.toString());
        updatedParams.delete("showSignin");
        updatedParams.delete("redirect");

        const nextUrl = updatedParams.toString()
            ? `/deals?${updatedParams.toString()}`
            : "/deals";

        router.replace(nextUrl);
    }, [searchParams, router]);

    useEffect(() => {
        if (allDeals.length === 0) return;

        allDeals.forEach((deal) => {
            fetchRepliesCount(deal.id, deal.deal_type === "private" || deal.deal_type === "ccps" || deal.deal_type === "ofs");
        });
    }, [allDeals]);


    const fetchRepliesCount = async (dealId, isPrivateDeal) => {
        if (!dealId) return;

        try {
            setCountLoading(true);
            const token = isPrivateDeal ? Cookies.get("token") : null;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}/admin/api/dashboard/replies-count/${dealId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            );

            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
            const data = await res.json();

            setQaCounts((prev) => ({
                ...prev,
                [dealId]: data?.data?.count || 0,
            }));

            // Store replies data per deal ID
            setReplies((prev) => ({
                ...prev,
                [dealId]: data,
            }));
        } catch (err) {
            console.error("Error fetching replies count:", err);
        } finally {
            setCountLoading(false);
        }
    };

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







    const getPrivateDealProgress = (deal) => {
        const raised =
            deal?.company_name === "Cricstudio Pvt. Ltd."
                ? 4.5
                : Number(deal?.raised_amount || 0);

        const target = Number(deal?.target_funding_in_cr || 0);

        if (target <= 0) {
            return {
                raised,
                percent: "0.00",
                width: "0%",
            };
        }

        const percent = ((raised / target) * 100).toFixed(1);

        return {
            raised,
            percent,
            width: `${Math.min(Number(percent), 100)}%`,
        };
    };





  
    const [otpPayload, setOtpPayload] = useState(null);
  
    const handleSigninOpen = () => {
      setShowSignin(true);
    };
  
  
    // SIGN IN → EMAIL OTP
    const handleSigninShowOtp = (payload) => {
      if (!payload?.type || !payload?.identifier) {
        console.error("Invalid OTP payload", payload);
        return;
      }
  
      setOtpPayload({
        flow: "signin",
        ...payload,
      });
  
      setShowSignin(false);
    };
  
    // SIGN UP → MOBILE OTP
    const handleSignupShowOtp = ({ email, phone }) => {
      if (!phone) return;
  
      setOtpPayload({
        flow: "signup",
        type: "mobile",
        identifier: phone,
        verifyEndpoint: "verify-register-otp",
        resendEndpoint: "resend-registeration-otp",
        email, // keep for later
      });
  
      setShowSignupForm(false);
    };
    const closeOtp = () => {
      setOtpPayload(null);
    };

    const renderPublicCard = (deal) => (
        <Link href={`/deals/${deal.slug}`}
            // onClick={() => setSelectedDeal(deal)}
            className={stylesdeals.cardLink}>
            <div className={styles.cardContainer1}>
                <div className={styles.cardInnerSections}>
                    <article className={styles.cardIPOsection}>
                        {deal?.tags?.length > 0 && deal.tags.map((data, idx) => (
                            <div className={styles.IPOheading} key={idx}>
                                <p className={styles.HeadingContent}>{data}</p>
                            </div>
                        ))}
                    </article>


                    <div className={styles.AnthemSection}>
                        <CompanyLogo
                            path={deal?.company_logo?.[0]?.path}
                            alt={deal?.company_name}
                            className={styles.anthemPicture}
                        />

                        <p className={styles.anthemHeading}>{deal?.company_name}</p>
                    </div>

                    <p className={styles.dealCardContent}>{deal?.tag_line}</p>

                    <div className={styles.revenueMainContainer}>
                        <section className={styles.revenueSection}>
                            <article className={styles.Revenue}>
                                <p className={styles.revenuHeading}>Revenue (FY'25)</p>
                                <p className={styles.priceInRupee}>₹{deal?.revenue_fy25_in_cr || 0} Cr</p>
                            </article>
                            <article>
                                <p className={styles.revenuHeading}>PAT (FY'25)</p>
                                <p className={styles.priceInRupee}>₹{deal?.pat_fy25_in_cr || 0} Cr</p>
                            </article>
                            <article>
                                <p className={styles.revenuHeading}>P/E multiple</p>
                                <p className={styles.priceInRupee}>{deal?.pe_multiple || 0}x</p>
                            </article>
                        </section>

                        <section className={styles.revenueSection}>
                            <article className={styles.Revenue}>
                                <p className={styles.revenuHeading}>CAGR Growth 3Y</p>
                                <p className={styles.priceInRupee}>{deal?.cagr_growth_3y_percent || 0}%</p>
                            </article>
                            <article>
                                <p className={styles.revenuHeading}>ROE (FY'25)</p>
                                <p className={styles.priceInRupee}>{deal?.roe_fy25_percent || 0}%</p>
                            </article>
                            <article>
                                <p className={styles.revenuHeading}>Issue Opening Date</p>
                                <p className={styles.priceInRupee}>{formatDate(deal?.offer_date_from)}</p>
                            </article>
                        </section>
                    </div>
                    <div className={styles.publicpromoter}>
                        {deal?.key_highlights?.map((tag, index) => (index < 3 &&
                            <div key={index} className={index === 0 ? styles.Strong : styles.monetization}>
                                <p>{tag}</p>
                            </div>
                        ))}
                    </div>

                    {/* <section className={styles.merchantMainContainer}>
                        <div className={styles.merchantBanker}>
                            <p className={styles.bankMerchant}>{deal.merchantBanker}</p>
                        </div>
                    </section> */}

                </div>


                <div className={styles.cardFooterMainContainer}>
                    <div className={styles.QandA}>
                        <div className={styles.QandAstats}>
                            {qaCounts[deal.id] > 0
                                ? `${qaCounts[deal.id]} Q&A answered in last ${daysUntilLive(deal?.createdAt)} days`
                                : "Do you have any question? Ask now"}
                        </div>

                        {qaCounts[deal.id] > 0 && (
                            <div className={styles.initialsContainer}>
                                {getLatestReplyInitials(
                                    replies[deal.id]?.data?.questions_by || []
                                ).map((i, index) => (
                                    <div key={index} className={styles.initialBadge}>
                                        {i}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Rating Strip */}
                {deal?.average_rating && (
                    <div className={styles.ratingContainer}>
                        <img src="/strip_Rating.svg" alt="Rating Strip" className={styles.ratingStripImage} />
                        <span className={styles.ratingText}>{deal?.average_rating}</span>
                        <img src="/rating_Star.svg" alt="Star" className={styles.ratingStar} />
                    </div>
                )}

            </div>
        </Link>
    );

    const renderPrivateCard = (deal) => (
        <Link href={`/deals/${deal.slug}`}

            className={stylesdeals.cardLink}>
            <div className={styles.card2Container}>
                {(deal?.deal_type === 'ofs' || deal?.deal_type === 'private' || deal?.deal_type === 'ccps') && deal?.exclusive_deal === true && (
                    <img src="/ofsdealGradient.svg" alt="Exclusive deal gradient" className={styles.ofsGradient} />
                )}
                <div className={styles.card2InnerSections}>
                    <article className={styles.card2IPOsection}>
                        {(deal?.deal_type === 'ofs' || deal?.deal_type === 'OFS') && (
                            <div className={styles.ofsDefaultTag}>
                                <p className={styles.ofsDefaultTagText}>Unlisted Shares</p>
                            </div>
                        )}

                        {deal.tags?.map((tag, index) => (
                            <div
                                key={index}
                                className={styles.card2IPOtag}
                            >
                                <p className={styles.card2IPOtext}>{tag.trim()}</p>
                            </div>
                        ))}
                    </article>

                    <div className={styles.card2CompanySection}>
                        <CompanyLogo
                            path={deal?.company_logo?.[0]?.path}
                            alt={deal?.company_name}
                            className={styles.anthemPicture}
                        />

                        <p className={styles.card2CompanyName}>{deal?.company_name}</p>
                    </div>

                    {deal?.deal_type !== 'ofs' && deal?.deal_type !== 'OFS' && (
                        <p className={styles.card2Description}>{deal?.tag_line}</p>
                    )}

                {/* Exclusive Tag */}
                {deal?.exclusive_deal === true && (
                    <div className={styles.exclusiveTagWrapperofs}>
                        <img 
                            src={"/exclusiveofstag.svg"} 
                            alt="Exclusive Deal" 
                            className={styles.exclusiveTagImageofs} 
                        />
                    </div>
                )}

                {(deal?.deal_type === 'ofs' || deal?.deal_type === 'OFS') ? (
                    <>
                        <div className={styles.ofsHighlightBox}>
                            <div className={styles.ofsHighlightRow}>
                                <div className={styles.ofsHighlightCol}>
                                    <p className={styles.card2StatHeading}>OFS Size</p>
                                    <p className={styles.ofsHighlightValue}>₹ {deal?.issue_size_overall || deal?.offer_for_sale || "TBD"} {deal?.issue_size_overall || deal?.offer_for_sale ? "Cr" : ""}</p>
                                </div>
                                <div className={styles.ofsHighlightCol}>
                                    <p className={styles.card2StatHeading}>Current GMP</p>
                                    <p className={styles.ofsHighlightValue}>₹ {deal?.per_share_price || deal?.offer_price || "TBD"} <span className={styles.perShare}>{deal?.per_share_price || deal?.offer_price ? "/ share" : ""}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card2StatsContainer}>
                            <section className={styles.card2StatsRow}>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>Revenue (FY'25)</p>
                                    <p className={styles.card2StatValue}>₹ {deal?.revenue_fy25_in_cr || 0} Cr</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>ROE (FY'25)</p>
                                    <p className={styles.card2StatValue}>{deal?.roe_fy25_percent || 0}%</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>PAT (FY'25)</p>
                                    <p className={styles.card2StatValue}>INR {deal?.pat_fy25_in_cr || 0} Cr</p>
                                </article>
                            </section>

                            <section className={styles.card2StatsRow}>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>P/E Multiple</p>
                                    <p className={styles.card2StatValue}>{deal?.pe_multiple || "TBD"} {deal?.pe_multiple ? "x" : ""}</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>Market Cap</p>
                                    <p className={styles.card2StatValue}>
                                        {typeof deal?.valuation_in_cr === "number"
                                            ? ` ₹ ${Math.round(deal.valuation_in_cr).toLocaleString('en-IN')} Cr`
                                            : "TBD"}
                                    </p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>Min. Investment</p>
                                    <p className={styles.card2StatValue}>₹ {deal?.min_investment_amount_in_inr ? deal.min_investment_amount_in_inr.toLocaleString('en-IN') : "TBD"}</p>
                                </article>
                            </section>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.card2StatsContainer}>
                                <section className={styles.card2StatsRow}>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>
                                            Valuation
                                        </p>
                                        <p className={styles.card2StatValue}>

                                            {typeof deal?.valuation_in_cr === "number"
                                                ? ` ₹ ${Math.round(deal.valuation_in_cr)} Cr`
                                                : "TBD"}
                                        </p>
                                    </article>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>Revenue (FY'25)</p>
                                        <p className={styles.card2StatValue}>₹ {deal?.revenue_fy25_in_cr || 0} Cr</p>
                                    </article>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>Expected listing </p>
                                        <p className={styles.card2StatValue}>{formatDate(deal?.listing_timeline)}</p>
                                    </article>
                                </section>

                                <section className={styles.card2StatsRow}>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>PAT (FY'25)</p>
                                        <p className={styles.card2StatValue}>₹ {deal?.pat_fy25_in_cr || 0} Cr</p>
                                    </article>
                                    <article className={styles.card2Stat}>
                                        <p className={styles.card2StatHeading}>P/E Multiple</p>
                                        <p className={styles.card2StatValue}>{deal?.pe_multiple || "TBD"} {deal?.pe_multiple ? "X" : ""}</p>
                                    </article>
                                </section>
                            </div>

                            {(deal?.target_funding_in_cr || 0) > 0 && (() => {
                                const { raised, percent, width } = getPrivateDealProgress(deal);

                                return (
                                    <div className={styles.progressContainer}>
                                        <div className={styles.ProgressInPrice}>
                                            <p className={styles.PriceIncr}>
                                                ₹{raised} Cr / ₹{deal?.target_funding_in_cr} Cr
                                            </p>
                                            <p className={styles.PricePercent}>{percent}%</p>
                                        </div>

                                        <div className={styles.progressWrapper}>
                                            <div className={styles.progress}>
                                                <div
                                                    className={styles.progressBar}
                                                    style={{ width }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                    </>
                )}



                    <div className={styles.promoter}>
                        {deal?.key_highlights?.map((tag, index) => (
                            <div key={index} className={index === 0 ? styles.Strong : styles.monetization}>
                                <p>{tag}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.card2Footer}>
                    <div className={styles.card2QandA}>
                        <div className={styles.card2QandAStats}>
                            {qaCounts[deal.id] > 0
                                ? `${qaCounts[deal.id]} Q&A answered in last ${daysUntilLive(deal?.createdAt)} days`
                                : "Do you have any question? Ask now"}
                        </div>

                        {qaCounts[deal.id] > 0 && (
                            <div className={styles.initialsContainer}>
                                {getLatestReplyInitials(
                                    replies[deal.id]?.data?.questions_by || []
                                ).map((i, index) => (
                                    <div key={index} className={styles.initialBadge}>
                                        {i}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* <img src="/assets/pictures/star.svg" alt="" className={styles.starImage} /> */}
            </div>
        </Link>
    );

    const renderHiddenCard = (index) => {
        return (
            <div className={styles.privateCard}
                onMouseEnter={() => setShowBtn(index)}
                onMouseLeave={() => setShowBtn(-1)}>
                <img src="/deal_card.png" />
                <div className={styles.privateCardOverLay}>
                    <div className={`${styles.lockImg} ${showBtn == index ? styles.hidden : styles.visible
                        }`}>
                        <img src="lock-deal.png" />
                    </div>

                    <div className={`${styles.loginBtnContainer} ${!showBtn == index ? styles.hidden : styles.visible}`} onClick={handleSigninOpen}>
                        <div className={styles.loginBtnNew}>
                            Login to Explore Private Deal <ArrowUpRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        )

    }


    const [currPage, setCurrPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const hasMoreRef = useRef(null);



    useEffect(() => {
        async function fetchDeals() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=50&page=${currPage}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`,
                        },
                    }
                );

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data = await res.json();

                setAllDeals((prev) =>
                    currPage === 1 ? data.data : [...prev, ...data.data]
                );

                setHasMore(
                    data.pagination.totalRecords >
                    (currPage - 1) * 50 + data.data.length
                );
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
                setLoadMore(false)
            }
        }

        fetchDeals();
    }, [currPage, authToken]);


    useEffect(() => {
        if (!hasMore) return; // stop if no more pages
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    setCurrPage((prev) => prev + 1);
                    setLoadMore(true)
                }
            },
            { threshold: 1.0 } // triggers when fully visible
        );

        if (hasMoreRef.current) observer.observe(hasMoreRef.current);

        return () => {
            if (hasMoreRef.current) observer.unobserve(hasMoreRef.current);
        };
    }, [hasMore, loading]);




    if (loading) {
        return <Loader />;
    }
    // if (!allDeals || allDeals.length == 0) {
    //     return <div>No deals currently available.</div>;
    // }


    return (
        <>
            <div className={styles.AllDealsMainContainer}>
                <section className={`${styles.DealsTalkMainContainer} ${stylesdeals.DealsTalkMainContainer}`} >
                    <div className={`${styles.DealsTalkHeading} ${styles.allDealsHead}`}>
                        <span className={styles.SpanDealsTalkHeading}>All Deals</span>
                        <p>Explore and analyse upcoming Public and Private deals</p>
                    </div>

                    <div className={`${styles.carouselWrapper} carouselWrapper`}>
                        <div className={`row g-3 ${styles.dealsRow}`}>
                            {allDeals?.map((deal, index) => (
                                <div key={deal.id} className="col-lg-4 col-md-6 col-sm-12">
                                    {(deal?.deal_type == 'private' || deal?.deal_type == 'ccps' || deal?.deal_type == 'ofs') ? !authToken ? renderHiddenCard(index + 1) :
                                        renderPrivateCard(deal) : deal?.deal_type === 'public' ?
                                        renderPublicCard(deal) : renderHiddenCard(index + 1)
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                    {
                        hasMore && loadMore &&
                        <LoadMoreLoader />
                    }
                    {hasMore && <div ref={hasMoreRef} style={{ height: "1px" }} >
                    </div>}
                </section>
            </div>
              {showSignin && (
                           <SigninPopup
                             show={showSignin}
                             onHide={() => setShowSignin(false)}
                             onShowOtp={handleSigninShowOtp}
                             onShowSignUp={() => {
                               setShowSignin(false);
                               setShowSignupType(true);
                             }}
                           />
                         )}
                   
                         {/* SIGN UP TYPE */}
                         {showSignupType && (
                           <SignupTypePopup
                             show
                             onHide={() => setShowSignupType(false)}
                             onProceed={() => {
                               setShowSignupType(false);
                               setShowSignupForm(true);
                             }}
                             onBack={() => {
                               setShowSignupType(false);
                               setShowSignin(true);
                             }}
                           />
                         )}
                   
                         {/* SIGN UP FORM */}
                         {showSignupForm && (
                           <SignupFormPopup
                             show
                             onHide={() => setShowSignupForm(false)}
                             onBack={() => {
                               setShowSignupForm(false);
                               setShowSignupType(true);
                             }}
                             onShowOtp={handleSignupShowOtp}
                           />
                         )}
                   
                         {/* OTP POPUP (NO showOtp FLAG) */}
                      {otpPayload && (
                        <OtpPopup
                          {...otpPayload}
                          show
                          handleClose={closeOtp}
                          handleBack={() => {
                            const flow = otpPayload.flow;
                            closeOtp();
                            flow === "signin"
                              ? setShowSignin(true)
                              : setShowSignupForm(true);
                          }}
                          onVerified={() => {
                            closeOtp();
                          }}
                        />
                      )}
        </>

    );
}

export default function AllDeals() {
    return (
        <Suspense fallback={<Loader />}>
            <AllDealsContent />
        </Suspense>
    );
} 
