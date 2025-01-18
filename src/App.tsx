import Header from "./components/common/Header";
import Navbar from "./components/common/Navbar";
import Settings from "./components/Settings";
import SiteBlocker from "./components/Site Blocker/SiteBlocker";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import PomodoroTimer from "./components/PomodoroTimer";
import { useState } from "react";
import Todos from "./components/Todos";

const DEFAULT_TAB_SIZE = {
  width: "w-80",
  height: "h-[400px]",
};

const App = () => {
  const [tabSize, setTabSize] = useState(DEFAULT_TAB_SIZE);

  const handleTabResize = (value: string) => {
    if (value === "settings") {
      setTabSize({
        width: "w-[500px]",
        height: "h-[500px]",
      });
    } else if (value === "sites" || value === "todos") {
      setTabSize({
        width: DEFAULT_TAB_SIZE.width,
        height: "h-[500px]",
      });
    } else {
      setTabSize(DEFAULT_TAB_SIZE);
    }
  };

  return (
    <Tabs
      defaultValue="timer"
      onValueChange={handleTabResize}
      className={`${tabSize.width} ${tabSize.height} relative flex flex-col mx-auto text-sm border transition-all duration-300`}
    >
      <Header />

      <div className="w-full h-full px-4">
        <PomodoroTimer />
        <TabsContent value="sites">
          <SiteBlocker />
        </TabsContent>
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
        <TabsContent value="todos">
          <Todos />
        </TabsContent>
      </div>

      <Navbar />
    </Tabs>
  );
};

export default App;
