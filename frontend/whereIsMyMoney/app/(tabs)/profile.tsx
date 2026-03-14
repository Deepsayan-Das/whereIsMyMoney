import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native'
import { useFocusEffect, router } from 'expo-router'
import { api } from '@/services/api'
import { removeToken } from '@/services/authStorage'
import { SafeAreaView } from 'react-native-safe-area-context'

const NEO_SHADOW_DARK  = { shadowColor: '#c8c8e0', shadowOffset: { width: 6,  height: 6  }, shadowOpacity: 0.7, shadowRadius: 10 }
const NEO_SHADOW_LIGHT = { shadowColor: '#ffffff',  shadowOffset: { width: -5, height: -5 }, shadowOpacity: 1,   shadowRadius: 10 }
const INPUT_SHADOW     = { shadowColor: '#271873',  shadowOffset: { width: 3,  height: 3  }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 }

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      fetchProfile()
    }, [])
  )

  const fetchProfile = async () => {
    setRefreshing(true)
    try {
      const res = await api.get("/users/profile")
      setUser(res.data.user)
    } catch (err) {
      console.log("Profile fetch error", err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out of WIMM?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.post("/users/logout")
            } catch (err) {
              console.log("Logout API error", err)
            } finally {
              await removeToken()
              router.replace("/Login")
            }
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-[#f1f1f3]' edges={['top', 'right', 'left', 'bottom']}>
      <ScrollView
        className='flex-1'
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProfile} />
        }
      >
        <View className='px-6 pt-6 mb-8 items-center'>
          <View className='flex-row items-center gap-x-2 mb-10 self-start'>
            <Image 
              source={require('../../assets/images/logo.png')} 
              className='w-8 h-8'
              resizeMode='contain'
            />
            <Text className='text-text-primary font-black text-xl tracking-tighter'>WIMM Profile</Text>
          </View>

          <View style={NEO_SHADOW_DARK} className='rounded-full'>
            <View style={NEO_SHADOW_LIGHT} className='rounded-full'>
              <View className='w-32 h-32 rounded-full bg-secondary items-center justify-center' style={{ borderWidth: 4, borderColor: '#0f0f1a' }}>
                <Text style={{ fontSize: 60 }}>👤</Text>
              </View>
            </View>
          </View>

          <Text className='text-text-primary font-black text-2xl mt-6'>{user?.email.split('@')[0] || 'User'}</Text>
          <Text className='text-text-muted text-sm font-medium'>{user?.email || 'loading...'}</Text>
        </View>

        <View className='px-6 gap-y-4'>
            <Text className='text-text-secondary font-bold text-lg mb-1'>Account Settings</Text>
            
            <TouchableOpacity style={INPUT_SHADOW} className='bg-primary px-5 py-5 rounded-2xl flex-row items-center justify-between'>
                <View className='flex-row items-center gap-x-3'>
                    <Text className='text-xl'>📧</Text>
                    <Text className='text-text-primary font-bold'>Change Email</Text>
                </View>
                <Text className='text-text-muted'>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={INPUT_SHADOW} className='bg-primary px-5 py-5 rounded-2xl flex-row items-center justify-between'>
                <View className='flex-row items-center gap-x-3'>
                    <Text className='text-xl'>🔒</Text>
                    <Text className='text-text-primary font-bold'>Security & Privacy</Text>
                </View>
                <Text className='text-text-muted'>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={handleLogout}
                className='bg-error/10 px-5 py-5 rounded-2xl flex-row items-center justify-between mt-4'
                style={[INPUT_SHADOW, { borderStyle: 'dashed', borderWidth: 2, borderColor: '#ef4444' }]}
            >
                <View className='flex-row items-center gap-x-3'>
                    <Text className='text-xl'>🚪</Text>
                    <Text className='text-error font-black'>Sign Out</Text>
                </View>
                <Text className='text-error'>→</Text>
            </TouchableOpacity>
        </View>

        <View className='mt-12 items-center mb-10'>
            <Text className='text-text-muted text-xs font-bold uppercase tracking-widest'>WIMM v1.0.0</Text>
            <Text className='text-text-muted text-[10px] mt-1'>Neo-Brutalist Finance Tracker</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
