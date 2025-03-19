import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaComment, FaTimes, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from '../styles/modules/chatbot.module.scss';
import { getClasses } from '../utils/getClasses';
import { sendChatMessage } from '../services/openaiService';
import { createTaskFromAI } from '../services/chatTaskService';
import { TODO_ASSISTANT_PROMPT } from '../services/aiPrompts';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hi there! How can I help you manage your tasks?', isBot: true }
  ]);
  const [chatMessages, setChatMessages] = useState([
    { role: 'system', content: TODO_ASSISTANT_PROMPT },
    { role: 'assistant', content: 'Hi there! How can I help you manage your tasks?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    if (isLoading) return;
    
    // Add user message to chat interface
    const userMessage = { text: inputValue, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    // Add user message to OpenAI messages array
    const openaiUserMessage = { role: 'user', content: inputValue };
    const updatedChatMessages = [...chatMessages, openaiUserMessage];
    setChatMessages(updatedChatMessages);
    
    // Clear input field
    setInputValue('');
    setIsLoading(true);
    
    // Add loading indicator
    setMessages(prev => [...prev, { text: '...', isBot: true, isLoading: true }]);

    try {
      // Send message to OpenAI
      const response = await sendChatMessage(updatedChatMessages);
      
      // Remove loading indicator
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // Add assistant response to chat interface
      setMessages(prev => [
        ...prev, 
        { text: response.response.content || 'I processed your request.', isBot: true }
      ]);
      
      // Add assistant response to OpenAI messages array
      setChatMessages(prev => [...prev, response.response]);
      
      // Handle task creation if the function was called
      if (response.functionCalled === 'createTask' && response.functionResult.success) {
        try {
          // Create the task in Firebase and update Redux
          await createTaskFromAI(response.functionResult.task, dispatch);
          toast.success('Task added successfully!');
        } catch (error) {
          console.error('Error creating task:', error);
          toast.error(`Failed to create task: ${error.message}`);
          
          // Add error message to chat
          setMessages(prev => [
            ...prev, 
            { text: `I couldn't create that task: ${error.message}`, isBot: true }
          ]);
        }
      }
    } catch (error) {
      console.error('Error sending message to OpenAI:', error);
      
      // Remove loading indicator
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // Add error message to chat
      setMessages(prev => [
        ...prev, 
        { text: 'Sorry, I encountered an error. Please try again.', isBot: true }
      ]);
      
      toast.error('Failed to process message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {!isOpen && (
        <motion.button
          className={styles.chatbotButton}
          onClick={toggleChatbot}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open chatbot"
        >
          <FaComment />
        </motion.button>
      )}

      {isOpen && (
        <motion.div
          className={styles.chatbotPanel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className={styles.chatbotHeader}>
            <h3>Task Assistant</h3>
            <button 
              className={styles.closeButton}
              onClick={toggleChatbot}
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={getClasses([
                  styles.message,
                  message.isBot ? styles.botMessage : styles.userMessage,
                  message.isLoading ? styles.loadingMessage : ''
                ])}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={isLoading ? "Please wait..." : "Type your message..."}
              className={styles.messageInput}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              aria-label="Send message"
              disabled={isLoading}
            >
              <FaPaperPlane />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

export default Chatbot;