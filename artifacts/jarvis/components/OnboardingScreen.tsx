import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Animated, Dimensions, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [groqKey, setGroqKey] = useState('');
  const [orKey, setOrKey] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = async () => {
    if (currentSlide < 4) {
      setCurrentSlide(prev => prev + 1);
    } else {
      await AsyncStorage.setItem('@jarvis_onboarded', 'true');
      onComplete();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('@jarvis_onboarded', 'true');
    onComplete();
  };

  const slides = [
    {
      title: "Bun venit. Sunt J.A.R.V.I.S.",
      content: "Sistemul tău de asistență bazat pe inteligență artificială. Pregătește-te pentru integrare completă.",
      icon: 'pulse'
    },
    {
      title: "Configurează Groq",
      content: "Introduce cheia API Groq pentru performanță maximă.",
      action: (
        <>
          <TextInput 
            style={styles.input} 
            placeholder="Introduceți cheia API..." 
            placeholderTextColor="#666"
            value={groqKey}
            onChangeText={setGroqKey}
          />
          <TouchableOpacity onPress={() => Linking.openURL('https://console.groq.com/keys')}>
            <Text style={styles.link}>Obține cheia de aici</Text>
          </TouchableOpacity>
        </>
      )
    },
    {
      title: "Configurează OpenRouter",
      content: "Opțional: Pentru modele avansate.",
      action: (
        <>
          <TextInput 
            style={styles.input} 
            placeholder="Introduceți cheia API (opțional)..." 
            placeholderTextColor="#666"
            value={orKey}
            onChangeText={setOrKey}
          />
          <TouchableOpacity onPress={() => Linking.openURL('https://openrouter.ai/keys')}>
            <Text style={styles.link}>Obține cheia de aici</Text>
          </TouchableOpacity>
        </>
      )
    },
    {
      title: "Features",
      content: "Explorează capabilitățile sistemului:",
      features: ['Chat AI', 'Code Studio', 'Memorie', 'Stats Dashboard', 'Voice']
    },
    {
      title: "Ești gata.",
      content: "Sistemul este activ. Începe conversația.",
      final: true
    }
  ];

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.container}>
        <TouchableOpacity style={styles.skip} onPress={handleSkip}>
          <Text style={styles.skipText}>Sari</Text>
        </TouchableOpacity>
        
        <View style={styles.slideContainer}>
          <Text style={styles.title}>{slides[currentSlide].title}</Text>
          <Text style={styles.body}>{slides[currentSlide].content}</Text>
          
          {slides[currentSlide].action}
          
          {slides[currentSlide].features && (
            <View style={styles.features}>
              {slides[currentSlide].features?.map((f, i) => (
                <Text key={i} style={styles.featureText}>• {f}</Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{currentSlide === 4 ? "FINALIZEAZĂ" : "Continuă"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, currentSlide === i && styles.activeDot]} />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', padding: 40, justifyContent: 'center' },
  skip: { position: 'absolute', top: 50, right: 30 },
  skipText: { color: '#0ff', fontSize: 16 },
  slideContainer: { alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  body: { color: '#ccc', textAlign: 'center', marginBottom: 30 },
  input: { width: '100%', borderBottomWidth: 1, borderColor: '#0ff', color: '#fff', marginBottom: 10, padding: 10 },
  link: { color: '#0ff', marginBottom: 20 },
  features: { marginBottom: 30, alignItems: 'flex-start' },
  featureText: { color: '#fff', fontSize: 18, marginBottom: 5 },
  button: { backgroundColor: '#0ff', padding: 15, borderRadius: 5, width: '100%', alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold' },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#444', marginHorizontal: 5 },
  activeDot: { backgroundColor: '#0ff' }
});
