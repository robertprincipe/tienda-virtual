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

  return record ?? {
    privacyPolicyHtml: null,
    termsHtml: null,
    shippingPolicyHtml: null,
    refundPolicyHtml: null,
  };
};
