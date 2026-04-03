"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ReCaptchaProviderWrapper({ children }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY || "6LezyRgsAAAAAOCQ0A9TsVlukuTUiWFl5WXuXbyu"}
      scriptProps={{ async: true, defer: true }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}

