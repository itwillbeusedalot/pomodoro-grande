import { Globe, Settings, Timer } from "lucide-react";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Navbar = () => {
  return (
    <TabsList className="absolute bottom-0 text-primary-custom border-t bg-secondary-custom w-full gap-4 px-4 py-6 rounded-none">
      <TabsTrigger
        value="timer"
        className=" data-[state=active]:bg-primary-custom data-[state=active]:text-white"
      >
        <Timer />
      </TabsTrigger>
      <TabsTrigger
        value="sites"
        className=" data-[state=active]:bg-primary-custom data-[state=active]:text-white"
      >
        <Globe />
      </TabsTrigger>
      <TabsTrigger
        value="settings"
        className=" data-[state=active]:bg-primary-custom data-[state=active]:text-white"
      >
        <Settings />
      </TabsTrigger>
    </TabsList>
  );
};

export default Navbar;
