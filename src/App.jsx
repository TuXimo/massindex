import Layout from './components/Layout'
import BMISection from './components/BMI/BMISection'
import { ConfigProvider } from './context/ConfigContext';
import PageTitle from './components/PageTitle';

function App() {
  return (
    <ConfigProvider>
      <PageTitle />
      <Layout>
        <BMISection />
      </Layout>
    </ConfigProvider>
  );
}

export default App
