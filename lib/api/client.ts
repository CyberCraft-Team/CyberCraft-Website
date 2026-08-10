"use client";

import { apiFetch } from "./fetcher";

/**
 * Typed wrapper over the backend, through this app's BFF proxy.
 *
 * Every method used to take a `token` first argument that the caller read
 * out of localStorage. The session is now an HttpOnly cookie the browser
 * attaches automatically, so there is no token to pass and no method takes
 * one. Login and logout live in their own route handlers, because those are
 * the two places where the cookie is written.
 */

class ApiClient {
  // -- public ---------------------------------------------------------------

  getPublicServers() {
    return apiFetch<any>("public/servers/");
  }

  getStats() {
    return apiFetch<any>("public/stats/");
  }

  getNews() {
    return apiFetch<any>("public/news/");
  }

  getNewsItem(id: number | string) {
    return apiFetch<any>(`public/news/${id}/`);
  }

  getVotingSites() {
    return apiFetch<any>("public/voting/sites/");
  }

  getTopVoters() {
    return apiFetch<any>("public/voting/top/");
  }

  getSocialLinks() {
    return apiFetch<any>("public/social-links/");
  }

  getLauncherDownloads() {
    return apiFetch<any>("launcher/downloads/");
  }

  getRanks() {
    return apiFetch<any>("rewards/ranks/");
  }

  // -- registration and account recovery ------------------------------------

  /** Multipart: the skin PNG is mandatory. Goes to its own route handler. */
  async register(data: {
    username: string;
    email: string;
    password: string;
    skin: File;
    referral_code?: string;
  }) {
    const form = new FormData();
    form.append("username", data.username);
    form.append("email", data.email);
    form.append("password", data.password);
    form.append("skin", data.skin);
    if (data.referral_code) form.append("referral_code", data.referral_code);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: form,
      credentials: "same-origin",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (payload && (payload.error || JSON.stringify(payload.errors))) ||
          "Ro'yxatdan o'tish amalga oshmadi",
      );
    }
    return payload;
  }

  requestPasswordReset(email: string) {
    return apiFetch<any>("auth/password-reset/", { method: "POST", json: { email } });
  }

  confirmPasswordReset(resetToken: string, newPassword: string) {
    return apiFetch<any>("auth/password-reset/confirm/", {
      method: "POST",
      json: { token: resetToken, password: newPassword },
    });
  }

  verifyEmail(verificationToken: string) {
    return apiFetch<any>("auth/verify-email/confirm/", {
      method: "POST",
      json: { token: verificationToken },
    });
  }

  sendVerificationEmail() {
    return apiFetch<any>("auth/verify-email/send/", { method: "POST" });
  }

  changePassword(oldPassword: string, newPassword: string) {
    return apiFetch<any>("auth/launcher/change-password/", {
      method: "POST",
      json: { old_password: oldPassword, new_password: newPassword },
    });
  }

  // -- profile --------------------------------------------------------------

  uploadSkin(file: File) {
    const form = new FormData();
    form.append("skin", file);
    return apiFetch<any>("auth/launcher/skin/", { method: "POST", body: form });
  }

  uploadCape(file: File) {
    const form = new FormData();
    form.append("cape", file);
    return apiFetch<any>("auth/launcher/cape/", { method: "POST", body: form });
  }

  // -- rewards --------------------------------------------------------------

  getDailyBonusStatus() {
    return apiFetch<any>("rewards/daily-bonus/status/");
  }

  claimDailyBonus() {
    return apiFetch<any>("rewards/daily-bonus/", { method: "POST" });
  }

  purchaseRank(rankId: number) {
    return apiFetch<any>("rewards/ranks/purchase/", {
      method: "POST",
      json: { rank_id: rankId },
    });
  }

  getReferralInfo() {
    return apiFetch<any>("rewards/referral/");
  }

  getCCTransactions() {
    return apiFetch<any>("rewards/transactions/");
  }

  // -- notifications --------------------------------------------------------

  getNotifications() {
    return apiFetch<any>("notifications/");
  }

  getNotificationUnreadCount() {
    return apiFetch<any>("notifications/unread-count/");
  }

  markNotificationRead(id: number) {
    return apiFetch<any>(`notifications/${id}/read/`, { method: "POST" });
  }

  markAllNotificationsRead() {
    return apiFetch<any>("notifications/read-all/", { method: "POST" });
  }

  // -- admin: social links --------------------------------------------------

  getAdminSocialLinks() {
    return apiFetch<any>("admin/social-links/");
  }

  createSocialLink(data: Record<string, unknown>) {
    return apiFetch<any>("admin/social-links/", { method: "POST", json: data });
  }

  updateSocialLink(id: number, data: Record<string, unknown>) {
    return apiFetch<any>(`admin/social-links/${id}/`, { method: "PATCH", json: data });
  }

  deleteSocialLink(id: number) {
    return apiFetch<any>(`admin/social-links/${id}/`, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
