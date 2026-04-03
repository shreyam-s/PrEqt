"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import styles from "./page.module.css";
import Overview from "../../customnavbarsection/overview/overview";
import Business from "../../customnavbarsection/business/Business";
import Industry from "../../customnavbarsection/industry/industry";
import Keyfinancials from "../../customnavbarsection/keyfinancials/keyfinancials";
import Shareholding from "../../customnavbarsection/fundraise/Shareholding";
import Documentation from "../../customnavbarsection/documentation/page";
import { useDealStore } from "@/store/dealStore";


const sectionComponents = {
  overview: Overview,
  business: Business,
  financial: Keyfinancials,
  industry: Industry,
  fundraise: Shareholding,
  documentation: Documentation
};

export default function PrivateDealDetails({ isPrivateDeal }) {
  const [activeSection, setActiveSection] = useState(null);
  const sectionRefs = useRef({});
  const manualScrollRef = useRef(false);
  const rafRef = useRef(null);
  const manualRafRef = useRef(null);
  const cancelListenersRef = useRef(null);
  const manualMaxTimeoutRef = useRef(null);
  const dealDetails = useDealStore((state) => state.dealDetails);

  // ✅ Filter only valid sections based on API response
  const sections = useMemo(() => {
    const data = dealDetails?.data || {};
    return [
      data.deal_overview?.status && { id: "overview", label: "Overview" },
      data.business?.status && { id: "business", label: "Business" },
      data.financial_highlights?.status && {
        id: "financial",
        label: "Financial Highlights"
      },
      data.industry_overview?.status && {
        id: "industry",
        label: "Industry Overview"
      },
      data.fundraise_future_plans?.status && {
        id: "fundraise",
        label: "Fundraise/Future Plans"
      },
      data.deal_documents?.status && {
        id: "documentation",
        label: "Documentation"
      }
    ].filter(Boolean); // remove false or undefined sections
  }, [dealDetails]);

  // Initialize first active section when sections are ready
  useEffect(() => {
    if (sections.length > 0) {
      setActiveSection(sections[0].id);
    }
  }, [sections]);

  const getTriggerOffset = () => {
    const menuEl = document.querySelector(`.${styles.respectedMenu}`);
    if (menuEl) {
      const styleTop = parseFloat(getComputedStyle(menuEl).top) || 0;
      return styleTop + 50;
    }
    return 100;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (manualScrollRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const offset = getTriggerOffset();
        let current = sections[0]?.id;

        for (let i = 0; i < sections.length; i++) {
          const s = sections[i];
          const el = sectionRefs.current[s.id];
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (top - offset <= 0) current = s.id;
          else break;
        }

        if (
          window.innerHeight + window.scrollY >=
          document.body.scrollHeight - 2
        ) {
          current = sections[sections.length - 1]?.id;
        }

        setActiveSection((prev) => (prev !== current ? current : prev));
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (manualMaxTimeoutRef.current) {
        clearTimeout(manualMaxTimeoutRef.current);
        manualMaxTimeoutRef.current = null;
      }
    };
  }, [sections]);

  useEffect(() => {
    const ul = document.querySelector(`.${styles.respectedMenu} ul`);
    const li = ul?.querySelector(`.${styles.active}`);
    if (li && ul) {
      ul.style.setProperty("--indicator-top", `${li.offsetTop}px`);
      ul.style.setProperty("--indicator-height", `${li.offsetHeight}px`);
    }
  }, [activeSection]);

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    
    // Clear any existing timeout
    if (manualMaxTimeoutRef.current) {
      clearTimeout(manualMaxTimeoutRef.current);
    }
    
    const offset = getTriggerOffset();
    const elementTop = el.getBoundingClientRect().top + window.scrollY;
    const scrollTarget = Math.max(0, elementTop - offset + 30);
    manualScrollRef.current = true;
    setActiveSection(id);
    window.scrollTo({ top: scrollTarget, behavior: "smooth" });
    
    // Reset manual scroll flag after scroll animation completes
    // Smooth scroll typically takes 500-1000ms, using 1000ms to be safe
    manualMaxTimeoutRef.current = setTimeout(() => {
      manualScrollRef.current = false;
      manualMaxTimeoutRef.current = null;
    }, 1000);
  };

  return (
    <div
      className={
        isPrivateDeal ? styles.privateDealDetails : styles.publicDealDetails
      }
    >
      {/* Left Content */}
      <div className={styles.respectedDetails}>
        {sections.map((section) => {
          const Component = sectionComponents[section.id];
          return (
            <div
              key={section.id}
              id={section.id}
              ref={(el) => (sectionRefs.current[section.id] = el)}
              className={styles.section}
            >
              <h2 className={styles.detailslabel}>{section.label}</h2>
              {Component ? (
                <Component isPrivateDeal={isPrivateDeal} />
              ) : (
                <p>Missing component for {section.label}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Sticky Menu */}
      {sections.length > 0 && (
        <div className={styles.respectedMenu}>
          <ul>
            {sections.map((section) => (
              <li
                key={section.id}
                className={activeSection === section.id ? styles.active : ""}
                onClick={() => scrollToSection(section.id)}
              >
                <span data-label={section.label}>{section.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
