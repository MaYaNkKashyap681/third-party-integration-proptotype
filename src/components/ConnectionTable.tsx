"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // ShadCN Button component


interface ConnectionsProps {
  todoistToken: string | null;
  notionToken: string | null;
}

interface Service {
  name: string;
  serviceName: string;
  token: string | null;
  imageUrl: string;
  isConnected: boolean;
}

// Define the services explicitly
const services: Service[] = [
  {
    name: "Todoist",
    serviceName: "todoist",
    token: "todoistToken",
    imageUrl:
      "https://static-00.iconduck.com/assets.00/todoist-icon-256x256-vmg7wr0z.png",
    isConnected: false,
  },
  {
    name: "Notion",
    serviceName: "notion",
    token: "notionToken",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
    isConnected: false,
  },
];

interface Props {
  connections: ConnectionsProps;
}

const ConnectionTable: React.FC<Props> = ({ connections }) => {
  const prepareData = (services: Service[]) => {
    return services.map((service) => {
      return {
        ...service,
        isConnected:
          connections[service.token as keyof ConnectionsProps] !== null,
      };
    });
  };
  const [serviceStates, setServiceStates] = useState<Service[]>(
    prepareData(services)
  );

  const handleDisconnect = async (
    serviceName: string,
    isConnected: boolean
  ) => {
    const response = await fetch(
      `/api/service/disconnect?service=${serviceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setServiceStates((prevState) =>
        prevState.map((service) =>
          service.serviceName === serviceName
            ? { ...service, isConnected: !isConnected }
            : service
        )
      );
      alert(data.message);
    } else {
      alert("Failed to update connection status");
    }
  };

  const handleConnect = async (serviceName: string) => {
    try {
      const response = await fetch(`/api/service/connect?service=${serviceName}`,
        {
          method: 'POST'
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to connect to service');
      }
  
      const data = await response.json();
  
      if (data.success && data.data) {
        window.location.href = data.data;
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      console.error("Error during service connection:", error);
      alert("An error occurred while connecting to the service");
    }
  };

  const handleConnectDisconnect = async (
    serviceName: string,
    isConnected: boolean
  ) => {
    isConnected
      ? handleDisconnect(serviceName, isConnected)
      : handleConnect(serviceName);
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">Connection Status</h1>
      <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">
              Service
            </th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">
              Image
            </th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {serviceStates.map((service) => (
            <tr key={service.name} className="border-t border-gray-200">
              <td className="px-6 py-4">{service.name}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    service.isConnected
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {service.isConnected ? "Connected" : "Disconnected"}
                </span>
              </td>
              <td className="px-6 py-4">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  width="40"
                  height="40"
                  className="rounded-md"
                />
              </td>
              <td className="px-6 py-4">
                <Button
                  variant={service.isConnected ? "destructive" : "default"}
                  onClick={() =>
                    handleConnectDisconnect(
                      service.serviceName,
                      service.isConnected
                    )
                  }
                >
                  {service.isConnected ? "Disconnect" : "Connect"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConnectionTable;
