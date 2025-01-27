import {
  ChartNoAxesCombined,
  Globe,
  ListTodo,
  Settings,
  Timer,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const NAV_ITEMS = [
  {
    value: "timer",
    icon: Timer,
  },
  {
    value: "todos",
    icon: ListTodo,
  },
  {
    value: "sites",
    icon: Globe,
  },
  {
    value: "analytics",
    icon: ChartNoAxesCombined,
  },
  {
    value: "settings",
    icon: Settings,
  },
];

const Navbar = () => {
  return (
    <TabsList className="text-primary-custom border-t bg-secondary-custom/5 w-full gap-3 px-4 py-6 rounded-none">
      {NAV_ITEMS.map(({ value, icon: Icon }) => (
        <TabsTrigger
          key={value}
          value={value}
          className="data-[state=active]:bg-primary-custom data-[state=active]:text-white"
        >
          <Icon />
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default Navbar;
