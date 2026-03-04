const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    return headers;
  }

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers: {
        ...this.getAuthHeader(token),
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  async userLogin(username: string, password: string) {
    return this.fetch<import("./types").LoginResponse>(
      "/auth/launcher/login/",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
    );
  }

  async userLogout(token: string) {
    return this.fetch<{ message: string }>("/auth/launcher/logout/", {
      method: "POST",
      token,
    });
  }

  async getUserMe(token: string) {
    return this.fetch<{ user: import("./types").UserMinimal }>(
      "/auth/launcher/me/",
      { token },
    );
  }

  async adminLogin(username: string, password: string) {
    return this.fetch<import("./types").AdminLoginResponse>(
      "/auth/admin/login/",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
    );
  }

  async adminLogout(token: string) {
    return this.fetch<{ message: string }>("/auth/admin/logout/", {
      method: "POST",
      token,
    });
  }

  async getAdminMe(token: string) {
    return this.fetch<{ user: import("./types").AdminUser }>(
      "/auth/admin/me/",
      { token },
    );
  }

  async getServers(token?: string) {
    return this.fetch<import("./types").Server[]>("/launcher/servers/", {
      token,
    });
  }

  async getServerManifest(serverId: number, token: string) {
    return this.fetch<import("./types").ServerManifest>(
      `/servers/${serverId}/manifest/`,
      { token },
    );
  }

  async getPublicServers() {
    return this.fetch<import("./types").Server[]>("/public/servers/");
  }

  async getStats() {
    return this.fetch<import("./types").Stats>("/public/stats/");
  }

  async getNews() {
    return this.fetch<import("./types").News[]>("/public/news/");
  }

  async getVotingSites() {
    return this.fetch<import("./types").VotingSite[]>("/public/voting/sites/");
  }

  async getTopVoters() {
    return this.fetch<import("./types").TopVoter[]>("/public/voting/top/");
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
  }) {
    return this.fetch<{
      message: string;
      user: {
        id: number;
        username: string;
        email: string;
      };
    }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async uploadSkin(token: string, file: File) {
    const formData = new FormData();
    formData.append("skin", file);

    const response = await fetch(`${this.baseUrl}/auth/launcher/skin/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json() as Promise<{
      message: string;
      skin_face_url: string | null;
    }>;
  }

  // Rewards API endpoints
  async getRanks() {
    const data = await this.fetch<any>("/rewards/ranks/");
    return Array.isArray(data) ? data : data.results || [];
  }

  async getDailyBonusStatus(token: string) {
    return this.fetch<import("./types").DailyBonusStatus>(
      "/rewards/daily-bonus/status/",
      { token },
    );
  }

  async claimDailyBonus(token: string) {
    return this.fetch<import("./types").DailyBonusClaimResponse>(
      "/rewards/daily-bonus/",
      {
        method: "POST",
        token,
      },
    );
  }

  async purchaseRank(token: string, rankId: number) {
    return this.fetch<import("./types").RankPurchaseResponse>(
      "/rewards/ranks/purchase/",
      {
        method: "POST",
        body: JSON.stringify({ rank_id: rankId }),
        token,
      },
    );
  }

  async getReferralInfo(token: string) {
    return this.fetch<import("./types").ReferralInfo>("/rewards/referral/", {
      token,
    });
  }

  async getCCTransactions(token: string) {
    const data = await this.fetch<any>("/rewards/transactions/", { token });
    // ListAPIView returns {count, results} or plain array
    return Array.isArray(data) ? data : data.results || [];
  }

  // Notifications API
  async getNotifications(token: string) {
    const data = await this.fetch<any>("/notifications/", {
      token,
    });
    // ListAPIView returns {count, results} or plain array
    return Array.isArray(data) ? data : data.results || [];
  }

  async getNotificationUnreadCount(token: string) {
    return this.fetch<import("./types").NotificationUnreadCount>(
      "/notifications/unread-count/",
      { token },
    );
  }

  async markNotificationRead(token: string, id: number) {
    return this.fetch<{ message: string }>(`/notifications/${id}/read/`, {
      method: "POST",
      token,
    });
  }

  async markAllNotificationsRead(token: string) {
    return this.fetch<{ message: string }>("/notifications/read-all/", {
      method: "POST",
      token,
    });
  }

  // Email verification
  async sendVerificationEmail(token: string) {
    return this.fetch<{ message: string }>("/auth/verify-email/send/", {
      method: "POST",
      token,
    });
  }

  async verifyEmail(verificationToken: string) {
    return this.fetch<{ message: string }>("/auth/verify-email/confirm/", {
      method: "POST",
      body: JSON.stringify({ token: verificationToken }),
    });
  }

  // Password reset
  async requestPasswordReset(email: string) {
    return this.fetch<{ message: string }>("/auth/password-reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async confirmPasswordReset(resetToken: string, newPassword: string) {
    return this.fetch<{ message: string }>("/auth/password-reset/confirm/", {
      method: "POST",
      body: JSON.stringify({ token: resetToken, new_password: newPassword }),
    });
  }

  // Social Links API
  async getSocialLinks() {
    return this.fetch<import("./types").SocialLink[]>("/public/social-links/");
  }

  async getAdminSocialLinks(token: string) {
    return this.fetch<import("./types").SocialLink[]>("/admin/social-links/", {
      token,
    });
  }

  async createSocialLink(
    token: string,
    data: Omit<import("./types").SocialLink, "id">,
  ) {
    return this.fetch<import("./types").SocialLink>("/admin/social-links/", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    });
  }

  async updateSocialLink(
    token: string,
    id: number,
    data: Partial<import("./types").SocialLink>,
  ) {
    return this.fetch<import("./types").SocialLink>(
      `/admin/social-links/${id}/`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        token,
      },
    );
  }

  async deleteSocialLink(token: string, id: number) {
    const response = await fetch(`${this.baseUrl}/admin/social-links/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Token ${token}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
