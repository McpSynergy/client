/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Bubble,
  BubbleProps,
  Sender,
  Suggestion,
  useXAgent,
  useXChat,
  XStream,
} from "@ant-design/x";
import { ChatComponent } from "@mcp-synergy/react";
import { Flex, Typography, type GetProp } from "antd";
import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styled from "styled-components";

const StyledSenderWrapper = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: #111111;
  padding: 16px;
  border-top: 1px solid #222222;
  z-index: 2;

  .ant-input {
    background-color: #111111 !important;
    border-color: #222222 !important;
    color: #ffffff !important;
    font-size: 16px !important;
    height: 44px !important;
    padding: 8px 12px !important;

    &:hover {
      border-color: #0070f3 !important;
    }

    &:focus {
      border-color: #0070f3 !important;
    }

    &::placeholder {
      color: #666666 !important;
      font-size: 16px !important;
    }
  }

  .ant-input-affix-wrapper {
    background-color: #111111 !important;
    border-color: #222222 !important;
    height: 44px !important;
    padding: 0 12px !important;

    &:hover {
      border-color: #0070f3 !important;
    }

    &:focus {
      border-color: #0070f3 !important;
    }

    .ant-input {
      height: 42px !important;
      padding: 0 !important;
    }
  }

  @media (max-width: 768px) {
    padding: 12px;

    .ant-input {
      font-size: 16px !important;
      height: 48px !important;
      padding: 8px 16px !important;
    }

    .ant-input-affix-wrapper {
      height: 48px !important;
      padding: 0 16px !important;

      .ant-input {
        height: 46px !important;
      }
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
  { label: "Recommend 3 books", value: "recommend books" },
];

const Chat = () => {
  const [content, setContent] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMarkdown: BubbleProps["messageRender"] = (content) => (
    <Typography>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content?.trim() || ""}
      </ReactMarkdown>
    </Typography>
  );

  // Agent for request with XStream
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate, onError }: any) => {
      // 创建 AbortController 用于取消请求
      const abortController = new AbortController();

      // 将 AbortController 存储到 ref 中，以便外部调用
      abortControllerRef.current = abortController;

      try {
        const response = await fetch("/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-signature":
              "f3de0210ee9003d84626476c631ffc0d1ddf0c268696d7d3e2caa5a3b71273b6",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: message }],
          }),
          signal: abortController.signal, // 添加 abort signal
        });

        if (!response.ok) {
          onError(new Error("网络请求失败"));
          return;
        }

        if (!response.body) {
          onError(new Error("无法读取响应流"));
          return;
        }

        let fullResponse = "";
        let lastMeta = null; // 保存最后收到的 meta 信息

        // 🌟 使用 XStream 处理流式数据
        for await (const chunk of XStream({
          readableStream: response.body,
        })) {
          console.log("收到chunk:", chunk); // 调试日志

          // 处理 SSE 格式数据
          if (chunk.data) {
            const jsonStr = chunk.data; // 移除 "data: " 前缀
            try {
              const parsedChunk = JSON.parse(jsonStr);
              console.log("解析后的数据:", parsedChunk); // 调试日志

              // 处理新的数据结构 { code: 0, data: { content: "...", meta: {...} } }
              if (parsedChunk.code === 0 && parsedChunk.data) {
                const { content, meta } = parsedChunk.data;

                // 保存最后收到的 meta 信息
                if (meta) {
                  lastMeta = meta;
                }

                if (content) {
                  // 如果已有内容，则在新内容前添加两个换行符作为段落分隔
                  if (fullResponse && fullResponse.trim()) {
                    fullResponse += "\n\n" + content;
                  } else {
                    fullResponse = content;
                  }
                  console.log("累积内容:", fullResponse); // 调试日志

                  // 构造消息对象，包含 content 和 meta 信息
                  const messageData = {
                    content: fullResponse,
                    meta: lastMeta,
                  };

                  // 使用 onUpdate 实现流式输出
                  onUpdate(messageData);
                }
              }

              // 兼容性处理：如果还有旧格式的数据，保持兼容
              if (parsedChunk.type === "step" && parsedChunk.content) {
                if (fullResponse && fullResponse.trim()) {
                  fullResponse += "\n\n" + parsedChunk.content;
                } else {
                  fullResponse = parsedChunk.content;
                }
                console.log("累积内容 (兼容模式):", fullResponse); // 调试日志
                onUpdate(fullResponse);
              }

              // 处理错误响应
              if (parsedChunk.code !== 0 && parsedChunk.message) {
                console.error("服务器错误:", parsedChunk.message);
                onError(new Error(parsedChunk.message));
                return;
              }
            } catch (error) {
              console.error("JSON解析错误:", error, "原始数据:", jsonStr);
              // 忽略解析错误的chunk
              continue;
            }
          }
        }

        if (fullResponse) {
          // 如果收集到了 meta 信息，则构造完整的消息对象
          const finalMessage = lastMeta
            ? {
                content: fullResponse,
                meta: lastMeta,
              }
            : fullResponse;

          onSuccess(finalMessage);
        } else {
          onError(new Error("未收到有效响应"));
        }

        // 清理 AbortController ref
        abortControllerRef.current = null;
      } catch (error) {
        // 处理取消请求的情况
        if (error instanceof Error && error.name === "AbortError") {
          console.log("请求已被取消");
          // 不调用 onError，因为这是用户主动取消的
          abortControllerRef.current = null;
          return;
        }
        onError(error instanceof Error ? error : new Error(String(error)));
        // 清理 AbortController ref
        abortControllerRef.current = null;
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

  useEffect(() => {
    console.log("messagexxs", messages);
  }, [messages]);

  React.useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages]);

  // 安全的 markdown 渲染函数，处理不完整的 markdown 内容
  const safeRenderMarkdown = (content: string) => {
    if (!content) return null;

    try {
      // 预处理内容，确保不完整的 markdown 语法也能较好地渲染
      let processedContent = content.trim();

      // 如果内容以不完整的代码块标记结尾，临时补全它
      if (processedContent.split("```").length % 2 === 0) {
        // 奇数个 ``` 说明有未关闭的代码块
        processedContent += "\n```";
      }

      return (
        <Typography>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 自定义渲染器，确保更好的兼容性和样式
              p: ({ children }) => (
                <p style={{ margin: "0.5em 0" }}>{children}</p>
              ),
              h1: ({ children }) => (
                <h1
                  style={{
                    margin: "0.8em 0 0.5em 0",
                    fontSize: "1.8em",
                    fontWeight: "bold",
                  }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  style={{
                    margin: "0.8em 0 0.5em 0",
                    fontSize: "1.6em",
                    fontWeight: "bold",
                  }}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  style={{
                    margin: "0.8em 0 0.5em 0",
                    fontSize: "1.4em",
                    fontWeight: "bold",
                  }}
                >
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4
                  style={{
                    margin: "0.6em 0 0.4em 0",
                    fontSize: "1.2em",
                    fontWeight: "bold",
                  }}
                >
                  {children}
                </h4>
              ),
              ul: ({ children }) => (
                <ul style={{ margin: "0.5em 0", paddingLeft: "1.5em" }}>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol style={{ margin: "0.5em 0", paddingLeft: "1.5em" }}>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li style={{ margin: "0.2em 0" }}>{children}</li>
              ),
              strong: ({ children }) => (
                <strong style={{ fontWeight: "bold" }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em style={{ fontStyle: "italic" }}>{children}</em>
              ),
              code: ({ children, ...props }: any) =>
                props.inline ? (
                  <code
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      padding: "2px 4px",
                      borderRadius: "3px",
                      fontFamily: "monospace",
                    }}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      padding: "12px",
                      borderRadius: "6px",
                      overflow: "auto",
                      fontFamily: "monospace",
                    }}
                  >
                    <code>{children}</code>
                  </pre>
                ),
              // 表格相关组件样式
              table: ({ children }) => (
                <div style={{ overflowX: "auto", margin: "1em 0" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {children}
                </thead>
              ),
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => (
                <tr
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "bold",
                    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td
                  style={{
                    padding: "12px 16px",
                    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {children}
                </td>
              ),
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </Typography>
      );
    } catch (error) {
      // 如果 markdown 渲染失败，回退到纯文本显示
      console.warn("Markdown 渲染失败，回退到纯文本:", error);
      return (
        <Typography>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
            {content}
          </pre>
        </Typography>
      );
    }
  };

  const renderMessage = (content: any, status: string) => {
    // 统一处理数据结构：如果是对象格式 {content, meta}，则提取相应字段
    let textContent = content;
    let metaInfo = null;

    // 处理新的数据结构
    if (
      typeof content === "object" &&
      content !== null &&
      "content" in content
    ) {
      textContent = content.content;
      metaInfo = content.meta;
    }

    // 对于流式输出（loading状态），使用提取的文本内容进行 markdown 渲染
    if (status === "loading") {
      return safeRenderMarkdown(textContent);
    }

    if (status === "local") {
      return renderMarkdown(textContent);
    }

    // 如果有 meta 信息，渲染组件
    if (metaInfo) {
      const props = metaInfo?.componentProps;
      return (
        <>
          {renderMarkdown(textContent)}
          {metaInfo.serverName !== "null" && (
            <ChatComponent
              name={metaInfo.toolName}
              props={props}
              fallback={<></>}
            />
          )}
        </>
      );
    }

    // 兼容旧格式：检查原始 content 是否有 meta 字段
    const legacyMeta = content?.meta;
    if (legacyMeta) {
      const props = legacyMeta?.componentProps;
      return (
        <>
          {renderMarkdown(content?.content ?? content)}
          <ChatComponent
            name={legacyMeta.toolName}
            props={props}
            fallback={<></>}
          />
        </>
      );
    }

    return renderMarkdown(textContent);
  };

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        borderLeft: "1px solid #141414",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        <Bubble.List
          roles={roles}
          style={{ paddingTop: 8 }}
          items={messages.map(({ id, message, status }) => ({
            key: id,
            role: status === "local" ? "local" : "ai",
            content: message,
            messageRender: (content: any) => {
              return renderMessage(content, status);
            },
          }))}
        />
        <div ref={messagesEndRef} />
      </div>

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
              onCancel={() => {
                // 取消当前请求
                if (agent.isRequesting() && abortControllerRef.current) {
                  abortControllerRef.current.abort();
                  abortControllerRef.current = null;
                }
                setContent("");
              }}
              onKeyDown={onKeyDown}
              placeholder={`Input "/" to get suggestions`}
            />
          </StyledSenderWrapper>
        )}
      </Suggestion>
    </Flex>
  );
};

export default Chat;
