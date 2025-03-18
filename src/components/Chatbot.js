import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaComment, FaTimes, FaPaperPlane } from 'react-icons/fa';
import styles from '../styles/modules/chatbot.module.scss';
import { getClasses } from '../utils/getClasses';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hi there! How can I help you today?', isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    // Add user message to chat
    setMessages([...messages, { text: inputValue, isBot: false }]);
    setInputValue('');
    
    // This is just the UI part - no actual functionality
    // The backend integration would go here in a real implementation
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
            <h3>Chat Support</h3>
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
                  message.isBot ? styles.botMessage : styles.userMessage
                ])}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className={styles.messageInput}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              aria-label="Send message"
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