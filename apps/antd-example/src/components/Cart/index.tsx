import { DeleteOutlined } from "@ant-design/icons";
import { List, Button, Card, Space } from "antd";
import { useIsMCPComponent } from "@mcp-synergy/react";
import { useCart } from "../../context/GlobalContext";

/**
 * @mcp-comp Cart
 * @mcp-description Display shopping cart information
 * @mcp-server-name mcp-component-render
 */
export interface BooksCartProps {
  handleGoBack?: () => void;
}

const Cart = ({ handleGoBack }: BooksCartProps) => {
  const isMCPComponent = useIsMCPComponent();
  const { cart, removeFromCart, total, clearCart } = useCart();

  return (
    <Space
      direction="vertical"
      style={{
        width: "100%",
      }}
    >
      <Card
        title={
          !isMCPComponent && (
            <Button type="link" onClick={handleGoBack}>
              Go Back
            </Button>
          )
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={cart}
          renderItem={(item) => (
            <List.Item
              actions={
                !isMCPComponent
                  ? [
                      <Button
                        type="link"
                        onClick={() => {
                          removeFromCart(item.id);
                        }}
                        icon={<DeleteOutlined />}
                        shape="circle"
                        danger
                      ></Button>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                avatar={
                  <img
                    src={item.cover}
                    alt={item.title}
                    style={{ width: 50, height: 50, objectFit: "cover" }}
                  />
                }
                title={
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {item.title}
                  </span>
                }
                description={`Price: $${item.price} | Count: ${item.count}`}
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
          <h2>总计: ${total.toFixed(2)}</h2>
          <Space>
            <Button
              onClick={() => {
                clearCart();
              }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={() => {
                alert("Checkout done");
                clearCart();
              }}
            >
              Checkout
            </Button>
          </Space>
        </Space>
      </Card>
    </Space>
  );
};

export default Cart;
