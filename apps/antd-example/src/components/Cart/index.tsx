/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DeleteOutlined } from "@ant-design/icons";
import { List, Button, Card, Space } from "antd";
import { useIsMCPComponent } from "@mcp-synergy/react";


/**
 * @mcp-comp Cart
 * @mcp-prop-path books
 */
export interface Book { 
    id: string;    
    title: string;
    author: string;
    cover: string;
    price: number;
    count: number;
}

/**
 * @mcp-comp Cart
 * @mcp-description Display shopping cart information
 * @mcp-server-name mcp-component-render
 */
export interface BooksCartProps {
  books?: Book[];
  handleGoBack?: () => void;
  onRemove?: (id: string) => void;
}
const Cart = ({
  books,
  handleGoBack,
  onRemove,
}: BooksCartProps) => {
  
  const isMCPComponent = useIsMCPComponent();

  const myBooks = (books ?? JSON.parse(localStorage.getItem("cart") || "[]")) as {
    id: string;
    title: string;
    author: string;
    cover: string;
    price: number;
    count: number;
  }[];
  
  return (
    <Space
      direction="vertical"
      style={{
        width: "100%",
      }}
    >
      <Card
        title={
         !isMCPComponent && <Button type="link" onClick={handleGoBack}>
            Go Back
          </Button>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={myBooks}
          renderItem={(item) => (
            <List.Item
              actions={!isMCPComponent  ? [
                <Button
                  type="link"
                  onClick={() => {
                    // @ts-ignore
                    onRemove?.(item.id);
                  }}
                  icon={<DeleteOutlined />}
                  shape="circle"
                ></Button>,
                // <Button type="link" onClick={() => handleAdjustQuantity(item.id)}>
                //   Adjust Quantity
                // </Button>,
              ] :[]}
            >
              <List.Item.Meta
                avatar={
                  <img
                    src={item.cover}
                    alt={item.title}
                    style={{ width: 50, height: 50 }}
                  />
                }
                title={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {item.title}
                  </span>
                }
                description={`Price: $${item.price} | Quantity: ${item.count}`}
              />
            </List.Item>
          )}
        />
      </Card>
      <Card
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Space direction="vertical">
          <h2>
            Total: $
            {myBooks.reduce((acc, book) => acc + book.price, 0)?.toFixed(2)}
          </h2>
          <Button type="primary">Checkout</Button>
        </Space>
      </Card>
    </Space>
  );
};

export default Cart;
