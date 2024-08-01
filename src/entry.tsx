import { List, Form, ActionPanel, Action, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import Groups from "./Groups";
import axios from "axios";
import { SEARCH_BAR_PLACEHOLDER } from "./const";

async function getAccount(token: string) {
  return await axios.get(`https://api.channel.io/desk/account`, {
    headers: {
      "x-account": token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export default function Command() {
  const [tokenError, setTokenError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToken, setIsToken] = useState<boolean>(false);

  function dropNameErrorIfNeeded() {
    if (tokenError && tokenError.length > 0) {
      setTokenError(undefined);
    }
  }

  useEffect(() => {
    async function fetchToken() {
      const token = await LocalStorage.getItem<string>("x-account");
      setIsLoading(false);
      setIsToken(!!token);
    }
    fetchToken();
  }, []);

  if (isLoading) {
    return <List isLoading={isLoading} searchBarPlaceholder={SEARCH_BAR_PLACEHOLDER} />;
  }

  return (
    <>
      {isToken ? (
        <Groups />
      ) : (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Save"
                onSubmit={async (values) => {
                  const token = values.token as string;

                  try {
                    await getAccount(token);
                    await LocalStorage.setItem("x-account", values.token);
                    setIsToken(true);
                  } catch (error) {
                    setTokenError("Invalid token");
                  }
                }}
              />
            </ActionPanel>
          }
        >
          <Form.TextField
            id="token"
            title="Channel Token"
            placeholder="Enter your token"
            error={tokenError}
            onChange={dropNameErrorIfNeeded}
            onBlur={async (event) => {
              const value = event.target.value;
              if (value?.length == 0 || !value) {
                setTokenError("The field should't be empty!");
              } else {
                dropNameErrorIfNeeded();
              }
            }}
          />
        </Form>
      )}
    </>
  );
}
