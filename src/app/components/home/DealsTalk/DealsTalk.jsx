"use client";
import styles from "./DealsTalk.module.css";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Loader from "../../Loader";
import Cookies from "js-cookie";
import { formatDate } from "@/app/utils/FormatDate";

function DealsTalkContent() {
    const swiperRef = useRef(null);
    const searchParams = useSearchParams();
    const dealId = searchParams?.get("dealId");
    const accessToken = Cookies.get('accessToken');
    const [qaCounts, setQaCounts] = useState({});
    const [replies, setReplies] = useState({}); // Store replies per dealId: { [dealId]: data }
    const [countLoading, setCountLoading] = useState(false);
    const [countError, setCountError] = useState(false);
    const [swiperReady, setSwiperReady] = useState(false);
    const [hasMoreSlides, setHasMoreSlides] = useState(false);


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


    // Define deals data to check if deal is private
    const dealsConfig = {
        "1": { deal: "public" },
        "2": { deal: "private" },
        "3": { deal: "private" },
        "4": { deal: "private" }
    };

    const isPrivateDeal = dealId && dealsConfig[dealId]?.deal === "private";

    // Custom arrow components (use a button for accessibility and reliable clicks)
    const NextArrow = () => (
        <button
            type="button"
            className={styles.customNextArrow}
            aria-label="Next slide"
            onClick={() => {
                if (swiperRef.current && swiperRef.current.swiper) {
                    swiperRef.current.swiper.slideNext();
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (swiperRef.current && swiperRef.current.swiper) {
                        swiperRef.current.swiper.slideNext();
                    }
                }
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                <path d="M9 18.168L15 12.168L9 6.16797" stroke="#7E60FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );

    const dealsData = [
        {
            id: 1,
            type: "SME-IPO",
            category: "Logistics",
            companyLogo: "/assets/pictures/acmpl.svg",
            companyName: "Ashwini Container Movers Limited ",
            description: "Ashwini Container Movers Limited is a commercial/container transport & logistics company headquartered in Navi Mumbai.",
            stats: {
                revenue: "₹94.1Cr",
                pat: "₹11.5 Cr",
                patMultiple: "₹11.5 Cr",
                cagrGrowth: "17% ( FY'22-FY'25)",
                roe: "75.9%(FY'25)",
                issueDate: "21-05-2026"
            },
            merchantBanker: "Corporate Professionals",
            deal: "public"
        },
        {
            id: 2,
            type: "Pre IPO- SME",
            category: "Solar Energy",
            companyLogo: "/assets/pictures/hvr.svg",
            companyName: "HVR Solar Pvt Ltd",
            description: "India’s leading solar module manufacturer powering the green revolution.",
            stats: {
                revenue: "₹75 Cr",
                revenue2: "₹101 Cr",
                expectedListing: "-",
                pat: "7.0 Cr",
                peMultiple: "10.7x"
            },
            progress: {
                current: "0Cr / 15Cr",
                percentage: "94%"
            },
            tags: ["Strong promoter", "Clear Monetization", "Fund Participating"],
            deal: "private"
        },
    ];

    const [allTopDeals, setAllTopDeals] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFetchTopDeals = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_BASE}/admin/api/deals/all-deals?limit=20`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${accessToken}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAllTopDeals(data.data || []);
            } else {
                console.log("Failed to fetch top deals");
            }
        } catch (error) {
            console.log("Error fetching top deals:", error);
        }

    }

    useEffect(() => {
        handleFetchTopDeals()
    }, [])

    useEffect(() => {
        if (allTopDeals.length === 0) return;

        allTopDeals.forEach((deal) => {
            fetchRepliesCount(deal.id, deal.deal_type === "private" || deal.deal_type === "ccps");
        });

        // Check if there are more slides after deals are loaded
        if (swiperRef.current && swiperRef.current.swiper) {
            setTimeout(() => {
                checkIfHasMoreSlides();
            }, 100);
        }
    }, [allTopDeals]);

    const checkIfHasMoreSlides = () => {
        if (swiperRef.current && swiperRef.current.swiper && allTopDeals.length > 0) {
            const swiper = swiperRef.current.swiper;
            // For loop mode, check if total slides are more than what can be displayed
            // For non-loop mode, check isEnd
            if (swiper.params.loop) {
                // With loop enabled, check if actual slides count is greater than slidesPerView
                const slidesPerView = swiper.params.slidesPerView;
                // Use the actual deals count (allTopDeals.length) instead of counting DOM elements
                // Compare with slidesPerView directly (can be decimal like 1.5, 2.3, etc.)
                // If we have more slides than can be displayed, show the arrow
                setHasMoreSlides(allTopDeals.length > slidesPerView);
            } else {
                setHasMoreSlides(!swiper.isEnd);
            }
        }
    };

    useEffect(() => {
        const handleResize = () => {
            // Check again on resize since breakpoints change slidesPerView
            if (swiperRef.current && swiperRef.current.swiper) {
                setTimeout(() => {
                    checkIfHasMoreSlides();
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize Swiper navigation after swiper + custom button have mounted
    useEffect(() => {
        if (!swiperRef.current || !swiperRef.current.swiper) return;
        const swiper = swiperRef.current.swiper;
        const nextSelector = `.${styles.customNextArrow}`;

        // Ensure navigation params exist and point to our custom button
        swiper.params.navigation = swiper.params.navigation || {};
        swiper.params.navigation.nextEl = nextSelector;

        // Destroy existing navigation if present, then init/update so it finds our button
        if (swiper.navigation && swiper.navigation.destroy) {
            try {
                swiper.navigation.destroy();
            } catch (e) {
                // ignore
            }
        }

        if (swiper.navigation && swiper.navigation.init) {
            swiper.navigation.init();
            swiper.navigation.update();
        }
    }, [swiperReady, hasMoreSlides]);


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
        if (!liveAt) return 0;
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

    const renderPublicCard = (deal) => (
        <Link href={`/deals/${deal.slug}`} className={styles.cardLink}>
            <div className={styles.cardContainer1}>
                <div className={styles.cardInnerSections}>
                    <article className={styles.cardIPOsection}>
                        {deal?.tags?.length > 0 && deal?.tags?.map((data, idx) => (
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
                                <p className={styles.priceInRupee}>{formatDate(deal.offer_date_from)}</p>
                            </article>
                        </section>
                    </div>
                    <div className={styles.publicpromoter}>
                        {deal?.key_highlights?.map((tag, index) => (
                            <div key={index} className={index === 0 ? styles.Strong : styles.monetization}>
                                <p>{tag}</p>
                            </div>
                        ))}
                    </div>

                    <section className={styles.merchantMainContainer}>
                        {deal.merchant_banker_appointed && <div className={styles.merchantBanker}>
                            <p className={styles.bankMerchant}>{deal.merchant_banker_appointed}</p>
                        </div>}
                    </section>
                </div>

                <div className={styles.cardFooterMainContainer}>
                    <div className={styles.QandA}>
                        <div className={styles.QandAstats}>
                            {qaCounts[deal.id] > 0
                                ? `${qaCounts[deal.id]} ${daysUntilLive(deal?.createdAt)} days`
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
        <Link href={`/deals/${deal.slug}`} className={styles.cardLink}>
            <div className={styles.card2Container}>
                {(deal?.deal_type === 'ofs' || deal?.deal_type === 'private' || deal?.deal_type === 'ccps') && deal?.exclusive_deal === true && (
                    <img src="/ofsdealGradient.svg" alt="exclusive deal gradient" className={styles.ofsGradient} />
                )}
                <div className={styles.card2InnerSections}>
                    <article className={styles.card2IPOsection}>
                        {(deal?.deal_type === 'ofs' || deal?.deal_type === 'OFS') && (
                            <div className={styles.ofsDefaultTag}>
                                <p className={styles.ofsDefaultTagText}>Unlisted Shares</p>
                            </div>
                        )}
                        {deal?.tags?.length > 0 && deal?.tags?.map((data, idx) => (
                            <div className={styles.card2IPOtag} key={idx}>
                                <p className={styles.card2IPOtext}>{data}</p>
                            </div>
                        ))}
                    </article>

                    {/* <p className={styles.para} style={{ marginBottom: "6px", width: "95%" }}>
                        {deal.short_desc}
                    </p> */}

                    {/* Exclusive Tag */}
                    {deal?.exclusive_deal === true && (
                        <div className={styles.exclusiveTagWrapperofs}>
                            <img 
                                src={"/exclusiveofstag.svg" } 
                                alt="Exclusive Deal" 
                                className={ styles.exclusiveTagImageofs} 
                            />
                        </div>
                    )}

                    <div className={styles.card2CompanySection}>
                        <CompanyLogo
                            path={deal?.company_logo?.[0]?.path}
                            alt={deal?.company_name}
                            className={styles.anthemPicture}
                        />
                        <p className={styles.card2CompanyName}>{deal?.company_name || ""}</p>
                    </div>

                    {deal?.deal_type !== 'ofs' && deal?.deal_type !== 'OFS' && (
                        <p className={styles.card2Description}>{deal?.tag_line || ""}</p>
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
                        <div className={styles.card2StatsContainer}>
                            <section className={styles.card2StatsRow}>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>{deal?.deal_type === "ofs" ? "Market Cap" : "Valuation"}</p>
                                    <p className={styles.card2StatValue}> {typeof deal?.valuation_in_cr === "number"
                                        ? ` ₹${Math.round(deal.valuation_in_cr)} Cr`
                                        : "TBD"}</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>Revenue (FY'25)</p>
                                    <p className={styles.card2StatValue}>₹{deal?.revenue_fy25_in_cr || 0} Cr</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>Expected listing </p>
                                    <p className={styles.card2StatValue}>{formatDate(deal?.listing_timeline)}</p>
                                </article>
                            </section>
    
                            <section className={styles.card2StatsRow}>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>PAT (FY'25)</p>
                                    <p className={styles.card2StatValue}>₹{deal?.pat_fy25_in_cr || 0} Cr</p>
                                </article>
                                <article className={styles.card2Stat}>
                                    <p className={styles.card2StatHeading}>P/E Multiple</p>
                                    <p className={styles.card2StatValue}>{deal?.pe_multiple || "TBD"} {deal?.pe_multiple ? "X" : ""}</p>
                                </article>
                            </section>
                        </div>
                    )}

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

    return (
        <section className={`${styles.DealsTalkMainContainer} ${isPrivateDeal ? styles.privateDealTheme : ''}`}>
            <div className={`${styles.DealsTalkHeading} ${styles.homeTalkingHeading}`}>
                Deals People Are <span className={`${styles.SpanDealsTalkHeading} ${styles.homeTalkingHeadingText}`}>Talking About </span>
            </div>

            <div className={`${styles.carouselWrapper} carouselWrapper`}>
                <Swiper
                    ref={swiperRef}
                    onSwiper={(swiper) => {
                        // Store swiper instance for easier access
                        if (swiperRef.current && !swiperRef.current.swiper) {
                            swiperRef.current.swiper = swiper;
                        }
                        setSwiperReady(true);
                        // Check if there are more slides initially
                        setTimeout(() => {
                            checkIfHasMoreSlides();
                        }, 100);
                    }}
                    onSlideChange={(swiper) => {
                        // Update state when slide changes
                        checkIfHasMoreSlides();
                    }}
                    onResize={(swiper) => {
                        // Update state when swiper resizes (breakpoint changes)
                        checkIfHasMoreSlides();
                    }}
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    // wire navigation to our custom next button (class selector)
                    navigation={{ nextEl: `.${styles.customNextArrow}` }}
                    pagination={false}
                    // disable looping as requested
                    loop={false}
                    autoplay={false}
                    breakpoints={{
                        0: {
                            slidesPerView: 1,
                        },
                        400: {
                            slidesPerView: 1,
                        },
                        480: {
                            slidesPerView: 1,
                        },
                        640: {
                            slidesPerView: 1,
                        },
                        769: {
                            slidesPerView: 1,
                        },
                        1025: {
                            slidesPerView: 1,
                        },
                        1133: {
                            slidesPerView: 2,
                        },
                        1380: {
                            slidesPerView: 2,
                        },
                        1520: {
                            slidesPerView: 3,
                        },
                        1730: {
                            slidesPerView: 3,
                        },

                    }}
                    className={styles.dealsSwiper}
                >
                    {allTopDeals.map((deal, index) => (
                        <SwiperSlide key={deal.id}>
                            {deal.deal_type === "public" ? renderPublicCard(deal) : renderPrivateCard(deal)}
                        </SwiperSlide>
                    ))}
                </Swiper>
                {swiperReady && allTopDeals.length > 0 && hasMoreSlides && <NextArrow />}
            </div>
        </section>
    );
}

export default function DealsTalk() {
    return (
        <Suspense fallback={<Loader />}>
            <DealsTalkContent />
        </Suspense>
    );
}