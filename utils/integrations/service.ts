import { IService } from "./integarations.types";
import { TodoistService } from "./todoist/TodoistService";
import { NotionService } from "./notion/NotionService";

const serviceRegistry: { [key: string]: IService } = {
    todoist: new TodoistService(),
    notion: new NotionService()
  };
  
  export function getService(serviceName: string): IService | null {
    return serviceRegistry[serviceName] || null;
  }