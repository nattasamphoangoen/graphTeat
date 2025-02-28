import { useContext } from "react";
import { DataContext } from "../context/DataContext";
import TopicDetails from "../components/TopicDetails";

const Chat = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("Chat must be used within DataProvider");

  return (
    <div className="chat-container">
      <TopicDetails />
    </div>
  );
};

export default Chat;
