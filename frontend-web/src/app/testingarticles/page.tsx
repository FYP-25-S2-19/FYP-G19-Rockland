"use client"

import React, { useState } from 'react';

interface LoginData {
  email: string;
  password: string;
}

interface ArticleData {
  title: string;
  content: string;
  categories_id: number;
  is_free: boolean;
  photo: string | null;
}

const ArticleTestPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [loginData, setLoginData] = useState<LoginData>({
    email: 'john.doe@example.com',  // Use any existing user
    password: 'password123'
  });
  
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    content: '',
    categories_id: 1,
    is_free: true,
    photo: null
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const API_BASE = 'http://localhost:5000';

  // Handle login
  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE}/api/test-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setToken(result.access_token || result.token);  // Handle both token formats
        setIsLoggedIn(true);
        setMessage('✅ Login successful!');
      } else {
        setMessage(`❌ Login failed: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (): void => {
        setArticleData({
          ...articleData,
          photo: reader.result as string // This will be base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle article creation
  const handleCreateArticle = async (): Promise<void> => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE}/api/articles/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('✅ Article created successfully!');
        console.log('Created article:', result.article);
        
        // Reset form
        setArticleData({
          title: '',
          content: '',
          categories_id: 1,
          is_free: true,
          photo: null
        });
        // Reset file input
        const fileInput = document.getElementById('photo-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(`❌ Article creation failed: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        minHeight: '100vh', 
        padding: '40px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          maxWidth: '400px', 
          margin: '0 auto',
          padding: '30px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
            🪨 Rockland Article Test
          </h1>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          {message && (
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh', 
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', margin: 0 }}>
            📝 Create Article
          </h1>
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Title:
          </label>
          <input
            type="text"
            value={articleData.title}
            onChange={(e) => setArticleData({...articleData, title: e.target.value})}
            placeholder="Enter article title..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Content:
          </label>
          <textarea
            value={articleData.content}
            onChange={(e) => setArticleData({...articleData, content: e.target.value})}
            placeholder="Enter article content (minimum 50 characters)..."
            rows={6}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Category ID:
          </label>
          <input
            type="number"
            value={articleData.categories_id}
            onChange={(e) => setArticleData({...articleData, categories_id: parseInt(e.target.value)})}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={articleData.is_free}
              onChange={(e) => setArticleData({...articleData, is_free: e.target.checked})}
              style={{ marginRight: '8px' }}
            />
            Free Article
          </label>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Photo (optional):
          </label>
          <input
            id="photo-input"
            type="file"
            accept="image/png,image/jpg,image/jpeg"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          {articleData.photo && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              ✅ Photo selected and converted to base64
            </div>
          )}
        </div>
        
        <button
          onClick={handleCreateArticle}
          disabled={loading || !articleData.title || !articleData.content}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: (loading || !articleData.title || !articleData.content) ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: (loading || !articleData.title || !articleData.content) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Article...' : 'Create Article'}
        </button>
        
        {message && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleTestPage;