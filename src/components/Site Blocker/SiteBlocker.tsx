import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlockedSites from "./BlockedSites";
import AllowedUrls from "./AllowedUrls";

const SiteBlocker = () => {
  return (
    <Tabs defaultValue="blacklist">
      <TabsList className="grid w-full grid-cols-2 border">
        <TabsTrigger
          value="blacklist"
          className="text-xs data-[state=active]:bg-primary-custom  data-[state=active]:text-white"
        >
          Blacklist
        </TabsTrigger>
        <TabsTrigger
          value="whitelist"
          className="text-xs data-[state=active]:bg-primary-custom data-[state=active]:text-white"
        >
          Whitelist
        </TabsTrigger>
      </TabsList>
      <TabsContent value="blacklist">
        <BlockedSites />
      </TabsContent>
      <TabsContent value="whitelist">
        <AllowedUrls />
      </TabsContent>
    </Tabs>
  );
};

export default SiteBlocker;
