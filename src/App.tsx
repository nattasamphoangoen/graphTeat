import "./App.css";
import AppRouter from "./AppRouter";
import { DataProvider } from "./context/DataContext";

function App() {
  return (
    <DataProvider>
      <div className="app-container">
        <AppRouter />
      </div>
    </DataProvider>
  );
}

export default App;
