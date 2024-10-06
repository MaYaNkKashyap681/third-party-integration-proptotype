import { IService } from "./integarations.types";
import { getService } from "./service";

class ServiceManager {
  private activeServices: { [key: string]: IService } = {};

  addService(serviceName: string): void {
    const service = getService(serviceName);
    if (service) {
      this.activeServices[serviceName] = service;
    }
  }

  removeService(serviceName: string): void {
    delete this.activeServices[serviceName];
  }

  connect(serviceName: string): String {
    const service = this.activeServices[serviceName];
    if(service) {
        return service.connect();
    }
    return "";
  }

   async isConnected(serviceName: string): Promise<Boolean> {
    const service = this.activeServices[serviceName];
    const data = await service.ensureValidToken();
    return data
  }
  
  async executeServiceAction(serviceName: string, action: string, payload: any) {
    const service = this.activeServices[serviceName];
    if (service) {
      return await service.executeAction(action, payload);
    }
    throw new Error(`Service ${serviceName} not found`);
  }

  async disconnect(serviceName: string): Promise<void> {
    const service = this.activeServices[serviceName];
    service.disconnect();
    
  }
}

const serviceManager = new ServiceManager();

serviceManager.addService("todoist");
serviceManager.addService("notion");

export {serviceManager};