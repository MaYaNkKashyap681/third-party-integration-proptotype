import { IService } from "../integarations.types";
import { prisma } from "./../../prisma/prisma";

export class TodoistService implements IService {
  name = "todoist";
  clientId = "";
  clientSecret = "";
  redirectUri = "http://localhost:3000/api/callback/todoist";
  token: string | null = null;
  refreshToken: string | null = null;
  tokenExpires: Date | null = null;
  userId = "1";

  constructor() {
    this.clientId = process.env.TODOIST_CLIENT_ID as string;
    this.clientSecret = process.env.TODOIST_CLIENT_SECRET as string;

    // console.log( "Hey Todoist", this.clientId)
  }

  connect(): String {
    const state = "secretstring";
    const url: string = `https://todoist.com/oauth/authorize?client_id=${this.clientId}&scope=data:read,data:delete,task:add&state=${state}&redirect_uri=${this.redirectUri}`;
    return url;
  }

  async handleCallback(code: string): Promise<void> {
    const response = await fetch("https://todoist.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // Store tokens in the database for user with ID 1
      await prisma.user.update({
        where: { id: this.userId },
        data: {
          todoistToken: this.token,
          
          todoistTokenExpires: this.tokenExpires,
        },
      });
    } else {
      throw new Error("Failed to fetch access token");
    }
  }

  async ensureValidToken(): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { todoistToken, todoistTokenExpires } = user;

    if (!todoistToken || !todoistTokenExpires) {
      await this.clearToken();
      throw new Error("Token is not valid");
    }

    if (new Date() > todoistTokenExpires) {
      await this.clearToken();
      throw new Error("Token has expired");
    }

    this.token = todoistToken;
    return true;
  }

  private async clearToken(): Promise<void> {
    await prisma.user.update({
      where: { id: this.userId },
      data: {
        todoistToken: null,
        todoistTokenExpires: null,
      },
    });
    this.token = null;
    this.refreshToken = null;
    this.tokenExpires = null;
  }

  async disconnect(): Promise<void> {
    await this.clearToken();
  }

  async executeAction(action: string, payload: any): Promise<any> {
    try {
      await this.ensureValidToken();

      switch (action) {
        case "getProjects":
          return await this.getProjects();
        case "createTask":
          return await this.createTask(payload.content, payload.project_id);
        default:
          throw new Error("Unknown action");
      }
    } catch (error: any) {
      if (error.message.includes("Token")) {
        throw new Error("Token not Valid");
      }
      console.error("Execution error:", error);
      throw error;
    }
  }

  async getProjects(): Promise<any> {
    const response = await fetch("https://api.todoist.com/rest/v2/projects", {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching projects: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async createTask(content: string, project_id: string): Promise<any> {
    const response = await fetch("https://api.todoist.com/rest/v2/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        project_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error creating task: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}
