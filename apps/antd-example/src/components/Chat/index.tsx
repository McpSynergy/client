/* eslint-disable @typescript-eslint/no-explicit-any */
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
import React from "react";
import styled from "styled-components";

const md = markdownit({ html: true, breaks: true });

const StyledSenderWrapper = styled.div`
  .ant-input {
    background-color: #111111 !important;
    border-color: #222222 !important;
    color: #ffffff !important;

    &:hover {
      border-color: #0070f3 !important;
    }

    &:focus {
      border-color: #0070f3 !important;
    }

    &::placeholder {
      color: #666666 !important;
    }
  }

  .ant-input-affix-wrapper {
    background-color: #111111 !important;
    border-color: #222222 !important;

    &:hover {
      border-color: #0070f3 !important;
    }

    &:focus {
      border-color: #0070f3 !important;
    }
  }
`;

const roles: GetProp<typeof Bubble.List, "roles"> = {
  ai: {
    placement: "start",
    avatar: {
      icon: (
        <img src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" />
      ),
      style: { background: "#fde3cf" },
    },
    typing: { step: 5, interval: 50 },
    style: {
      maxWidth: 600,
    },
  },
  local: {
    placement: "end",
    avatar: {
      icon: <img src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />,
      style: { background: "#87d068" },
    },
  },
};

type SuggestionItems = Exclude<GetProp<typeof Suggestion, "items">, () => void>;

const suggestions: SuggestionItems = [
  { label: "Show my cart", value: "cart" },
  { label: "Show {{ name }} info", value: "user" },
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
            "x-signature":
              "f3de0210ee9003d84626476c631ffc0d1ddf0c268696d7d3e2caa5a3b71273b6",
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
    if (status === "loading") {
      return content;
    }

    if (status === "local") {
      return renderMarkdown(content);
    }

    const meta = content?.meta;
    if (meta) {
      const props = meta?.componentProps;
      return (
        <>
          {renderMarkdown(content?.content ?? content)}
          <ChatComponent name={meta.toolName} props={props} fallback={<></>} />
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
          const content_ = suggestions.find(
            (suggestion) => suggestion.value === itemVal,
          )?.label;
          setContent(content_?.toString() ?? "");
        }}
      >
        {({ onTrigger, onKeyDown }) => (
          <StyledSenderWrapper>
            <Sender
              loading={agent.isRequesting()}
              value={content}
              onChange={(nextVal) => {
                if (nextVal === "/") {
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
          </StyledSenderWrapper>
        )}
      </Suggestion>
    </Flex>
  );
};

export default Chat;
