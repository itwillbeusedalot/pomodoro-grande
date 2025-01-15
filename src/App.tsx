import { useState, useEffect } from "react";
import browser from "webextension-polyfill";

const App = () => {
  const [sites, setSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Load URLs from storage on mount
    browser.storage.local.get("urls").then((result) => {
      if (result.urls) setSites(result.urls as string[]);
    });

    browser.storage.local.get("isEnabled").then((result) => {
      if (result.isEnabled !== undefined) {
        setIsEnabled(result.isEnabled as boolean);
      }
    });
  }, []);

  const addSite = () => {
    if (newSite && !sites.includes(newSite)) {
      setSites([...sites, newSite]);
      setNewSite("");
      browser.storage.local.set({ urls: [...sites, newSite] });
    }
  };

  const removeSite = (siteToRemove: string) => {
    const updatedSites = sites.filter((site) => site !== siteToRemove);
    setSites(updatedSites);
    browser.storage.local.set({ urls: updatedSites });
  };

  const toggleBlocker = () => {
    setIsEnabled(!isEnabled);
    browser.storage.local.set({ isEnabled: !isEnabled });
  };

  return (
    <div className="w-80 p-4 bg-gray-100 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Site Blocker</h1>

      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          placeholder="Enter site or domain"
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addSite}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>

      <ul className="mb-4 max-h-60 overflow-y-auto">
        {sites.map((site, index) => (
          <li
            key={index}
            className="flex justify-between items-center bg-white p-2 mb-2 rounded shadow"
          >
            <span className="text-gray-800">{site}</span>
            <button
              onClick={() => removeSite(site)}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <span className="text-gray-800 font-medium">Enable Blocker</span>
        <button
          onClick={toggleBlocker}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isEnabled ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transform duration-300 ${
              isEnabled ? "translate-x-6" : "translate-x-0"
            }`}
          ></div>
        </button>
      </div>
    </div>
  );
};

export default App;
