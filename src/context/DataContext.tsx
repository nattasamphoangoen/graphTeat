import { createContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface TopicData {
  id: number;
  name: string;
  details: DetailData[];
}

interface DetailData {
  id?: number;
  topic_id?: number;
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
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*');

      if (topicsError) throw topicsError;

      const { data: detailsData, error: detailsError } = await supabase
        .from('details')
        .select('*');

      if (detailsError) throw detailsError;

      // Combine topics with their details
      const topicsWithDetails = topicsData.map(topic => ({
        ...topic,
        details: (detailsData
          .filter(detail => detail.topic_id === topic.id) || [])
          .map(detail => ({
            ...detail,
            value: Number(detail.value) // Ensure value is a number
          }))
      }));

      console.log('Processed topics data:', topicsWithDetails);

      setTopics(topicsWithDetails);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTopic = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;

      setTopics(prev => [...prev, { ...data, details: [] }]);
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  const addDetail = async (topicId: number, detail: DetailData) => {
    try {
      const { data, error } = await supabase
        .from('details')
        .insert([{ ...detail, topic_id: topicId }])
        .select()
        .single();

      if (error) throw error;

      setTopics(prev =>
        prev.map(topic => {
          if (topic.id === topicId) {
            return {
              ...topic,
          details: [...topic.details, { ...data, value: Number(data.value) }]
            };
          }
          return topic;
        })
      );
    } catch (error) {
      console.error('Error adding detail:', error);
    }
  };

  const deleteTopic = async (id: number) => {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTopics(prev => prev.filter(topic => topic.id !== id));
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const deleteDetail = async (topicId: number, detailIndex: number) => {
    try {
      const detail = topics
        .find(t => t.id === topicId)
        ?.details[detailIndex];

      if (!detail) return;

      const { error } = await supabase
        .from('details')
        .delete()
        .eq('id', detail.id);

      if (error) throw error;

      setTopics(prev =>
        prev.map(topic => {
          if (topic.id === topicId) {
            return {
              ...topic,
              details: topic.details.filter((_, index) => index !== detailIndex)
            };
          }
          return topic;
        })
      );
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };

  const updateTopic = async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setTopics(prev =>
        prev.map(topic => {
          if (topic.id === id) {
            return { ...topic, name };
          }
          return topic;
        })
      );
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const updateDetail = async (
    topicId: number,
    detailIndex: number,
    detail: DetailData
  ) => {
    try {
      const currentDetail = topics
        .find(t => t.id === topicId)
        ?.details[detailIndex];

      if (!currentDetail) return;

      const { error } = await supabase
        .from('details')
        .update({ ...detail })
        .eq('id', currentDetail.id);

      if (error) throw error;

      setTopics(prev =>
        prev.map(topic => {
          if (topic.id === topicId) {
            const newDetails = [...topic.details];
            newDetails[detailIndex] = { ...detail, id: currentDetail.id };
            return { ...topic, details: newDetails };
          }
          return topic;
        })
      );
    } catch (error) {
      console.error('Error updating detail:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
