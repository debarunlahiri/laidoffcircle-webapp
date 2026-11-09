"use client";
import { useState } from "react";
import { api, apiMessage, invalidate, queryPath } from "@/lib/api";
import type {
  ApiReferral,
  ApiReferralRequest,
  ReferralFeedback,
  ReferralLevel,
  ReferralWorkMode,
} from "@/lib/api-types";
import { toOpportunity } from "@/lib/referral-mapper";
import type { ReferralOpportunity } from "@/types";
import { useConfirm } from "@/providers/confirm-provider";
import { useApiList, useDebouncedValue } from "./use-api-resource";
export function useReferrals(
  notify: (message: string) => void,
  search: string,
) {
  const confirm = useConfirm();
  const [referralSaving, setReferralSaving] = useState(false);
  const [requestReferralId, setRequestReferralId] = useState<string | null>(
    null,
  );
  const [pending, setPending] = useState<string[]>([]);
  const [requestTarget, setRequestTarget] =
    useState<ReferralOpportunity | null>(null);
  const [requestSending, setRequestSending] = useState(false);
  // Latest vote totals returned by the API, shown until the list reloads.
  const [feedback, setFeedback] = useState<
    Record<
      string,
      {
        myFeedback: ReferralFeedback | null;
        helpfulCount: number;
        notHelpfulCount: number;
      }
    >
  >({});
  const debouncedSearch = useDebouncedValue(search);
  const list = useApiList<ApiReferral>(
    queryPath("/referrals", { search: debouncedSearch, status: "all" }),
    60000,
  );
  const requests = useApiList<ApiReferralRequest>(
    requestReferralId ? `/referrals/${requestReferralId}/requests` : null,
  );
  const opportunities: ReferralOpportunity[] = list.data.map(toOpportunity);
  const requested = opportunities
    .filter((item) => item.requestStatus)
    .map((item) => item.id!);
  async function act(id: string, action: () => Promise<unknown>) {
    if (pending.includes(id)) return;
    setPending((current) => [...current, id]);
    try {
      await action();
      invalidate("referrals", "notifications");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setPending((current) => current.filter((item) => item !== id));
    }
  }
  async function addReferral(fields: {
    company: string;
    title: string;
    location: string;
    skills: string;
    description: string;
    companyLink: string;
    jobLink: string;
    workMode: ReferralWorkMode;
    level: ReferralLevel | null;
    minExperience: number | null;
    requestFields: {
      label: string;
      type: string;
      required: boolean;
      options: string[];
    }[];
  }) {
    if (referralSaving) return false;
    setReferralSaving(true);
    try {
      await api("/referrals", {
        method: "POST",
        body: { ...fields, companyId: fields.company },
      });
      invalidate("referrals");
      notify("Your referral opportunity has been added.");
      return true;
    } catch (error) {
      notify(apiMessage(error));
      return false;
    } finally {
      setReferralSaving(false);
    }
  }
  async function uploadDocument(file: File) {
    const body = new FormData();
    body.append("document", file);
    return api<{ id: string; name: string; size: number }>(
      "/referrals/documents",
      { method: "POST", body },
    );
  }
  async function submitRequest(
    id: string,
    payload: {
      message: string;
      answers: Record<string, string>;
      documents: Record<string, string>;
    },
  ) {
    if (requestSending) return false;
    setRequestSending(true);
    try {
      await api(`/referrals/${id}/requests`, { method: "POST", body: payload });
      invalidate("referrals", "notifications");
      setRequestTarget(null);
      notify("Referral request sent.");
      return true;
    } catch (error) {
      notify(apiMessage(error));
      return false;
    } finally {
      setRequestSending(false);
    }
  }
  async function rateReferral(id: string, helpful: boolean | null) {
    try {
      const result = await api<{
        myFeedback: ReferralFeedback | null;
        helpfulCount: number;
        notHelpfulCount: number;
      }>(`/referrals/${id}/feedback`, {
        method: helpful === null ? "DELETE" : "PUT",
        body: helpful === null ? undefined : { helpful },
      });
      setFeedback((current) => ({ ...current, [id]: result }));
      invalidate("referrals");
    } catch (error) {
      notify(apiMessage(error));
    }
  }
  return {
    requestTarget,
    setRequestTarget,
    requestSending,
    submitRequest,
    uploadDocument,
    referralFeedback: feedback,
    rateReferral,
    withdrawRequest: async (id: string) => {
      if (
        !(await confirm({
          title: "Withdraw your request?",
          message: "The referrer will no longer see your request.",
          confirmLabel: "Withdraw",
          tone: "danger",
        }))
      )
        return;
      return act(id, async () => {
        await api(`/referrals/${id}/requests`, { method: "DELETE" });
        notify("Your request was withdrawn.");
      });
    },
    deleteReferral: async (id: string) => {
      if (
        !(await confirm({
          title: "Delete this referral?",
          message: "This permanently removes it, along with its requests.",
          confirmLabel: "Delete referral",
          tone: "danger",
        }))
      )
        return;
      return act(id, async () => {
        await api(`/referrals/${id}`, { method: "DELETE" });
        notify("Referral removed.");
      });
    },
    opportunities,
    requested,
    referralSaving,
    addReferral,
    requestReferralId,
    setRequestReferralId,
    referralRequests: requests.data,
    referralRequestsLoading: requests.loading,
    referralRequestsError: requests.error,
    referralRequestsHasMore: requests.hasMore,
    loadMoreReferralRequests: requests.loadMore,
    referralPending: pending,
    setReferralStatus: (id: string, status: "open" | "closed") =>
      act(id, () =>
        api(`/referrals/${id}`, { method: "PATCH", body: { status } }),
      ),
    decideReferral: (userId: string, status: "accepted" | "declined") =>
      requestReferralId
        ? act(userId, () =>
            api(`/referrals/${requestReferralId}/requests/${userId}`, {
              method: "PATCH",
              body: { status },
            }),
          )
        : Promise.resolve(),
    referralsLoading: list.loading,
    referralsError: list.error,
    referralsHasMore: list.hasMore,
    loadMoreReferrals: list.loadMore,
  };
}
