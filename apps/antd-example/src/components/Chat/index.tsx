/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserOutlined } from "@ant-design/icons";
import {
  Bubble,
  BubbleProps,
  Sender,
  Suggestion,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { ChatComponent } from "@mcp-synergy/react";
import { Flex, Typography, type GetProp } from "antd";
import markdownit from "markdown-it";
import React, { Suspense } from "react";

const md = markdownit({ html: true, breaks: true });

const roles: GetProp<typeof Bubble.List, "roles"> = {
  ai: {
    placement: "start",
    avatar: { icon: <UserOutlined />, style: { background: "#fde3cf" } },
    typing: { step: 5, interval: 50 },
    style: {
      maxWidth: 600,
    },
  },
  local: {
    placement: "end",
    avatar: { icon: <UserOutlined />, style: { background: "#87d068" } },
  },
};

type SuggestionItems = Exclude<GetProp<typeof Suggestion, 'items'>, () => void>;

const suggestions: SuggestionItems = [
  { label: 'Show me the cart', value: 'cart' },
  { label: 'Show {{ name }} info', value: 'user' },
];

const Chat = () => {
  const [content, setContent] = React.useState("");

  const renderMarkdown: BubbleProps["messageRender"] = (content) => (
    <Typography>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content?.trim()) }} />
    </Typography>
  );

  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onError }) => {
      try {
        const response = await fetch("http://localhost:3000/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-signature": "f3de0210ee9003d84626476c631ffc0d1ddf0c268696d7d3e2caa5a3b71273b6",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: message }],
          }),
        });

        const reader = response?.body?.getReader();
        if (!reader) return;

        let fullResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += new TextDecoder().decode(value);
        }

        const res = JSON.parse(fullResponse);
        if (res?.code !== 0) {
          onError(new Error("Failed return. Please try again later."));
          return;
        }

        onSuccess(res?.data);
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    },
  });

  const { onRequest, messages } = useXChat({
    defaultMessages: [
      {
        id: "init",
        message: "Hello, how can I help you?",
        status: "success",
      },
    ],
    agent,
    requestPlaceholder: "Waiting...",
    requestFallback: "Mock failed return. Please try again later.",
  });

  const renderMessage = (content: any, status: string) => {
    if (status === "loading" || status === "local") {
      return content;
    }

    const meta = content?.meta;
    if (meta) {
      const props = meta?.componentProps;
      return (
        <>
          {renderMarkdown(content?.content ?? content)}
          <Suspense fallback="loading...">
            <ChatComponent name={meta.toolName} props={props} />
          </Suspense>
        </>
      );
    }

    return renderMarkdown(content?.content ?? content);
  };

  return (
    <Flex
      vertical
      gap="middle"
      style={{
        height: "100%",
        borderLeft: "1px solid #141414",
        padding: 16,
      }}
    >
      <Bubble.List
        roles={roles}
        style={{ flex: 1, paddingTop: 8 }}
        items={messages.map(({ id, message, status }) => ({
          key: id,
          loading: status === "loading",
          role: status === "local" ? "local" : "ai",
          content: message,
          messageRender: (content) => renderMessage(content, status),
        }))}
      />

      <Suggestion
        items={suggestions}
        onSelect={(itemVal) => {
          const content_ = suggestions.find((suggestion) => suggestion.value === itemVal)?.label;
          setContent(content_?.toString() ?? "");
        }}
      >
        {({onTrigger, onKeyDown}) => (
          <Sender
            loading={agent.isRequesting()}
            value={content}
            onChange={(nextVal) => {
              if (nextVal === '/') {
                onTrigger();
              } else if (!nextVal) {
                onTrigger(false);
              }
              setContent(nextVal);
            }}
            onSubmit={(nextContent) => {
              onRequest(nextContent);
              setContent("");
            }}
            onKeyDown={onKeyDown}
            placeholder="输入 / 获取建议"
          />
        )}
      </Suggestion>
    </Flex>
  );
};

export default Chat;
