import { useContext, useRef } from "react";
import * as htmlToImage from 'html-to-image';
import ExcelJS from "exceljs";
import { DataContext } from "./context/DataContext";
import {
  // LineChart,
  // Line,
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
  ZAxis,
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
  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const context = useContext(DataContext);
  if (!context) throw new Error("DataVisualization must be used within DataProvider");
  const { topics } = context;

  // // Prepare data for charts
  // const firstTopicDetails = topics[0]?.details || [];
  // const secondTopicDetails = topics[1]?.details || [];
  
  // console.log("First topic details for PieChart:", firstTopicDetails);
  // console.log("Second topic details for BarChart:", secondTopicDetails);

  const handleExportToExcel = async () => {
    // Capture charts as images
    const pieChartImage = pieChartRef.current 
      ? await htmlToImage.toPng(pieChartRef.current)
      : null;
    
    const barChartImage = barChartRef.current
      ? await htmlToImage.toPng(barChartRef.current)
      : null;
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

    // Pie Chart Sheet with Image
    const pieChartSheet = workbook.addWorksheet('Pie Chart');
    if (pieChartImage) {
      const imageId1 = workbook.addImage({
        buffer: base64ToBuffer(pieChartImage),
        extension: 'png',
      });
      pieChartSheet.addImage(imageId1, {
        tl: { col: 0, row: 0 },
        ext: { width: 600, height: 400 }
      });
    }

    // Bar Chart Sheet with Image
    const barChartSheet = workbook.addWorksheet('Bar Chart');
    if (barChartImage) {
      const imageId2 = workbook.addImage({
        buffer: base64ToBuffer(barChartImage),
        extension: 'png',
      });
      barChartSheet.addImage(imageId2, {
        tl: { col: 0, row: 0 },
        ext: { width: 600, height: 400 }
      });
    }

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Topic Summary
    summarySheet.addRow(['Data Summary']).font = { bold: true, size: 14 };
    summarySheet.addRow([]);
    
    summarySheet.addRow(['Topics Overview']).font = { bold: true };
    topics.forEach(topic => {
      const totalValue = topic.details.reduce((sum, detail) => sum + detail.value, 0);
      const avgValue = totalValue / topic.details.length;
      const maxValue = Math.max(...topic.details.map(d => d.value));
      const minValue = Math.min(...topic.details.map(d => d.value));
      
      // Add topic header
      summarySheet.addRow([`Topic: ${topic.name}`]).font = { bold: true };
      
      // Add statistics
      summarySheet.addRows([
        ['Statistics:', 'Value'],
        ['Total Items', topic.details.length],
        ['Total Value', totalValue],
        ['Average Value', avgValue.toFixed(2)],
        ['Maximum Value', maxValue],
        ['Minimum Value', minValue]
      ]);

      // Add details header
      summarySheet.addRow(['Details Breakdown']).font = { bold: true };
      
      // Add column headers for details
      summarySheet.addRow(['Name', 'Value', 'Color']);
      
      // Add all details for this topic
      topic.details.forEach(detail => {
        const row = summarySheet.addRow([detail.name, detail.value, detail.color]);
        row.getCell(3).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: detail.color.replace('#', '') }
        };
      });

      // Add spacing between topics
      summarySheet.addRows([[''], ['']]);
    });

    // Format summary sheet
    summarySheet.getColumn('A').width = 25;
    summarySheet.getColumn('B').width = 15;
    summarySheet.getColumn('C').width = 15;
    
    // Add charts
    if (pieChartImage) {
      const imageId3 = workbook.addImage({
        buffer: base64ToBuffer(pieChartImage),
        extension: 'png',
      });
      summarySheet.addImage(imageId3, {
        tl: { col: 3, row: 1 },
        ext: { width: 300, height: 200 }
      });
    }
    
    if (barChartImage) {
      const imageId4 = workbook.addImage({
        buffer: base64ToBuffer(barChartImage),
        extension: 'png',
      });
      summarySheet.addImage(imageId4, {
        tl: { col: 3, row: 15 },
        ext: { width: 300, height: 200 }
      });
    }

    // Format data sheet
    dataSheet.columns.forEach(column => {
      if (column.key) {
        const col = dataSheet.getColumn(column.key);
        col.width = 15;
        col.alignment = { horizontal: 'left' };
      }
    });

    // Save workbook
    await workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visualization_data.xlsx';
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
    <div className="visualization-container">
      {/* Topics and Details Table */}
      <section className="data-table-section">
        <h2>Topics and Details</h2>
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
          {/* Line Chart */}
          {/* <div className="chart-container">
            <h3>Line Chart View</h3>
            <LineChart width={500} height={300} data={topics[0]?.details || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </div> */}

          {/* Pie Chart */}
          <div className="chart-container" ref={pieChartRef}>
            <div className="chart-header">
              <h3>Pie Chart View</h3>
            </div>
            <PieChart width={500} height={300}>
              <Pie
                data={topics[0]?.details || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name} (${entry.value})`}
                labelLine={false}
              >
                {(topics[0]?.details || []).map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          {/* Bar Chart */}
          <div className="chart-container" ref={barChartRef}>
            <div className="chart-header">
              <h3>Bar Chart View</h3>
            </div>
            <BarChart width={500} height={300} data={topics[1]?.details || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                // tick={(props) => {
                //   const { x, y, payload } = props;
                //   return (
                //     <g transform={`translate(${x},${y})`}>
                //       <text
                //         x={0}
                //         y={0}
                //         dy={10}
                //         textAnchor="end"
                //         transform="rotate(-45)"
                //         style={{ fontSize: "12px" }}
                //       >
                //         {payload.value}
                //       </text>
                //     </g>
                //   );
                // }}
                tickFormatter={(value) =>
                  value.length > 6 ? value.slice(0, 6) + "..." : value
                }
              />
              <YAxis />
              <ZAxis />
              <Tooltip />
              {/* <Legend /> */}
              <Bar dataKey="value">
                {(topics[1]?.details || []).map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataVisualization;
