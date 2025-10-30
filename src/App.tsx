import { useEffect, useState, useRef } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Button } from './components/ui/button';
import { tabsMock } from './chrome/tabsMock';
import { FocusIcon, Trash2Icon, SearchIcon, RefreshCwIcon } from 'lucide-react';

interface Tab {
  id: number;
  active: boolean;
  audible: boolean;
  autoDiscardable: boolean;
  discarded: boolean;
  favIconUrl?: string;
  frozen: boolean;
  groupId: number;
  height: number;
  highlighted: boolean;
  lastAccessed: number;
  mutedInfo: {
    muted: boolean;
  };
  pinned: boolean;
  selected: boolean;
  splitViewId: number;
  status: string;
  title: string;
  url: string;
  width: number;
  windowId: number;
}

interface TabsBanana extends Tab {
  duplicated_tabs: Tab[];
}

const processTabs = (tabs: Tab[]): TabsBanana[] => {
  return tabs.map((tab) => ({
    ...tab,
    duplicated_tabs: tabs.filter((t) => t.url === tab.url),
  }));
}

function App() {
  const [tabs, setTabs] = useState<TabsBanana[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const updateTabs = async () => {
    // @ts-ignore
    if (!chrome.tabs) {
      setTabs(processTabs(tabsMock));
      return;
    }

    // @ts-ignore
    const tabsNew = await chrome.tabs.query({
      url: ["<all_urls>"]
    });
    setTabs(processTabs(tabsNew));
    console.log(tabs);
  }

  useEffect(() => {
    updateTabs();
    // Focus the search input when the component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleOnRemoveTab = async (tab: TabsBanana) => {
    // @ts-ignore
    await chrome.tabs.remove(tab.id);
    updateTabs();
  }

  const handleOnRemoveDuplicatedTab = async (tab: TabsBanana) => {
    // @ts-ignore
    await chrome.tabs.remove(tab.duplicated_tabs.map((t) => t.id));
    updateTabs();
  }

  const handleOnFocusTab = async (tab: TabsBanana) => {
    // @ts-ignore
    await chrome.tabs.update(tab.id, { active: true });
    updateTabs();
  }

  const filteredTabs = tabs.filter((tab) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tab.title.toLowerCase().includes(query) ||
      tab.url.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full h-full p-3">
      <div className="my-4 flex gap-4 items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tabs by title or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            Showing {filteredTabs.length} of {tabs.length} tabs
          </p>
        )}

        <Button onClick={updateTabs} variant="default" className="flex items-center">
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Action</TableHead>
          <TableHead className="w-[100px]">Link</TableHead>
          <TableHead className="w-[100px]">Duplicated</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Last Accessed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTabs.map((tab) => (
          <TableRow key={tab.id} highlight={tab.active}>
            <TableCell className="flex gap-2">
              <Button onClick={() => handleOnRemoveTab(tab)}>
                <Trash2Icon />
              </Button>
              <Button onClick={() => handleOnFocusTab(tab)}>
                <FocusIcon />
              </Button>
            </TableCell>
            <TableCell className="w-[100px]">
              <Button onClick={() => handleOnRemoveDuplicatedTab(tab)}>
                <Trash2Icon /> {tab.duplicated_tabs.length}
              </Button>
              </TableCell>
            <TableCell className="font-medium">
              {tab.url.substring(0, 30)}
            </TableCell>
            <TableCell className="line-clamp-1 max-w-[200px]">{tab.title}</TableCell>
            <TableCell className="text-right">{new Date(tab.lastAccessed).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Total Tabs</TableCell>
          <TableCell className="text-right">{filteredTabs.length}/{tabs.length}</TableCell>
        </TableRow>
      </TableFooter>
      <TableCaption>TDAH Tab Manager made with 🍌 by <a href="https://github.com/sprengel" target="_blank" rel="noopener noreferrer">ericksprengel</a></TableCaption>
    </Table>
    </div>
  )
}

export default App
