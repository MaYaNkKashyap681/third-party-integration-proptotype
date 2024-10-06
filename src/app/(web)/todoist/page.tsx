"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
}

const Page = () => {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskName, setTaskName] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
 
        const response = await fetch("/api/service/todoist/getProjects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data: any = await response.json();

        if (data.success) {
          // console.log(data.result);
          setProjects(data.result);
        } else {
          const errorMessage: string = data.message;
          if(errorMessage.toLocaleLowerCase() === 'token not valid') {
            router.push("http://localhost:3000/connections");
          }
        }
    };

    fetchProjects();
  }, []);

  // Handle task form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      setMessage("Please select a project.");
      return;
    }

    if (!taskName) {
      setMessage("Please enter a task name.");
      return;
    }

    try {
      const response = await fetch("/api/service/todoist/createTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: selectedProject,
          content: taskName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task.");
      }

      setTaskName(""); // Clear the input after successful submission
      setMessage("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
      setMessage("Failed to add task. Please try again.");
    }
  };

  return (
    <div>
      {/* Select project dropdown */}
      <div className="space-y-2">
        <Label htmlFor="project">Select a Project</Label>
        <Select onValueChange={setSelectedProject}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.length > 0 ? (
              projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name || "Untitled"}
                </SelectItem>
              ))
            ) : (
              <></>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Task creation form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="taskName">Task Name</Label>
          <Input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
          />
        </div>

        <Button type="submit" className="w-full">
          Add Task
        </Button>
      </form>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
};

export default Page;
