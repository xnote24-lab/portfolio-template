import {useState} from 'react';
import {sendMessage} from '../api/client';

export function useMedicalAssistant() {
  const [conversationId, setConversationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function ask(input) {
    setLoading(true);
    setError('');
    try {
      const data = await sendMessage({...input, conversationId});
      setConversationId(data.conversationId);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  return {conversationId, loading, result, error, ask};
}
