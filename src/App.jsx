import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'
import BMISection from './components/BMI/BMISection'
import CalculatorPage from './pages/CalculatorPage'
import { ConfigProvider } from './context/ConfigContext';
import PageTitle from './components/PageTitle';

import SEO from './components/SEO';

function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <>
              <SEO />
              <PageTitle />
              <Layout>
                <BMISection />
              </Layout>
            </>
          } />
          <Route path="/calculator" element={<CalculatorPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App
