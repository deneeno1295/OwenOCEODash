import { Router, Request, Response, NextFunction } from "express";
import session from "express-session";
import crypto from "crypto";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      name: string;
      organizationId: string;
      instanceUrl: string;
      accessToken: string;
      refreshToken?: string;
    };
    oauthState?: string;
  }
}

export interface SalesforceUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  instanceUrl: string;
  accessToken: string;
  refreshToken?: string;
}

const SALESFORCE_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
const SALESFORCE_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
const SALESFORCE_REDIRECT_URI = process.env.SALESFORCE_REDIRECT_URI || `${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000'}/auth/callback`;
const SALESFORCE_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com";

export function createAuthRouter(): Router {
  const router = Router();

  router.get("/signin", (req: Request, res: Response) => {
    if (!SALESFORCE_CLIENT_ID) {
      return res.status(500).json({ error: "Salesforce OAuth not configured" });
    }

    const state = crypto.randomBytes(16).toString("hex");
    req.session.oauthState = state;

    const authUrl = new URL(`${SALESFORCE_LOGIN_URL}/services/oauth2/authorize`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", SALESFORCE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", SALESFORCE_REDIRECT_URI);
    authUrl.searchParams.set("scope", "api refresh_token openid profile email");
    authUrl.searchParams.set("state", state);

    res.redirect(authUrl.toString());
  });

  router.get("/callback", async (req: Request, res: Response) => {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        console.error("OAuth error:", error, error_description);
        return res.redirect(`/?error=${encodeURIComponent(error_description as string || error as string)}`);
      }

      if (!code || typeof code !== "string") {
        return res.redirect("/?error=missing_code");
      }

      if (state !== req.session.oauthState) {
        return res.redirect("/?error=invalid_state");
      }

      if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET) {
        return res.redirect("/?error=oauth_not_configured");
      }

      const tokenResponse = await fetch(`${SALESFORCE_LOGIN_URL}/services/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: SALESFORCE_CLIENT_ID,
          client_secret: SALESFORCE_CLIENT_SECRET,
          redirect_uri: SALESFORCE_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Token exchange failed:", errorText);
        return res.redirect("/?error=token_exchange_failed");
      }

      const tokenData = await tokenResponse.json() as {
        access_token: string;
        refresh_token?: string;
        instance_url: string;
        id: string;
      };

      const userInfoResponse = await fetch(`${tokenData.instance_url}/services/oauth2/userinfo`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        console.error("Failed to fetch user info");
        return res.redirect("/?error=user_info_failed");
      }

      const userInfo = await userInfoResponse.json() as {
        sub: string;
        email: string;
        name: string;
        organization_id: string;
      };

      req.session.user = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        organizationId: userInfo.organization_id,
        instanceUrl: tokenData.instance_url,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      };

      delete req.session.oauthState;
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/?error=session_error");
        }
        res.redirect("/");
      });
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.redirect("/?error=callback_failed");
    }
  });

  router.get("/me", (req: Request, res: Response) => {
    if (req.session.user) {
      const { accessToken, refreshToken, ...safeUser } = req.session.user;
      res.json({ authenticated: true, user: safeUser });
    } else {
      res.json({ authenticated: false, user: null });
    }
  });

  router.post("/logout", (req: Request, res: Response) => {
    const instanceUrl = req.session.user?.instanceUrl;
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true, logoutUrl: instanceUrl ? `${instanceUrl}/secur/logout.jsp` : null });
    });
  });

  router.get("/config", (_req: Request, res: Response) => {
    res.json({
      configured: !!(SALESFORCE_CLIENT_ID && SALESFORCE_CLIENT_SECRET),
      loginUrl: SALESFORCE_LOGIN_URL,
    });
  });

  return router;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: "Authentication required" });
  }
}

export function getSessionMiddleware() {
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
  
  return session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  });
}
