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
    
    // Data Sheet
    const dataSheet = workbook.addWorksheet('Data');
    dataSheet.columns = [
      { header: 'Topic', key: 'topic' },
      { header: 'Detail', key: 'detail' },
      { header: 'Value', key: 'value' },
      { header: 'Color', key: 'color' }
    ];

    const allData = topics.flatMap(topic => 
      topic.details.map(detail => ({
        topic: topic.name,
        detail: detail.name,
        value: detail.value,
        color: detail.color
      }))
    );
    dataSheet.addRows(allData);

    // Create individual sheets for each topic with charts
    for (const topic of topics) {
      const sheet = workbook.addWorksheet(topic.name);
      
      // Add topic data
      sheet.addRow([`Topic: ${topic.name}`]).font = { bold: true };
      sheet.addRow(['Chart Type:', topic.chartType]).font = { bold: true };
      sheet.addRow([]);
      
      // Add details
      sheet.addRow(['Details']).font = { bold: true };
      sheet.addRow(['Name', 'Value', 'Color', 'Percentage']);
      
      const totalValue = topic.details.reduce((sum, d) => sum + d.value, 0);
      topic.details.forEach(detail => {
        const percentage = ((detail.value / totalValue) * 100).toFixed(2) + '%';
        const row = sheet.addRow([detail.name, detail.value, detail.color, percentage]);
        row.getCell(3).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: detail.color.replace('#', '') }
        };
      });

      // Add chart image
      const element = chartRefs.current[`chart-${topic.id}`];
      const chartImage = element ? await htmlToImage.toPng(element) : null;

      if (chartImage) {
        const imageId = workbook.addImage({
          buffer: base64ToBuffer(chartImage),
          extension: 'png',
        });
        sheet.addRow([]);
        sheet.addImage(imageId, {
          tl: { col: 0, row: sheet.lastRow!.number + 1 },
          ext: { width: 500, height: 300 }
        });
      }

      // Format columns
      sheet.getColumn(1).width = 25;
      sheet.getColumn(2).width = 15;
      sheet.getColumn(3).width = 15;
      sheet.getColumn(4).width = 15;
    }

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Data Summary']).font = { bold: true, size: 14 };
    summarySheet.addRow([]);
    summarySheet.addRow(['Total Topics:', topics.length]);
    summarySheet.addRow(['Total Details:', topics.reduce((sum, t) => sum + t.details.length, 0)]);
    
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
