import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, PermissionsAndroid } from 'react-native';
import Voice from '@react-native-voice/voice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AIService from '../services/AIService';

const AIToolsPanel = ({ pdfText, currentPage, loading }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [summary, setSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      setCurrentQuestion(e.value[0]);
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'App needs access to your microphone for voice questions',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const startSpeechToText = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;
    
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopSpeechToText = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateFlashcards = async () => {
    setAiLoading(true);
    setActiveTool('flashcards');
    try {
      const cards = await AIService.generateFlashcards(
        typeof pdfText === 'function' ? await pdfText() : pdfText,
        `From page ${currentPage} of study material`
      );
      setFlashcards(cards);
    } catch (error) {
      console.error(error);
    }
    setAiLoading(false);
  };

  const handleGenerateSummary = async () => {
    setAiLoading(true);
    setActiveTool('summary');
    try {
      const generatedSummary = await AIService.generateSummary(
        typeof pdfText === 'function' ? await pdfText() : pdfText,
        `From page ${currentPage} of study material`  
      );
      setSummary(generatedSummary);
    } catch (error) {
      console.error(error);
    }
    setAiLoading(false);
  };

  const handleExtractConcepts = async () => {
    setAiLoading(true);
    setActiveTool('concepts');
    try {
      const keyConcepts = await AIService.extractKeyConcepts(
        typeof pdfText === 'function' ? await pdfText() : pdfText
      );
      setConcepts(keyConcepts);
    } catch (error) {
      console.error(error);
    }
    setAiLoading(false);
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) return;
    
    setAiLoading(true);
    setActiveTool('qa');
    try {
      const answer = await AIService.askQuestion(
        typeof pdfText === 'function' ? await pdfText() : pdfText,
        currentQuestion
      );
      setAnswer(answer);
    } catch (error) {
      console.error(error);
      setAnswer("Sorry, I couldn't answer that question.");
    }
    setAiLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity 
          onPress={handleGenerateFlashcards}
          style={styles.toolButton}
        >
          <Icon name="style" size={24} color="#6200ee" />
          <Text style={styles.toolText}>Flashcards</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleGenerateSummary}
          style={styles.toolButton}
        >
          <Icon name="summarize" size={24} color="#6200ee" />
          <Text style={styles.toolText}>Summary</Text>
        </TouchableOpacity>
      </View>

  {(loading || typeof pdfText === 'function') ? (
    <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
  ) : (
    <View style={styles.content}>
      {!pdfText && <Text style={styles.noText}>No text available from this page</Text>}
          {activeTool === 'flashcards' && flashcards.length > 0 && (
            <View>
              {flashcards.map((card, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.question}>{card.question}</Text>
                  <Text style={styles.answer}>{card.answer}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTool === 'summary' && summary && (
            <Text style={styles.summary}>{summary}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15
  },
  toolButton: {
    alignItems: 'center',
    padding: 10
  },
  toolText: {
    marginTop: 5,
    color: '#6200ee'
  },
  content: {
    minHeight: 200
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  question: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  answer: {
    color: '#555'
  },
  summary: {
    lineHeight: 22
  }
});

export default AIToolsPanel;