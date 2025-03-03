import { useState, useContext, useRef } from "react";
import { DataContext, type ChartType } from "../context/DataContext";
import { Pie, Bar, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';

const TopicDetails = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("TopicDetails must be used within DataProvider");

  // const [newTopicName, setNewTopicName] = useState("");
  // const [selectedChartType, setSelectedChartType] = useState<ChartType>("bar");
  const [addingDetail, setAddingDetail] = useState<{
    topicId: number;
    detail: { name: string; value: number; color: string };
  } | null>(null);

  const [editingDetail, setEditingDetail] = useState<{
    topicId: number;
    detailIndex: number;
    detail: { name: string; value: number; color: string };
  } | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");
  const [editingTopicChartType, setEditingTopicChartType] = useState<ChartType>("");

  // const handleAddTopic = () => {
  //   if (newTopicName.trim()) {
  //     context.addTopic(newTopicName, selectedChartType);
  //     setNewTopicName("");
  //     setSelectedChartType("bar");
  //   }
  // };

  const handleEditTopic = (id: number) => {
    const topic = context.topics.find((t) => t.id === id);
    if (topic) {
      setEditingTopicId(id);
      setEditingTopicName(topic.name);
      setEditingTopicChartType(topic.chartType);
    }
  };

  const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const setChartRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      chartRefs.current[id] = el;
    }
  };

  const captureChart = async (elementId: string): Promise<string> => {
    const element = chartRefs.current[elementId];
    if (!element) return '';
    
    const canvas = await html2canvas(element);
    return canvas.toDataURL('image/png');
  };

  const handleExportToExcel = async () => {
    if (!context.topics.length) {
      alert("No data to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    
    // Overview sheet
    const overviewSheet = workbook.addWorksheet('Overview');
    overviewSheet.addRow(['Chart Data Export']);
    overviewSheet.addRow(['Generated on:', new Date().toLocaleString()]);
    overviewSheet.addRow(['']);
    overviewSheet.addRow(['Summary']);
    overviewSheet.addRow(['Total Topics:', context.topics.length]);
    overviewSheet.addRow(['Total Details:', context.topics.reduce((sum, t) => sum + t.details.length, 0)]);

    // Process each topic and create individual sheets with charts
    for (const topic of context.topics) {
      const sheetName = `${topic.name.slice(0, 20)}_${topic.chartType}`;
      const sheet = workbook.addWorksheet(sheetName);
      
      // Add topic data
      sheet.addRow(['Topic Details']);
      sheet.addRow(['Name:', topic.name]);
      sheet.addRow(['Chart Type:', topic.chartType]);
      sheet.addRow(['']);
      sheet.addRow(['Details']);
      sheet.addRow(['Name', 'Value', 'Color', 'Percentage']);
      
      const total = topic.details.reduce((sum, d) => sum + d.value, 0);
      topic.details.forEach(detail => {
        sheet.addRow([
          detail.name,
          detail.value,
          detail.color,
          `${((detail.value / total) * 100).toFixed(2)}%`
        ]);
      });

      // Create and capture chart image
      const chartImage = await captureChart(`chart-${topic.id}`);
      if (chartImage) {
        const imageId = workbook.addImage({
          base64: chartImage.split('base64,')[1],
          extension: 'png',
        });
        sheet.addImage(imageId, {
          tl: { col: 0, row: sheet.lastRow!.number + 2 },
          ext: { width: 600, height: 400 }
        });
      }

      // Format columns
      sheet.getColumn(1).width = 30;
      sheet.getColumn(2).width = 15;
      sheet.getColumn(3).width = 15;
      sheet.getColumn(4).width = 15;
    }

    // Save workbook
    await workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chart-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleUpdateTopic = () => {
    if (editingTopicId !== null && editingTopicName.trim() && editingTopicChartType) {
      context.updateTopic(editingTopicId, editingTopicName, editingTopicChartType);
      setEditingTopicId(null);
      setEditingTopicName("");
      setEditingTopicChartType("");
    } else if (!editingTopicChartType) {
      alert("Please select a chart type");
    }
  };

  return (
    <div className="topic-details-section">
      <div className="export-section" style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button 
          onClick={handleExportToExcel}
          style={{
            padding: '8px 16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export to Excel
        </button>
      </div>
      {/* <div className="topic-card">
        <h3>Add New Topic</h3>
        <div className="edit-controls">
          <input
            type="text"
            placeholder="Topic Name"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
          />
          <select 
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value as ChartType)}
                    >
                      <option value="" disabled>Select Chart Type</option>
                      <option value="bar">Bar Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="line">Line Chart</option>
                    </select>
          <button onClick={handleAddTopic}>Add Topic</button>
        </div>
      </div> */}

      {/* Hidden chart elements for capturing */}
      <div style={{ display: 'none' }}>
        {context.topics.map(topic => (
          <div key={topic.id} ref={setChartRef(`chart-${topic.id}`)}>
            {topic.chartType === 'pie' && (
              <Pie
                data={{
                  labels: topic.details.map(d => d.name),
                  datasets: [{
                    data: topic.details.map(d => d.value),
                    backgroundColor: topic.details.map(d => d.color)
                  }]
                }}
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: topic.name
                    }
                  }
                }}
              />
            )}
            {topic.chartType === 'bar' && (
              <Bar
                data={{
                  labels: topic.details.map(d => d.name),
                  datasets: [{
                    data: topic.details.map(d => d.value),
                    backgroundColor: topic.details.map(d => d.color)
                  }]
                }}
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: topic.name
                    }
                  }
                }}
              />
            )}
            {topic.chartType === 'line' && (
              <Line
                data={{
                  labels: topic.details.map(d => d.name),
                  datasets: [{
                    data: topic.details.map(d => d.value),
                    borderColor: topic.details[0]?.color || '#4a90e2',
                    fill: false
                  }]
                }}
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: topic.name
                    }
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="topics-list">
        {context.topics.map((topic) => (
          <div key={topic.id} className="topic-card">
            <div className="topic-header">
              <div className="header-controls">
                {editingTopicId === topic.id ? (
                  <div className="edit-controls">
                    <input
                      type="text"
                      value={editingTopicName}
                      onChange={(e) => setEditingTopicName(e.target.value)}
                    />
                    <select
                      value={editingTopicChartType}
                      onChange={(e) => setEditingTopicChartType(e.target.value as ChartType)}
                    >
                      <option value="" disabled>Select Chart Type</option>
                      <option value="bar">Bar Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="line">Line Chart</option>
                    </select>
                    <button onClick={handleUpdateTopic}>Save</button>
                    <button onClick={() => setEditingTopicId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <h3>{topic.name}</h3>
                    <div className="topic-actions">
                      <button onClick={() => handleEditTopic(topic.id)}>
                        Edit
                      </button>
                      <button onClick={() => context.deleteTopic(topic.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="details-container">
              <h4>Details</h4>
              {topic.details.map((detail, index) => (
                editingDetail?.topicId === topic.id && editingDetail.detailIndex === index ? (
                  <div key={index} className="edit-controls">
                    <input
                      type="text"
                      placeholder="Detail name"
                      style={{ width: "50%", color: "#000", background: "#fff" }}
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
                      placeholder="Value"
                      style={{ width: "50%", color: "#000", background: "#fff" }}
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
                      style={{ width: "50px", color: "#000", background: "#fff" }}
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
                    <button
                      onClick={() => {
                        context.updateDetail(topic.id, index, editingDetail.detail);
                        setEditingDetail(null);
                      }}
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingDetail(null)}>Cancel</button>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="detail-item"
                    style={{ borderLeftColor: detail.color }}
                  >
                    <div className="detail-content">
                      <span className="detail-name">{detail.name}:</span>
                      <span className="detail-value">{detail.value}</span>
                    </div>
                    <div className="detail-actions">
                      <button
                        onClick={() =>
                          setEditingDetail({
                            topicId: topic.id,
                            detailIndex: index,
                            detail: { ...detail }
                          })
                        }
                      >
                        Edit
                      </button>
                      <button onClick={() => context.deleteDetail(topic.id, index)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )
              ))}

              {addingDetail?.topicId === topic.id ? (
                <div className="edit-controls">
                  <input
                    type="text"
                    placeholder="Detail name"
                    style={{ width: "50%", color: "#000", background: "#fff" }}
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
                    style={{ width: "50%", color: "#000", background: "#fff" }}
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
                    style={{ width: "50px", color: "#000", background: "#fff" }}
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
                      context.addDetail(addingDetail.topicId, addingDetail.detail);
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
                  style={{ color: "#000", background: "#fff", border: "1px solid #000" }}
                  onClick={() =>
                    setAddingDetail({
                      topicId: topic.id,
                      detail: { name: "", value: 0, color: "#4a90e2" },
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
    </div>
  );
};

export default TopicDetails;
