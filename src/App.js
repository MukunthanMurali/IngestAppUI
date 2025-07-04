import React from 'react';
import HomepageVideos from './components/Home/Homepage';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <HomepageVideos />
      </div>
    </QueryClientProvider>
  );
}

export default App;
