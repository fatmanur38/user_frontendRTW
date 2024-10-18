import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserInterview from './Components/UserInterview';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/interview/:videolink" element={<UserInterview />} />
      </Routes>
    </Router>
  );
};

export default App;