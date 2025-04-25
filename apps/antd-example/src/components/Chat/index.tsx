/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserOutlined } from "@ant-design/icons";
import {
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { Flex, Typography, type GetProp } from "antd";
import React, { Suspense } from "react";
import markdownit from "markdown-it";
import { listMcpr } from "../../../mcpr";

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

const Chat = () => {
  const [content, setContent] = React.useState("");

  // ...数据做渲染

  const renderMarkdown: BubbleProps["messageRender"] = (content) => (
    <Typography>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content?.trim()) }} />
    </Typography>
  );

  // Agent for request
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onError }) => {
      fetch("/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature":
            "f3de0210ee9003d84626476c631ffc0d1ddf0c268696d7d3e2caa5a3b71273b6",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      })
        .then(async (response) => {
          console.log("response", response);
          const reader = response?.body?.getReader();
          if (!reader) return;
          let fullResponse = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = new TextDecoder().decode(value);
            fullResponse += chunk;
          }
          const res = JSON.parse(fullResponse);
          if (res?.code !== 0) {
            onError(new Error("Failed return. Please try again later."));
          }
          console.log("res?.data", res?.data);

          onSuccess(res?.data);
        })
        .catch((error) => {
          onError(error);
        });
    },
  });

  // Chat messages
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

  return (
    <Flex
      vertical
      gap="middle"
      style={{
        height: "100%",
        borderLeft: "1px solid #e8e8e8",
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
          messageRender: (content: any) => {
            if (status === "loading" || status === "local") {
              return content;
            }

            const meta = content?.meta;

            if (meta) {
              console.log("meta", meta);

              const Component = listMcpr.find((item) => {
                return (
                  item.name === meta?.toolName &&
                  item.serverName === meta?.serverName
                );
              })?.component as React.ComponentType<unknown> | undefined;
              console.log("Component", Component, meta?.componentProps);

              return (
                <>
                  {renderMarkdown(content?.content ?? content)}
                  {Component && (
                    <Suspense fallback={"loading..."}>
                      <Component {...meta?.componentProps} />
                    </Suspense>
                  )}
                </>
              );
            }

            return renderMarkdown(content?.content ?? content);
          },
        }))}
      />
      <Sender
        loading={agent.isRequesting()}
        value={content}
        onChange={setContent}
        onSubmit={(nextContent) => {
          onRequest(nextContent);
          setContent("");
        }}
      />
    </Flex>
  );
};

export default Chat;
