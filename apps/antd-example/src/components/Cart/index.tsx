import { DeleteOutlined } from "@ant-design/icons";
import { List, Button, Card, Space } from "antd";

const Cart = ({
  books,
  handleGoBack,
  onRemove,
}: {
  books: {
    id: string;
    title: string;
    author: string;
    cover: string;
    price: number;
    count: number;
  }[];
  handleGoBack: () => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <Space
      direction="vertical"
      style={{
        width: "100%",
      }}
    >
      <Card
        title={
          <Button type="link" onClick={handleGoBack}>
            Go Back
          </Button>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={books}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => {
                    onRemove(item.id);
                  }}
                  icon={<DeleteOutlined />}
                  shape="circle"
                ></Button>,
                // <Button type="link" onClick={() => handleAdjustQuantity(item.id)}>
                //   Adjust Quantity
                // </Button>,
              ]}
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
            {books.reduce((acc, book) => acc + book.price, 0)?.toFixed(2)}
          </h2>
          <Button type="primary">Checkout</Button>
        </Space>
      </Card>
    </Space>
  );
};

export default Cart;
