import { useContext } from "react";
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

const DataVisualization = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("DataVisualization must be used within DataProvider");
  const { topics } = context;

  // // Prepare data for charts
  // const firstTopicDetails = topics[0]?.details || [];
  // const secondTopicDetails = topics[1]?.details || [];
  
  // console.log("First topic details for PieChart:", firstTopicDetails);
  // console.log("Second topic details for BarChart:", secondTopicDetails);

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

      {/* Charts Section */}
      <section className="charts-section">
        <h2>Data Visualization</h2>

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
          <div className="chart-container">
            <h3>Pie Chart View</h3>
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
          <div className="chart-container">
            <h3>Bar Chart View</h3>
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
