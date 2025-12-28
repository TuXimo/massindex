import Layout from './components/Layout'
import BMISection from './components/BMI/BMISection'
import { ConfigProvider } from './context/ConfigContext';
import PageTitle from './components/PageTitle';

import SEO from './components/SEO';

function App() {
  return (
    <ConfigProvider>
      <SEO />
      <PageTitle />
      <Layout>
        <BMISection />
      </Layout>
    </ConfigProvider>
  );
}

export default App
