import type { Message, PortfolioData } from "./types"
export type { Education, Experience, Message, PortfolioData, Project, Skill } from "./types"

// API functions with timeout and better error handling
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const response = await fetchWithTimeout('/api/portfolio', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error)
    throw new Error('Failed to fetch portfolio data')
  }
}

export async function updatePortfolioData(data: PortfolioData): Promise<void> {
  try {
    const response = await fetchWithTimeout('/api/portfolio', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to update portfolio data:', error)
    throw new Error('Failed to update portfolio data')
  }
}

export async function getMessages(): Promise<Message[]> {
  try {
    const response = await fetchWithTimeout('/api/messages', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    throw new Error('Failed to fetch messages')
  }
}

export async function sendMessage(message: { name: string; email: string; message: string }): Promise<void> {
  try {
    const response = await fetchWithTimeout('/api/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(message),
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    throw new Error('Failed to send message')
  }
}

export async function updateMessage(id: string, read: boolean): Promise<void> {
  try {
    const response = await fetchWithTimeout(`/api/messages/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ read }),
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to update messages:', error)
    throw new Error('Failed to update message')
  }
}
