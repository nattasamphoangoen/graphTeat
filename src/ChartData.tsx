import { useState, FormEvent } from "react";
import { useData } from "./context/useData";
import TopicDetails from "./components/TopicDetails";

interface DetailForm {
  name: string;
  value: string;
  color: string;
}

const ChartData = () => {
  const { topics, addTopic, addDetail } = useData();
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [showDetailForm, setShowDetailForm] = useState(false);

  const [topicData, setTopicData] = useState({
    name: "",
  });

  const [detailData, setDetailData] = useState<DetailForm>({
    name: "",
    value: "",
    color: "#4a90e2",
  });

  // const handleTopicSelect = (topicId: number) => {
  //   setSelectedTopicId(topicId);
  //   const topic = topics.find((t) => t.id === topicId);
  //   if (topic) {
  //     setTopicData({
  //       name: topic.name,
  //     });
  //   }
  //   setShowDetailForm(false);
  // };

  const handleTopicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTopicData({
      ...topicData,
      [name]: value,
    });
  };

  const handleDetailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(":", name, value);

    setDetailData({
      ...detailData,
      [name]: value,
    });
  };

  const handleTopicSubmit = (e: FormEvent) => {
    e.preventDefault();
    addTopic(topicData.name);
    setTopicData({
      name: "",
    });
    setSelectedTopicId(null);
  };

  const handleDetailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedTopicId !== null) {
      addDetail(selectedTopicId, {
        name: detailData.name,
        value: Number(detailData.value),
        color: detailData.color,
      });
      setDetailData({
        name: "",
        value: "",
        color: "#4a90e2",
      });
      setShowDetailForm(false);
    }
  };

  return (
    <div className="chart-container">
      {/* <TopicDetails /> */}
      {/* <section className="topic-section">
        <h2>Select Topic</h2>
        <div className="topic-buttons">
          {topics.map((topic) => (
            <div key={topic.id} className="topic-item">
              <button
                className={`topic-btn ${
                  selectedTopicId === topic.id ? "active" : ""
                }`}
                onClick={() => handleTopicSelect(topic.id)}
              >
                {topic.name}
              </button>
              {selectedTopicId === topic.id && (
                <button
                  className="detail-btn"
                  onClick={() => setShowDetailForm(true)}
                >
                  Add Details
                </button>
              )}
            </div>
          ))}
        </div>
      </section> */}

      <section className="form-section">
        <h2 style={{ margin: "0" }}>Fill Data</h2>
        <form onSubmit={handleTopicSubmit} className="chart-form">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              className="input"
              type="text"
              id="name"
              name="name"
              value={topicData.name}
              onChange={handleTopicInputChange}
              required
              placeholder="Enter name"
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Topic
          </button>
        </form>
      </section>

      {showDetailForm && selectedTopicId && (
        <section className="form-section detail-form">
          <h3>
            Add Details for {topics.find((t) => t.id === selectedTopicId)?.name}
          </h3>
          <form onSubmit={handleDetailSubmit} className="chart-form">
            <div className="form-group">
              <label htmlFor="detail-name">Name:</label>
              <input
                type="text"
                id="detail-name"
                name="name"
                className="input"
                value={detailData.name}
                onChange={handleDetailInputChange}
                required
                placeholder="Enter detail name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="value">Value:</label>
              <input
                type="number"
                id="value"
                name="value"
                className="input"
                value={detailData.value}
                onChange={handleDetailInputChange}
                required
                placeholder="Enter value"
              />
            </div>

            <div
              className="form-group"
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <label htmlFor="color">Color:</label>
              <input
                type="color"
                id="color"
                name="color"
                style={{
                  width: "50px", // ปรับขนาดให้ใหญ่ขึ้น
                  height: "30px",
                  cursor: "pointer",
                  marginLeft: "10px",
                  padding: "0",
                  background: "none", // ลบพื้นหลังที่ไม่จำเป็น
                  border: "none",
                }}
                value={detailData.color}
                onChange={handleDetailInputChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Submit Details
            </button>
          </form>
        </section>
      )}

      <TopicDetails />
    </div>
  );
};

export default ChartData;
