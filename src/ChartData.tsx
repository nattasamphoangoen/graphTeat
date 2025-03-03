import { useState, FormEvent } from "react";
import { useContext } from "react";
import { DataContext, type ChartType } from "./context/DataContext";
import TopicDetails from "./components/TopicDetails";

interface DetailForm {
  name: string;
  value: string;
  color: string;
}

const ChartData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("ChartData must be used within DataProvider");
  const { topics, addTopic, addDetail } = context;
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [showDetailForm, setShowDetailForm] = useState(false);

  const [topicData, setTopicData] = useState<{
    name: string;
    chartType: ChartType;
  }>({
    name: "",
    chartType: ""
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
    setDetailData({
      ...detailData,
      [name]: value,
    });
  };

  const handleTopicSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topicData.chartType) {
      alert("Please select a chart type");
      return;
    }
    addTopic(topicData.name, topicData.chartType);
    setTopicData({
      name: "",
      chartType: ""
    });
    setSelectedTopicId(null);
  };

  const handleDetailSubmit = async (e: FormEvent) => {
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
    <div className="chart-container" style={{ padding: "2rem", margin: "0 auto", width: "1200px" }}>
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
        <h2 style={{ margin: "0", color: "#333", fontSize: "1.5rem" }}>Fill Data</h2>
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
          <div className="form-group">
            <label htmlFor="chartType">Chart Type:</label>
            <select
              id="chartType"
              name="chartType"
              className="input"
              value={topicData.chartType}
              onChange={(e) => setTopicData({...topicData, chartType: e.target.value as ChartType})}
              required
            >
              <option value="" disabled>Select Chart Type</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="line">Line Chart</option>
            </select>
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
              className="color-input"
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
