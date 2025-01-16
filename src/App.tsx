import Header from "./components/common/Header";
import Navbar from "./components/common/Navbar";
import Settings from "./components/Settings";
import SiteBlocker from "./components/SiteBlocker";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import { FIVE_MINUTES, DEFAULT_TIME, ONE_HOUR } from "./constants";
import browser from "webextension-polyfill";
import PomodoroTimer from "./components/PomodoroTimer";

const App = () => {
  return (
    <Tabs
      defaultValue="timer"
      className="relative w-80 h-[400px] flex flex-col mx-auto text-sm border"
    >
      <Header />

      <div className="w-full h-full px-4 py-2 ">
        <PomodoroTimer />
        <TabsContent value="sites">
          <SiteBlocker />
        </TabsContent>
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </div>

      <Navbar />
    </Tabs>
  );
};

export default App;
