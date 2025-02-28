import "./App.css";
import AppRouter from "./AppRouter";
import { DataProvider } from "./context/DataContext";

function App() {
  return (
    <DataProvider>
      <AppRouter />
    </DataProvider>
  );
}

export default App;
