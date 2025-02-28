import { useContext, useState } from "react";
import { DataContext } from "../context/DataContext";

interface DetailData {
  name: string;
  value: number;
  color: string;
}

interface TopicData {
  id: number;
  name: string;
  details: DetailData[];
}

const TopicDetails = () => {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("TopicDetails must be used within DataProvider");
  const {
    topics,
    deleteTopic,
    deleteDetail,
    updateTopic,
    updateDetail,
    addDetail,
  } = context;

  const [editingTopic, setEditingTopic] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [editingDetail, setEditingDetail] = useState<{
    topicId: number;
    index: number;
    detail: DetailData;
  } | null>(null);

  const [addingDetail, setAddingDetail] = useState<{
    topicId: number;
    detail: DetailData;
  } | null>(null);

  const handleTopicEdit = (id: number, name: string) => {
    setEditingTopic({ id, name });
  };

  const handleDetailEdit = (
    topicId: number,
    index: number,
    detail: DetailData
  ) => {
    setEditingDetail({ topicId, index, detail: { ...detail } });
  };

  const handleTopicUpdate = () => {
    if (editingTopic) {
      updateTopic(editingTopic.id, editingTopic.name);
      setEditingTopic(null);
    }
  };

  const handleDetailUpdate = () => {
    if (editingDetail) {
      updateDetail(
        editingDetail.topicId,
        editingDetail.index,
        editingDetail.detail
      );
      setEditingDetail(null);
    }
  };

  return (
    <section className="topic-details-section">
      <h2>Topic Details</h2>
      <div className="topics-list">
        {topics.map((topic: TopicData) => (
          <div key={topic.id} className="topic-card">
            <div className="topic-header">
              {editingTopic?.id === topic.id ? (
                <div className="edit-controls">
                  <input
                    type="text"
                    value={editingTopic.name}
                    onChange={(e) =>
                      setEditingTopic({ ...editingTopic, name: e.target.value })
                    }
                  />
                  <button onClick={handleTopicUpdate}>Save</button>
                  <button onClick={() => setEditingTopic(null)}>Cancel</button>
                </div>
              ) : (
                <div className="header-controls">
                  <h3>{topic.name}</h3>
                  <div className="topic-actions">
                    <button
                      onClick={() => handleTopicEdit(topic.id, topic.name)}
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteTopic(topic.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="details-container">
              <h4>Details:</h4>
              {topic.details.length > 0 ? (
                <ul className="details-list">
                  {topic.details.map((detail: DetailData, index: number) => (
                    <li
                      key={index}
                      className="detail-item"
                      style={{ borderLeftColor: detail.color }}
                    >
                      {editingDetail?.topicId === topic.id &&
                      editingDetail.index === index ? (
                        <div className="edit-controls">
                          <input
                            type="text"
                            value={editingDetail.detail.name}
                            onChange={(e) =>
                              setEditingDetail({
                                ...editingDetail,
                                detail: {
                                  ...editingDetail.detail,
                                  name: e.target.value,
                                },
                              })
                            }
                          />
                          <input
                            type="number"
                            value={editingDetail.detail.value}
                            onChange={(e) =>
                              setEditingDetail({
                                ...editingDetail,
                                detail: {
                                  ...editingDetail.detail,
                                  value: Number(e.target.value),
                                },
                              })
                            }
                          />
                          <input
                            type="color"
                            value={editingDetail.detail.color}
                            onChange={(e) =>
                              setEditingDetail({
                                ...editingDetail,
                                detail: {
                                  ...editingDetail.detail,
                                  color: e.target.value,
                                },
                              })
                            }
                          />
                          <button onClick={handleDetailUpdate}>Save</button>
                          <button onClick={() => setEditingDetail(null)}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="detail-content">
                            <span className="detail-name">{detail.name}</span>
                            <span className="detail-value">{detail.value}</span>
                          </div>
                          <div className="detail-actions">
                            <button
                              onClick={() =>
                                handleDetailEdit(topic.id, index, detail)
                              }
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteDetail(topic.id, index)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-details">No details added yet</p>
              )}
              {addingDetail?.topicId === topic.id ? (
                <div className="edit-controls">
                  <input
                    type="text"
                    placeholder="Detail name"
                    value={addingDetail.detail.name}
                    onChange={(e) =>
                      setAddingDetail({
                        ...addingDetail,
                        detail: {
                          ...addingDetail.detail,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Value"
                    value={addingDetail.detail.value}
                    onChange={(e) =>
                      setAddingDetail({
                        ...addingDetail,
                        detail: {
                          ...addingDetail.detail,
                          value: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <input
                    type="color"
                    value={addingDetail.detail.color}
                    onChange={(e) =>
                      setAddingDetail({
                        ...addingDetail,
                        detail: {
                          ...addingDetail.detail,
                          color: e.target.value,
                        },
                      })
                    }
                  />
                  <button
                    onClick={() => {
                      addDetail(addingDetail.topicId, addingDetail.detail);
                      setAddingDetail(null);
                    }}
                  >
                    Save
                  </button>
                  <button onClick={() => setAddingDetail(null)}>Cancel</button>
                </div>
              ) : (
                <button
                  className="add-detail-btn"
                  onClick={() =>
                    setAddingDetail({
                      topicId: topic.id,
                      detail: { name: "", value: 0, color: "#000000" },
                    })
                  }
                >
                  Add Detail
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopicDetails;
