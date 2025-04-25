import axios from 'axios'

const api = axios.create({
  baseURL: 'http://api.qingyunke.com',
  timeout: 5000
})

export const sendChatMessage = async (message: string) => {
  try {
    const response = await api.get('/api.php', {
      params: {
        key: 'free',
        appid: 0,
        msg: message
      }
    })
    return response.data
  } catch (error) {
    throw new Error('发送消息失败')
  }
}