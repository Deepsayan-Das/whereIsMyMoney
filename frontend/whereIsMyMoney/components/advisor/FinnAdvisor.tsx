import React, {
  useState, useRef, useEffect,
} from 'react'
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, Animated, KeyboardAvoidingView,
  Platform, ActivityIndicator, Dimensions, Keyboard,
} from 'react-native'
import {
  fetchInsights, sendChatMessage,
  type Insight, type ChatMessage, type FinancialContext,
} from '@/services/ai.service'
import { Ionicons } from '@expo/vector-icons';
import { FINN_FAB_SHD } from '@/constants/shadows'
import { Account, Transaction } from '@/app/(tabs)/index'
// Remove lucide-react-native import as it causes bundling errors


interface FinnAdvisorProps {
  accounts: Account[]
  transactions: Transaction[]
  isFabOpen?: boolean
}

const { height: SCREEN_H } = Dimensions.get('window')

const NEO_DARK = { shadowColor: '#c8c8e0', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.7, shadowRadius: 10 }
const NEO_LIGHT = { shadowColor: '#ffffff', shadowOffset: { width: -5, height: -5 }, shadowOpacity: 1, shadowRadius: 10 }
const INPUT_SHD = { shadowColor: '#271873', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 }

const SEVERITY_CONFIG: Record<string, { bg: string; border: string; icon: string }> = {
  positive: { bg: '#f0fdf4', border: '#86efac', icon: '🌟' },
  warning: { bg: '#fffbeb', border: '#fcd34d', icon: '⚠️' },
  danger: { bg: '#fef2f2', border: '#fca5a5', icon: '🔴' },
  tip: { bg: '#eef0ff', border: '#a5b4fc', icon: '💡' },
}

const QUICK_REPLIES = [
  "Give me a spending summary",
  "How's my savings looking?",
  "Where am I overspending?",
  "Any tips to save more?",
]

function InsightCard({ insight }: { insight: Insight }) {
  const cfg = SEVERITY_CONFIG[insight.severity]
  const slideY = useRef(new Animated.Value(10)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View style={{ transform: [{ translateY: slideY }], opacity }}>
      <View
        className='rounded-2xl p-4 mb-3 flex-row items-start gap-x-3'
        style={{ backgroundColor: cfg.bg, borderWidth: 1, borderColor: cfg.border }}
      >
        <Text className='text-base mt-0.5'>{cfg.icon}</Text>
        <Text className='flex-1 text-text-primary text-sm leading-5'>{insight.message}</Text>
      </View>
    </Animated.View>
  )
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <View className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className='w-7 h-7 rounded-full bg-secondary items-center justify-center mr-2 mt-1'>
          <Text style={{ fontSize: 13 }}>🤖</Text>
        </View>
      )}
      <View
        className='rounded-2xl px-4 py-3'
        style={[
          { maxWidth: '80%' },
          isUser
            ? { backgroundColor: '#2718fe', ...INPUT_SHD }
            : { backgroundColor: '#f7f7ff', ...INPUT_SHD }
        ]}
      >
        <Text
          style={{
            color: isUser ? '#f7f7ff' : '#0f0f1a',
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {msg.content}
        </Text>
      </View>
    </View>
  )
}

export default function FinnAdvisor({ accounts, transactions, isFabOpen }: FinnAdvisorProps) {
  const currentCtx: FinancialContext = { accounts, transactions }
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'insights' | 'chat'>('insights')
  const [insights, setInsights] = useState<Insight[]>([])
  const [loadingI, setLoadingI] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hey! I'm Finn 👋 I've got your financial data loaded up. Ask me anything — or check your insights above!" },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const slideY = useRef(new Animated.Value(SCREEN_H)).current
  const fabScale = useRef(new Animated.Value(1)).current
  const fabJump = useRef(new Animated.Value(0)).current
  const scrollRef = useRef<ScrollView>(null)

  const insightsFetched = useRef(false)
  const INPUT_OFFSET = 65 // offset to lift input above keyboard appropriately
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => setKeyboardHeight(e.endCoordinates.height))
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0))
    return () => { show.remove(); hide.remove() }
  }, [])

  function openOverlay() {
    setOpen(true)
    Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start()
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start()

    if (!insightsFetched.current) {
      insightsFetched.current = true
      setLoadingI(true)
      fetchInsights(currentCtx)
        .then(setInsights)
        .finally(() => setLoadingI(false))
    }
  }

  useEffect(() => {
    Animated.spring(fabJump, {
      toValue: isFabOpen ? -130 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true
    }).start()
  }, [isFabOpen, fabJump])

  function closeOverlay() {
    Animated.timing(slideY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }).start(() => setOpen(false))
  }

  async function handleSend(text = input) {
    const msg = text.trim()
    if (!msg || sending) return
    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setSending(true)
    setTab('chat')
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    try {
      const reply = await sendChatMessage(msg, messages, currentCtx)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Hmm, I hit a snag. Try again in a second!" }])
    } finally {
      setSending(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  return (
    <>
      {open && (
        <Animated.View
          style={[
            { transform: [{ translateY: slideY }] },
            {
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: SCREEN_H * 0.82,
              zIndex: 50,
            },
          ]}
        >
          <View
            className='flex-1 bg-[#f1f1f3] rounded-t-3xl overflow-hidden'
            style={{
              shadowColor: '#271873',
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Handle + header */}
            <View className='items-center pt-3 pb-2'>
              <View className='w-10 h-1 bg-border rounded-full' />
            </View>

            <View className='flex-row items-center justify-between px-6 pb-4'>
              <View>
                <Text className='text-text-primary font-bold text-2xl'>Hey, I&apos;m Finn 🤖</Text>
                <Text className='text-text-muted text-sm'>Your personal finance advisor</Text>
              </View>
              <TouchableOpacity
                onPress={closeOverlay}
                className='w-9 h-9 bg-primary rounded-full items-center justify-center'
                style={INPUT_SHD}
              >
                <Text className='text-text-secondary font-bold text-base'>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Tab bar */}
            <View className='flex-row mx-6 mb-4 bg-primary rounded-2xl p-1' style={INPUT_SHD}>
              {(['insights', 'chat'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  className='flex-1 py-2.5 rounded-xl items-center'
                  style={tab === t ? { backgroundColor: '#2718fe' } : {}}
                >
                  <Text
                    className='font-semibold text-sm'
                    style={{ color: tab === t ? '#f7f7ff' : '#4b4b63' }}
                  >
                    {t === 'insights' ? '✨ Insights' : '💬 Chat'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content */}
            {tab === 'insights' ? (
              <ScrollView className='flex-1 px-6' showsVerticalScrollIndicator={false}>
                {loadingI ? (
                  <View className='items-center py-12 gap-y-3'>
                    <ActivityIndicator color='#2718fe' size='large' />
                    <Text className='text-text-muted text-sm'>Finn is reading your finances…</Text>
                  </View>
                ) : insights.length === 0 ? (
                  <View style={NEO_DARK} className='rounded-2xl mt-2'>
                    <View style={NEO_LIGHT} className='rounded-2xl'>
                      <View className='bg-primary rounded-2xl p-6 items-center'>
                        <Text className='text-4xl mb-3'>🎉</Text>
                        <Text className='text-text-primary font-bold text-base mb-1'>All looking good!</Text>
                        <Text className='text-text-muted text-sm text-center'>
                          No flags right now. Your finances are in great shape — keep it up!
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className='pt-1 pb-6'>
                    {insights.map(ins => <InsightCard key={ins.id} insight={ins} />)}
                    <Text className='text-text-muted text-xs font-semibold uppercase tracking-widest mb-3 mt-2'>
                      Ask Finn
                    </Text>
                    <View className='flex-row flex-wrap gap-2'>
                      {QUICK_REPLIES.map(q => (
                        <TouchableOpacity
                          key={q}
                          onPress={() => handleSend(q)}
                          className='bg-primary rounded-2xl px-4 py-2'
                          style={INPUT_SHD}
                        >
                          <Text className='text-text-secondary text-xs font-medium'>{q}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            ) : (
              <ScrollView
                ref={scrollRef}
                className='flex-1 px-6'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 4, paddingBottom: 12 }}
              >
                {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {sending && (
                  <View className='flex-row items-center gap-x-2 mb-3'>
                    <View className='w-7 h-7 rounded-full bg-secondary items-center justify-center'>
                      <Text style={{ fontSize: 13 }}>🤖</Text>
                    </View>
                    <View className='bg-primary rounded-2xl px-4 py-3' style={INPUT_SHD}>
                      <ActivityIndicator color='#2718fe' size='small' />
                    </View>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Input bar */}
            <View
              className='flex-row items-center mx-6 mt-2 bg-primary rounded-2xl px-4'
              style={[INPUT_SHD, { marginBottom: keyboardHeight > 0 ? keyboardHeight + INPUT_OFFSET : 24 }]}
            >
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder='Ask Finn anything…'
                placeholderTextColor='#8b8ba3'
                className='flex-1 text-text-primary text-sm py-4'
                onSubmitEditing={() => handleSend()}
                returnKeyType='send'
              />
              <TouchableOpacity
                onPress={() => handleSend()}
                disabled={!input.trim() || sending}
                className='w-9 h-9 rounded-full bg-secondary items-center justify-center ml-2'
                style={{ opacity: input.trim() && !sending ? 1 : 0.35 }}
              >
                <Ionicons name="paper-plane" size={20} color="#f7f7ff" />
              </TouchableOpacity>
            </View>

          </View>
        </Animated.View>
      )}

      {/* FAB */}
      {!open && (
        <Animated.View
          style={{ transform: [{ scale: fabScale }, { translateY: fabJump }] }}
          className='absolute bottom-28 right-6'
        >
          <TouchableOpacity
            onPress={openOverlay}
            activeOpacity={0.9}
            className='w-14 h-14 bg-primary rounded-full items-center justify-center'
            style={[FINN_FAB_SHD, NEO_DARK]}
          >
            <Text style={{ fontSize: 26 }}>🤖</Text>
          </TouchableOpacity>
          <View
            className='absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full items-center justify-center'
            style={{ borderWidth: 2, borderColor: '#f1f1f3' }}
          />
        </Animated.View>
      )}
    </>
  )
}