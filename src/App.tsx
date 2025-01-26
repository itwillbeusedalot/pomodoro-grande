import Header from "./components/common/Header";
import Navbar from "./components/common/Navbar";
import Settings from "./features/settings/Settings";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import PomodoroTimer from "./features/pomodoro/PomodoroTimer";
import { useState } from "react";
import Todos from "./features/todos/Todos";
import SiteBlocker from "./features/site-blocker/SiteBlocker";

const DEFAULT_TAB_SIZE = {
  width: "w-80",
  height: "h-[350px]",
};

const App = () => {
  const [tabSize, setTabSize] = useState(DEFAULT_TAB_SIZE);

  const handleTabResize = (value: string) => {
    if (value === "timer") {
      setTabSize(DEFAULT_TAB_SIZE);
    } else if (value === "settings") {
      setTabSize({
        width: DEFAULT_TAB_SIZE.width,
        height: "h-[600px]",
      });
    } else {
      setTabSize({
        width: DEFAULT_TAB_SIZE.width,
        height: "h-[500px]",
      });
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
