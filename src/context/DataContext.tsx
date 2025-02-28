import { createContext, useState, ReactNode } from "react";

interface TopicData {
  id: number;
  name: string;
  details: DetailData[];
}

interface DetailData {
  name: string;
  value: number;
  color: string;
}

interface DataContextType {
  topics: TopicData[];
  addTopic: (name: string) => void;
  addDetail: (topicId: number, detail: DetailData) => void;
  deleteTopic: (id: number) => void;
  deleteDetail: (topicId: number, detailIndex: number) => void;
  updateTopic: (id: number, name: string) => void;
  updateDetail: (
    topicId: number,
    detailIndex: number,
    detail: DetailData
  ) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [topics, setTopics] = useState<TopicData[]>([]);

  const addTopic = (name: string) => {
    setTopics((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        details: [],
      },
    ]);
  };

  const addDetail = (topicId: number, detail: DetailData) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            details: [...topic.details, detail],
          };
        }
        return topic;
      })
    );
  };

  const deleteTopic = (id: number) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== id));
  };

  const deleteDetail = (topicId: number, detailIndex: number) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            details: topic.details.filter((_, index) => index !== detailIndex),
          };
        }
        return topic;
      })
    );
  };

  const updateTopic = (id: number, name: string) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id === id) {
          return {
            ...topic,
            name,
          };
        }
        return topic;
      })
    );
  };

  const updateDetail = (
    topicId: number,
    detailIndex: number,
    detail: DetailData
  ) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id === topicId) {
          const newDetails = [...topic.details];
          newDetails[detailIndex] = detail;
          return {
            ...topic,
            details: newDetails,
          };
        }
        return topic;
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        topics,
        addTopic,
        addDetail,
        deleteTopic,
        deleteDetail,
        updateTopic,
        updateDetail,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
export { DataContext };
// export const useData = () => {
//   const context = useContext(DataContext);
//   if (context === undefined) {
//     throw new Error("useData must be used within a DataProvider");
//   }
//   return context;
// };
