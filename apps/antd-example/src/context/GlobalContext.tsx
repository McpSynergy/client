import React, { createContext, useContext, useReducer, ReactNode } from "react";

// 定义类型
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  price: number;
}

export interface CartItem extends Book {
  count: number;
}

export interface User {
  name: string;
  title: string;
  avatar: string;
  email: string;
  phone?: string;
  company?: string;
  skills: Array<{
    name: string;
    color?: string;
  }>;
  stats: {
    projects: number;
    followers: number;
    following: number;
  };
}

export interface GlobalState {
  books: Book[];
  user: User;
  cart: CartItem[];
  searchTerm: string;
  isLoading: boolean;
}

// 定义 Action 类型
export type GlobalAction =
  | { type: "SET_BOOKS"; payload: Book[] }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "ADD_TO_CART"; payload: Book }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_ITEM"; payload: { id: string; count: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_BOOK"; payload: Book }
  | { type: "UPDATE_BOOK"; payload: Book }
  | { type: "DELETE_BOOK"; payload: string };

// 初始状态
const initialState: GlobalState = {
  books: [
    {
      id: "1",
      title: "Computing and Technology Ethics",
      author: "Emanuelle Burton, Judy Goldsmith, Nicholas Mattei",
      cover:
        "https://i.pinimg.com/736x/5b/0d/80/5b0d809c4c6a3cfb5f6f87562f98bf16.jpg",
      price: 45.99,
    },
    {
      id: "2",
      title:
        "More than a Glitch: Confronting Race, Gender, and Ability Bias in Tech",
      author: "Meredith Broussard",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0262547260.01.L.jpg",
      price: 29.99,
    },
    {
      id: "3",
      title: "Working with AI: Real Stories of Human-Machine Collaboration",
      author: "Thomas H. Davenport & Steven M. Miller",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0262047519.01.L.jpg",
      price: 32.99,
    },
    {
      id: "4",
      title:
        "Quantum Supremacy: How the Quantum Computer Revolution Will Change Everything",
      author: "Michio Kaku",
      cover:
        "https://i.pinimg.com/736x/5b/0d/80/5b0d809c4c6a3cfb5f6f87562f98bf16.jpg",
      price: 28.99,
    },
    {
      id: "5",
      title: "Business Success with Open Source",
      author: "VM (Vicky) Brasseur",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1680509551.01.L.jpg",
      price: 39.99,
    },
    {
      id: "6",
      title: "The Internet Con: How to Seize the Means of Computation",
      author: "Cory Doctorow",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1804291277.01.L.jpg",
      price: 24.99,
    },
    {
      id: "7",
      title:
        "How Infrastructure Works: Inside the Systems That Shape Our World",
      author: "Deb Chachra",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0593086430.01.L.jpg",
      price: 27.99,
    },
    {
      id: "8",
      title: "Extremely Online: The Untold Story of Fame, Influence, and Power",
      author: "Taylor Lorenz",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1982146745.01.L.jpg",
      price: 26.99,
    },
    {
      id: "9",
      title: "The Apple II Age: How the Computer Became Personal",
      author: "Laine Nooney",
      cover:
        "https://i.pinimg.com/736x/5b/0d/80/5b0d809c4c6a3cfb5f6f87562f98bf16.jpg",
      price: 35.99,
    },
    {
      id: "10",
      title:
        "Fancy Bear Goes Phishing: The Dark History of the Information Age",
      author: "Scott J. Shapiro",
      cover:
        "https://i.pinimg.com/736x/5b/0d/80/5b0d809c4c6a3cfb5f6f87562f98bf16.jpg",
      price: 29.99,
    },
  ],
  user: {
    name: "John Doe",
    title: "Senior Developer",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    company: "Example Corp",
    skills: [
      { name: "JavaScript", color: "gold" },
      { name: "React", color: "cyan" },
      { name: "Node.js", color: "green" },
      { name: "TypeScript", color: "blue" },
      { name: "Python", color: "purple" },
    ],
    stats: {
      projects: 24,
      followers: 1489,
      following: 583,
    },
  },
  cart: [],
  searchTerm: "",
  isLoading: false,
};

// Reducer 函数
const globalReducer = (
  state: GlobalState,
  action: GlobalAction,
): GlobalState => {
  switch (action.type) {
    case "SET_BOOKS":
      return {
        ...state,
        books: action.payload,
      };

    case "ADD_BOOK":
      return {
        ...state,
        books: [...state.books, action.payload],
      };

    case "UPDATE_BOOK":
      return {
        ...state,
        books: state.books.map((book) =>
          book.id === action.payload.id ? action.payload : book,
        ),
      };

    case "DELETE_BOOK":
      return {
        ...state,
        books: state.books.filter((book) => book.id !== action.payload),
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case "ADD_TO_CART": {
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, count: item.count + 1 }
              : item,
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, count: 1 }],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_CART_ITEM":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, count: action.payload.count }
            : item,
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
      };

    case "SET_SEARCH_TERM":
      return {
        ...state,
        searchTerm: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Context 接口
interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  // 辅助函数
  addToCart: (book: Book) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, count: number) => void;
  clearCart: () => void;
  updateUser: (user: Partial<User>) => void;
  setSearchTerm: (term: string) => void;
  getFilteredBooks: () => Book[];
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

// 创建 Context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider 组件
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // 辅助函数
  const addToCart = (book: Book) => {
    dispatch({ type: "ADD_TO_CART", payload: book });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const updateCartItem = (id: string, count: number) => {
    if (count <= 0) {
      removeFromCart(id);
    } else {
      dispatch({ type: "UPDATE_CART_ITEM", payload: { id, count } });
    }
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const updateUser = (user: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: user });
  };

  const setSearchTerm = (term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  };

  const getFilteredBooks = () => {
    if (!state.searchTerm) {
      return state.books;
    }
    return state.books.filter(
      (book) =>
        book.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(state.searchTerm.toLowerCase()),
    );
  };

  const getCartTotal = () => {
    return state.cart.reduce(
      (total, item) => total + item.price * item.count,
      0,
    );
  };

  const getCartItemCount = () => {
    return state.cart.reduce((total, item) => total + item.count, 0);
  };

  const value: GlobalContextType = {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    updateUser,
    setSearchTerm,
    getFilteredBooks,
    getCartTotal,
    getCartItemCount,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

// 自定义 Hook
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

// 专门的 hooks
export const useBooks = () => {
  const { state, dispatch, setSearchTerm, getFilteredBooks } =
    useGlobalContext();

  return {
    books: state.books,
    searchTerm: state.searchTerm,
    filteredBooks: getFilteredBooks(),
    setSearchTerm,
    addBook: (book: Book) => dispatch({ type: "ADD_BOOK", payload: book }),
    updateBook: (book: Book) =>
      dispatch({ type: "UPDATE_BOOK", payload: book }),
    deleteBook: (id: string) => dispatch({ type: "DELETE_BOOK", payload: id }),
  };
};

export const useUser = () => {
  const { state, updateUser } = useGlobalContext();

  return {
    user: state.user,
    updateUser,
  };
};

export const useCart = () => {
  const {
    state,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getCartItemCount,
  } = useGlobalContext();

  return {
    cart: state.cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    total: getCartTotal(),
    itemCount: getCartItemCount(),
  };
};
