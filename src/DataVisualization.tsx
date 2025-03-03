import { useContext, useRef } from "react";
import * as htmlToImage from 'html-to-image';
import ExcelJS from "exceljs";
import { DataContext } from "./context/DataContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const base64ToBuffer = (base64: string) => {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const DataVisualization = () => {
  const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const context = useContext(DataContext);
  if (!context) throw new Error("DataVisualization must be used within DataProvider");
  const { topics } = context;

  const setChartRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      chartRefs.current[id] = el;
    }
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Data Summary']).font = { bold: true, size: 14 };
    summarySheet.addRow([]);
    
    // Topics Overview
    summarySheet.addRow(['Topics Overview']).font = { bold: true };
    summarySheet.addRow([]);

    for (const topic of topics) {
      const values = topic.details.map(d => d.value);
      const totalValue = values.reduce((a, b) => a + b, 0);
      const avgValue = (totalValue / values.length).toFixed(2);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);

      // Topic Statistics
      summarySheet.addRow([`Topic: ${topic.name}`]).font = { bold: true };
      summarySheet.addRow(['Statistics:', 'Value']);
      summarySheet.addRow(['Total Items', topic.details.length]);
      summarySheet.addRow(['Total Value', totalValue]);
      summarySheet.addRow(['Average Value', avgValue]);
      summarySheet.addRow(['Maximum Value', maxValue]);
      summarySheet.addRow(['Minimum Value', minValue]);
      summarySheet.addRow([]);

      // Details Breakdown header
      summarySheet.addRow(['Details Breakdown']).font = { bold: true };
      summarySheet.addRow(['Name', 'Value', 'Color']);

      // Get chart image first to determine layout
      const element = chartRefs.current[`chart-${topic.id}`];
      const chartImage = element ? await htmlToImage.toPng(element) : null;

      if (chartImage) {
        const imageId = workbook.addImage({
          buffer: base64ToBuffer(chartImage),
          extension: 'png',
        });

        // Add details with chart on the right
        const detailsStartRow = summarySheet.lastRow!.number + 1;
        topic.details.forEach(detail => {
          const row = summarySheet.addRow([detail.name, detail.value, detail.color]);
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: detail.color.replace('#', '') }
          };
        });

        // Add chart to the right of the details
        summarySheet.addImage(imageId, {
          tl: { col: 5, row: detailsStartRow - 10 }, // Align with details section
          ext: { width: 400, height: 240 }
        });
      } else {
        // If no chart, just add details
        topic.details.forEach(detail => {
          const row = summarySheet.addRow([detail.name, detail.value, detail.color]);
          row.getCell(3).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: detail.color.replace('#', '') }
          };
        });
      }

      // Add spacing after each topic
      summarySheet.addRow([]);
      summarySheet.addRow([]);
    }

    // Format columns
    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 15;
    summarySheet.getColumn(3).width = 15;
    summarySheet.getColumn(4).width = 5; // Spacing between data and charts
    
    // Save workbook
    await workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visualization_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  if (!topics.length) {
    return (
      <div className="visualization-container">
        <div className="data-table-section">
          <h2>No data available</h2>
          <p>Add some topics and details to see visualizations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="visualization-container" style={{ color: "black", margin: "0 auto", padding: "20px", width: "1200px" }}>
      {/* Topics and Details Table */}
      <section className="data-table-section">
        <h2 style={{ color: "black"}}>Topics and Details</h2>
        <div className="data-table">
          <div className="data-actions">
            <button onClick={handleExportToExcel} className="export-btn">
              Export to Excel
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td>{topic.name}</td>
                  <td>
                    <ul className="details-list">
                      {topic.details.map((detail, index) => (
                        <li key={index} style={{ color: detail.color }}>
                          {detail.name}: {detail.value}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="charts-section">
        <div className="chart-grid">
          {topics.map((topic) => (
            <div key={topic.id} className="chart-container" ref={setChartRef(`chart-${topic.id}`)}>
              <div className="chart-header">
                <h3>{topic.name}</h3>
              </div>
              {topic.chartType === 'pie' && (
                <PieChart width={500} height={300}>
                  <Pie
                    data={topic.details}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    labelLine={false}
                  >
                    {topic.details.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
              {topic.chartType === 'bar' && (
                <BarChart width={500} height={300} data={topic.details}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(value) =>
                      value.length > 6 ? value.slice(0, 6) + "..." : value
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {topic.details.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
              {topic.chartType === 'line' && (
                <LineChart width={500} height={300} data={topic.details}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={topic.details[0]?.color || "#8884d8"}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DataVisualization;
