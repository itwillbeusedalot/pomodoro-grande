import { useState, useEffect, FormEvent } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import browser from "webextension-polyfill";

const SiteBlocker = () => {
  const [sites, setSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Load URLs from storage on mount
    browser.storage.local.get("urls").then((result) => {
      if (result.urls) setSites(result.urls as string[]);
    });
  }, []);

  const addSite = (e: FormEvent) => {
    e.preventDefault();

    const urlRegex = /^(https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const match = newSite.match(urlRegex);

    if (!match) {
      setError(
        "Invalid domain or URL. Please enter a valid site (e.g., example.com or https://example.com)."
      );
      return;
    }

    const domain = match[2]; // Extract the valid domain
    if (domain && !sites.includes(domain)) {
      setSites([...sites, domain]);
      setNewSite("");
      setError("");
      browser.storage.local.set({ urls: [...sites, domain] });
    } else if (sites.includes(domain)) {
      setError("This domain is already in the list.");
    }
  };

  const removeSite = (siteToRemove: string) => {
    const updatedSites = sites.filter((site) => site !== siteToRemove);
    setSites(updatedSites);
    browser.storage.local.set({ urls: updatedSites });
  };

  return (
    <div className="w-full space-y-2">
      <h1 className="text-lg text-center font-semibold mb-2">
        Blocked Domains
      </h1>
      <form onSubmit={addSite} className="flex items-center gap-1">
        <Input
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          placeholder="Enter site or domain"
        />

        <Button
          type="submit"
          className="bg-primary-custom hover:bg-primary-custom/90"
        >
          Add
        </Button>
      </form>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <ul className="custom-scrollbar max-h-[10rem] overflow-y-auto">
        {sites.map((site, index) => (
          <li
            key={index}
            className="flex justify-between items-center p-2 mb-2 rounded shadow"
          >
            <span>{site}</span>
            <button
              onClick={() => removeSite(site)}
              className="text-primary-custom hover:text-primary-custom/90 focus:outline-none"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SiteBlocker;
