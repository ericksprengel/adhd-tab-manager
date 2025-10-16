import { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Button } from './components/ui/button';
import { tabsMock } from './chrome/tabsMock';
import { FocusIcon, Trash2Icon } from 'lucide-react';

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

  return (
    <div className="w-full h-full p-3">
      <h1>Tabs</h1>
      <div className="card">
        <Button onClick={updateTabs}>
          count is {tabs.length}
        </Button>
      </div>

      <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
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
        {tabs.map((tab) => (
          <TableRow key={tab.id}>
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
          <TableCell colSpan={3}>Total Tabs</TableCell>
          <TableCell className="text-right">{tabs.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
    </div>
  )
}

export default App
