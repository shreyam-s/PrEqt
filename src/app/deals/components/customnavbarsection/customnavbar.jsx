import React, { useState, useEffect, useRef } from "react";
import { Tab, Tabs, Fade } from "react-bootstrap";
import { useDealStore } from "@/store/dealStore";
import Overview from "./overview/overview";
import Fundamentals from "./fundamentals/fundamentals";
import Keyfinancials from "./keyfinancials/keyfinancials";
import Industry from "./industry/industry";
import Business from "./business/Business";
import Shareholding from "./fundraise/Shareholding";
import Documentation from "./documentation/page";
import "./customnavbar.css";

const Customnavbar = ({ isPrivateDeal, isccps }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data || {};

  const [key, setKey] = useState("Overview");
  const tabsRef = useRef(null);
  const [firstLoad, setFirstLoad] = useState(true);

  const contentRefs = {
    Overview: useRef(null),
    Business: useRef(null),
    "Industry Overview": useRef(null),
    "Financial Highlights": useRef(null),
    "Fundraise/Future Plans": useRef(null),
    Documentation: useRef(null),
  };

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      return
    }
    const activeTab = tabsRef.current?.querySelector(".nav-link.active");
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }

    const activeContent = contentRefs[key]?.current;
    if (activeContent) {
      const navbarHeight = tabsRef.current?.offsetHeight || 0;
      const topOffset =
        activeContent.getBoundingClientRect().top +
        window.scrollY -
        navbarHeight;

      window.scrollTo({
        top: topOffset,
        behavior: "smooth",
      });
    }
  }, [key]);

  return (
    <div className="first-navbar">
      <Tabs
        id="carousel-tabs"
        ref={tabsRef}
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="navigation-tabs"
        transition={Fade}
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="Overview" title="Overview">
          <div ref={contentRefs["Overview"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Overview isPrivateDeal={isPrivateDeal} />
          </div>
        </Tab>

        <Tab eventKey="Business" title="Business">
          <div ref={contentRefs["Business"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Business isPrivateDeal={isPrivateDeal} />
          </div>
        </Tab>

        <Tab eventKey="Industry Overview" title="Industry Overview">
          <div ref={contentRefs["Industry Overview"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Industry isPrivateDeal={isPrivateDeal} />
          </div>
        </Tab>

        <Tab eventKey="Financial Highlights" title="Financial Highlights">
          <div ref={contentRefs["Financial Highlights"]} className="tab-content-wrapper" style={{ minHeight: '100vh' }}>
            <Keyfinancials isPrivateDeal={isPrivateDeal} />
          </div>
        </Tab>

        <Tab eventKey="Fundraise/Future Plans" title="Fundraise/Future Plans">
          <div ref={contentRefs["Fundraise/Future Plans"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Shareholding isPrivateDeal={isPrivateDeal} isccps = {isccps}/>
          </div>
        </Tab>

        <Tab eventKey="Documentation" title="Documentation">
          <div ref={contentRefs["Documentation"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Documentation isPrivateDeal={isPrivateDeal} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Customnavbar;