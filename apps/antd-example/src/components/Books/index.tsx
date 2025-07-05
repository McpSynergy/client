import { Badge, Input } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import BookCard from "./BookCard";
import styled from "styled-components";
import { useBooks, useCart } from "../../context/GlobalContext";

const ScrollableContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #111111;
  }

  &::-webkit-scrollbar-thumb {
    background: #333333;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #444444;
  }
`;

const Container = styled.div`
  height: calc(100vh - 64px - 48px);
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const SearchWrapper = styled.div`
  width: 100%;
  padding: 16px 24px;
  background-color: #111111;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid #222222;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  .ant-input-affix-wrapper {
    background-color: #1a1a1a !important;
    border-color: #222222 !important;
    color: #ffffff !important;

    &:hover {
      border-color: #0070f3 !important;
    }

    &:focus {
      border-color: #0070f3 !important;
    }

    .ant-input {
      background-color: #1a1a1a !important;
      color: #ffffff !important;

      &::placeholder {
        color: #666666 !important;
      }
    }
  }

  .ant-btn {
    background-color: hsla(0, 0%, 93%, 1) !important;
    border-color: hsla(0, 0%, 93%, 1) !important;
    color: #000000 !important;

    &:hover {
      background-color: hsla(0, 0%, 85%, 1) !important;
      border-color: hsla(0, 0%, 85%, 1) !important;
    }

    &:active {
      background-color: hsla(0, 0%, 80%, 1) !important;
      border-color: hsla(0, 0%, 80%, 1) !important;
    }
  }
`;

const Books = ({ onViewCart }: { onViewCart: VoidFunction }) => {
  const { filteredBooks, searchTerm, setSearchTerm } = useBooks();
  const { addToCart, itemCount } = useCart();

  return (
    <Container>
      <SearchWrapper>
        <Input
          placeholder="search book name or author"
          allowClear
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%" }}
        />
      </SearchWrapper>
      <ScrollableContainer>
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            addToCart={() => addToCart(book)}
          />
        ))}
      </ScrollableContainer>
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 10,
        }}
      >
        <Badge count={itemCount} size="small">
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333333",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              color: "#ffffff",
              fontSize: "18px",
            }}
            onClick={onViewCart}
          >
            <ShoppingCartOutlined />
          </div>
        </Badge>
      </div>
    </Container>
  );
};

export default Books;
