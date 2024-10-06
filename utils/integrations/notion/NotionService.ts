import { IService } from "../integarations.types";
import { prisma } from './../../prisma/prisma'

export class NotionService implements IService {
  name = "notion";
  clientId = ''
  clientSecret = ''
  redirectUri = "http://localhost:3000/api/callback/notion";
  token: string | null = null;
  refreshToken: string | null = null;
  tokenExpires: Date | null = null;
  userId = "1";

  constructor() {
    this.clientId = process.env.NOTION_CLIENT_ID as string;
    this.clientSecret = process.env.NOTION_CLIENT_SECRET as string;
    // console.log("Client Id", this.clientId);
  }

  connect(): String {
    const url: string = `https://api.notion.com/v1/oauth/authorize?client_id=${this.clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    return url;
  }

  async handleCallback(code: string): Promise<void> {
    const encoded = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: this.redirectUri,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      this.token = data.access_token;
      this.tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours expiry

      await prisma.user.update({
        where: { id: this.userId },
        data: {
          notionToken: this.token,
          notionTokenExpires: this.tokenExpires,
        },
      });
    }
  }

  async ensureValidToken(): Promise<Boolean> {
    const user = await prisma.user.findUnique({ where: { id: this.userId } });

    if (user?.notionTokenExpires && new Date(user.notionTokenExpires) > new Date()) {
      this.token = user.notionToken;
      return true;
    }

    if (this.refreshToken) {
      await this.refreshAccessToken();
    } else {
      throw new Error("Token expired and no refresh token available.");
    }
    return true;
  }

  async refreshAccessToken(): Promise<void> {
    const encoded = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      this.token = data.access_token;
      this.tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours expiry

      // Update tokens in the database
      await prisma.user.update({
        where: { id: this.userId },
        data: {
          notionToken: this.token,
          notionTokenExpires: this.tokenExpires,
        },
      });
    }
  }

  async disconnect(): Promise<void> {
    await prisma.user.update({
      where: { id: this.userId },
      data: {
        notionToken: null,
        notionTokenExpires: null,
      },
    });
    this.token = null;
    this.refreshToken = null;
    this.tokenExpires = null;
  }

  async executeAction(action: string, payload: any): Promise<any> {

    const user = await prisma.user.findUnique({ where: { id: this.userId } });

    switch (action) {
      case "getDatabases":
        return this.getDatabases(user?.notionToken);

      case "createDatabase":
        return this.createDatabase(user?.notionToken, payload.name);

      case "addPage":
        return this.addPage(user?.notionToken, payload.pageTitle, payload.pageContent);

      case "addContent":
        return this.addContentToPage(user?.notionToken, payload.pageId, payload.content);

      default:
        throw new Error("Invalid action");
    }
  }

  private async getDatabases(token: string | null | undefined): Promise<any> {


    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: { property: "object", value: "database" },
        sort: { direction: "ascending", timestamp: "last_edited_time" }
      }),
    });
  //  console.log(response);
    

    if (!response.ok) throw new Error("Failed to fetch databases");
    return await response.json();
  }

  private async createDatabase(token: string | null | undefined, name: string): Promise<any> {
    const response = await fetch("https://api.notion.com/v1/databases", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { type: "page_id", page_id: "your-root-page-id" }, 
        title: [{ type: "text", text: { content: name } }],
        properties: { Name: { title: {} } },
      }),
    });

    if (!response.ok) throw new Error("Failed to create database");
    return await response.json();
  }

  private async addPage(
    token: string | null | undefined,
    pageTitle: string,
    pageContent: string
  ): Promise<any> {
    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { type: 'workspace' }, 
        properties: {
          Name: { title: [{ text: { content: pageTitle } }] },
          Description: { rich_text: [{ text: { content: pageContent } }] },
        },
        children: [
          {
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [{ type: "text", text: { content: pageTitle } }],
            },
          },
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: { content: pageContent },
                },
              ],
            },
          },
        ],
      }),
    });
  
    if (!response.ok) throw new Error("Failed to add page");
    return await response.json();
  }
  
  

  private async addContentToPage(token: string | null | undefined, pageId: string, content: string): Promise<any> {
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        children: [{ object: "block", type: "paragraph", paragraph: { text: [{ type: "text", text: { content } }] } }],
      }),
    });

    if (!response.ok) throw new Error("Failed to add content");
    return await response.json();
  }
}
