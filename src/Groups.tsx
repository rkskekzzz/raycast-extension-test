import { ActionPanel, Action, List, LocalStorage, Icon, Color } from "@raycast/api";
import { useEffect, useState } from "react";
import { useCachedState } from "@raycast/utils";
import axios from "axios";
import { SEARCH_BAR_PLACEHOLDER } from "./const";
import Inko from "inko";

const inko = new Inko();

type Group = {
  id: string;
  channelId: string;
  title: string;
  scope: string;
  managerIds: string[];
  createdAt: number;
  updatedAt: number;
  name: string;
  active: boolean;
};

const API_LIMIT = "500";

async function getPublicGroups(next?: string) {
  const token = await LocalStorage.getItem<string>("x-account");
  return await axios.get(
    `https://api.channel.io/desk/channels/1/groups/public?` +
      new URLSearchParams(
        next
          ? {
              limit: API_LIMIT,
              since: next,
            }
          : { limit: API_LIMIT },
      ).toString(),
    {
      headers: {
        "x-account": token,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );
}

export default function Groups() {
  const [searchText, setSearchText] = useState("");

  const [groups, setGroups] = useCachedState<Group[]>("groups", []);

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.name.toLowerCase().includes(inko.ko2en(searchText).toLowerCase()),
  );

  useEffect(() => {
    async function fetchGroups() {
      const res = [];
      let response;
      let next;
      while ((response = await getPublicGroups(next)).data.next) {
        res.push(...response.data.groups);
        next = response.data.next;
      }
      res.push(...response.data.groups);
      setGroups(res);
    }
    fetchGroups();
  }, []);

  return (
    <List onSearchTextChange={setSearchText} searchBarPlaceholder={SEARCH_BAR_PLACEHOLDER} throttle>
      <List.Section title="Results" subtitle={groups.length + ""}>
        {filteredGroups?.map((group) => (
          <List.Item
            key={group.id}
            title={group.title}
            subtitle={group.name}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action.OpenInBrowser
                    title="Open in Channel Talk"
                    url={`https://desk.channel.io/#/channels/1/team_chats/groups/${group.id}`}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
