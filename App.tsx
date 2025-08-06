
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import Header from './components/Header';
import { FeedProvider } from './hooks/useFeedManager';

const App: React.FC = () => {
  return (
    <FeedProvider>
      <HashRouter>
        <div className="min-h-screen bg-primary">
          <Header />
          <main className="container mx-auto p-4 max-w-4xl">
            <Routes>
              <Route path="/" element={<ArticleList />} />
              <Route path="/article/:id" element={<ArticleDetail />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </FeedProvider>
  );
};

export default App;
