import { Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { api } from '../services/api'
import { saveToken } from '../services/authStorage'

const Login = () => {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {

      console.log("Sending:", { email, password });

      const res = await api.post("/users/login", {
        email: email.trim(),
        password: password.trim(),
      });

      const token = res.data.token

      await saveToken(token)

      router.replace("/")

    } catch (err) {
      console.error(err)


      alert("Invalid email or password")
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-[#f1f1f3]'>
      <View className='flex-1 justify-center items-center'>

        {/* Outer dark shadow — bottom-right */}
        <View
          className='w-[90%] h-[60%] rounded-3xl'
          style={{
            shadowColor: '#c8c8e0',
            shadowOffset: { width: 10, height: 10 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {/* Inner light shadow — top-left highlight */}
          <View
            className='w-full h-full rounded-3xl'
            style={{
              shadowColor: '#ffffff',
              shadowOffset: { width: -6, height: -6 },
              shadowOpacity: 1,
              shadowRadius: 12,
            }}
          >
            {/* The actual card */}
            <View
              className='w-full h-full rounded-3xl bg-primary justify-evenly items-center border-2 border-[#f7f7ff] py-12'
            >
              <View className='items-center mb-4'>
                <Image
                  source={require('../assets/images/logo.png')}
                  className='w-20 h-20 mb-2'
                  resizeMode='contain'
                />
                <Text className='text-text-primary font-black text-4xl tracking-tighter'>WIMM</Text>
              </View>
              <Text className='text-text-secondary font-bold text-3xl'>Welcome Back</Text>
              <Text className='text-text-muted text-base'>Login to your account</Text>

              <TextInput
                placeholder='Email'
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                className="bg-primary rounded-full p-4 px-6 mb-5 w-[90%]"
                style={{
                  shadowColor: "#271873",
                  shadowOffset: { width: 4, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              />

              <TextInput
                placeholder='Password'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="bg-primary rounded-full p-4 px-6 mb-5 w-[90%]"
                style={{
                  shadowColor: "#271873",
                  shadowOffset: { width: 4, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              />

              <TouchableOpacity
                onPress={handleLogin}
                className='bg-secondary rounded-full flex justify-center items-center w-[90%] py-4'
                style={{
                  shadowColor: "#271873",
                  shadowOffset: { width: 4, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              >
                <Text className='text-primary font-bold text-2xl'>Login</Text>
              </TouchableOpacity>

              <Text className='text-md text-text-muted'>
                Don&apos;t Have An Account ?
                <Link href="/Signup" className='text-secondary font-bold text-lg'>Signup</Link>
              </Text>

            </View>
          </View>
        </View>

      </View>
    </SafeAreaView>
  )
}

export default Login