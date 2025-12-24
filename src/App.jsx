
import Layout from './components/Layout'
import BMISection from './components/BMI/BMISection'
import { ConfigProvider } from './context/ConfigContext';

function App() {
  return (
    <ConfigProvider>
      <Layout>
        <BMISection />
      </Layout>
    </ConfigProvider>
  );
}

export default App
