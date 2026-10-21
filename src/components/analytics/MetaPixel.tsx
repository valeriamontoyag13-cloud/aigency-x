"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, trackStandard } from "@/lib/metaPixel";
import { rememberAdOrigin } from "@/lib/adOrigin";

/**
 * Loads the Meta Pixel (only when there is an ID) and counts each page seen.
 * Any click on a link to our WhatsApp counts as "Contact", wherever it is.
 * autoConfig off: the pixel doesn't read buttons or form fields by itself, so
 * Meta only gets the events we send (privacy policy, section 12).
 */
export function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);

  // Which ad brought the visitor, so the lead can say it (works with or without the pixel).
  useEffect(() => {
    rememberAdOrigin();
  }, []);

  // The first page view goes with the snippet; later ones are client-side navigations.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    trackStandard("PageView");
  }, [pathname]);

  useEffect(() => {
    if (!META_PIXEL_ID) return;
    function onClick(event: MouseEvent) {
      const link = (event.target as HTMLElement | null)?.closest?.("a[href]");
      if (link && /api\.whatsapp\.com|wa\.me/.test(link.getAttribute("href") ?? "")) trackStandard("Contact");
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!META_PIXEL_ID) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('set','autoConfig',false,'${META_PIXEL_ID}');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
    </Script>
  );
}
