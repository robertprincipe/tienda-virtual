"use server";

import { db } from "@/drizzle/db";
import { storeSettings } from "@/drizzle/schema";

export const getStorePolicies = async () => {
  const record = await db.query.storeSettings.findFirst({
    columns: {
      privacyPolicyHtml: true,
      termsHtml: true,
      shippingPolicyHtml: true,
      refundPolicyHtml: true,
    },
  });

  return (
    record ?? {
      privacyPolicyHtml: null,
      termsHtml: null,
      shippingPolicyHtml: null,
      refundPolicyHtml: null,
    }
  );
};

/**
 * Get public store information for contact and about pages
 */
export const getPublicStoreInfo = async () => {
  const record = await db.query.storeSettings.findFirst({
    columns: {
      companyName: true,
      legalName: true,
      email: true,
      phone: true,
      companyLine1: true,
      companyLine2: true,
      companyCity: true,
      companyRegion: true,
      companyPostalCode: true,
      companyCountryCode: true,
      logoUrl: true,
    },
  });

  return (
    record ?? {
      companyName: "S & P Soluciones Integrales",
      legalName: null,
      email: null,
      phone: null,
      companyLine1: null,
      companyLine2: null,
      companyCity: null,
      companyRegion: null,
      companyPostalCode: null,
      companyCountryCode: null,
      logoUrl: null,
    }
  );
};
