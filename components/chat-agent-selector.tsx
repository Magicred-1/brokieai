"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // Import Accordion components

interface Agent {
  id: string;
  name: string;
  tokenAddress?: string;
}

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: Agent;
  onAgentChange: (agent: Agent) => void;
}

export function AgentSelector({
  agents,
  selectedAgent,
  onAgentChange,
}: AgentSelectorProps) {
  return (
    <div>
      <Accordion type="single" collapsible>
        <AccordionItem value="agent-selection">
          <AccordionTrigger className="w-full justify-between p-2">
            <Button variant="outline" className="w-full justify-between">
              {selectedAgent.name}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </AccordionTrigger>
          <AccordionContent>
            {/* Render the list of agents in the accordion content */}
            <div className="space-y-2">
              {agents.length === 0 ? (
                <p className="text-center text-gray-500">No agents found.</p>
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      onAgentChange(agent);
                    }}
                    className="p-2 cursor-pointer hover:bg-muted/30 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <Check
                        className={`h-4 w-4 ${
                          selectedAgent.id === agent.id
                            ? "text-blue-500 opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      <span>{agent.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
