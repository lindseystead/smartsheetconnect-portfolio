/**
 * Analytics Component
 *
 * Dynamically injects analytics scripts based on configuration
 * from the setup wizard.
 *
 * @author Lindsey Stead
 * @module client/components/Analytics
 */

import { useEffect } from "react";
import { useAppConfig } from "@/hooks/useAppConfig";

export function Analytics(): null {
  const { data: config } = useAppConfig();
  const analytics = config?.analytics;

  useEffect(() => {
    // Track injected scripts for cleanup
    const injectedScripts: HTMLScriptElement[] = [];
    const injectedNoscripts: HTMLElement[] = [];

    // Google Analytics (GA4)
    if (analytics?.googleAnalyticsId) {
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}`;
      document.head.appendChild(script1);
      injectedScripts.push(script1);

      const script2 = document.createElement("script");
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${analytics.googleAnalyticsId}');
      `;
      document.head.appendChild(script2);
      injectedScripts.push(script2);
    }

    // Google Tag Manager
    if (analytics?.googleTagManagerId) {
      const script1 = document.createElement("script");
      script1.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${analytics.googleTagManagerId}');
      `;
      document.head.appendChild(script1);
      injectedScripts.push(script1);

      const noscript = document.createElement("noscript");
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${analytics.googleTagManagerId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.appendChild(noscript);
      injectedNoscripts.push(noscript);
    }

    // Facebook Pixel
    if (analytics?.facebookPixelId) {
      const script = document.createElement("script");
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${analytics.facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
      injectedScripts.push(script);

      const noscript = document.createElement("noscript");
      noscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${analytics.facebookPixelId}&ev=PageView&noscript=1"/>
      `;
      document.body.appendChild(noscript);
      injectedNoscripts.push(noscript);
    }

    // LinkedIn Insight Tag
    if (analytics?.linkedinInsightTag) {
      const script = document.createElement("script");
      script.innerHTML = `
        _linkedin_partner_id = "${analytics.linkedinInsightTag}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
      `;
      document.head.appendChild(script);
      injectedScripts.push(script);

      const script2 = document.createElement("script");
      script2.async = true;
      script2.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      document.head.appendChild(script2);
      injectedScripts.push(script2);
    }

    // Custom Analytics Script
    // SECURITY WARNING: This executes user-provided JavaScript code.
    // Only allow trusted scripts. Consider using Content Security Policy (CSP)
    // to restrict script execution in production.
    if (analytics?.customAnalyticsScript) {
      // Basic validation: check for obviously dangerous patterns
      const scriptContent = analytics.customAnalyticsScript.trim();

      // Reject empty scripts
      if (!scriptContent) {
        console.warn("Custom analytics script is empty, skipping");
      } else {

      // Basic safety checks (non-exhaustive - CSP should be used for production)
      const dangerousPatterns = [
        /eval\s*\(/i,
        /Function\s*\(/i,
        /document\.write\s*\(/i,
        /innerHTML\s*=/i,
        /outerHTML\s*=/i,
      ];

        const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(scriptContent));
        if (hasDangerousPattern) {
          console.error("Custom analytics script contains potentially dangerous patterns, rejecting");
        } else {
          const script = document.createElement("script");
          script.innerHTML = scriptContent;
          script.setAttribute("data-custom-analytics", "true");
          document.head.appendChild(script);
          injectedScripts.push(script);
        }
      }
    }

    // Cleanup function
    return () => {
      // Remove injected scripts if component unmounts or config changes
      // Note: Analytics scripts typically persist intentionally, but we clean up
      // to prevent duplicates if config changes
      injectedScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      injectedNoscripts.forEach(noscript => {
        if (noscript.parentNode) {
          noscript.parentNode.removeChild(noscript);
        }
      });
    };
  }, [analytics]);

  return null;
}

