// AgentSelector Component
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Agent {
  id: string;
  name: string;
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
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedAgent.name}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search AI agent..." />
          {agents.length === 0 && <CommandEmpty>No agent found.</CommandEmpty>}
          <CommandGroup>
            {agents.map((agent) => (
              // <CommandItem
              //   key={agent.id}
              //   onSelect={() => {
              //     onAgentChange(agent);
              //     setOpen(false);
              //   }}
              // >
              //   <Check
              //     className={`mr-2 h-4 w-4 ${
              //       selectedAgent.id === agent.id ? "opacity-100" : "opacity-0"
              //     }`}
              //   />
              //   {agent.name}
              // </CommandItem>
              <div
                onClick={() => {
                  onAgentChange(agent);
                  setOpen(false);
                }}
                key={agent.id}
              >
                <p>{agent.name}</p>
              </div>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
