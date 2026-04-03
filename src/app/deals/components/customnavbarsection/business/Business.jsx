"use client";
import React, { useState, useEffect } from "react";
import styles from "./Business.module.css";
import { ChevronDown } from "lucide-react";
import { Collapse } from "react-bootstrap";
import { useDealStore } from "@/store/dealStore";

// ✅ Reusable SafeImage component
const SafeImage = ({ src, alt, className, style }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        e.target.onerror = null;
        setIsVisible(false);
      }}
    />
  );
};

// ✅ Dropdown Component
const Dropdown = ({ title, children, isOpen, onToggle, isPrivateDeal }) => (
  <div className={styles.dropdown}>
    <div className={styles.header} onClick={() => onToggle(title)}>
      <h3 className={styles.title}>{title}</h3>
      <span className={`${styles.iconWrapper} ${isOpen ? styles.open : ""}`}>
        <ChevronDown size={24} color={isPrivateDeal ? "white" : "black"} />
      </span>
    </div>

    <Collapse in={isOpen} mountOnEnter unmountOnExit={false}>
      <div className={styles.content}>{children}</div>
    </Collapse>
  </div>
);

const Business = ({ isPrivateDeal }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const business = dealDetails?.data?.business;
  const companyName = dealDetails?.data?.deal_setpData?.company_name || "Company"; // ✅ Fallback for missing name

  const [openStates, setOpenStates] = useState({});
  useEffect(() => {
    if (business) {
      setOpenStates({
        "Products & Services": !!business?.products_and_services?.status,
        "Geographical Presence": !!business?.geographical_presence?.status,
        "Business Model": !!business?.business_model?.status,
        "Sales Channel": !!business?.sales_channel?.status,
        "Clients": !!business?.clients?.status,
      });
    }
  }, [business]);

  const toggleDropdown = (title) => {
    setOpenStates((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  if (!business) return null;

  return (
    <div
      className={`${styles.container} ${
        isPrivateDeal ? styles.privateDeal : ""
      }`}
    >
      {/* ✅ PRODUCTS & SERVICES */}
      {business?.products_and_services?.status && (
        <Dropdown
          title="Products & Services"
          isOpen={openStates["Products & Services"]}
          onToggle={toggleDropdown}
          isPrivateDeal={isPrivateDeal}
        >
          <div className={styles.clients}>
            {business?.products_and_services?.data?.map((item, index) => {
              const file = item.uploadedFileData;
              const imagePath = file?.path?.replace("public", "");
              const isImage = file?.mimeType?.startsWith("image/");
              const imageUrl = isImage
                ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${imagePath}`
                : "";

              // ✅ Updated alt tag: includes company name
              const altText = `${item.name || "Product"} - ${companyName}`;

              return (
                <div key={index} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <SafeImage
                      src={imageUrl}
                      alt={altText}
                      className={styles.cardImage}
                    />
                    <div className={styles.overlay}></div>
                    <div className={styles.productName}>{item.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Dropdown>
      )}

      <hr className={styles.hr} />

      {/* ✅ GEOGRAPHICAL PRESENCE */}
      {business?.geographical_presence?.status && (
        <Dropdown
          title="Geographical Presence"
          isOpen={openStates["Geographical Presence"]}
          onToggle={toggleDropdown}
          isPrivateDeal={isPrivateDeal}
        >
          {business.geographical_presence.data?.data?.map((item, index) => (
            <div key={index} className={styles.pTag}>
              <strong className={styles.strong}>{item.label_name}</strong>
              <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          ))}
        </Dropdown>
      )}

      <hr className={styles.hr} />

      {/* ✅ BUSINESS MODEL */}
      {business?.business_model?.status && (
        <Dropdown
          title="Business Model"
          isOpen={openStates["Business Model"]}
          onToggle={toggleDropdown}
          isPrivateDeal={isPrivateDeal}
        >
          <div
            className={styles.businessModal}
            dangerouslySetInnerHTML={{ __html: business.business_model.data }}
          />
        </Dropdown>
      )}

      <hr className={styles.hr} />

      {/* ✅ SALES CHANNEL (only for private deals) */}
      {business?.sales_channel?.status && (
        <>
          <Dropdown
            title="Sales Channel"
            isOpen={openStates["Sales Channel"]}
            onToggle={toggleDropdown}
            isPrivateDeal={isPrivateDeal}
          >
            <div
              className={styles.businessModal}
              dangerouslySetInnerHTML={{ __html: business.sales_channel.data }}
            />
          </Dropdown>

          <hr className={styles.hr} />
        </>
      )}

      {/* ✅ CLIENTS */}
      {business?.clients?.status &&
        Array.isArray(business.clients.data) &&
        business.clients.data.length > 0 && (
          <Dropdown
            title="Clients"
            isOpen={openStates["Clients"]}
            onToggle={toggleDropdown}
            isPrivateDeal={isPrivateDeal}
          >
            <div className={styles.clients}>
              {business?.clients.data.map((client, index) => {
                const file = client.uploadedFileData;
                const imagePath = file?.path?.replace("public", "");
                const isImage = file?.mimeType?.startsWith("image/");
                const imageUrl = isImage
                  ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${imagePath}`
                  : "/fallbackImages.png";

                // ✅ Updated alt tag for clients
                const altText = `${client.name || "Client"} - ${companyName}`;

                return (
                  <div key={index} className={styles.clientcardwrap}>
                    <SafeImage
                      src={imageUrl}
                      alt={altText}
                      className={styles.clientcardImage}
                    />
                    <div className={styles.clientName}>{client.name}</div>
                  </div>
                );
              })}
            </div>
          </Dropdown>
        )}
    </div>
  );
};

export default Business;
